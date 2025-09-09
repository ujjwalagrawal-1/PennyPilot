// src/components/BillCard.jsx

import React from "react";

const BillCard = ({bill}) => {
  console.log(bill);
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDueDateDisplay = () => {
    const today = new Date();
    const dueDate = new Date(bill.dueDate);
    const daysDiff = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return "Overdue";
    if (daysDiff === 0) return "Today";
    if (daysDiff === 1) return "Tomorrow";
    return `${daysDiff} days`;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex items-center p-2">
        {/* Due Date (left column box) */}
        <div className="flex flex-col items-center justify-center bg-gray-50 rounded-md px-4 py-2 mr-6 w-16 flex-shrink-0">
          <div className="text-xs font-medium text-gray-500">
            {new Date(bill.dueDate).toLocaleString("en-US", { month: "short" })}
          </div>
          <div className="text-lg font-semibold text-gray-800">
            {new Date(bill.dueDate).getDate()}
          </div>
        </div>

        {/* Item Name + Description (flex-1 so it grows properly) */}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{bill.vendorName} -</h3>
          <p className="text-sm text-gray-500 mt-1">{bill.description}</p>
        </div>

        {/* Last Charge (prevent shrinking) */}
        <div className="text-sm text-center text-gray-500 w-32 flex-shrink-0">
          <div className="font-medium">{formatDate(bill.lastCharge)}</div>
        </div>

        {/* Amount (prevent shrinking) */}
        <div className="ml-6 flex-shrink-0">
          <div className="px-4 py-2 border rounded-md font-bold text-gray-900 bg-gray-50">
            ${bill.amount.toFixed(0)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BillCard;