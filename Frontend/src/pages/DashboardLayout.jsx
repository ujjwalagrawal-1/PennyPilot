// pages/DashboardLayout.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import SidebarNavbar from '../components/SidebarNavbar'; // Adjust path if needed
import Overview from './Overview';
import Transactions from './Transactions';
import Bills from './Bills';
import Expenses from './Expenses';
import Settings from './Settings';

const DashboardLayout = () => {
  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {/* Sidebar */}
      <SidebarNavbar />

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-h-screen bg-gray-50">
        <div className="flex-1 overflow-auto p-6">
          <Routes>
            <Route path="/" element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<Overview />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="bills" element={<Bills />} />
            <Route path="expense" element={<Expenses height={350} flag={true} width="100%" />} />
            <Route path="settings" element={<Settings />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;