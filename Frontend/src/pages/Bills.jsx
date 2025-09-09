// src/pages/BillsPage.jsx

import React, { useState, useEffect } from 'react';
import BillCard from '../cards/BillCards';
import axios from 'axios';
import { Backendurl } from '../../private/private';
import { useAuth } from '../context/AuthContext';
// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add interceptor to add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const BillsPage = () => {
  const {setbillscontext} = useAuth();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    vendorName: '',
    amount: '',
    dueDate: '',
    description: '',
    category: 'other',
    isRecurring: false,
    recurrence: 'monthly',
    paymentMethod: '',
  });

  // Fetch bills from backend
  const fetchBills = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`${Backendurl}/bills`);
      setBills(data.data || []);
      setbillscontext(data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch bills');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(`${Backendurl}/bills`, {
        ...formData,
        amount: parseFloat(formData.amount),
      });

      // Add new bill to list
      setBills((prev) => [data.data, ...prev]);
      
      // Reset form
      setFormData({
        vendorName: '',
        amount: '',
        dueDate: '',
        description: '',
        category: 'Subscription',
        isRecurring: false,
        recurrence: 'monthly',
        paymentMethod: '',
      });
      
      alert('Bill added successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add bill');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Upcoming Bills</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Bills List */}
          <div className="lg:col-span-2 space-y-4">
            {/* Search & Filter Bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="relative w-64">
                <input
                  type="text"
                  placeholder="Search bills..."
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 absolute left-3 top-2.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <button
                onClick={fetchBills}
                className="p-2 text-gray-500 hover:text-gray-700"
                title="Refresh"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2A8.001 8.001 0 0020.582 17m0 0H16"
                  />
                </svg>
              </button>
            </div>

            {/* Bills */}
            {loading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : bills.length === 0 ? (
              <div className="text-center py-10 text-gray-500">No upcoming bills found.</div>
            ) : (
              bills.map((bill) => <BillCard key={bill._id || bill.id} bill={bill} />)
            )}
          </div>

          {/* Right: Add New Bill Form */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 sticky top-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Add New Bill</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Vendor Name</label>
                <input
                  type="text"
                  name="vendorName"
                  value={formData.vendorName}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Amount ($)</label>
                <input
                  type="number"
                  step="0.01"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Due Date</label>
                <input
                  type="date"
                  name="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  required
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Subscription">Subscription</option>
                  <option value="Utilities">Utilities</option>
                  <option value="Rent">Rent</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Internet">Internet</option>
                  <option value="Phone">Phone</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isRecurring"
                  checked={formData.isRecurring}
                  onChange={handleChange}
                  className="mr-2"
                />
                <label className="text-sm font-medium text-gray-700">Recurring Bill</label>
              </div>

              {formData.isRecurring && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Recurrence</label>
                  <select
                    name="recurrence"
                    value={formData.recurrence}
                    onChange={handleChange}
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">Payment Method</label>
                <input
                  type="text"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                  placeholder="e.g., Credit Card"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Add Bill
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillsPage;