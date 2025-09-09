import Bill from '../models/Bills.js';
import { asyncHandler } from '../utils/asynchandler.js';

// Helper: Check if a bill is overdue
const isOverdue = (dueDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return dueDate < today && !isNaN(dueDate);
};

// 🔹 GET /api/bills - Get all bills for logged-in user (with optional filters)
const getBills = asyncHandler(async (req, res) => {
  const { status, category, startDate, endDate } = req.query;
  const query = { user: req.user.id };

  if (status) query.status = status;
  if (category) query.category = category;
  if (startDate || endDate) {
    query.dueDate = {};
    if (startDate) query.dueDate.$gte = new Date(startDate);
    if (endDate) query.dueDate.$lte = new Date(endDate);
  }

  const bills = await Bill.find(query).sort({ dueDate: 1 });

  const enrichedBills = bills.map((bill) => {
    const billObj = bill.toObject();
    if (bill.status === 'Pending' && isOverdue(bill.dueDate)) {
      billObj.status = 'Overdue';
    }
    return billObj;
  });

  res.json({
    success: true,
    count: enrichedBills.length,
    data: enrichedBills,
  });
});

// 🔹 GET /api/bills/:id - Get single bill by ID
const getBillById = asyncHandler(async (req, res) => {
  const bill = await Bill.findOne({ _id: req.params.id, user: req.user.id });
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }

  res.json({ success: true, data: bill });
});

// 🔹 POST /api/bills - Create a new bill
const createBill = asyncHandler(async (req, res) => {
  const {
    vendorName,
    amount,
    dueDate,
    description,
    category,
    isRecurring,
    recurrence,
    paymentMethod,
  } = req.body;

  const bill = new Bill({
    user: req.user.id,
    vendorName,
    amount,
    dueDate,
    description: description || '',
    category: category || 'Other',
    isRecurring: isRecurring || false,
    recurrence: recurrence || 'monthly',
    paymentMethod: paymentMethod || '',
  });

  await bill.save();

  res.status(201).json({
    success: true,
    message: 'Bill created successfully',
    data: bill,
  });
});

// 🔹 PUT /api/bills/:id - Update a bill
const updateBill = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    'vendorName',
    'amount',
    'dueDate',
    'description',
    'category',
    'isRecurring',
    'recurrence',
    'paymentMethod',
    'status',
    'attachmentUrl',
  ];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    res.status(400);
    throw new Error('Invalid updates!');
  }

  const bill = await Bill.findOne({ _id: req.params.id, user: req.user.id });
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }

  updates.forEach((update) => {
    bill[update] = req.body[update];
  });

  await bill.save();

  res.json({
    success: true,
    message: 'Bill updated successfully',
    data: bill,
  });
});

// 🔹 PUT /api/bills/:id/pay - Mark bill as paid
const markAsPaid = asyncHandler(async (req, res) => {
  const bill = await Bill.findOne({ _id: req.params.id, user: req.user.id });
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found');
  }

  if (bill.status === 'Paid') {
    res.status(400);
    throw new Error('Bill is already marked as paid');
  }

  bill.status = 'Paid';
  bill.paidDate = new Date();
  await bill.save();

  res.json({
    success: true,
    message: 'Bill marked as paid',
    data: bill,
  });
});

// 🔹 DELETE /api/bills/:id - Delete a bill
const deleteBill = asyncHandler(async (req, res) => {
  const bill = await Bill.findOneAndDelete({ _id: req.params.id, user: req.user.id });
  if (!bill) {
    res.status(404);
    throw new Error('Bill not found or already deleted');
  }

  res.json({
    success: true,
    message: 'Bill deleted successfully',
  });
});

// 🔹 GET /api/bills/upcoming - Get upcoming bills (next 30 days, pending)
const getUpcomingBills = asyncHandler(async (req, res) => {
  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setMonth(today.getMonth() + 1);

  const bills = await Bill.find({
    user: req.user.id,
    dueDate: { $gte: today, $lte: nextMonth },
    status: { $in: ['Pending', 'Overdue'] },
  }).sort({ dueDate: 1 });

  const enrichedBills = bills.map((bill) => {
    const status = bill.status === 'Pending' && isOverdue(bill.dueDate) ? 'Overdue' : bill.status;
    return { ...bill.toObject(), status };
  });

  res.json({
    success: true,
    data: enrichedBills,
  });
});

// 🔹 GET /api/bills/overdue - Get all overdue bills
const getOverdueBills = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const bills = await Bill.find({
    user: req.user.id,
    dueDate: { $lt: today },
    status: 'Pending',
  }).sort({ dueDate: 1 });

  res.json({
    success: true,
    count: bills.length,
    data: bills.map((bill) => bill.toObject()),
  });
});

// 🔹 POST /api/bills/:id/generate-next - Generate next recurring bill
const generateNextRecurringBill = asyncHandler(async (req, res) => {
  const parentBill = await Bill.findOne({ _id: req.params.id, user: req.user.id });
  if (!parentBill || !parentBill.isRecurring) {
    res.status(400);
    throw new Error('Only recurring bills can generate next instance');
  }

  const nextBillDate = new Date(parentBill.dueDate);
  switch (parentBill.recurrence) {
    case 'weekly':
      nextBillDate.setDate(nextBillDate.getDate() + 7);
      break;
    case 'monthly':
      nextBillDate.setMonth(nextBillDate.getMonth() + 1);
      break;
    case 'quarterly':
      nextBillDate.setMonth(nextBillDate.getMonth() + 3);
      break;
    case 'yearly':
      nextBillDate.setFullYear(nextBillDate.getFullYear() + 1);
      break;
    default:
      nextBillDate.setMonth(nextBillDate.getMonth() + 1);
  }

  const newBill = new Bill({
    user: parentBill.user,
    vendorName: parentBill.vendorName,
    vendorLogoUrl: parentBill.vendorLogoUrl,
    description: parentBill.description,
    amount: parentBill.amount,
    dueDate: nextBillDate,
    category: parentBill.category,
    isRecurring: true,
    recurrence: parentBill.recurrence,
    attachmentUrl: parentBill.attachmentUrl,
    status: 'Pending',
  });

  await newBill.save();

  res.status(201).json({
    success: true,
    message: 'Next recurring bill generated',
    data: newBill,
  });
});

// ✅ Export all controllers at the end
export {
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
  markAsPaid,
  getUpcomingBills,
  getOverdueBills,
  generateNextRecurringBill,
};