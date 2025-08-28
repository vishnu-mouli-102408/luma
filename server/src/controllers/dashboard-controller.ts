import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/db";
import { logger } from "../lib/logger";
import { startOfDay, endOfDay } from "date-fns";

interface DashboardStats {
	moodScore: number | null;
	completionRate: number;
	totalActivities: number;
	therapySessions: number;
	lastUpdated: Date;
	moodHistory: Array<{ score: number; timestamp: Date }>;
	activityBreakdown: Array<{ type: string; count: number }>;
}

export const getDashboardStats = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				error: "User not authenticated",
				success: false,
			});
		}

		// Define today's time range
		const today = new Date();
		const startOfToday = startOfDay(today);
		const endOfToday = endOfDay(today);

		// Fetch today's mood entries using parallel queries for better performance
		const [todaysMoods, todaysActivities, allTherapySessions, recentMoods] = await Promise.all([
			// Today's mood entries
			prisma.mood.findMany({
				where: {
					userId,
					timestamp: {
						gte: startOfToday,
						lte: endOfToday,
					},
				},
				orderBy: { timestamp: "desc" },
			}),

			// Today's activities
			prisma.activity.findMany({
				where: {
					userId,
					timestamp: {
						gte: startOfToday,
						lte: endOfToday,
					},
				},
				orderBy: { timestamp: "desc" },
			}),

			// All therapy sessions (lifetime count)
			prisma.activity.count({
				where: {
					userId,
					type: "therapy",
				},
			}),

			// Recent mood history (last 7 days)
			prisma.mood.findMany({
				where: {
					userId,
					timestamp: {
						gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
					},
				},
				orderBy: { timestamp: "asc" },
				select: {
					score: true,
					timestamp: true,
				},
			}),
		]);

		// Calculate average mood score for today
		const averageMoodScore =
			todaysMoods.length > 0
				? Math.round(todaysMoods.reduce((sum, mood) => sum + mood.score, 0) / todaysMoods.length)
				: null;

		// Calculate activity breakdown by type
		const activityBreakdown = todaysActivities.reduce((acc, activity) => {
			const existingType = acc.find((item) => item.type === activity.type);
			if (existingType) {
				existingType.count++;
			} else {
				acc.push({ type: activity.type, count: 1 });
			}
			return acc;
		}, [] as Array<{ type: string; count: number }>);

		// Get recommendation completion rate
		const [totalRecommendations, completedRecommendations] = await Promise.all([
			prisma.activityRecommendation.count({
				where: { userId },
			}),
			prisma.activityRecommendation.count({
				where: { userId, isCompleted: true },
			}),
		]);

		const recommendationCompletionRate =
			totalRecommendations > 0 ? Math.round((completedRecommendations / totalRecommendations) * 100) : 0;

		// Prepare dashboard statistics
		const dashboardStats: DashboardStats = {
			moodScore: averageMoodScore,
			completionRate: recommendationCompletionRate,
			totalActivities: todaysActivities.length,
			therapySessions: allTherapySessions,
			lastUpdated: new Date(),
			moodHistory: recentMoods,
			activityBreakdown,
		};

		logger.info(
			{
				statsCount: {
					moods: todaysMoods.length,
					activities: todaysActivities.length,
					therapySessions: allTherapySessions,
					totalRecommendations,
					completedRecommendations,
					completionRate: recommendationCompletionRate,
				},
			},
			`Dashboard stats fetched for user ${userId}`
		);

		res.status(200).json({
			success: true,
			data: dashboardStats,
		});
	} catch (error) {
		logger.error(error, "Error fetching dashboard stats");
		next(error);
	}
};

export const getActivityHistory = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				error: "User not authenticated",
				success: false,
			});
		}

		// Get last 30 days of activities
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

		const activities = await prisma.activity.findMany({
			where: {
				userId,
				timestamp: {
					gte: thirtyDaysAgo,
				},
			},
			orderBy: { timestamp: "desc" },
			select: {
				id: true,
				type: true,
				name: true,
				duration: true,
				timestamp: true,
			},
		});

		res.status(200).json({
			success: true,
			data: activities,
		});
	} catch (error) {
		logger.error(error, "Error fetching activity history");
		next(error);
	}
};

export const getMoodTrends = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				error: "User not authenticated",
				success: false,
			});
		}

		// Get last 30 days of mood entries
		const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

		const moods = await prisma.mood.findMany({
			where: {
				userId,
				timestamp: {
					gte: thirtyDaysAgo,
				},
			},
			orderBy: { timestamp: "asc" },
			select: {
				score: true,
				timestamp: true,
				note: true,
			},
		});

		// Calculate trend statistics
		const averageScore = moods.length > 0 ? moods.reduce((sum, mood) => sum + mood.score, 0) / moods.length : 0;

		res.status(200).json({
			success: true,
			data: {
				moods,
				averageScore: Math.round(averageScore),
				totalEntries: moods.length,
			},
		});
	} catch (error) {
		logger.error(error, "Error fetching mood trends");
		next(error);
	}
};
