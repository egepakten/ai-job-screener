# chatgpt_clone/rag/job_agent.py
"""
Job Agent - The intelligent system that decides HOW to search for jobs
This is AGENTIC RAG in action!
"""

import numpy as np
from typing import List, Dict, Optional
from .embedder import embed_text
from .query_analyzer import QueryAnalyzer


class JobAgent:
    """
    The Job Agent uses multiple TOOLS to find the best matching jobs:
    
    Tool 1: Vector Search (FAISS) - Finds semantically similar jobs
    Tool 2: Salary Filter - Filters by salary range  
    Tool 3: Location Filter - Filters by location
    Tool 4: Visa Filter - Filters by visa sponsorship
    Tool 5: Skill Filter - Filters by exact skill matches
    
    The agent DECIDES which tools to use and in what order!
    """
    
    def __init__(self, faiss_index, metadata):
        """
        Initialize the agent with:
        - faiss_index: Your FAISS vector index
        - metadata: List of all job dictionaries
        """
        self.faiss_index = faiss_index
        self.metadata = metadata
        self.analyzer = QueryAnalyzer()
        
    def search(self, query: str, top_k: int = 20) -> Dict:
        """
        Main search method - This is where the magic happens!
        
        The agent:
        1. Analyzes the query to understand what user wants
        2. Plans which tools to use
        3. Executes the search strategy
        4. Returns filtered results
        """
        
        # STEP 1: Analyze the query
        print(f"🧠 Agent analyzing query: '{query}'")
        parsed_query = self.analyzer.analyze_query(query)
        print(f"📊 Parsed query: {parsed_query}")
        
        # STEP 2: Execute search based on query type
        if parsed_query["query_type"] == "general_browse":
            # Simple case: user wants to browse all jobs
            print("📋 Strategy: Return all jobs (no filtering needed)")
            results = self.metadata[:top_k]
            
        elif parsed_query["query_type"] == "comparison":
            # Special case: user wants to compare (future enhancement)
            print("📊 Strategy: Comparison query detected")
            results = self._handle_comparison(parsed_query, top_k)
            
        else:
            # Main case: Smart multi-step filtering
            print("🎯 Strategy: Multi-step filtered search")
            results = self._multi_step_search(parsed_query, top_k)
        
        return {
            "jobs": results,
            "total_results": len(results),
            "parsed_query": parsed_query,
            "strategy": "agentic_rag"
        }
    
    def _multi_step_search(self, parsed_query: Dict, top_k: int) -> List[Dict]:
        """
        The CORE of Agentic RAG - Multi-step intelligent search
        
        This method decides the ORDER of operations:
        1. Start with vector search (cast a wide net)
        2. Apply hard filters (salary, location, visa)
        3. Rank by relevance
        """
        
        # TOOL 1: Vector Search - Find semantically similar jobs
        print("  🔍 Tool 1: Vector search for semantic similarity")
        
        # Create search query from skills
        if parsed_query["skills"]:
            search_text = " ".join(parsed_query["skills"]) + " developer"
        else:
            search_text = parsed_query["original_query"]
        
        # Get MORE candidates than we need (we'll filter down)
        candidate_k = min(100, self.faiss_index.ntotal)  # Get up to 100 candidates
        vector_results = self._vector_search(search_text, candidate_k)
        print(f"    ✓ Found {len(vector_results)} candidates from vector search")
        
        # TOOL 2: Apply filters one by one
        filtered_results = vector_results
        
        # Filter by salary
        if parsed_query["salary_min"]:
            print(f"  💰 Tool 2: Filtering by salary >= £{parsed_query['salary_min']}")
            filtered_results = self._filter_by_salary(
                filtered_results, 
                parsed_query["salary_min"],
                parsed_query["salary_max"]
            )
            print(f"    ✓ {len(filtered_results)} jobs after salary filter")
        
        # Filter by location
        if parsed_query["location"]:
            print(f"  📍 Tool 3: Filtering by location = {parsed_query['location']}")
            filtered_results = self._filter_by_location(
                filtered_results,
                parsed_query["location"]
            )
            print(f"    ✓ {len(filtered_results)} jobs after location filter")
        
        # Filter by visa sponsorship
        if parsed_query["visa_required"]:
            print(f"  🛂 Tool 4: Filtering by visa sponsorship")
            filtered_results = self._filter_by_visa(filtered_results)
            print(f"    ✓ {len(filtered_results)} jobs after visa filter")
        
        # Filter by remote preference
        if parsed_query["remote"]:
            print(f"  🏠 Tool 5: Filtering for remote jobs")
            filtered_results = self._filter_by_remote(filtered_results)
            print(f"    ✓ {len(filtered_results)} jobs after remote filter")
        
        # Return top K results
        final_results = filtered_results[:top_k]
        print(f"✅ Final results: {len(final_results)} jobs")
        
        return final_results
    
    # ==========================================
    # TOOL IMPLEMENTATIONS
    # ==========================================
    
    def _vector_search(self, query: str, k: int) -> List[Dict]:
        """
        TOOL: Vector search using FAISS
        
        This finds jobs that are semantically similar to the query
        """
        # Embed the query
        query_vector = embed_text(query)
        
        # Search FAISS
        D, I = self.faiss_index.search(
            np.array([query_vector]).astype("float32"), 
            k=k
        )
        
        # Return matching jobs
        results = [self.metadata[i] for i in I[0] if i < len(self.metadata)]
        return results
    
    def _filter_by_salary(
        self, 
        jobs: List[Dict], 
        min_salary: Optional[int],
        max_salary: Optional[int] = None
    ) -> List[Dict]:
        """
        TOOL: Filter jobs by salary range
        
        This removes jobs that don't meet salary requirements
        """
        filtered = []
        
        for job in jobs:
            salary_str = job.get('salary', '').lower()
            
            # Skip if no salary info
            if not salary_str or salary_str == 'not specified':
                continue
            
            # Extract salary number from string like "£60,000 - £80,000"
            # Simple approach: find all numbers and take the first one
            import re
            numbers = re.findall(r'[\d,]+', salary_str)
            if not numbers:
                continue
            
            # Parse the first number (usually the minimum)
            job_salary = int(numbers[0].replace(',', ''))
            
            # Apply filters
            if min_salary and job_salary < min_salary:
                continue
            
            if max_salary and job_salary > max_salary:
                continue
            
            filtered.append(job)
        
        return filtered
    
    def _filter_by_location(self, jobs: List[Dict], location: str) -> List[Dict]:
        """
        TOOL: Filter jobs by location
        
        Matches location string (case-insensitive)
        """
        location_lower = location.lower()
        
        filtered = []
        for job in jobs:
            job_location = job.get('location', '').lower()
            
            # Check if location matches
            if location_lower in job_location:
                filtered.append(job)
        
        return filtered
    
    def _filter_by_visa(self, jobs: List[Dict]) -> List[Dict]:
        """
        TOOL: Filter for jobs offering visa sponsorship
        """
        filtered = []
        
        for job in jobs:
            visa_info = job.get('visa_sponsorship', '').lower()
            
            # Check if visa is mentioned positively
            if 'yes' in visa_info or 'available' in visa_info or 'sponsor' in visa_info:
                filtered.append(job)
        
        return filtered
    
    def _filter_by_remote(self, jobs: List[Dict]) -> List[Dict]:
        """
        TOOL: Filter for remote jobs
        """
        filtered = []
        
        for job in jobs:
            location = job.get('location', '').lower()
            description = job.get('description', '').lower()
            
            # Check if remote is mentioned
            if 'remote' in location or 'remote' in description:
                filtered.append(job)
        
        return filtered
    
    def _handle_comparison(self, parsed_query: Dict, top_k: int) -> List[Dict]:
        """
        TOOL: Handle comparison queries (future enhancement)
        
        Example: "Compare Python vs JavaScript salaries"
        """
        # For now, just return basic results
        # In the future, this could do statistical analysis
        return self._vector_search(parsed_query["original_query"], top_k)


# ==========================================
# TESTING FUNCTION
# ==========================================

def test_agent():
    """
    Test the agent with sample queries
    
    NOTE: This won't work standalone because it needs FAISS index
    Use this as a reference for how to use the agent
    """
    print("""
    🧪 Agent Usage Example:
    
    from chatgpt_clone.rag.retriever import load_faiss_index
    from chatgpt_clone.rag.job_agent import JobAgent
    
    # Load your FAISS index
    faiss_index, metadata = load_faiss_index()
    
    # Create agent
    agent = JobAgent(faiss_index, metadata)
    
    # Search
    results = agent.search("Find Python jobs in London paying over £60k")
    
    # Get results
    print(f"Found {results['total_results']} jobs")
    for job in results['jobs']:
        print(f"- {job['title']} at {job['company']}")
    """)


if __name__ == "__main__":
    test_agent()