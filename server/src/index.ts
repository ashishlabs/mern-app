import express, { Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import connectDB from "./config/db"; 
import authRoutes from "./routes/auth/auth.routes"; 
import todoRoutes from "./routes/todo/todo.routes"; 
import "./utils/scheduler";
import { triggerNotificationsNow } from "./utils/scheduler";
import notificationRoutes from "./routes/notification/notification.routes";
import songRoutes from "./routes/songs/song.routes";
import playlistRoutes from "./routes/songs/playlist.routes";
import tagsRoutes from "./routes/tags/tags.routes";
import authMiddleware from "./middleware/auth.middleware"; // Import the auth middleware

// Initialize dotenv
dotenv.config();

// Set up Express app
const app = express();
app.use(express.json({ limit: '10kb' })); // Limit the size of the request body

// Configure CORS to allow all origins
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Userid']
}));

app.use(helmet()); // Use Helmet to set various HTTP headers for security

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later."
});
app.use(limiter);

// Connect to MongoDB
connectDB();

// Get API version from environment variables
const apiVersion = process.env.API_VERSION || "v1";

// Basic Route to test if server is running
app.get("/", (req: Request, res: Response) => {
  res.json({ message: "Server is running. Welcome to the MERN stack with TypeScript!" });
});

app.post("/api/trigger-notifications", async (req, res) => {
  try {
    await triggerNotificationsNow();
    res.status(200).json({ message: "Notifications triggered successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to trigger notifications" });
  }
});

// Apply the authentication middleware globally
app.use(authMiddleware); // Global middleware for all routes

// Use versioned routes
app.use(`/api/${apiVersion}/auth`, authRoutes); // Auth routes don't need the middleware
app.use(`/api/${apiVersion}/todos`, todoRoutes);
app.use(`/api/${apiVersion}/notification`, notificationRoutes);
app.use(`/api/${apiVersion}/songs`, songRoutes);
app.use(`/api/${apiVersion}/playlists`, playlistRoutes);
app.use(`/api/${apiVersion}/tags`, tagsRoutes);


// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
