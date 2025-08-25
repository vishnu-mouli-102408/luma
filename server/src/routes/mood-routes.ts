import express from "express";
import { createMood } from "../controllers/mood-controller";

const router = express.Router();

// Create a new mood
router.post("/create-mood", createMood);

export default router;
