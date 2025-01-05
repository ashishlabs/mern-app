// routes/fees/fees.routes.ts
import express from 'express';
import { addFeePayment, getFeePayments } from '../../controllers/students/fees.controller';

const router = express.Router();

// Route to add fee payment
router.post('/', addFeePayment);

// Route to get all fee payments
router.get('/', getFeePayments);

export default router;
