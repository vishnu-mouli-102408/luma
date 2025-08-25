import express from "express";
import { logActivity } from "../controllers/activity-controller";

const router = express.Router();

// Log a new activity
router.post("/log-activity", logActivity);

export default router;
