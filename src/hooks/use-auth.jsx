"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useApi } from "./use-api";

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const api = useApi();
  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        // In a real app, you would check with your backend
        const storedUser = localStorage.getItem("cricket_user");
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Auth check failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // In a real app, you would authenticate with your backend
      // For demo purposes, we'll just simulate a successful login
      await new Promise((resolve) => setTimeout(resolve, 1000));
      const response = await api.post("/auth/login", { email, password });

      console.log(response.data);
      localStorage.setItem("cricket_user", JSON.stringify(user));
      localStorage.setItem("cricket_token", "dummy-jwt-token");
      setUser(user);
      return response?.data;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      // In a real app, you would log out with your backend
      await new Promise((resolve) => setTimeout(resolve, 500));
      localStorage.removeItem("cricket_user");
      localStorage.removeItem("cricket_token");
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
