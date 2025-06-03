import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useToast } from "./use-toast";

// Grab token from wherever you store it
const getAuthToken = () => localStorage.getItem("token"); // adjust as needed

const BASE_URL = `${import.meta.env.VITE_URL}`;

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
export function useGet(endpoint, deps = [], withAuth = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const api = createApi(withAuth);

  useEffect(() => {
    setLoading(true);
    api
      .get(endpoint)
      .then((res) => setData(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error };
}

// GET by ID
export function useGetById(endpoint, id, deps = [], withAuth = true) {
  return useGet(`${endpoint}/${id}`, deps, withAuth);
}

// POST
export function usePost(withAuth = true) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = createApi(withAuth);

  const post = useCallback(
    async (endpoint, payload) => {
      setLoading(true);
      try {
        const res = await api.post(endpoint, payload);
        return res.data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  return { post, loading, error };
}

// PUT
export function useEdit(withAuth = true) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = createApi(withAuth);
  const { toast } = useToast();

  const edit = useCallback(
    async (endpoint, id, payload) => {
      setLoading(true);
      try {
        const res = await api.put(`${endpoint}/${id}`, payload);
        toast({
          title: "Success",
          description: "Tournament created successfully",
        });
        return res.data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  return { edit, loading, error };
}

// DELETE
export function useDelete(withAuth = true) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const api = createApi(withAuth);

  const deleteById = useCallback(
    async (endpoint, id) => {
      setLoading(true);
      try {
        const res = await api.delete(`${endpoint}/${id}`);
        return res.data;
      } catch (err) {
        setError(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [api]
  );

  return { deleteById, loading, error };
}
