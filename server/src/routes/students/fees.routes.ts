// routes/fees/fees.routes.ts
import express from 'express';
import { addFeePayment, deleteFees, getFeePayments, updateFees } from '../../controllers/students/fees.controller';

const router = express.Router();
router.post('/', addFeePayment);
router.get('/:id', getFeePayments);
router.post('/:id', updateFees);
router.delete('/:id', deleteFees);

export default router;
