import React, { useState, useEffect } from "react";
import axios from "axios";
import { Backendurl } from "../../private/private";
import { FaUser, FaLock, FaSave, FaCamera, FaTrash } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

// Axios instance
const api = axios.create({
  baseURL: Backendurl,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

// Attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("account");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Profile Data
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    username: "",
    phone: "",
  });

  // Password Data
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    retypePassword: "",
  });

  // Photo
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);

  // Sync user when it loads/changes
  useEffect(() => {
    if (!user) return; // no user yet
    setFormData({
      fullName: user.name || "",
      email: user.email || "",
      username: user.username || "",
      phone: user.phone || "",
    });
    setPhotoPreview(user.avatar || null);
    setLoading(false);
  }, [user]);

  // Handlers
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
    document.getElementById("photo-upload").value = "";
  };

  // API Calls
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const { data } = await api.patch("/api/update", {
        name: formData.fullName,
        username: formData.username,
        phone: formData.phone,
      });
      setSuccess(data.message || "Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordData.newPassword !== passwordData.retypePassword) {
      setError("New passwords do not match.");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    try {
      const { data } = await api.post("/api/change-password", {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });
      setSuccess(data.message || "Password changed successfully!");
      setPasswordData({ oldPassword: "", newPassword: "", retypePassword: "" });
    } catch (err) {
      setError(err.response?.data?.message || "Current password is incorrect.");
    }
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    const fd = new FormData();
    fd.append("UserImage", photoFile);
    try {
      await api.post("/api/update", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSuccess("Profile photo uploaded successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "Photo upload failed.");
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  // Render
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>

      {/* Tabs */}
      <div className="flex space-x-1 mb-8 border-b">
        <button
          onClick={() => setActiveTab("account")}
          className={`flex items-center gap-2 pb-3 px-4 rounded-t-lg transition ${
            activeTab === "account"
              ? "bg-teal-50 text-teal-700 border-b-2 border-teal-600"
              : "text-gray-500 hover:text-teal-600"
          }`}
        >
          <FaUser /> Account
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`flex items-center gap-2 pb-3 px-4 rounded-t-lg transition ${
            activeTab === "security"
              ? "bg-teal-50 text-teal-700 border-b-2 border-teal-600"
              : "text-gray-500 hover:text-teal-600"
          }`}
        >
          <FaLock /> Security
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-6 p-4 bg-red-100 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 bg-green-100 border border-green-200 text-green-700 rounded-lg">
          {success}
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        {activeTab === "account" ? (
          <form onSubmit={handleUpdateProfile} className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Account Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Left */}
              <div className="space-y-6">
                <div>
                  <label className="block text-gray-600 font-medium mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleProfileChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <div>
                  <label className="block text-gray-600 font-medium mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleProfileChange}
                    placeholder="+91 98765 43210"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400"
                  />
                </div>

                <button
                  type="submit"
                  className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg shadow hover:bg-teal-700 transition"
                >
                  <FaSave /> Update Profile
                </button>
              </div>

              {/* Right: Photo */}
              <div className="flex flex-col items-center space-y-4">
                <h3 className="font-medium text-gray-700">Profile Photo</h3>
                <div className="relative">
                  <img
                    src={
                      photoPreview || "https://via.placeholder.com/120?text=No+Photo"
                    }
                    alt="Profile"
                    className="w-32 h-32 rounded-full object-cover border-4 border-gray-200"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="absolute bottom-0 right-0 bg-teal-500 text-white p-2 rounded-full cursor-pointer hover:bg-teal-600"
                  >
                    <FaCamera />
                  </label>
                  <input
                    id="photo-upload"
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </div>
                {photoFile && (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleUploadPhoto}
                      className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                    >
                      Upload
                    </button>
                    <button
                      type="button"
                      onClick={removePhoto}
                      className="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    >
                      <FaTrash size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={handleChangePassword} className="p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Change Password
            </h2>
            <p className="text-gray-600 mb-6">
              Ensure your new password is strong and unique.
            </p>

            <div className="max-w-md space-y-6">
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="oldPassword"
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter current password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  name="retypePassword"
                  value={passwordData.retypePassword}
                  onChange={handlePasswordChange}
                  placeholder="Re-enter new password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-400"
                  required
                />
              </div>

              <button
                type="submit"
                className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-lg shadow hover:bg-teal-700 transition"
              >
                <FaSave /> Change Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
