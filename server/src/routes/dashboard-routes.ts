import express from "express";
import { getDashboardStats, getActivityHistory, getMoodTrends } from "../controllers/dashboard-controller";

const router = express.Router();

// Get today's dashboard statistics
router.get("/stats", getDashboardStats);

// Get activity history for charts/analytics
router.get("/activity-history", getActivityHistory);

// Get mood trends and analytics
router.get("/mood-trends", getMoodTrends);

export default router;
