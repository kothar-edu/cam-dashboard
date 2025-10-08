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
  const api = createApi(withAuth);

  // Memoize params and query to prevent unnecessary re-renders
  const memoizedParams = useMemo(() => params, [JSON.stringify(params)]);
  const memoizedQuery = useMemo(() => query, [JSON.stringify(query)]);

  useEffect(() => {
    setLoading(true);
    setError(null);

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

    api
      .get(url, config)
      .then((res) => setData(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, [endpoint, ...deps, memoizedParams, memoizedQuery]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
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
  return useGet(`${endpoint}/${id}`, deps, withAuth, params, query);
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
  const { toast } = useToast();

  const post = useCallback(
    async (endpoint, payload, options = {}) => {
      setLoading(true);
      setError(null);

      try {
        const res = await api.post(endpoint, payload);

        if (res.status === 200) {
          const message = options.successMessage || successMessage;
          toast({
            title: "Success",
            description: message,
          });
          onSuccess();
          return res.data;
        } else {
          onError();
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
export function useEdit(withAuth = true, messages = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = createApi(withAuth);
  const { toast } = useToast();

  const edit = useCallback(
    async (endpoint, id, payload, customMessages = {}) => {
      setLoading(true);
      try {
        const res = await api.put(`${endpoint}/${id}`, payload);

        const successMessage =
          customMessages.success ||
          messages.success ||
          "Data updated successfully";
        toast({
          title: "Success",
          description: successMessage,
        });

        return res.data;
      } catch (err) {
        setError(err);

        const errorMessage =
          customMessages.error || messages.error || "Failed to update data";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, messages, toast]
  );

  return { edit, loading, error };
}

// DELETE
export function useDelete(withAuth = true, messages = {}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = createApi(withAuth);
  const { toast } = useToast();

  const deleteById = useCallback(
    async (endpoint, id, customMessages = {}) => {
      setLoading(true);
      try {
        const res = await api.delete(`${endpoint}/${id}`);

        const successMessage =
          customMessages.success ||
          messages.success ||
          "Data deleted successfully";
        toast({
          title: "Success",
          description: successMessage,
        });

        return res.data;
      } catch (err) {
        setError(err);

        const errorMessage =
          customMessages.error || messages.error || "Failed to delete data";
        toast({
          title: "Error",
          description: errorMessage,
          variant: "destructive",
        });

        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api, messages, toast]
  );

  return { deleteById, loading, error };
}
