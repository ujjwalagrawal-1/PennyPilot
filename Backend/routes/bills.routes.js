// routes/billRoutes.js

import express from 'express';
import { verifyJWT } from '../middlewares/authMiddlewares.js';
import {
  getBills,
  getBillById,
  createBill,
  updateBill,
  deleteBill,
  markAsPaid,
  getUpcomingBills,
  getOverdueBills,
  generateNextRecurringBill,
} from '../controllers/Bills.controller.js';

const router = express.Router();

// Protect all routes with JWT
router.use(verifyJWT);

// Routes
router.route('/')
  .get(getBills)
  .post(createBill);

router.route('/upcoming')
  .get(getUpcomingBills);

router.route('/overdue')
  .get(getOverdueBills);

router.route('/:id')
  .get(getBillById)
  .put(updateBill)
  .delete(deleteBill);

router.route('/:id/pay')
  .put(markAsPaid);

router.route('/:id/generate-next')
  .post(generateNextRecurringBill);

export default router;