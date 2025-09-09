// models/Bill.js

import mongoose from 'mongoose';

const billSchema = new mongoose.Schema({
  // Reference to the User who owns this bill
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  // Vendor or service name (e.g., "Netflix", "Electricity Board")
  vendorName: {
    type: String,
    required: true,
    trim: true,
  },

  // Optional: URL to vendor logo (for display in UI)
  vendorLogoUrl: {
    type: String,
    trim: true,
  },

  // Description of the bill (e.g., "Monthly subscription", "Electricity - June")
  description: {
    type: String,
    trim: true,
  },

  // Bill amount in dollars (or local currency)
  amount: {
    type: Number,
    required: true,
    min: 0,
  },

  // Due date of the bill
  dueDate: {
    type: Date,
    required: true,
  },

  // Status of the bill
  status: {
    type: String,
    enum: ['Pending', 'Paid', 'Overdue', 'Cancelled'],
    default: 'Pending',
  },

  // Optional: Track if it's a recurring bill
  isRecurring: {
    type: Boolean,
    default: false,
  },

  // If recurring, how often? (e.g., monthly, quarterly)
  recurrence: {
    type: String,
    enum: ['weekly', 'monthly', 'quarterly', 'yearly'],
    default: 'monthly',
  },

  // Payment method used (optional)
  paymentMethod: {
    type: String,
    trim: true,
  },

  // Date when bill was marked as paid (can be null)
  paidDate: {
    type: Date,
    default: null,
  },

  // Optional: Category for filtering (e.g., Utilities, Subscriptions, Rent)
  category: {
    type: String,
    enum: ['Utilities', 'Subscription', 'Rent', 'Internet', 'Phone', 'Insurance', 'Other'],
    default: 'Other',
  },

  // Optional: Attach bill PDF or image
  attachmentUrl: {
    type: String,
    trim: true,
  },

}, {
  timestamps: true, // Adds createdAt and updatedAt
});

// Indexes for performance (important for queries)
billSchema.index({ user: 1, dueDate: 1 });           // Get bills by user and due date
billSchema.index({ status: 1 });                     // Filter by status
billSchema.index({ dueDate: 1, status: 1 });         // Upcoming bills (e.g., due soon and pending)

const Bill = mongoose.model('Bill', billSchema);
export default Bill;