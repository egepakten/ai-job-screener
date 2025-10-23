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

export interface ChatResponse {
  answer: string;
  jobs: Job[];
  total_matches: number;
  mode: "gpt" | "fast";
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
}

// ✅ NEW: Browse/Search Jobs API (No GPT, free & fast)
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

// ✅ UPDATED: Chat API with new features
export const chatAPI = {
  // Smart search with GPT
  sendMessage: async (
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
