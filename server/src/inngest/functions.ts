import { inngest } from "./client";
import { functions as aiFunctions } from "./ai-functions";
import { logger } from "../lib/logger";
import { prisma } from "../lib/db";

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

		// Validate payload
		const { userId, score, note, timestamp } = await step.run("validate-mood-payload", async () => {
			const data = event.data as {
				userId?: string;
				score?: number;
				note?: string | null;
				timestamp?: string | Date;
			};
			if (!data?.userId || typeof data?.score !== "number") {
				throw new Error("Missing required fields in mood/updated event");
			}
			return data as Required<Pick<typeof data, "userId" | "score">> & Partial<Pick<typeof data, "note" | "timestamp">>;
		});

		// Analyze mood patterns from DB
		const analysis = await step.run("analyze-mood-patterns", async () => {
			const now = new Date();
			const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
			const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

			const [last7Agg, last30Agg, lowsLast7, recentMoods] = await Promise.all([
				prisma.mood.aggregate({
					where: { userId, timestamp: { gte: sevenDaysAgo } },
					_avg: { score: true },
					_count: true,
				}),
				prisma.mood.aggregate({
					where: { userId, timestamp: { gte: thirtyDaysAgo } },
					_avg: { score: true },
					_count: true,
				}),
				prisma.mood.count({ where: { userId, timestamp: { gte: sevenDaysAgo }, score: { lt: 3 } } }),
				prisma.mood.findMany({ where: { userId }, orderBy: { timestamp: "desc" }, take: 5 }),
			]);

			const avg7 = last7Agg._avg.score ?? null;
			const avg30 = last30Agg._avg.score ?? null;
			let trend: "improving" | "declining" | "stable" = "stable";
			if (avg7 !== null && avg30 !== null) {
				if (avg7 - avg30 > 0.3) trend = "improving";
				else if (avg30 - avg7 > 0.3) trend = "declining";
			}

			const recommendations: string[] = [];
			if (score < 3 || lowsLast7 >= 2) {
				recommendations.push("Consider a short mindfulness exercise");
			}
			if (trend === "declining") {
				recommendations.push("Schedule a therapy session or reach out to support");
			}

			return {
				avg7,
				avg30,
				trend,
				lowsLast7,
				recentMoods,
				recommendations,
			};
		});

		// Build alert payload to return in response (no external side-effects)
		const alert = await step.run("build-alert-payload", async () => {
			if (score < 3) {
				return {
					shouldAlert: true,
					level: "high" as const,
					reason: "Low mood score (<3)",
					score,
					note: note ?? null,
					timestamp: timestamp ?? new Date().toISOString(),
				};
			}
			if (analysis.trend === "declining" || analysis.lowsLast7 >= 2) {
				return {
					shouldAlert: true,
					level: "medium" as const,
					reason: analysis.trend === "declining" ? "Mood trend declining" : "Multiple low moods in last 7 days",
					score,
					note: note ?? null,
					timestamp: timestamp ?? new Date().toISOString(),
				};
			}
			return { shouldAlert: false as const };
		});

		return {
			message: "Mood update processed",
			analysis,
			alert,
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

		// Validate payload
		const {
			userId,
			id: activityId,
			type,
			name,
			duration,
			timestamp,
		} = await step.run("validate-payload", async () => {
			const data = event.data as {
				userId?: string;
				id?: string;
				type?: string;
				name?: string;
				description?: string | null;
				duration?: number | null;
				timestamp?: string | Date;
			};

			if (!data?.userId || !data?.id || !data?.type || !data?.name) {
				throw new Error("Missing required fields in activity/completed event");
			}
			return data as Required<Pick<typeof data, "userId" | "id" | "type" | "name">> &
				Partial<Pick<typeof data, "duration" | "timestamp">>;
		});

		// Compute user progress aggregates
		const progress = await step.run("compute-progress", async () => {
			const [totalCount, durationAgg] = await Promise.all([
				prisma.activity.count({ where: { userId } }),
				prisma.activity.aggregate({
					where: { userId },
					_sum: { duration: true },
				}),
			]);

			const totalDurationMinutes = durationAgg._sum.duration ?? 0;

			// Simple points heuristic: 10 per activity + 1 per 5 minutes
			const totalPoints = totalCount * 10 + Math.floor(totalDurationMinutes / 5);

			return {
				completedActivities: totalCount,
				totalDurationMinutes,
				totalPoints,
				lastActivityId: activityId,
				lastActivityAt: timestamp ?? new Date().toISOString(),
			};
		});

		// Determine achievements
		const achievements = await step.run("determine-achievements", async () => {
			const newAchievements: string[] = [];

			if (progress.completedActivities === 1) {
				newAchievements.push("First Activity Completed");
			}
			if (progress.completedActivities === 10) {
				newAchievements.push("10 Activities Milestone");
			}
			if ((progress.totalDurationMinutes ?? 0) >= 30) {
				newAchievements.push("30 Minutes Club");
			}

			// Type-specific small milestone (5 of same type)
			const thisTypeCount = await prisma.activity.count({ where: { userId, type: type as any } });
			if (thisTypeCount === 5) {
				newAchievements.push(`${String(type)} Novice`);
			}

			return { newAchievements };
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
