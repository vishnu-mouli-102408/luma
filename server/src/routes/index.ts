import express from "express";
import activityRoutes from "./activity-routes";
import moodRoutes from "./mood-routes";
import chatRoutes from "./chat-routes";

const router = express.Router();

router.use("/activity", activityRoutes);
router.use("/mood", moodRoutes);
router.use("/chat", chatRoutes);

export default router;
