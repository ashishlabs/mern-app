// controllers/fees.controller.ts
import { Request, Response } from 'express';
import Fees from '../../models/students/fees.model';
import { sendResponse } from '../../utils/response';
import { statusCodes } from '../../config/status.code';
import { messages } from '../../config/message';
import logger from '../../utils/logger';
import { getUserIdFromToken } from '../../utils/auth';

export const addFeePayment = async (req: Request, res: Response) => {
  const { studentId, amountPaid, dueAmount, paymentDate, paymentMethod } = req.body;

  try {
    const newFee = new Fees({
      studentId,
      amountPaid,
      paymentDate,
      paymentMethod
    });

    await newFee.save();
    sendResponse(res, statusCodes.OK, messages.FEES_ADDED, newFee);
  } catch (error) {
    logger.error("addFeePayment: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED, {});
  }
};

export const getFeePayments = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const fees = await Fees.find({ studentId: id });
    sendResponse(res, statusCodes.OK, messages.FEES_FETCHED, fees);
  } catch (error) {
    logger.error("getFeePayments: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED, {});
  }
};

export const updateFees = async (req: Request, res: Response): Promise<void> => {
  const userId = getUserIdFromToken(req.headers.authorization);
  const feesId = req.params.id;
  const updatedData = req.body;

  if (!userId) {
      sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_ID_REQUIRED);
      return;
  }

  try {
      const existingFees = await Fees.findById(feesId);
      if (!existingFees) {
          sendResponse(res, statusCodes.NOT_FOUND, messages.FEES_NOT_FOUND);
          return;
      }

      Object.assign(existingFees, updatedData);
      await existingFees.save();

      sendResponse(res, statusCodes.OK, messages.STUDENT_UPDATED, existingFees);
  } catch (error) {
      logger.error("updateFees: %o", error);
      sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};

export const deleteFees = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const deleteFees = await Fees.findByIdAndDelete(id);

    if (!deleteFees) {
      sendResponse(res, statusCodes.NOT_FOUND, messages.FEES_NOT_FOUND);
      return;
    }

    sendResponse(res, statusCodes.OK, messages.FEES_DELETED, deleteFees);
  } catch (error) {
    logger.error("deleteFees: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};