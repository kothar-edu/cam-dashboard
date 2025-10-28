"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useQuery } from "@tanstack/react-query";
import { queryClient } from "../lib/queryClient";
import axios from "../lib/axios";
const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem("token"));

  const [userPagination, setUserPagination] = useState({
    pageIndex: 0,
    pageSize: 20,
    search: null,
    isActive: null,
    isPaymentVerified: null,
    isStaff: null,
    paymentStatus: null,
  });

  const getUsers = async (userPagination) => {
    const params = {};

    // Pagination
    if (userPagination.pageSize) {
      params.limit = userPagination.pageSize;
    }
    if (
      userPagination.pageIndex !== undefined &&
      userPagination.pageIndex !== null
    ) {
      params.offset = userPagination.pageIndex * userPagination.pageSize;
    }

    // Search
    if (userPagination.search) {
      params.search = userPagination.search;
    }

    // Filters
    if (
      userPagination.isActive !== null &&
      userPagination.isActive !== undefined
    ) {
      params.is_active = userPagination.isActive;
    }
    if (
      userPagination.isPaymentVerified !== null &&
      userPagination.isPaymentVerified !== undefined
    ) {
      params.is_payment_verified = userPagination.isPaymentVerified;
    }
    if (
      userPagination.isStaff !== null &&
      userPagination.isStaff !== undefined
    ) {
      params.is_staff = userPagination.isStaff;
    }
    if (userPagination.paymentStatus) {
      params.payment_status = userPagination.paymentStatus;
    }

    const response = await axios.get("/user/", { params });
    return response.data;
  };

  const {
    data: usersList = [],
    isFetching: isFetchingUsers,
    error: errorUsers,
  } = useQuery({
    queryKey: ["users", userPagination],
    queryFn: () => getUsers(userPagination),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 0,
    cacheTime: 0,
    enabled: !!token,
  });

  const refetchPaginatedUsers = (params = {}) => {
    queryClient.fetchQuery({
      queryKey: ["users", userPagination],
      queryFn: () => getUsers(params),
    });
  };

  const {
    data: rolesList = [],
    isFetching: isFetchingRoles,
    error: errorRoles,
    refetch: refetchRoles,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: () => getRoles(),
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 0,
    cacheTime: 0,
    enabled: false,
  });

  const getRoles = async () => {
    const response = await axios.get("/user/role/");
    return response.data;
  };

  // const api = useApi();
  useEffect(() => {
    // Check if user is already logged in
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
      setToken(token);
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }

    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setToken(null);
    delete axios.defaults.headers.common["Authorization"];
    setUser(null);
    toast.success("Logged out successfully");
  };

  const value = {
    user,
    setUser,
    loading,
    logout,
    token,
    setToken,
    usersList,
    isFetchingUsers,
    errorUsers,
    userPagination,
    setUserPagination,
    refetchPaginatedUsers,
    rolesList,
    isFetchingRoles,
    errorRoles,
    refetchRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
