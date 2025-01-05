import { Request, Response } from "express";
import { getUserIdFromToken } from "../../utils/auth";
import { sendResponse } from "../../utils/response";
import { statusCodes } from "../../config/status.code";
import { messages } from "../../config/message";
import logger from "../../utils/logger";
import Batch from "../../models/students/batch.model";


export const saveBatch = async (req: Request, res: Response): Promise<void> => {
    const userId = getUserIdFromToken(req.headers.authorization);

    if (!userId) {
        sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_ID_REQUIRED);
        return;
    }
    const { name, students } = req.body;
    try {
        const newBatch = new Batch({ name, students });
        await newBatch.save();
        sendResponse(res, statusCodes.CREATED, messages.BATCH_ADDED, newBatch);
    } catch (error) {
        logger.error("Error adding tag: %o", error);
        sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
    }
};


export const getBatches = async (req: Request, res: Response): Promise<void> => {
    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
        sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_ID_REQUIRED);
        return;
    }
    try {
        const batches = await Batch.find({});

        if (!batches.length) {
            sendResponse(res, statusCodes.NOT_FOUND, messages.BATCH_NOT_FOUND, []);
            return;
        }
        sendResponse(res, statusCodes.OK, messages.BATCH_FETCHED, batches);
        return;
    } catch (error) {
        logger.error("Error fetching batches: %o", error);
        sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
    }
};

