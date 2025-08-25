import { inngest } from "../inngest/client";
import { logger } from "./logger";

export const sendTherapySessionEvent = async (sessionData: any) => {
	try {
		await inngest.send({
			name: "therapy/session.created",
			data: {
				sessionId: sessionData.id,
				userId: sessionData.userId,
				timestamp: new Date().toISOString(),
				requiresFollowUp: sessionData.requiresFollowUp || false,
				sessionType: sessionData.type,
				duration: sessionData.duration,
				notes: sessionData.notes,
				...sessionData,
			},
		});
		logger.info("Therapy session event sent successfully");
	} catch (error) {
		logger.error({ error }, "Failed to send therapy session event");
		throw error;
	}
};

export const sendMoodUpdateEvent = async (moodData: any) => {
	try {
		await inngest.send({
			name: "mood/updated",
			data: {
				userId: moodData.userId,
				score: moodData.score,
				timestamp: moodData.timestamp,
				note: moodData.note,
				...moodData,
			},
		});
		logger.info("Mood update event sent successfully");
	} catch (error) {
		logger.error({ error }, "Failed to send mood update event");
		throw error;
	}
};

export const sendActivityCompletionEvent = async (activityData: any) => {
	try {
		await inngest.send({
			name: "activity/completed",
			data: {
				userId: activityData.userId,
				activityId: activityData.id,
				timestamp: activityData.timestamp,
				duration: activityData.duration,
				type: activityData.type,
				name: activityData.name,
				description: activityData.description,
				...activityData,
			},
		});
		logger.info("Activity completion event sent successfully");
	} catch (error) {
		logger.error({ error }, "Failed to send activity completion event");
		throw error;
	}
};
