import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  message: string;
  session_id?: string;
  user_memory?: string;
  return_all?: boolean;
  use_gpt?: boolean; // ✅ NEW: For fast mode
}

export interface Job {
  title: string;
  company: string;
  salary: string;
  tech_stack: string[];
  location: string;
  description: string;
  visa_sponsorship: string;
  link: string;
  full_description?: string;
}

// ✅ NEW: Parsed query structure from agent
export interface ParsedQuery {
  skills: string[];
  salary_min: number | null;
  salary_max: number | null;
  location: string | null;
  visa_required: boolean;
  remote: boolean;
}

export interface ChatResponse {
  answer: string;
  jobs: Job[];
  total_matches: number;
  parsed_query?: ParsedQuery; // ✅ NEW: Agent's parsed query
  mode: "gpt" | "fast" | "agent_gpt" | "agent_fast"; // ✅ UPDATED: New modes
}

export interface JobsResponse {
  results: Job[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface SystemStats {
  total_jobs: number;
  total_users: number;
  cache_size: object;
  max_gpt_results: number;
  endpoints?: {
    [key: string]: string;
  };
}

// ✅ Browse/Search Jobs API (No GPT, free & fast)
export const jobsAPI = {
  // Browse all jobs with pagination
  browseJobs: async (
    page: number = 1,
    limit: number = 50
  ): Promise<JobsResponse> => {
    try {
      const response = await api.get<JobsResponse>("/jobs", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error browsing jobs:", error);
      throw error;
    }
  },

  // Search jobs by keyword
  searchJobs: async (
    searchTerm: string,
    page: number = 1,
    limit: number = 50
  ): Promise<JobsResponse> => {
    try {
      const response = await api.get<JobsResponse>("/jobs", {
        params: { search: searchTerm, page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error searching jobs:", error);
      throw error;
    }
  },

  // Get system stats
  getStats: async (): Promise<SystemStats> => {
    try {
      const response = await api.get<SystemStats>("/stats");
      return response.data;
    } catch (error) {
      console.error("Error getting stats:", error);
      throw error;
    }
  },
};

// ✅ UPDATED: Chat API with new agent-chat endpoint
export const chatAPI = {
  // ⭐ NEW: Agentic RAG endpoint (recommended)
  sendMessage: async (
    message: string,
    options?: {
      sessionId?: string;
      userMemory?: string;
      fastMode?: boolean;
      useGpt?: boolean;
    }
  ): Promise<ChatResponse> => {
    try {
      // ✅ Use /agent-chat endpoint (new intelligent system)
      const response = await api.post<ChatResponse>("/agent-chat", {
        message,
        session_id: options?.sessionId,
        user_memory: options?.userMemory,
        use_gpt: options?.useGpt !== false, // Default: true
      });
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },

  // Old RAG endpoint (for comparison/fallback)
  sendMessageOld: async (
    message: string,
    options?: {
      sessionId?: string;
      userMemory?: string;
      fastMode?: boolean;
    }
  ): Promise<ChatResponse> => {
    try {
      const response = await api.post<ChatResponse>("/chat", {
        message,
        session_id: options?.sessionId,
        user_memory: options?.userMemory,
        return_all: options?.fastMode || false,
      });
      return response.data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  },
};

export default api;
