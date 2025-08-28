import express from "express";
import activityRoutes from "./activity-routes";
import moodRoutes from "./mood-routes";
import chatRoutes from "./chat-routes";
import dashboardRoutes from "./dashboard-routes";
import recommendationRoutes from "./recommendation-routes";

const router = express.Router();

router.use("/activity", activityRoutes);
router.use("/mood", moodRoutes);
router.use("/chat", chatRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/recommendations", recommendationRoutes);

export default router;
