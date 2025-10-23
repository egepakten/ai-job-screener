# chatgpt_clone/main.py
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from rag.retriever import load_faiss_index
from rag.embedder import embed_text
import numpy as np
import openai
import os
import hashlib
from functools import lru_cache
from typing import Optional
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

openai.api_key = os.getenv("OPENAI_API_KEY")
openai_client = openai.OpenAI()  # If you're using `openai>=1.0.0`

# Load FAISS index and metadata on startup
faiss_index, metadata = load_faiss_index()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Constants
MAX_GPT_CONTEXT_RESULTS = 20  # Limit results sent to GPT to prevent context overflow

# In-memory user profile storage (in production, use Redis or database)
user_profiles = {}

# Cache for FAISS search results (stores up to 128 unique queries)
@lru_cache(maxsize=128)
def cached_search(query_hash: str, k: int):
    """Cache FAISS search results based on query hash"""
    # This is a wrapper - actual search happens in the endpoint
    # We'll use this to cache the query hash
    return query_hash

@app.get("/jobs")
async def get_jobs(
    page: int = Query(1, ge=1, description="Page number (starts at 1)"),
    limit: int = Query(50, ge=1, le=100, description="Number of jobs per page"),
    search: Optional[str] = Query(None, description="Optional search term to filter jobs")
):
    """
    Get paginated list of all jobs without GPT processing.
    Fast endpoint for browsing all available positions.
    """
    total_jobs = len(metadata)
    
    # Optional filtering by search term
    filtered_jobs = metadata
    if search:
        search_lower = search.lower()
        filtered_jobs = [
            job for job in metadata 
            if search_lower in job.get('title', '').lower() 
            or search_lower in job.get('company', '').lower()
            or search_lower in str(job.get('tech_stack', [])).lower()
        ]
    
    total_filtered = len(filtered_jobs)
    
    # Calculate pagination
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    
    # Get page of results
    page_results = filtered_jobs[start_idx:end_idx]
    
    return {
        "results": page_results,
        "total": total_filtered,
        "page": page,
        "limit": limit,
        "total_pages": (total_filtered + limit - 1) // limit,
        "has_next": end_idx < total_filtered,
        "has_prev": page > 1
    }

