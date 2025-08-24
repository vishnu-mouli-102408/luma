import { inngest } from "./client";
import { functions as aiFunctions } from "./ai-functions";
import { logger } from "../lib/logger";

// Function to handle therapy session events
export const therapySessionHandler = inngest.createFunction(
	{ id: "therapy-session-handler" },
	{ event: "therapy/session.created" },
	async ({ event, step }) => {
		// Log the session creation
		await step.run("log-session-creation", async () => {
			logger.info({ event: event.data }, "New therapy session created");
		});

		// Process the session data
		const processedData = await step.run("process-session-data", async () => {
			// Add any processing logic here
			return {
				...event.data,
				processedAt: new Date().toISOString(),
			};
		});

		// Send follow-up notification if needed
		if (event.data.requiresFollowUp) {
			await step.run("send-follow-up", async () => {
				// Add notification logic here
				logger.info({ event: event.data }, "Sending follow-up for session");
			});
		}

		return {
			message: "Therapy session processed successfully",
			sessionId: event.data.sessionId,
			processedData,
		};
	}
);

// Function to handle mood tracking events
export const moodTrackingHandler = inngest.createFunction(
	{ id: "mood-tracking-handler" },
	{ event: "mood/updated" },
	async ({ event, step }) => {
		// Log the mood update
		await step.run("log-mood-update", async () => {
			logger.info({ event: event.data }, "Mood update received");
		});

		// Analyze mood patterns
		const analysis = await step.run("analyze-mood-patterns", async () => {
			// Add mood analysis logic here
			return {
				trend: "improving", // This would be calculated based on historical data
				recommendations: ["Consider scheduling a therapy session"],
			};
		});

		// If mood is concerning, trigger an alert
		if (event.data.mood < 3) {
			// Assuming mood is on a scale of 1-5
			await step.run("trigger-alert", async () => {
				logger.info({ event: event.data }, "Triggering alert for concerning mood");
				// Add alert logic here
			});
		}

		return {
			message: "Mood update processed",
			analysis,
		};
	}
);

// Function to handle activity completion events
export const activityCompletionHandler = inngest.createFunction(
	{ id: "activity-completion-handler" },
	{ event: "activity/completed" },
	async ({ event, step }) => {
		// Log the activity completion
		await step.run("log-activity-completion", async () => {
			logger.info({ event: event.data }, "Activity completed");
		});

		// Update user progress
		const progress = await step.run("update-progress", async () => {
			// Add progress tracking logic here
			return {
				completedActivities: 1,
				totalPoints: 10,
			};
		});

		// Check if user has earned any achievements
		const achievements = await step.run("check-achievements", async () => {
			// Add achievement checking logic here
			return {
				newAchievements: ["First Activity Completed"],
			};
		});

		return {
			message: "Activity completion processed",
			progress,
			achievements,
		};
	}
);

// Add all functions to the exported array
export const functions = [therapySessionHandler, moodTrackingHandler, activityCompletionHandler, ...aiFunctions];
