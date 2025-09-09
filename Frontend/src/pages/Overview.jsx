import React from "react";
import { Bell, Search, Gamepad2, Shirt, UtensilsCrossed, Car, Keyboard } from "lucide-react";
import Expenses from "./Expenses";
import BillCard from "../cards/BillCards";
import  { useAuth } from "../context/AuthContext";
// Example upcoming bills

// Example transactions
const transactions = [
  { id: 1, icon: <Gamepad2 className="w-5 h-5 text-gray-600" />, item: "GTR 5", shop: "Gadget & Gear", date: "17 May 2023", amount: "$160.00" },
  { id: 2, icon: <Shirt className="w-5 h-5 text-gray-600" />, item: "Polo Shirt", shop: "XL Fashions", date: "17 May 2023", amount: "$20.00" },
  { id: 3, icon: <UtensilsCrossed className="w-5 h-5 text-gray-600" />, item: "Biriyani", shop: "Hajir Biriyani", date: "17 May 2023", amount: "$10.00" },
  { id: 4, icon: <Car className="w-5 h-5 text-gray-600" />, item: "Taxi Fare", shop: "Uber", date: "17 May 2023", amount: "$12.00" },
  { id: 5, icon: <Keyboard className="w-5 h-5 text-gray-600" />, item: "Keyboard", shop: "Gadget & Gear", date: "17 May 2023", amount: "$22.00" },
];

export default function Overview() {
  const {bills} = useAuth();
  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">📅 September 9, 2025</p>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-gray-600" />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search here"
                className="pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-64"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Top Row: Balance + Bills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Total Balance */}
            <div className="bg-white shadow rounded-xl p-6 flex flex-col justify-between">
              <h2 className="text-sm font-medium text-gray-500">Total Balance</h2>
              <p className="text-3xl font-bold text-gray-900 mt-2">₹50000</p>
              <p className="text-sm text-gray-500">All Accounts</p>
              <div className="mt-6 bg-teal-500 text-white rounded-lg p-4">
                <p className="text-sm">Credit Card</p>
                <p className="text-lg font-semibold">**** **** **** 2598</p>
                <p className="text-lg font-bold mt-2">₹54678</p>
              </div>
            </div>

            {/* Upcoming Bills */}
            <div className="bg-white shadow rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-500">Upcoming Bills</h2>
                <button className="text-sm text-teal-600 hover:underline">View All</button>
              </div>
              {bills.map((bill) => (
                <BillCard key={bill.id} bill={bill} />
              ))}
            </div>
          </div>

          {/* Bottom Row: Recent Transactions & Expenses */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Transactions */}
            <div className="bg-white shadow rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-medium text-gray-500">Recent Transactions</h2>
                <button className="text-sm text-teal-600 hover:underline">View All</button>
              </div>
              <div className="space-y-3">
                {transactions.map((t) => (
                  <div key={t.id} className="flex items-center justify-between border-b last:border-0 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        {t.icon}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.item}</p>
                        <p className="text-xs text-gray-500">{t.shop}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-500">{t.date}</p>
                      <p className="font-medium text-gray-900">{t.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expenses Section */}
            <div className="bg-white shadow rounded-xl p-6">
              <div className="mb-6">
                <h2 className="text-sm font-medium text-gray-500">Expenses Comparison</h2>
                <div className="mt-2">
                  <Expenses height={300} flag={false} width="100%" />
                </div>
              </div>

              {/* Expenses Breakdown */}
              
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}