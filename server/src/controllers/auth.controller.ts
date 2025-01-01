import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/user.model";
import { sendResponse } from "../utils/response";
import logger from "../utils/logger";
import { messages } from "../config/message";
import { statusCodes } from "../config/status.code";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

export const signup = async (req: Request, res: Response): Promise<void> => {
  const {  email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_EXISTS);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "1h" });

    sendResponse(res, statusCodes.CREATED, messages.USER_CREATED, { token, user: newUser });
  } catch (error) {
    logger.error("Error during signup: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      sendResponse(res, statusCodes.NOT_FOUND, messages.USER_NOT_FOUND);
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      sendResponse(res, statusCodes.BAD_REQUEST, messages.INVALID_CREDENTIALS);
      return;
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

    sendResponse(res, statusCodes.OK, messages.LOGIN_SUCCESSFUL, { token, user });
  } catch (error) {
    logger.error("Error during login: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};