import { Router } from "express";
import { streamMusic, getSongs } from "../controllers/music.controller";

const router = Router();

// Define the route for streaming music files
router.get("/stream/:filename", streamMusic);

// Define the route for getting the list of songs
router.get("/songs", getSongs);

export default router;