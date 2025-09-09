import { useState, useEffect } from "react";
import axios from "axios";
import { Backendurl } from "../../private/private";
import {
  Gamepad2,
  Shirt,
  UtensilsCrossed,
  Film,
  Car,
  Pizza,
  Keyboard,
  Search,
  Bell,
  Plus,
  Upload,
} from "lucide-react";

// Create axios instance
const api = axios.create({
  baseURL: Backendurl, // Use full Backendurl (e.g., http://localhost:5000)
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Add token interceptor
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken"); // Match your other files
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Icon mapper function
const getTransactionIcon = (category) => {
  const icons = {
    Food: <UtensilsCrossed className="w-5 h-5 text-gray-600" />,
    Transport: <Car className="w-5 h-5 text-gray-600" />,
    Shopping: <Shirt className="w-5 h-5 text-gray-600" />,
    Bills: <Bell className="w-5 h-5 text-gray-600" />,
    Salary: <Pizza className="w-5 h-5 text-gray-600" />,
    Investment: <Keyboard className="w-5 h-5 text-gray-600" />,
    Entertainment: <Film className="w-5 h-5 text-gray-600" />,
    Other: <Pizza className="w-5 h-5 text-gray-600" />,
  };
  return icons[category] || icons.Other;
};

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [visibleTransactions, setVisibleTransactions] = useState(7);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: "expense",
    amount: "",
    category: "Other",
    description: "",
  });
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrFile, setOcrFile] = useState(null);

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        const response = await api.get("/transactions"); // Use relative path with baseURL
        const transactionsData = Array.isArray(response.data)
          ? response.data
          : response.data.transactions || response.data.data || [];
        setTransactions(transactionsData);
      } catch (err) {
        const message =
          err.response?.data?.message || "Failed to fetch transactions";
        setError(message);
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Filter transactions based on tab and search
  const filteredTransactions = transactions.filter((transaction) => {
    const matchesTab = activeTab === "all" || transaction.type === activeTab;
    const matchesSearch =
      transaction.description
        ?.toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      transaction.category?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && (!searchQuery || matchesSearch);
  });

  const displayedTransactions = filteredTransactions.slice(
    0,
    visibleTransactions
  );

  const loadMore = () => {
    setVisibleTransactions((prev) =>
      Math.min(prev + 5, filteredTransactions.length)
    );
  };

  // Add new transaction handler
  const handleAddTransaction = async (e) => {
    e.preventDefault();
    if (!newTransaction.amount || !newTransaction.description) {
      setError("Amount and description are required");
      return;
    }

    try {
      const response = await api.post("/transactions", {
        ...newTransaction,
        amount: parseFloat(newTransaction.amount),
      });
      setTransactions((prev) => [response.data.transaction || response.data, ...prev]);
      setIsModalOpen(false);
      resetForm();
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to add transaction"
      );
    }
  };

  // Reset form
  const resetForm = () => {
    setNewTransaction({
      type: "expense",
      amount: "",
      category: "Other",
      description: "",
    });
    setOcrFile(null);
  };

  // OCR file handler
  const handleOCRUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("UserImage", file);

  try {
    setIsProcessingOCR(true);
    setError(null);

    // Step 1: Call OCR endpoint
    const ocrResponse = await api.post(`${Backendurl}/transactions/ocr`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      withCredentials: true,
    });

    const parsedData = ocrResponse.data; 
    // parsedData = { amount: "317.00", description: "..." }

    if (!parsedData?.amount || !parsedData?.description) {
      setError("Invalid OCR response");
      return;
    }

    // Step 2: Create actual transaction using the normal endpoint
    const transactionPayload = {
      type: "expense", // default as expense
      amount: parseFloat(parsedData.amount),
      category: "Other", // you could later classify using AI or dropdown
      description: parsedData.description,
    };

    const saveResponse = await api.post(`${Backendurl}/transactions`, transactionPayload);

    // Step 3: Update UI
    const savedTransaction = saveResponse.data;
    setTransactions((prev) => [savedTransaction, ...prev]);

    setNewTransaction(transactionPayload);
    setOcrFile(file.name);

  } catch (err) {
    console.error("OCR Error:", err);
    setError(err.response?.data?.message || "Failed to process receipt");
  } finally {
    setIsProcessingOCR(false);
  }
};


  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        {error}
      </div>
    );

  return (
    <div className="flex h-screen bg-gray-50">
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">
              📅{" "}
              {new Date().toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="ml-4 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Bell className="w-4 h-4 text-gray-600" />
            </button>
            <div className="relative">
              <input
                type="text"
                placeholder="Search transactions"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-10 py-2 border border-gray-200 rounded-lg bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent w-64"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Add Transaction Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <div className="relative z-50">
              <div className="fixed inset-0 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold">Add New Transaction</h2>
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="text-gray-500 hover:text-gray-700 text-2xl"
                    >
                      ×
                    </button>
                  </div>

                  {/* OCR Upload Section */}
                  <div className="mb-6">
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                      <input
                        type="file"
                        id="ocr-upload"
                        className="hidden"
                        accept="image/*"
                        onChange={handleOCRUpload}
                      />
                      <label
                        htmlFor="ocr-upload"
                        className="cursor-pointer flex flex-col items-center gap-2"
                      >
                        <Upload className="w-8 h-8 text-gray-400" />
                        <span className="text-sm text-gray-600">
                          {ocrFile ? `Uploaded: ${ocrFile}` : "Upload receipt for auto-fill"}
                        </span>
                      </label>
                      {isProcessingOCR && (
                        <div className="mt-2 text-sm text-teal-600 animate-pulse">
                          Processing receipt...
                        </div>
                      )}
                      {error && ocrFile && !isProcessingOCR && (
                        <div className="mt-2 text-sm text-red-500">{error}</div>
                      )}
                    </div>
                  </div>

                  <form onSubmit={handleAddTransaction}>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Type
                        </label>
                        <select
                          value={newTransaction.type}
                          onChange={(e) =>
                            setNewTransaction({
                              ...newTransaction,
                              type: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        >
                          <option value="expense">Expense</option>
                          <option value="revenue">Revenue</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={newTransaction.amount}
                          onChange={(e) =>
                            setNewTransaction({
                              ...newTransaction,
                              amount: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select
                          value={newTransaction.category}
                          onChange={(e) =>
                            setNewTransaction({
                              ...newTransaction,
                              category: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                        >
                          <option value="Food">Food</option>
                          <option value="Transport">Transport</option>
                          <option value="Shopping">Shopping</option>
                          <option value="Bills">Bills</option>
                          <option value="Salary">Salary</option>
                          <option value="Investment">Investment</option>
                          <option value="Entertainment">Entertainment</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          value={newTransaction.description}
                          onChange={(e) =>
                            setNewTransaction({
                              ...newTransaction,
                              description: e.target.value,
                            })
                          }
                          className="w-full rounded-lg border border-gray-300 px-3 py-2"
                          required
                        />
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setIsModalOpen(false);
                          resetForm();
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 rounded-lg"
                      >
                        Add Transaction
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Section */}
        <div className="p-6">
          <h1 className="text-2xl font-semibold text-gray-900 mb-6">
            Recent Transactions
          </h1>
          <div className="bg-white rounded-lg border border-gray-200">
            {/* Tabs */}
            <div className="border-b border-gray-200 flex">
              {["all", "revenue", "expense"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab
                      ? "text-teal-600 border-teal-600"
                      : "text-gray-500 border-transparent hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                      Items
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                      Category
                    </th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                      Date
                    </th>
                    <th className="text-right py-4 px-6 text-sm font-medium text-gray-600">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {displayedTransactions.map((transaction) => (
                    <tr
                      key={transaction._id}
                      className="border-b border-gray-100 hover:bg-gray-50"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getTransactionIcon(transaction.category)}
                          </div>
                          <span className="text-sm font-medium text-gray-900">
                            {transaction.description}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {transaction.category}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {new Date(transaction.date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6 text-sm font-medium text-right">
                        <span
                          className={
                            transaction.type === "expense"
                              ? "text-red-600"
                              : "text-green-600"
                          }
                        >
                          {transaction.type === "expense" ? "-" : "+"}₹
                          {parseFloat(transaction.amount).toFixed(2)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Load More */}
            {filteredTransactions.length > visibleTransactions && (
              <div className="p-6 text-center border-t border-gray-200">
                <button
                  onClick={loadMore}
                  className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-2 rounded-lg font-medium transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}