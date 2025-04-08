"use client";

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { LoadingSpinner } from "../components/ui/loading-spinner";
import logo from "../../public/assets/cam-youth (1).png";
import axios from "axios";

function LoginPage() {
  const [email, setEmail] = useState("admin@email.com");
  const [password, setPassword] = useState("p@55w0rd");
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      // await login(email, password);
      // Navigate is handled automatically by the redirect in the component
      const response = await axios.post(
        `${"https://devapi.cam-youth.com/api"}/user/login/`,
        { email, password },
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFTOKEN":
              "UfWxYuM9yYtNoJvAeAr8YbKgnx6Nrc8CmNqXJ6vgNC8nVSQU4PJsRlSxbFm4DnFB",
          },
        }
      );
      localStorage.setItem("token", response?.data?.access);
      console.log(response?.data?.access);
      navigate("/dashboard");
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-24 h-24 bg-primary rounded-full flex items-center justify-center mb-4">
            <img src={logo} alt="" />
          </div>
          <CardTitle className="text-2xl font-bold">CAM Cricket</CardTitle>
          <CardDescription>
            Sign in to your account to access the dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="admin@cricket.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-primary hover:text-primary-dark"
                >
                  Forgot your password?
                </a>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

export default LoginPage;
