import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import { useToast } from "./use-toast";

// Grab token from wherever you store it
const getAuthToken = () => localStorage.getItem("token"); // adjust as needed

// const BASE_URL = `${import.meta.env.VITE_URL}`;
const BASE_URL = `https://devapi.cam-youth.com/api`;

// Axios factory with optional auth header
const createApi = (withAuth = true) => {
  const token = withAuth ? getAuthToken() : null;

  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  });
};

// GET
export function useGet(
  endpoint,
  deps = [],
  withAuth = true,
  params = {},
  query = {}
) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Memoize the API instance to prevent recreation on every render
  const api = useMemo(() => createApi(withAuth), [withAuth]);

  // Memoize params and query to prevent unnecessary re-renders
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);
  const memoizedQuery = useMemo(() => query, [JSON.stringify(query)]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build the URL with path parameters
      let url = endpoint;
      if (memoizedParams && Object.keys(memoizedParams).length > 0) {
        Object.keys(memoizedParams).forEach((key) => {
          url = url.replace(`:${key}`, memoizedParams[key]);
        });
      }

      // Add query parameters
      const config = {};
      if (memoizedQuery && Object.keys(memoizedQuery).length > 0) {
        config.params = memoizedQuery;
      }

      const response = await api.get(url, config);
      setData(response.data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  }, [api, endpoint, memoizedParams, memoizedQuery]);

  useEffect(() => {
    fetchData();
  }, [...deps]);

  return { data, loading, error, refetch: fetchData };
}

// GET by ID
export function useGetById(
  endpoint,
  id,
  deps = [],
  withAuth = true,
  params = {},
  query = {}
) {
  if (id) return useGet(`${endpoint}/${id}/`, deps, withAuth, params, query);
  else return { data: null, loading: false, error: null };
}

// POST
export function usePost(config = {}) {
  const {
    withAuth = true,
    successMessage = "Data created successfully",
    errorMessage = "Failed to create data",
    onSuccess,
    onError,
  } = config;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = createApi(withAuth);
  const toast = useToast();

  const post = useCallback(
    async (endpoint, payload, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.post(endpoint, payload);
        console.log(res);
        if (res.data) {
          const message = options.successMessage || successMessage;
          toast.success(message || "Data created successfully");
          onSuccess && onSuccess();
          return res.data;
        } else {
          onError && onError();
          toast.error(errorMessage || "Failed to create data");
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    },
    [api, successMessage, errorMessage, onSuccess, onError, toast]
  );

  return { post, loading, error };
}

// PUT
export function useEdit(config = {}) {
  const {
    withAuth = true,
    successMessage = "Data updated successfully",
    errorMessage = "Failed to update data",
    onSuccess,
    onError,
  } = config;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = createApi(withAuth);
  const toast = useToast();

  const edit = useCallback(
    async (endpoint, id, payload, customMessages = {}) => {
      setLoading(true);
      try {
        const res = await api.put(`${endpoint}/${id}/`, payload);

        const message =
          customMessages.success ||
          successMessage ||
          "Data updated successfully";
        onSuccess && onSuccess();
        toast.success(message);

        return res.data;
      } catch (err) {
        setError(err);

        const message =
          customMessages.error || errorMessage || "Failed to update data";
        onError && onError();
        toast.error(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, onSuccess, onError, toast]
  );

  return { edit, loading, error };
}

// DELETE
export function useDelete(config = {}) {
  const {
    withAuth = true,
    successMessage = "Data deleted successfully",
    errorMessage = "Failed to delete data",
    onSuccess,
    onError,
  } = config;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = createApi(withAuth);
  const toast = useToast();

  const deleteById = useCallback(
    async (endpoint, id, customMessages = {}) => {
      setLoading(true);
      try {
        const res = await api.delete(`${endpoint}/${id}/`);
        const message =
          customMessages.success ||
          successMessage ||
          "Data deleted successfully";
        toast.success(message);
        onSuccess && onSuccess();

        return res.data;
      } catch (err) {
        setError(err);
        onError && onError();
        setLoading(false);

        const message =
          customMessages.error || errorMessage || "Failed to delete data";
        toast.error(message);

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, onSuccess, onError, toast]
  );

  return { deleteById, loading, error };
}
