// src/pages/Login.jsx
import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Backendurl } from "../../private/private";
import toast from "react-hot-toast";
const Login = () => {
  const {storeTokenInLS,isLoggedIn} = useAuth();
  if(isLoggedIn){
    return <Navigate to={'/dashboard'} />;
  }
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  // Basic validation
  if (!form.email || !form.password) {
    setError("Please fill in both email and password.");
    setLoading(false);
    return;
  }

  try {
    const res = await axios.post(`${Backendurl}/users/login`, form, {
      headers: {
        "Content-Type": "application/json",
      },
      withCredentials: true,
    });
    const data = res.data;

    // Handle success
    console.log(data);
    storeTokenInLS(data.data.accessToken);
    // toast.success(data.message);
  } catch (err) {
    // Handle error
    const errorMessage = err.response?.data?.message || err.message || "An error occurred during login.";
    setError(errorMessage);
    // toast.error(errorMessage);
    console.error("Login error:", err);
  } finally {
    // This will run whether the request succeeds or fails
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left Side - Image Section */}
      <div className="lg:w-1/2 w-full h-64 lg:h-auto relative">
        <img
          src="/images/login-illustration.jpg" // 🔁 Replace with your image path
          alt="Welcome Illustration"
          className="w-full h-full object-cover"
          style={{ objectPosition: "center" }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent"></div>
        <div className="absolute bottom-10 left-10 text-white max-w-md">
          <h1 className="text-4xl font-bold">Welcome Back</h1>
          <p className="text-lg mt-2 opacity-90">
            Sign in to manage your expenses, track revenue, and gain financial clarity.
          </p>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="lg:w-1/2 w-full flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-2">Sign In</h2>
          <p className="text-gray-500 text-center mb-6">Enter your credentials to access your account</p>

          {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0CE6A7] focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0CE6A7] focus:border-transparent transition"
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center text-gray-600">
                <input type="checkbox" className="mr-2 rounded border-gray-300" /> Remember me
              </label>
              <a href="/forgot-password" className="text-[#0CE6A7] hover:underline font-medium">
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0CE6A7] hover:bg-[#0bcf97] text-white font-semibold py-3 rounded-lg shadow transition duration-200 ease-in-out transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Don't have an account?{" "}
            <a href="/signup" className="text-[#0CE6A7] font-semibold hover:underline">
              Create one
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;