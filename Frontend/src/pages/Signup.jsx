// src/pages/Signup.jsx
import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Backendurl } from "../../private/private";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
const Signup = () => {
  const {storeTokenInLS,isLoggedIn} = useAuth();
  if(isLoggedIn){
    return <Navigate to={'/dashboard'} />;
  }
  const [form, setForm] = useState({
    username: "",
    fullName: "",
    email: "",
    password: "",
    currency: "INR",
    monthlyBudget: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    } else {
      setAvatarPreview("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Frontend validation
    if (!form.username.trim()) {
      setError("Username is required.");
      setLoading(false);
      return;
    }
    if (!form.fullName.trim()) {
      setError("Full name is required.");
      setLoading(false);
      return;
    }
    if (!form.email) {
      setError("Email is required.");
      setLoading(false);
      return;
    }
    if (!form.password) {
      setError("Password is required.");
      setLoading(false);
      return;
    }
    if (!form.currency) {
      setError("Please select your currency.");
      setLoading(false);
      return;
    }
    if (!form.monthlyBudget || form.monthlyBudget <= 0) {
      setError("Monthly budget is required and must be greater than 0.");
      setLoading(false);
      return;
    }

    try {
      // Prepare FormData
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (avatarFile) {
        formData.append("UserImage", avatarFile);
      }

      // Send request
      const res = await axios.post(`${Backendurl}/users/register`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
          withCredentials: true,
      });

      const data = res.data;
      // Handle success
      console.log(data);
      storeTokenInLS(data.data.accessToken);
      toast.success(data.message);
      // navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-gray-50">
      {/* Left Side - Image / Illustration */}
      <div className="lg:w-1/2 w-full h-64 lg:h-auto relative">
        <img
          src="/images/signup-illustration.jpg"
          alt="Join Us Illustration"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-black/40"></div>
        <div className="absolute bottom-10 left-10 text-white max-w-md">
          <h1 className="text-4xl font-bold">Join ExpenseCalc</h1>
          <p className="text-lg mt-2 opacity-90">
            Start tracking your expenses, set budgets, and take control of your
            finances today.
          </p>
        </div>
      </div>

      {/* Right Side - Signup Form */}
      <div className="lg:w-1/2 w-full flex items-center justify-center p-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-3xl font-semibold text-gray-800 text-center mb-2">
            Create Account
          </h2>
          <p className="text-gray-500 text-center mb-6">
            Fill in your details to get started
          </p>

          {error && (
            <div className="mb-4 text-red-500 text-sm text-center">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                placeholder="John Doe"
                value={form.fullName}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0CE6A7] transition"
                required
              />
            </div>

            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Username *
              </label>
              <input
                type="text"
                id="username"
                name="username"
                placeholder="johndoe"
                value={form.username}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0CE6A7] transition"
                required
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0CE6A7] transition"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Password *
              </label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="••••••••"
                value={form.password}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0CE6A7] transition"
                required
              />
            </div>

            {/* Currency */}
            <div>
              <label
                htmlFor="currency"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Currency *
              </label>
              <select
                id="currency"
                name="currency"
                value={form.currency}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0CE6A7] transition bg-white"
                required
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="INR">INR - Indian Rupee</option>
                <option value="JPY">JPY - Japanese Yen</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>

            {/* Monthly Budget */}
            <div>
              <label
                htmlFor="monthlyBudget"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Monthly Budget ($)*
              </label>
              <input
                type="number"
                id="monthlyBudget"
                name="monthlyBudget"
                placeholder="e.g. 2000"
                value={form.monthlyBudget}
                onChange={handleChange}
                min="1"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0CE6A7] transition"
                required
              />
            </div>

            {/* Avatar Upload */}
            <div>
              <label
                htmlFor="avatar"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Profile Picture (Optional)
              </label>
              <input
                type="file"
                id="avatar"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none"
              />
              {avatarPreview && (
                <div className="mt-2 flex justify-center">
                  <img
                    src={avatarPreview}
                    alt="Preview"
                    className="w-16 h-16 rounded-full object-cover border"
                  />
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#0CE6A7] hover:bg-[#0bcf97] text-white font-semibold py-3 rounded-lg shadow transition duration-200 ease-in-out transform hover:scale-[1.01] disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500">
            Already have an account?{" "}
            <a
              href="/login"
              className="text-[#0CE6A7] font-semibold hover:underline"
            >
              Sign In
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
