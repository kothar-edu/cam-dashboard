"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
// import { useApi } from "../hooks/use-api";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: "1",
    email: "admin@email.com",
    name: "Admin User",
    role: "admin",
  });
  const [loading, setLoading] = useState(true);
  // const api = useApi();
  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    // try {
    //   setLoading(true);
    //   // In a real app, this would be an API call
    //   // For demo purposes, we'll simulate a successful login
    //   if (email && password) {
    //     const response = await axios.post(
    //       `${"https://api.cam-youth.com/api"}/user/login/`,
    //       { email, password },
    //       {
    //         method: "POST",
    //         headers: {
    //           "Content-Type": "application/json",
    //           "X-CSRFTOKEN":
    //             "UfWxYuM9yYtNoJvAeAr8YbKgnx6Nrc8CmNqXJ6vgNC8nVSQU4PJsRlSxbFm4DnFB",
    //         },
    //       }
    //     );
    //     console.log(response.data);
    //     axios.defaults.withXSRFToken = true;
    //     const token = "demo-token-12345";
    //     // Store user data and token
    //     localStorage.setItem("user", JSON.stringify(userData));
    //     localStorage.setItem("token", token);
    //     // Set axios default header
    //     setUser(userData);
    //     toast.success("Login successful");
    //     return userData;
    //   } else {
    //     throw new Error("Invalid credentials");
    //   }
    // } catch (error) {
    //   toast.error(error.message || "Login failed");
    //   throw error;
    // } finally {
    //   setLoading(false);
    // }
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    loading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
