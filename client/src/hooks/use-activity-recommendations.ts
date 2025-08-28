"use client";

import { useState, useEffect, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

interface ActivityRecommendation {
	id: string;
	activityType: string;
	title: string;
	description: string;
	reasoning: string;
	expectedBenefits: string[];
	difficultyLevel: "easy" | "medium" | "hard";
	estimatedDuration: number | null;
	basedOnMoodScore: number | null;
	isCompleted: boolean;
	completedAt: Date | null;
	createdAt: Date;
}

interface RecommendationStats {
	totalRecommendations: number;
	completedRecommendations: number;
	recentRecommendations: number;
	completionRate: number;
	activityTypeBreakdown: Array<{ type: string; count: number }>;
}

interface UseActivityRecommendationsReturn {
	// Data
	recommendations: ActivityRecommendation[];
	stats: RecommendationStats | null;

	// Loading states
	isLoading: boolean;
	isGenerating: boolean;
	isCompleting: (id: string) => boolean;

	// Actions
	fetchRecommendations: () => Promise<void>;
	generateRecommendations: (forceRegenerate?: boolean) => Promise<void>;
	markAsCompleted: (id: string) => Promise<void>;
	refreshStats: () => Promise<void>;

	// Utilities
	hasActiveRecommendations: boolean;
	canGenerateMore: boolean;
}

export function useActivityRecommendations(): UseActivityRecommendationsReturn {
	const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([]);
	const [stats, setStats] = useState<RecommendationStats | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());

	const { data: user } = authClient.useSession();

	// Fetch active recommendations
	const fetchRecommendations = useCallback(async () => {
		if (!user) return;

		try {
			setIsLoading(true);
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/active`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
			}

			const data = await response.json();
			if (data.success) {
				setRecommendations(data.data || []);
			} else {
				throw new Error(data.error || "Failed to fetch recommendations");
			}
		} catch (error) {
			console.error("Error fetching recommendations:", error);
			toast.error((error as Error).message || "Failed to load recommendations");
			setRecommendations([]);
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	// Fetch recommendation statistics
	const refreshStats = useCallback(async () => {
		if (!user) return;

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/stats`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch stats: ${response.statusText}`);
			}

			const data = await response.json();
			if (data.success) {
				setStats(data.data);
			}
		} catch (error) {
			console.error("Error fetching recommendation stats:", error);
		}
	}, [user]);

	// Generate new recommendations
	const generateRecommendations = useCallback(
		async (forceRegenerate = false) => {
			if (!user) return;

			try {
				setIsGenerating(true);
				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/generate`, {
					method: "POST",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						forceRegenerate,
					}),
				});

				if (!response.ok) {
					throw new Error(`Failed to generate recommendations: ${response.statusText}`);
				}

				const data = await response.json();
				if (data.success) {
					if (data.data && Array.isArray(data.data)) {
						setRecommendations(data.data);
						toast.success("Recent recommendations loaded");
					} else {
						toast.success("Generating personalized recommendations...");
						setTimeout(() => {
							fetchRecommendations();
						}, 3000);
					}
				} else {
					throw new Error(data.error || "Failed to generate recommendations");
				}
			} catch (error) {
				console.error("Error generating recommendations:", error);
				toast.error("Failed to generate recommendations");
			} finally {
				setIsGenerating(false);
			}
		},
		[user, fetchRecommendations]
	);

	// Mark recommendation as completed
	const markAsCompleted = useCallback(
		async (recommendationId: string) => {
			if (!user) return;

			try {
				setCompletingIds((prev) => new Set(prev.add(recommendationId)));

				const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/complete`, {
					method: "PATCH",
					credentials: "include",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						recommendationId,
					}),
				});

				if (!response.ok) {
					throw new Error(`Failed to mark as completed: ${response.statusText}`);
				}

				const data = await response.json();
				if (data.success) {
					setRecommendations((prev) => prev.filter((rec) => rec.id !== recommendationId));
					toast.success("Great job! Activity completed 🎉");
					refreshStats();
				} else {
					throw new Error(data.error || "Failed to mark as completed");
				}
			} catch (error) {
				console.error("Error marking recommendation as completed:", error);
				toast.error("Failed to mark as completed");
			} finally {
				setCompletingIds((prev) => {
					const newSet = new Set(prev);
					newSet.delete(recommendationId);
					return newSet;
				});
			}
		},
		[user, refreshStats]
	);

	// Check if a recommendation is being completed
	const isCompleting = useCallback(
		(id: string) => {
			return completingIds.has(id);
		},
		[completingIds]
	);

	useEffect(() => {
		if (user) {
			Promise.all([fetchRecommendations(), refreshStats()]);
		}
	}, [user, fetchRecommendations, refreshStats]);

	// Computed values
	const hasActiveRecommendations = recommendations.length > 0;
	const canGenerateMore = !isGenerating && user !== null;

	return {
		// Data
		recommendations,
		stats,

		// Loading states
		isLoading,
		isGenerating,
		isCompleting,

		// Actions
		fetchRecommendations,
		generateRecommendations,
		markAsCompleted,
		refreshStats,

		// Utilities
		hasActiveRecommendations,
		canGenerateMore,
	};
}
