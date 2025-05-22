import { createContext, useState } from "react";
import type { ReactNode } from "react";
import axios from "axios";

// API URL
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

// Types
export interface AgentResponse {
  response: string;
  sources?: Array<{
    title: string;
    link: string;
    snippet: string;
  }>;
  metadata?: Record<string, any>;
}

export interface QueryHistory {
  id: string;
  query: string;
  response: string;
  timestamp: string;
}

interface KnowledgeContextType {
  isLoading: boolean;
  lastResponse: AgentResponse | null;
  queryHistory: QueryHistory[];
  error: string | null;
  fetchInformation: (
    query: string,
    saveToHistory?: boolean
  ) => Promise<AgentResponse>;
  fetchQueryHistory: (limit?: number) => Promise<void>;
}

// Create context
export const KnowledgeContext = createContext<KnowledgeContextType>({
  isLoading: false,
  lastResponse: null,
  queryHistory: [],
  error: null,
  fetchInformation: async () => ({ response: "" }),
  fetchQueryHistory: async () => {},
});

interface KnowledgeProviderProps {
  children: ReactNode;
}

// Knowledge Provider
export const KnowledgeProvider = ({ children }: KnowledgeProviderProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [lastResponse, setLastResponse] = useState<AgentResponse | null>(null);
  const [queryHistory, setQueryHistory] = useState<QueryHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Query information agent
  const fetchInformation = async (
    query: string,
    saveToHistory = true
  ): Promise<AgentResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.post(
        `${API_URL}/api/agent/query`,
        {
          query,
          additional_context: {},
        },
        {
          params: { save_to_history: saveToHistory },
        }
      );

      const agentResponse = res.data as AgentResponse;
      setLastResponse(agentResponse);

      // Update local query history if saved to backend
      if (saveToHistory) {
        const newEntry: QueryHistory = {
          id: Date.now().toString(), // Temporary ID until we refresh history
          query,
          response: agentResponse.response,
          timestamp: new Date().toISOString(),
        };

        setQueryHistory((prev) => [newEntry, ...prev]);
      }

      return agentResponse;
    } catch (error) {
      console.error("Error fetching information:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
      return { response: "Failed to retrieve information. Please try again." };
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch query history
  const fetchQueryHistory = async (limit = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await axios.get(`${API_URL}/api/agent/history`, {
        params: { limit },
      });

      setQueryHistory(res.data);
    } catch (error) {
      console.error("Error fetching query history:", error);
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KnowledgeContext.Provider
      value={{
        isLoading,
        lastResponse,
        queryHistory,
        error,
        fetchInformation,
        fetchQueryHistory,
      }}
    >
      {children}
    </KnowledgeContext.Provider>
  );
};

export default KnowledgeProvider;
