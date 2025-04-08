"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";

const useApiCrud = (options) => {
  // Destructure options with defaults
  const {
    baseUrl = process.env.REACT_APP_API_URL || "/api",
    endpoint = "",
    useMockData = false,
    mockData = [],
    idField = "id",
    onSuccess = null,
    onError = null,
    debounceMs = 500,
    loadOnMount = true,
  } = options;

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Use refs to prevent unnecessary re-renders and API calls
  const debounceTimerRef = useRef(null);
  const initialLoadCompletedRef = useRef(false);
  const apiInstanceRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Create axios instance only once
  if (!apiInstanceRef.current) {
    apiInstanceRef.current = axios.create({
      baseURL: baseUrl,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 10000,
    });
  }

  // Debounce function to prevent excessive API calls
  const debounce = useCallback(
    (func, ...args) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      return new Promise((resolve) => {
        debounceTimerRef.current = setTimeout(() => {
          resolve(func(...args));
        }, debounceMs);
      });
    },
    [debounceMs]
  );

  // Get all items
  const getAll = useCallback(
    async (params = {}, skipDebounce = false) => {
      // Cancel any ongoing requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create a new abort controller for this request
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
        const request = async () => {
          const url = endpoint ? `/${endpoint}` : "/";
          return await apiInstanceRef.current.get(url, {
            params,
            signal: abortControllerRef.current.signal,
          });
        };

        const response = skipDebounce
          ? await request()
          : await debounce(request);
        setData(response.data);

        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (error) {
        // Don't set error state if request was aborted
        if (error.name !== "AbortError" && error.name !== "CanceledError") {
          setError(error);
          if (onError) {
            onError(error);
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [endpoint, debounce, onSuccess, onError]
  );

  // Get item by ID
  const getById = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const url = endpoint ? `/${endpoint}/${id}` : `/${id}`;
        const response = await apiInstanceRef.current.get(url);

        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (error) {
        setError(error);
        if (onError) {
          onError(error);
        }
      } finally {
        setLoading(false);
      }
    },
    [endpoint, onSuccess, onError]
  );

  // Create a new item
  const create = useCallback(
    async (item) => {
      setLoading(true);
      setError(null);

      try {
        const url = endpoint ? `/${endpoint}` : "/";
        const response = await apiInstanceRef.current.post(url, item);

        setData((prevData) => [...prevData, response.data]);

        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (error) {
        setError(error);
        if (onError) {
          onError(error);
        }
      } finally {
        setLoading(false);
      }
    },
    [endpoint, onSuccess, onError]
  );

  // Update an existing item
  const update = useCallback(
    async (id, item) => {
      setLoading(true);
      setError(null);

      try {
        const url = endpoint ? `/${endpoint}/${id}` : `/${id}`;
        const response = await apiInstanceRef.current.put(url, item);

        setData((prevData) =>
          prevData.map((i) => (i[idField] === id ? response.data : i))
        );

        if (onSuccess) {
          onSuccess(response.data);
        }

        return response.data;
      } catch (error) {
        setError(error);
        if (onError) {
          onError(error);
        }
      } finally {
        setLoading(false);
      }
    },
    [endpoint, idField, onSuccess, onError]
  );

  // Delete an item
  const remove = useCallback(
    async (id) => {
      setLoading(true);
      setError(null);

      try {
        const url = endpoint ? `/${endpoint}/${id}` : `/${id}`;
        await apiInstanceRef.current.delete(url);

        setData((prevData) => prevData.filter((i) => i[idField] !== id));

        if (onSuccess) {
          onSuccess();
        }
      } catch (error) {
        setError(error);
        if (onError) {
          onError(error);
        }
      } finally {
        setLoading(false);
      }
    },
    [endpoint, idField, onSuccess, onError]
  );

  // Search function with debounce
  const search = useCallback(
    (searchTerm, searchParams = {}) => {
      // Don't trigger API calls for empty or very short search terms
      if (!searchTerm || searchTerm.length < 2) {
        return Promise.resolve(data);
      }

      return getAll({ ...searchParams, search: searchTerm });
    },
    [getAll, data]
  );

  // Load data on mount if specified
  useEffect(() => {
    // Only load data once on mount if loadOnMount is true and not using mock data
    if (loadOnMount && !useMockData && !initialLoadCompletedRef.current) {
      getAll({}, true); // Skip debounce for initial load
      initialLoadCompletedRef.current = true;
    } else if (useMockData && !initialLoadCompletedRef.current) {
      // If using mock data, just set it directly
      setData(mockData);
      initialLoadCompletedRef.current = true;
    }

    // Cleanup function to cancel any pending requests when unmounting
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [loadOnMount, useMockData, mockData, getAll]);

  return {
    data,
    loading,
    error,
    getAll,
    getById,
    create,
    update,
    remove,
    search,
  };
};

export default useApiCrud;
