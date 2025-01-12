import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../../models/user/user.model";
import { statusCodes } from "../../config/status.code";
import { sendResponse } from "../../utils/response";
import { messages } from "../../config/message";
import logger from "../../utils/logger";

const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";
const TOKEN_EXPIRATION = "1h";

// Helper function to generate token
const generateToken = (userId: unknown): string => {
  return jwt.sign({ id: userId.toString() }, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

// Helper function to sanitize user data
const sanitizeUser = (user: any) => ({
  email: user.email,
  id: user._id
});

export const signup = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Input validation
  if (!email?.trim() || !password?.trim()) {
    sendResponse(res, statusCodes.BAD_REQUEST, messages.INVALID_INPUT);
    return;
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      sendResponse(res, statusCodes.BAD_REQUEST, messages.USER_EXISTS);
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const newUser = await User.create({
      email: email.toLowerCase(),
      password: hashedPassword,
    });

    const token = generateToken(newUser._id);
    sendResponse(res, statusCodes.CREATED, messages.USER_CREATED, { 
      token, 
      user: sanitizeUser(newUser) 
    });
  } catch (error) {
    logger.error("Error during signup: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;

  // Input validation
  if (!email?.trim() || !password?.trim()) {
    sendResponse(res, statusCodes.BAD_REQUEST, messages.INVALID_INPUT);
    return;
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      sendResponse(res, statusCodes.NOT_FOUND, messages.USER_NOT_FOUND);
      return;
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      sendResponse(res, statusCodes.BAD_REQUEST, messages.INVALID_CREDENTIALS);
      return;
    }

    const token = generateToken(user._id);
    sendResponse(res, statusCodes.OK, messages.LOGIN_SUCCESSFUL, {
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    logger.error("Error during login: %o", error);
    sendResponse(res, statusCodes.INTERNAL_SERVER_ERROR, messages.ERROR_OCCURRED);
  }
};