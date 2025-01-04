import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { send } from "process";
import { sendResponse } from "../utils/response";
import { statusCodes } from "../config/status.code";

// Define the authMiddleware function
const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // List of routes to exclude from authentication
  const excludedRoutes = [
    '/api/v1/auth/login',
    '/api/v1/auth/signup',
  ];
  // Check if the current request is to one of the excluded routes
  if (excludedRoutes.includes(req.originalUrl)) {
    return next(); // Skip authentication and move to the next middleware
  }

  const token = req.headers.authorization?.split(" ")[1]; // Expecting "Bearer <token>"

  if (!token) {
    sendResponse(res, statusCodes.UNAUTHORIZED, "Unauthorized: Token not provided");
     return;
  }

  try {
    const secret = process.env.JWT_SECRET || "your_jwt_secret";
    const decoded = jwt.verify(token, secret); // Verify the token
    (req as any).user = decoded; // Attach the decoded user info to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    sendResponse(res, statusCodes.UNAUTHORIZED, "Forbidden: Invalid token");
     return;
  }
};

export default authMiddleware;
