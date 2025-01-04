import jwt from 'jsonwebtoken';

// Ensure that JWT_SECRET is loaded correctly
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Function to extract userId from the JWT token
export const getUserIdFromToken = (authorizationHeader: string | undefined): string | null => {
  if (!authorizationHeader) {
    console.error("Authorization header missing");
    return null; // If no Authorization header is provided
  }

  const token = authorizationHeader.split(' ')[1]; // Extract token from 'Bearer <token>'

  if (!token) {
    console.error("Token missing in Authorization header");
    return null; // If no token is found
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET); // Decode the token using JWT_SECRET
    return decoded.id; // Return the user ID from the decoded token
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      console.error("Token has expired");
    } else if (error instanceof jwt.JsonWebTokenError) {
      console.error("Invalid token: ", error.message);
    } else {
      console.error("Error verifying token:", error);
    }
    return null; // Return null if token is invalid or expired
  }
};