@app.post("/chat")
async def chat(request: Request):
    data = await request.json()
    user_input = data["message"]
    user_memory = data.get("user_memory", "")  # Optional user preferences/profile
    return_all = data.get("return_all", False)  # Flag to return all matches without GPT

    # 🔍 Embed user query
    user_vector = embed_text(user_input)
    
    # Get total number of jobs in index
    total_jobs = faiss_index.ntotal
    
    # 🎯 Search more results initially for better filtering (3x more than needed)
    initial_k = min(MAX_GPT_CONTEXT_RESULTS * 3, total_jobs)
    
    # Create cache key from query for caching
    query_cache_key = hashlib.md5(f"{user_input}_{user_memory}".encode()).hexdigest()
    
    # Search FAISS index (cached implicitly by query similarity)
    D, I = faiss_index.search(np.array([user_vector]).astype("float32"), k=initial_k)
    
    # Get candidate jobs
    candidate_jobs = [metadata[i] for i in I[0] if i < len(metadata)]
    
    # 🔍 Smart filtering based on query keywords
    user_input_lower = user_input.lower()
    
    # Extract location keywords from query
    location_keywords = []
    uk_cities = ['manchester', 'birmingham', 'edinburgh', 'glasgow', 'bristol', 'cambridge', 
                 'oxford', 'leeds', 'liverpool', 'sheffield', 'nottingham', 'cardiff']
    for city in uk_cities:
        if city in user_input_lower:
            location_keywords.append(city)
    
    # Extract tech stack keywords
    tech_keywords = []
    common_techs = ['python', 'java', 'javascript', 'typescript', 'react', 'node', 'aws', 'kubernetes', 
                    'docker', 'sql', 'nosql', 'mongodb', 'postgres', 'redis', 'kafka', 'scala', 'kotlin',
                    'swift', 'go', 'rust', 'c++', 'c#', '.net', 'django', 'flask', 'spring', 'angular', 'vue']
    for tech in common_techs:
        if tech in user_input_lower:
            tech_keywords.append(tech)
    
    # Apply smart filtering
    filtered_jobs = []
    for job in candidate_jobs:
        score = 0
        job_location = job.get('location', '').lower()
        job_tech_stack = [t.lower() for t in job.get('tech_stack', [])]
        job_title = job.get('title', '').lower()
        job_company = job.get('company', '').lower()
        
        # Location matching (highest priority)
        if location_keywords:
            if any(keyword in job_location for keyword in location_keywords):
                score += 100  # Strong match for location
            elif 'london' in job_location and 'london' not in location_keywords:
                score -= 50  # Penalize non-matching locations strongly
        
        # Tech stack matching
        if tech_keywords:
            matching_techs = sum(1 for tech in tech_keywords if tech in ' '.join(job_tech_stack))
            score += matching_techs * 10
        
        # Title matching
        query_words = [w for w in user_input_lower.split() if len(w) > 3]  # Skip short words
        for word in query_words:
            if word in job_title:
                score += 5
            if word in job_company:
                score += 3
        
        filtered_jobs.append((score, job))
    
    # Sort by score (descending) and take top results
    filtered_jobs.sort(key=lambda x: x[0], reverse=True)
    
    # Only return jobs with positive scores if location filtering was applied
    if location_keywords:
        # Strict location filtering - only return jobs that match the location
        relevant_jobs = [job for score, job in filtered_jobs if score > 0][:MAX_GPT_CONTEXT_RESULTS]
    elif tech_keywords:
        # Tech filtering - return jobs with positive scores
        relevant_jobs = [job for score, job in filtered_jobs if score > 0][:MAX_GPT_CONTEXT_RESULTS]
    else:
        # No specific filters - use FAISS similarity results
        relevant_jobs = candidate_jobs[:MAX_GPT_CONTEXT_RESULTS]
    
    # 🚀 Fast mode: return results without GPT processing
    if return_all:
        return {
            "answer": f"Found {len(relevant_jobs)} jobs matching your criteria." if relevant_jobs else "No jobs found matching your criteria.",
            "jobs": relevant_jobs,
            "total_matches": len(relevant_jobs),
            "mode": "fast"
        }

    # 🧠 Build rich context from retrieved metadata
    relevant_chunks = "\n\n".join([
        f"Job {idx + 1}/{len(relevant_jobs)}:\n"
        f"**{job.get('title', 'Unknown')}** at {job.get('company', 'Unknown')}\n"
        f"💰 Salary: {job.get('salary', 'Not specified')}\n"
        f"📍 Location: {job.get('location', 'Not specified')}\n"
        f"🛠️ Tech Stack: {', '.join(job.get('tech_stack', []))}\n"
        f"🔗 Link: {job.get('link', 'N/A')}\n"
        f"📝 Description: {job.get('description', '')[:200]}..."
        for idx, job in enumerate(relevant_jobs)
    ])
    
    # Add user memory context if provided
    memory_context = ""
    if user_memory:
        memory_context = f"\n\nUser Profile/Preferences:\n{user_memory}\n"

    # 💬 Create GPT messages with context
    job_count = len(relevant_jobs)
    messages = [
        {
            "role": "system",
            "content": f"You are a helpful job assistant with access to {total_jobs} job listings. "
                      f"IMPORTANT: When presenting job results, you MUST mention ALL jobs that are provided to you. "
                      f"If there are 5 jobs, describe all 5. If there are 10, describe all 10. Do not cherry-pick. "
                      f"Users expect to see details about every job shown in the table below your response. "
                      f"Provide personalized, helpful recommendations based on the user's query. "
                      f"If NO jobs match the user's requirements (especially location), clearly state "
                      f"that there are 0 matching positions and explain why. Suggest alternatives or "
                      f"broader search terms."
        },
        {
            "role": "user",
            "content": f"""
User Query: {user_input}
{memory_context}
{'Below are ALL ' + str(job_count) + ' job positions that match the query:' if relevant_jobs else 'No jobs found matching the criteria.'}

{relevant_chunks if relevant_jobs else 'The job database does not contain positions matching the specified requirements (particularly location requirements).'}

CRITICAL: You must analyze and mention ALL {job_count} jobs provided above. Do not skip any.

Please provide a comprehensive response:
{f"- List and describe ALL {job_count} jobs (do not skip any)" if relevant_jobs else "- Clearly state that 0 jobs were found"}
- For each job, include: title, company, salary, location, and key tech stack items
- Rank them by relevance to the user's query
- Highlight which jobs best match the user's requirements
- If fewer than 5 jobs found, explain why
- Be thorough - users will see a table below with all jobs, so your description should match
"""
        }
    ]

    # 🧠 Call GPT-4o
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        temperature=0.3,  # Lower temperature for more consistent, complete responses
    )
    
    gpt_answer = response.choices[0].message.content
    
    # Add a note if GPT seems to have skipped jobs (basic check)
    if job_count > 2 and gpt_answer.count('**') < job_count:
        gpt_answer += f"\n\n*Note: All {job_count} matching positions are shown in the table below.*"

    return {
        "answer": gpt_answer,
        "jobs": relevant_jobs,  # Also return raw job data
        "total_matches": len(relevant_jobs),
        "mode": "gpt"
    }

@app.post("/user/profile")
async def save_user_profile(request: Request):
    """
    Save or update user preferences and profile information.
    This will be used to personalize job recommendations.
    """
    data = await request.json()
    user_id = data.get("user_id", "default")
    preferences = data.get("preferences", {})
    
    # Store preferences
    user_profiles[user_id] = {
        "preferences": preferences,
        "tech_stack_preferences": preferences.get("tech_stack", []),
        "salary_min": preferences.get("salary_min"),
        "company_size_preference": preferences.get("company_size"),
        "visa_required": preferences.get("visa_required", False),
        "notes": preferences.get("notes", "")
    }
    
    return {
        "status": "success",
        "user_id": user_id,
        "profile": user_profiles[user_id]
    }

@app.get("/user/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get user profile and preferences"""
    profile = user_profiles.get(user_id, {})
    return {
        "user_id": user_id,
        "profile": profile
    }

@app.get("/stats")
async def get_stats():
    """Get system statistics"""
    return {
        "total_jobs": len(metadata),
        "total_users": len(user_profiles),
        "cache_size": cached_search.cache_info()._asdict() if hasattr(cached_search, 'cache_info') else {},
        "max_gpt_results": MAX_GPT_CONTEXT_RESULTS
    }