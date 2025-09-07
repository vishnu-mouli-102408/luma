import type { Request, Response, NextFunction } from "express";
import { moodSchema } from "../types/mood";
import { prisma } from "../lib/db";
import { logger } from "../lib/logger";
import { sendMoodUpdateEvent } from "../lib/inngest-events";

export const createMood = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const parsedPayload = moodSchema.safeParse(req?.body);

		if (!parsedPayload.success) {
			return res.status(400).json({ error: "Invalid payload", success: false });
		}

		const { score, note, timestamp = new Date().toISOString() } = parsedPayload.data;

		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "User not authenticated", success: false });
		}

		const mood = await prisma.mood.create({
			data: {
				userId,
				score,
				note,
				timestamp,
			},
		});

		logger.info(`Mood entry created for user ${userId}`);

		await sendMoodUpdateEvent({
			userId,
			score,
			note,
			timestamp: mood.timestamp,
		});

		res.status(201).json({
			success: true,
			data: mood,
		});
	} catch (error) {
		next(error);
	}
};
