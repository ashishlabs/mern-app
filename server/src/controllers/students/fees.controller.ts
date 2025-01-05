// controllers/fees.controller.ts
import { Request, Response } from 'express';
import Fees from '../../models/students/fees.model';

// Add new fee payment
export const addFeePayment = async (req: Request, res: Response) => {
  const { studentId, amountPaid, dueAmount, paymentDate, paymentMethod } = req.body;

  try {
    const newFee = new Fees({
      studentId,
      amountPaid,
      dueAmount,
      paymentDate,
      paymentMethod
    });

    await newFee.save();
    res.status(201).json({ message: 'Fee payment added successfully', fee: newFee });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add fee payment', details: error });
  }
};

// Get all fee payments
export const getFeePayments = async (req: Request, res: Response) => {
  try {
    const fees = await Fees.find().populate('studentId', 'name email'); // Optionally populate student details
    res.status(200).json(fees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve fee payments', details: error });
  }
};
