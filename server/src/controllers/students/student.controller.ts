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
    const student = req.body;
    try {
        const existingStudent = await Student.findOne({ name: student?.name });
        if (existingStudent) {
            sendResponse(res, statusCodes.CONFLICT, messages.STUDENT_ALREADY_EXISTS, existingStudent);
            return;
        }

        const newStudent = new Student(student);
        await newStudent.save();
        sendResponse(res, statusCodes.CREATED, messages.STUDENT_ADDED, newStudent);
    } catch (error) {
        logger.error("Error adding student: %o", error);
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
        const students = await Student.find({ isDeleted: false });

        if (!students.length) {
            sendResponse(res, statusCodes.NOT_FOUND, messages.STUDENT_NOT_FOUND, []);
            return;
        }
        sendResponse(res, statusCodes.OK, messages.STUDENT_FETCHED, students);
    } catch (error) {
        logger.error("Error fetching students: %o", error);
        sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
    }
};



export const getStudentById = async (req: Request, res: Response): Promise<void> => {
    const userId = getUserIdFromToken(req.headers.authorization);
    const studentId = req.params.id;
    if (!userId) {
        sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_ID_REQUIRED);
        return;
    }
    try {
        const student = await Student.findById(studentId);

        if (!student) {
            sendResponse(res, statusCodes.NOT_FOUND, messages.STUDENT_NOT_FOUND, {});
            return;
        }
        sendResponse(res, statusCodes.OK, messages.STUDENT_FETCHED, student);
        return;
    } catch (error) {
        logger.error("Error fetching Students: %o", error);
        sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
    }
};

export const updateStudent = async (req: Request, res: Response): Promise<void> => {
    const userId = getUserIdFromToken(req.headers.authorization);
    const studentId = req.params.id;
    const updatedData = req.body;

    if (!userId) {
        sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_ID_REQUIRED);
        return;
    }

    try {
        const existingStudent = await Student.findById(studentId);
        if (!existingStudent) {
            sendResponse(res, statusCodes.NOT_FOUND, messages.STUDENT_NOT_FOUND);
            return;
        }

        Object.assign(existingStudent, updatedData);
        await existingStudent.save();

        sendResponse(res, statusCodes.OK, messages.STUDENT_UPDATED, existingStudent);
    } catch (error) {
        logger.error("Error updating student: %o", error);
        sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
    }
};
export const deleteStudent = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const student = await Student.findById(id);
        if (!student || student.isDeleted) {
            sendResponse(res, statusCodes.NOT_FOUND, messages.STUDENT_NOT_FOUND);
            return;
        }

        student.isDeleted = true;
        student.deletedAt = new Date();
        await student.save();

        sendResponse(res, statusCodes.OK, messages.STUDENT_DELETED, student);
    } catch (error) {
        logger.error("Error soft deleting student: %o", error);
        sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
    }
};

export const restoreStudent = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;

    try {
        const student = await Student.findById(id);
        if (!student || !student.isDeleted) {
            sendResponse(res, statusCodes.NOT_FOUND, messages.STUDENT_NOT_FOUND);
            return;
        }

        student.isDeleted = false;
        student.deletedAt = new Date();
        await student.save();

        sendResponse(res, statusCodes.OK, messages.STUDENT_RESTORED, student);
    } catch (error) {
        logger.error("Error restoring student: %o", error);
        sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
    }
};
