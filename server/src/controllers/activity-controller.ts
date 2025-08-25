import type { Request, Response, NextFunction } from "express";
import { logger } from "../lib/logger";
import { activitySchema } from "../types/activity";
import { prisma } from "../lib/db";
import { sendActivityCompletionEvent } from "../lib/inngest-events";

// Log a new activity
export const logActivity = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsedPayload = activitySchema?.safeParse(req.body);
		if (!parsedPayload.success) {
			return res.status(400).json({ error: "Invalid payload" });
		}

		const userId = req.user?.id;
		if (!userId) {
			return res.status(401).json({ error: "Unauthorized" });
		}

		const { type, name, description, duration, timestamp } = parsedPayload.data;

		const activity = await prisma.activity.create({
			data: {
				userId,
				type,
				name,
				description,
				duration,
				timestamp,
			},
		});

		logger.info(`Activity logged: ${activity.id}`);

		// Send activity completion event to Inngest
		await sendActivityCompletionEvent({
			userId,
			id: activity.id,
			type,
			name,
			duration,
			description,
			timestamp: activity.timestamp,
		});

		return res.status(201).json(activity);
	} catch (error) {
		logger.error(error, "Error logging activity");
		next(error);
	}
};
