import type { Request, Response, NextFunction } from "express";
import { prisma } from "../lib/db";
import { logger } from "../lib/logger";
import { z } from "zod";

const markCompletedSchema = z.object({
	recommendationId: z.string().uuid("Invalid recommendation ID"),
});

const generateRecommendationsSchema = z.object({
	moodScore: z.number().min(0).max(100).optional(),
	forceRegenerate: z.boolean().optional().default(false),
});

export const getActiveRecommendations = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				error: "User not authenticated",
				success: false,
			});
		}

		const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

		const recommendations = await prisma.activityRecommendation.findMany({
			where: {
				userId,
				isCompleted: false,
				createdAt: {
					gte: sevenDaysAgo,
				},
			},
			orderBy: [{ createdAt: "desc" }],
			take: 10, // Limit to 10 most recent recommendations
		});

		logger.info(
			{
				userId,
				recommendationCount: recommendations.length,
			},
			"Active recommendations fetched"
		);

		res.status(200).json({
			success: true,
			data: recommendations,
		});
	} catch (error) {
		logger.error({ error, userId: req.user?.id }, "Error fetching active recommendations:");
		next(error);
	}
};

export const getRecommendationHistory = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				error: "User not authenticated",
				success: false,
			});
		}

		const page = parseInt(req.query.page as string) || 1;
		const limit = Math.min(parseInt(req.query.limit as string) || 20, 50); // Max 50 items per page
		const skip = (page - 1) * limit;

		const [recommendations, totalCount] = await Promise.all([
			prisma.activityRecommendation.findMany({
				where: { userId },
				orderBy: { createdAt: "desc" },
				skip,
				take: limit,
			}),
			prisma.activityRecommendation.count({
				where: { userId },
			}),
		]);

		const totalPages = Math.ceil(totalCount / limit);

		logger.info(
			{
				userId,
				page,
				limit,
				totalCount,
				returnedCount: recommendations.length,
			},
			"Recommendation history fetched"
		);

		res.status(200).json({
			success: true,
			data: {
				recommendations,
				pagination: {
					page,
					limit,
					totalCount,
					totalPages,
					hasNextPage: page < totalPages,
					hasPrevPage: page > 1,
				},
			},
		});
	} catch (error) {
		logger.error({ error, userId: req.user?.id }, "Error fetching recommendation history:");
		next(error);
	}
};

export const markRecommendationCompleted = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				error: "User not authenticated",
				success: false,
			});
		}

		// Validate request body
		const validationResult = markCompletedSchema.safeParse(req.body);
		if (!validationResult.success) {
			return res.status(400).json({
				error: "Invalid request data",
				details: validationResult.error.issues,
				success: false,
			});
		}

		const { recommendationId } = validationResult.data;

		const updatedRecommendation = await prisma.activityRecommendation.update({
			where: {
				id: recommendationId,
				userId,
			},
			data: {
				isCompleted: true,
				completedAt: new Date(),
			},
		});

		logger.info(
			{
				userId,
				recommendationId,
				activityType: updatedRecommendation.activityType,
			},
			"Recommendation marked as completed"
		);

		res.status(200).json({
			success: true,
			data: updatedRecommendation,
		});
	} catch (error: any) {
		if (error?.code === "P2025") {
			return res.status(404).json({
				error: "Recommendation not found or access denied",
				success: false,
			});
		}

		logger.error({ error, userId: req.user?.id }, "Error marking recommendation as completed:");
		next(error);
	}
};

export const requestNewRecommendations = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				error: "User not authenticated",
				success: false,
			});
		}

		// Validate request body
		const validationResult = generateRecommendationsSchema.safeParse(req.body);
		if (!validationResult.success) {
			return res.status(400).json({
				error: "Invalid request data",
				details: validationResult.error.issues,
				success: false,
			});
		}

		const { moodScore, forceRegenerate } = validationResult.data;

		if (!forceRegenerate) {
			const recentRecommendations = await prisma.activityRecommendation.findMany({
				where: {
					userId,
					isCompleted: false,
					createdAt: {
						gte: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
					},
				},
			});

			if (recentRecommendations.length > 0) {
				return res.status(200).json({
					success: true,
					message: "Recent recommendations already available",
					data: recentRecommendations,
				});
			}
		}

		const { inngest } = await import("../inngest/client");

		await inngest.send({
			name: "mood/updated",
			data: {
				userId,
				score: moodScore || 50, // Default to neutral if not provided
				timestamp: new Date(),
			},
		});

		logger.info(
			{
				userId,
				moodScore,
				forceRegenerate,
			},
			"New recommendation generation triggered"
		);

		res.status(202).json({
			success: true,
			message: "New recommendations are being generated. Check back in a moment.",
		});
	} catch (error) {
		logger.error({ error, userId: req.user?.id }, "Error requesting new recommendations:");
		next(error);
	}
};

export const getRecommendationStats = async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({
				error: "User not authenticated",
				success: false,
			});
		}

		const [totalCount, completedCount, recentCount, activityTypeBreakdown] = await Promise.all([
			prisma.activityRecommendation.count({
				where: { userId },
			}),

			prisma.activityRecommendation.count({
				where: { userId, isCompleted: true },
			}),

			// Recent recommendations (last 30 days)
			prisma.activityRecommendation.count({
				where: {
					userId,
					createdAt: {
						gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
					},
				},
			}),

			// Activity type breakdown
			prisma.activityRecommendation.groupBy({
				by: ["activityType"],
				where: { userId },
				_count: {
					activityType: true,
				},
			}),
		]);

		// Calculate completion rate with better precision
		const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

		const stats = {
			totalRecommendations: totalCount,
			completedRecommendations: completedCount,
			recentRecommendations: recentCount,
			completionRate,
			activityTypeBreakdown: activityTypeBreakdown.map((item) => ({
				type: item.activityType,
				count: item._count.activityType,
			})),
		};

		logger.info(
			{
				userId,
				stats,
			},
			"Recommendation statistics fetched"
		);

		res.status(200).json({
			success: true,
			data: stats,
		});
	} catch (error) {
		logger.error({ error, userId: req.user?.id }, "Error fetching recommendation statistics:");
		next(error);
	}
};
