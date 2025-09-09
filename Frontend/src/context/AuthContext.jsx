// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Backendurl } from "../../private/private";

export const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("accessToken") || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bills,setbillscontext ] = useState([]);
  // Store token in localStorage and update state
  const storeTokenInLS = (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    setToken(accessToken);
  };

  // Helper to check if user is logged in
  const isLoggedIn = !!token;

  // Logout: clear everything
  const logout = () => {
    localStorage.removeItem("accessToken");
    setUser(null);
    setToken("");
    toast.success("Logged out successfully!");
  };
  // Fetch current user profile (main user data)
  const userAuthentication = async () => {
    setLoading(true);
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${Backendurl}/users/me`, {
        headers: { Authorization: `Bearer ${token}` },
        withCredentials: true,
      });
      // console.log(response);
      if (response.data.data) {
        const userData = response.data.data;
        setUser(userData);
      } else {
        logout();
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      toast.error("Session expired. Please log in again.");
      logout();
    } finally {
      setLoading(false);
    }
  };

  // Re-authenticate on token change or app reload
  useEffect(() => {
    userAuthentication();
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        user,
        setUser,
        loading,
        isLoggedIn,
        storeTokenInLS,
        logout,
        bills,
        setbillscontext
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  return useContext(AuthContext);
};