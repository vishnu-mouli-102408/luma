import express from "express";
import {
	getActiveRecommendations,
	getRecommendationHistory,
	markRecommendationCompleted,
	requestNewRecommendations,
	getRecommendationStats,
} from "../controllers/recommendation-controller";

const router = express.Router();

// Get active recommendations for the user
router.get("/active", getActiveRecommendations);

// Get recommendation history with pagination
router.get("/history", getRecommendationHistory);

// Mark a recommendation as completed
router.patch("/complete", markRecommendationCompleted);

// Request new recommendations (triggers AI generation)
router.post("/generate", requestNewRecommendations);

// Get recommendation statistics
router.get("/stats", getRecommendationStats);

export default router;
