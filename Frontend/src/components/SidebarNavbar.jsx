// components/SidebarNavbar.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarNavbar = () => {
  const location = useLocation();

  // Define your menu items: name and route
  const menuItems = [
    { name: 'Overview', path: '/dashboard' },
    { name: 'Transactions', path: '/dashboard/transactions' },
    { name: 'Bills', path: '/dashboard/bills' },
    { name: 'Expense', path: '/dashboard/expense' },
    { name: 'Settings', path: '/dashboard/settings' },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white flex flex-col fixed h-full left-0 top-0 z-30">
      {/* Logo Section */}
      <div className="p-6 border-b border-gray-700">
        <h1 className="text-xl font-bold">PennyPilot</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200
                ${
                  isActive
                    ? 'bg-teal-600 text-white font-medium'
                    : 'text-gray-200 hover:bg-gray-700 hover:text-white'
                }
              `}
            >
              {/* You can add icons later (e.g., from Heroicons) */}
              <span className="text-sm md:text-base">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-gray-700">
        {/* Profile Info */}
        <div className="flex items-center space-x-3 mb-4">
          <img
            src="https://via.placeholder.com/32"
            alt="User profile"
            className="w-8 h-8 rounded-full object-cover"
          />
          <div>
            <p className="text-sm font-medium">Tanzir Rahman</p>
            <p className="text-xs text-gray-400 cursor-pointer hover:underline">
              View profile
            </p>
          </div>
        </div>

        {/* Logout Button */}
        <Link
          to="/logout"
          className="block w-full text-left px-4 py-2.5 text-sm text-gray-200 
                     bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors text-center"
        >
          Logout
        </Link>
      </div>
    </aside>
  );
};

export default SidebarNavbar;