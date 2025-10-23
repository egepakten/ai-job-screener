# chatgpt_clone/rag/query_analyzer.py
"""
Query Analyzer - Extracts structured filters from natural language queries
This is the BRAIN that understands what the user wants
"""

import re
import openai
import os
from typing import Dict, List, Optional
from dotenv import load_dotenv

load_dotenv()
openai_client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


class QueryAnalyzer:
    """
    Analyzes user queries and extracts:
    - Skills/technologies required
    - Salary range
    - Location preferences  
    - Visa sponsorship needs
    - Remote work preference
    """
    
    def __init__(self):
        # Common UK cities for location matching
        self.uk_cities = [
            "london", "manchester", "birmingham", "leeds", "glasgow",
            "liverpool", "edinburgh", "bristol", "cardiff", "belfast"
        ]
        
    def analyze_query(self, query: str) -> Dict:
        """
        Main method: Takes a natural language query and returns structured filters
        
        Example:
        Input: "Find Python jobs in London paying over £60k with visa sponsorship"
        Output: {
            "skills": ["Python"],
            "salary_min": 60000,
            "salary_max": None,
            "location": "London",
            "visa_required": True,
            "remote": False,
            "query_type": "skill_search"
        }
        """
        
        query_lower = query.lower()
        
        # Extract different components
        skills = self._extract_skills(query_lower)
        salary_min, salary_max = self._extract_salary(query_lower)
        location = self._extract_location(query_lower)
        visa_required = self._check_visa_requirement(query_lower)
        remote = self._check_remote(query_lower)
        query_type = self._determine_query_type(query_lower)
        
        return {
            "skills": skills,
            "salary_min": salary_min,
            "salary_max": salary_max,
            "location": location,
            "visa_required": visa_required,
            "remote": remote,
            "query_type": query_type,
            "original_query": query
        }
    
    def _extract_skills(self, query: str) -> List[str]:
        """
        Extract programming languages and technologies
        
        SIMPLE VERSION: Uses keyword matching
        """
        # Common tech skills to look for
        tech_keywords = [
            "python", "javascript", "typescript", "java", "c++", "c#", "ruby",
            "go", "golang", "rust", "php", "swift", "kotlin", "scala",
            "react", "angular", "vue", "node", "nodejs", "django", "flask",
            "spring", "aws", "azure", "gcp", "docker", "kubernetes", "k8s",
            "sql", "postgresql", "mysql", "mongodb", "redis", "elasticsearch",
            "machine learning", "ml", "ai", "data science", "devops"
        ]
        
        found_skills = []
        for skill in tech_keywords:
            if skill in query:
                found_skills.append(skill.title())  # Capitalize first letter
        
        return found_skills
    
    def _extract_salary(self, query: str) -> tuple:
        """
        Extract salary requirements
        
        Looks for patterns like:
        - "over £60k" or "above £60000"
        - "£50k to £70k" or "between £50000 and £70000"
        - "at least £40k"
        """
        salary_min = None
        salary_max = None
        
        # Pattern 1: "over £60k" or "above £60000" or "more than £60k"
        over_pattern = r'(?:over|above|more than|at least)\s*£?(\d+)k?'
        over_match = re.search(over_pattern, query)
        if over_match:
            amount = int(over_match.group(1))
            # If it's a small number like "60", assume it's in thousands
            salary_min = amount * 1000 if amount < 1000 else amount
        
        # Pattern 2: "£50k to £70k" or "between £50000 and £70000"
        range_pattern = r'£?(\d+)k?\s*(?:to|-|and)\s*£?(\d+)k?'
        range_match = re.search(range_pattern, query)
        if range_match:
            min_amount = int(range_match.group(1))
            max_amount = int(range_match.group(2))
            salary_min = min_amount * 1000 if min_amount < 1000 else min_amount
            salary_max = max_amount * 1000 if max_amount < 1000 else max_amount
        
        return salary_min, salary_max
    
    def _extract_location(self, query: str) -> Optional[str]:
        """
        Extract location from query
        
        Looks for UK cities in the query
        """
        for city in self.uk_cities:
            if city in query:
                return city.title()  # Capitalize: london → London
        
        # Check for "remote" as a location
        if "remote" in query or "work from home" in query:
            return "Remote"
        
        return None
    
    def _check_visa_requirement(self, query: str) -> bool:
        """
        Check if user needs visa sponsorship
        
        Keywords: visa, sponsorship, sponsor, tier 2, work permit
        """
        visa_keywords = ["visa", "sponsorship", "sponsor", "tier 2", "work permit"]
        return any(keyword in query for keyword in visa_keywords)
    
    def _check_remote(self, query: str) -> bool:
        """Check if user wants remote work"""
        remote_keywords = ["remote", "work from home", "wfh", "hybrid"]
        return any(keyword in query for keyword in remote_keywords)
    
    def _determine_query_type(self, query: str) -> str:
        """
        Classify the query type
        
        Types:
        - skill_search: "find python jobs"
        - company_search: "jobs at google"
        - general_browse: "show me all jobs"
        - comparison: "compare python vs javascript salaries"
        """
        if "compare" in query or "vs" in query or "versus" in query:
            return "comparison"
        
        if any(word in query for word in ["at", "company", "companies"]):
            return "company_search"
        
        if any(word in query for word in ["all", "browse", "list", "show"]):
            return "general_browse"
        
        return "skill_search"


# ==========================================
# TESTING FUNCTION (you can run this to test)
# ==========================================

def test_analyzer():
    """Test the query analyzer with sample queries"""
    analyzer = QueryAnalyzer()
    
    test_queries = [
        "Find Python jobs in London paying over £60k with visa sponsorship",
        "Show me React developer positions in Manchester",
        "Remote machine learning jobs between £70k and £90k",
        "JavaScript jobs at Google",
        "Compare Python vs Java salaries"
    ]
    
    print("🧪 Testing Query Analyzer\n")
    for query in test_queries:
        print(f"Query: {query}")
        result = analyzer.analyze_query(query)
        print(f"Result: {result}\n")


if __name__ == "__main__":
    test_analyzer()