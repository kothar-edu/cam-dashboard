import { useState, useEffect, useCallback } from "react";
import axios from "axios";

const token = localStorage.getItem("token");

// Create an Axios instance
const api = axios.create({
  baseURL: `${import.meta.env.VITE_URL}`, // Replace with your actual base URL
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  },
});

// Generic GET Hook
export function useGet(endpoint, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    api
      .get(endpoint)
      .then((res) => setData(res.data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, deps);

  return { data, loading, error };
}

// GET by ID
export function useGetById(endpoint, id, deps = []) {
  const fullUrl = `${endpoint}/${id}`;
  return useGet(fullUrl, deps);
}

// POST Hook
export function usePost() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const post = useCallback(async (endpoint, payload) => {
    console.log(endpoint);
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
  }, []);

  return { post, loading, error };
}

// PUT (Edit) Hook
export function useEdit() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const put = useCallback(async (endpoint, id, payload) => {
    setLoading(true);
    try {
      const res = await api.put(`${endpoint}/${id}`, payload);
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { put, loading, error };
}

// DELETE Hook
export function useDelete() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const deleteItem = useCallback(async (endpoint, id) => {
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
  }, []);

  return { deleteItem, loading, error };
}
