import React, { useState, useEffect } from "react";
import axios from "axios";
import { Backendurl } from "../../private/private";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  FaHome,
  FaUtensils,
  FaBus,
  FaFilm,
  FaShoppingBag,
  FaEllipsisH,
} from "react-icons/fa";

// Create axios instance
const api = axios.create({
  baseURL: `${Backendurl}`, // e.g., http://localhost:5000
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  console.log("Token from localStorage:", token);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default function Expenses({height,flag,width}) {
  const [selectedOption, setSelectedOption] = useState("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch expenses data
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        setLoading(true);
        const { data } = await api.get("/transactions");
        console.log("Fetched transactions:", data);

        const allTransactions = Array.isArray(data) ? data : data.transactions;

        if (!allTransactions || !Array.isArray(allTransactions)) {
          throw new Error("Invalid transaction data received");
        }

        // Filter only expenses (ignore revenue/income)
        const expensesOnly = allTransactions.filter(
          (t) => t.type && t.type.toLowerCase() === "expense"
        );

        processExpenseData(expensesOnly);
      } catch (err) {
        console.error("Error fetching or processing transactions:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "Failed to fetch or process expenses"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, []);

  // Process expense data for charts and categories
  const processExpenseData = (transactions) => {
    // Process monthly data: Current Year vs Last Year
    const monthly = processMonthlyData(transactions);
    setMonthlyData(monthly);

    // Process weekly data: This Week vs Last Week
    const weekly = processWeeklyData(transactions);
    setWeeklyData(weekly);

    // Process category breakdown
    const categoryBreakdown = processCategoryBreakdown(transactions);
    setExpenses(categoryBreakdown);
  };

  // Process monthly: Current Year vs Last Year
  const processMonthlyData = (transactions) => {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;
    const months = {};

    const monthNames = Array.from({ length: 12 }, (_, i) =>
      new Date(2024, i, 1).toLocaleString("default", { month: "short" })
    );

    // Initialize all months
    monthNames.forEach((month) => {
      months[month] = { current: 0, previous: 0 };
    });

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      if (isNaN(date)) return;

      const month = date.toLocaleString("default", { month: "short" });
      const year = date.getFullYear();

      if (year === currentYear) {
        months[month].current += transaction.amount;
      } else if (year === lastYear) {
        months[month].previous += transaction.amount;
      }
    });

    return Object.entries(months).map(([name, data]) => ({
      name,
      current: data.current,
      previous: data.previous,
    }));
  };

  // Process weekly: This Week vs Last Week
  const processWeeklyData = (transactions) => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diffToSunday = today.getDate() - dayOfWeek;

    const thisWeekStart = new Date(today);
    thisWeekStart.setHours(0, 0, 0, 0);
    thisWeekStart.setDate(diffToSunday);

    const lastWeekStart = new Date(thisWeekStart);
    lastWeekStart.setDate(thisWeekStart.getDate() - 7);
    lastWeekStart.setHours(0, 0, 0, 0);

    const thisWeekEnd = new Date(thisWeekStart);
    thisWeekEnd.setDate(thisWeekStart.getDate() + 6);
    thisWeekEnd.setHours(23, 59, 59, 999);

    let thisWeekTotal = 0;
    let lastWeekTotal = 0;

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      if (isNaN(date)) return;

      if (date >= thisWeekStart && date <= thisWeekEnd) {
        thisWeekTotal += transaction.amount;
      } else if (date >= lastWeekStart && date < thisWeekStart) {
        lastWeekTotal += transaction.amount;
      }
    });

    return [
      { name: "Last Week", current: 0, previous: lastWeekTotal },
      { name: "This Week", current: thisWeekTotal, previous: 0 },
    ];
  };

  // Process category breakdown
  const processCategoryBreakdown = (transactions) => {
    const categories = {};

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date);
      if (isNaN(date)) return;

      const cat = transaction.category || "Other";

      if (!categories[cat]) {
        categories[cat] = {
          title: cat,
          amount: 0,
          items: [],
          icon: getTransactionIcon(cat),
        };
      }

      categories[cat].amount += transaction.amount;
      categories[cat].items.push({
        name: transaction.description || "Unnamed",
        price: `$${transaction.amount.toFixed(2)}`,
      });
    });

    return Object.values(categories).map((category) => {
      const amount = parseFloat(category.amount.toFixed(2));
      const changeColor = amount > 0 ? "text-red-500" : "text-gray-500"; // red for spending

      return {
        ...category,
        amount: `$${amount.toFixed(2)}`,
        change: amount > 0 ? "↑" : "—",
        changeColor,
      };
    });
  };

  // Map category to icon
  const getTransactionIcon = (category) => {
    const cat = (category || "").toLowerCase();
    switch (true) {
      case ["food", "dining", "restaurant", "cafe", "meal", "groceries"].includes(cat):
        return <FaUtensils className="text-teal-500" />;
      case ["transport", "bus", "taxi", "uber", "metro", "fuel", "ride", "parking"].includes(cat):
        return <FaBus className="text-teal-500" />;
      case ["entertainment", "movie", "film", "concert", "streaming", "netflix", "spotify"].includes(cat):
        return <FaFilm className="text-teal-500" />;
      case ["shopping", "retail", "clothing", "amazon", "mall", "online"].includes(cat):
        return <FaShoppingBag className="text-teal-500" />;
      case ["home", "rent", "utilities", "electricity", "water", "internet", "mortgage"].includes(cat):
        return <FaHome className="text-teal-500" />;
      default:
        return <FaEllipsisH className="text-teal-500" />;
    }
  };

  // Pick which dataset to show
  const chartData = selectedOption === "monthly" ? monthlyData : weeklyData;

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );
  }

  // Filter expenses based on search
  const filteredExpenses = expenses.filter((expense) =>
    expense.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Top Bar */}
      {flag &&<div className="flex justify-between items-center mb-6">
        <p className="text-gray-500">
          {new Date().toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
        <input
          type="text"
          placeholder="Search categories..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-400"
        />
      </div>}

      {/* Expenses Comparison */}
      <div className="bg-white shadow rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Expenses Comparison</h2>
          <select
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
            className="border rounded-lg px-3 py-1 text-sm focus:outline-none"
          >
            <option value="monthly">Monthly Comparison</option>
            <option value="weekly">Weekly Comparison</option>
          </select>
        </div>

        <ResponsiveContainer width={width} height={height}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`$${value.toFixed(2)}`, "Amount"]} />
            <Legend />
            <Bar
              dataKey="current"
              fill="#ef4444"
              name={selectedOption === "monthly" ? "This Year" : "This Week"}
            />
            <Bar
              dataKey="previous"
              fill="#d1d5db"
              name={selectedOption === "monthly" ? "Last Year" : "Last Week"}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Expenses Breakdown */}
      <h2 className="text-lg font-semibold mb-4">Expenses Breakdown</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExpenses.map((cat, i) => (
          <div
            key={i}
            className="bg-white shadow rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {cat.icon}
                <h3 className="font-semibold">{cat.title}</h3>
              </div>
              <p className={`text-sm ${cat.changeColor}`}>{cat.change}</p>
            </div>
            {flag && <p className="text-xl font-bold">{cat.amount}</p>}
            <div className="border-t pt-2 space-y-1">
              {cat.items.slice(0, 5).map((item, j) => (
                <div key={j} className="flex justify-between text-gray-600 text-sm">
                  <span>{item.name}</span>
                  <span>{item.price}</span>
                </div>
              ))}
              {cat.items.length > 5 && (
                <p className="text-xs text-gray-400">+{cat.items.length - 5} more</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}