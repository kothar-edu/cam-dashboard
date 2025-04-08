"use client";

import { useState, useCallback, useEffect } from "react";
import axios from "axios";

// In a real app, you would configure axios with your API base URL
const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Add retry logic and better error handling
export function useApi() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Add auth token to requests
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("cricket_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Helper function to handle API calls with retry logic
  const apiCallWithRetry = async (apiCall) => {
    let currentRetry = 0;

    while (currentRetry <= maxRetries) {
      try {
        return await apiCall();
      } catch (err) {
        currentRetry++;

        // If it's the last retry, throw the error
        if (currentRetry > maxRetries) {
          throw err;
        }

        // If it's a network error or 5xx, retry after delay
        if (!err.response || (err.response && err.response.status >= 500)) {
          // Exponential backoff: 1s, 2s, 4s, etc.
          const delay = 1000 * Math.pow(2, currentRetry - 1);
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        // For other errors (4xx), don't retry
        throw err;
      }
    }
  };

  const get = useCallback(async (url, config) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCallWithRetry(() => api.get(url, config));
      return response.data;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const post = useCallback(async (url, data, config) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCallWithRetry(() =>
        api.post(url, data, config)
      );
      return response.data;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const put = useCallback(async (url, data, config) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCallWithRetry(() => api.put(url, data, config));
      return response.data;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const del = useCallback(async (url, config) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await apiCallWithRetry(() => api.delete(url, config));
      return response.data;
    } catch (err) {
      setError(
        err instanceof Error ? err : new Error("An unknown error occurred")
      );
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Rest of the code remains the same...
  const setupApi = () => {
    const token = localStorage.getItem("cricket_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  };

  useEffect(() => {
    setupApi();
  }, []);

  return {
    get,
    post,
    put,
    del,
    isLoading,
    error,
    setupApi,
  };
}
