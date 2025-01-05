import { Request, Response } from "express";
import { getUserIdFromToken } from "../../utils/auth";
import { sendResponse } from "../../utils/response";
import { statusCodes } from "../../config/status.code";
import { messages } from "../../config/message";
import Student from "../../models/students/student.model";
import logger from "../../utils/logger";


export const saveStudent = async (req: Request, res: Response): Promise<void> => {
    const userId = getUserIdFromToken(req.headers.authorization);

    if (!userId) {
        sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_ID_REQUIRED);
        return;
    }
    const { name, fees } = req.body;
    try {
        const existingStudent = await Student.findOne({ name });
        if (existingStudent) {
            sendResponse(res, statusCodes.CONFLICT, messages.STUDENT_ALREADY_EXISTS);
            return;
        }

        const newStudent = new Student({ name, fees });
        await newStudent.save();
        sendResponse(res, statusCodes.CREATED, messages.STUDENT_ADDED, newStudent);
    } catch (error) {
        logger.error("Error adding tag: %o", error);
        sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
    }
};


export const getStudents = async (req: Request, res: Response): Promise<void> => {
    const userId = getUserIdFromToken(req.headers.authorization);
    if (!userId) {
        sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_ID_REQUIRED);
        return;
    }
    try {
        const student = await Student.find({});

        if (!student.length) {
            sendResponse(res, statusCodes.NOT_FOUND, messages.STUDENT_NOT_FOUND, []);
            return;
        }
        sendResponse(res, statusCodes.OK, messages.STUDENT_FETCHED, student);
        return;
    } catch (error) {
        logger.error("Error fetching Students: %o", error);
        sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
    }
};

