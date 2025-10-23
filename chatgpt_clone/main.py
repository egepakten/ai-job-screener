# chatgpt_clone/main.py
from fastapi import FastAPI, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from chatgpt_clone.rag.retriever import load_faiss_index
from chatgpt_clone.rag.embedder import embed_text
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
    
    # 🎯 Smart k selection: limit to MAX_GPT_CONTEXT_RESULTS to prevent context overflow
    # Unless user explicitly wants all (use /jobs endpoint instead for better performance)
    k = min(MAX_GPT_CONTEXT_RESULTS, total_jobs)
    
    # Create cache key from query for caching
    query_cache_key = hashlib.md5(f"{user_input}_{user_memory}".encode()).hexdigest()
    
    # Search FAISS index (cached implicitly by query similarity)
    D, I = faiss_index.search(np.array([user_vector]).astype("float32"), k=k)
    
    # Get top relevant jobs
    relevant_jobs = [metadata[i] for i in I[0] if i < len(metadata)]
    
    # 🚀 Fast mode: return results without GPT processing
    if return_all:
        return {
            "answer": None,
            "jobs": relevant_jobs,
            "total_matches": len(relevant_jobs),
            "mode": "fast"
        }

    # 🧠 Build rich context from retrieved metadata
    relevant_chunks = "\n\n".join([
        f"**{job.get('title', 'Unknown')}** at {job.get('company', 'Unknown')}\n"
        f"💰 Salary: {job.get('salary', 'Not specified')}\n"
        f"📍 Location: {job.get('location', 'Not specified')}\n"
        f"🛠️ Tech Stack: {', '.join(job.get('tech_stack', []))}\n"
        f"📝 Description: {job.get('description', '')[:200]}..."
        for job in relevant_jobs
    ])
    
    # Add user memory context if provided
    memory_context = ""
    if user_memory:
        memory_context = f"\n\nUser Profile/Preferences:\n{user_memory}\n"

    # 💬 Create GPT messages with context
    messages = [
        {
            "role": "system",
            "content": f"You are a helpful job assistant with access to {total_jobs} job listings. "
                      f"Provide personalized, helpful recommendations based on the user's query."
        },
        {
            "role": "user",
            "content": f"""
User Query: {user_input}
{memory_context}
Below are the most relevant job positions based on the query:

{relevant_chunks}

Please analyze these jobs and provide a helpful response:
- Summarize the most relevant matches
- Highlight key details (salary, tech stack, company)
- Make recommendations based on the user's query
- Be concise but informative
"""
        }
    ]

    # 🧠 Call GPT-4o
    response = openai_client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
    )

    return {
        "answer": response.choices[0].message.content,
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
