// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"; // ← Make sure Navigate is imported!
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardLayout from './pages/DashboardLayout';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* Dashboard (with nested routes inside) */}
        <Route path="/dashboard/*" element={<DashboardLayout />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;