"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, CheckCircle, Clock, Zap, Target, RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

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

interface ActivityRecommendationsProps {
	onRecommendationCompleted?: () => void;
}

const getDifficultyColor = (level: string) => {
	switch (level) {
		case "easy":
			return "bg-green-500/10 text-green-600 border-green-200";
		case "medium":
			return "bg-yellow-500/10 text-yellow-600 border-yellow-200";
		case "hard":
			return "bg-red-500/10 text-red-600 border-red-200";
		default:
			return "bg-gray-500/10 text-gray-600 border-gray-200";
	}
};

const getActivityTypeIcon = (type: string) => {
	switch (type.toLowerCase()) {
		case "meditation":
			return "🧘";
		case "exercise":
			return "🏃";
		case "walking":
			return "🚶";
		case "reading":
			return "📚";
		case "journaling":
			return "✍️";
		case "therapy":
			return "💭";
		default:
			return "✨";
	}
};

export function ActivityRecommendations({ onRecommendationCompleted }: ActivityRecommendationsProps) {
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
				setRecommendations(data.data);
			} else {
				throw new Error(data.error || "Failed to fetch recommendations");
			}
		} catch (error) {
			console.error("Error fetching recommendations:", error);
			toast.error((error as Error).message || "Failed to load recommendations");
		} finally {
			setIsLoading(false);
		}
	}, [user]);

	// Fetch recommendation statistics
	const fetchStats = useCallback(async () => {
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
	const generateNewRecommendations = async (forceRegenerate = false) => {
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
					// Already have recommendations
					setRecommendations(data.data);
					toast.success("Recent recommendations loaded");
				} else {
					toast.success("Generating new recommendations...");
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
	};

	// Mark recommendation as completed
	const markAsCompleted = async (recommendationId: string) => {
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

				onRecommendationCompleted?.();

				fetchStats();
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
	};

	useEffect(() => {
		if (user) {
			Promise.all([fetchRecommendations(), fetchStats()]);
		}
	}, [user, fetchRecommendations, fetchStats]);

	if (!user) {
		return null;
	}

	return (
		<Card className="rounded-xl border border-border bg-card/80 supports-[backdrop-filter]:bg-card/60 backdrop-blur shadow-sm">
			<CardHeader>
				<div className="flex items-center justify-between">
					<div>
						<CardTitle className="flex items-center gap-2 tracking-tight">
							<Sparkles className="w-5 h-5 text-primary" />
							AI Recommendations
						</CardTitle>
						<CardDescription>Personalized activities based on your mood and progress</CardDescription>
					</div>
					<div className="flex items-center gap-2">
						{stats && (
							<div className="text-right">
								<div className="text-sm font-medium text-foreground">{stats.completionRate}% completion rate</div>
								<div className="text-xs text-muted-foreground">
									{stats.completedRecommendations} of {stats.totalRecommendations} completed
								</div>
							</div>
						)}
						<Button
							variant="outline"
							size="sm"
							onClick={() => generateNewRecommendations(true)}
							disabled={isGenerating}
							className="cursor-pointer"
						>
							{isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
						</Button>
					</div>
				</div>
			</CardHeader>
			<CardContent>
				{isLoading ? (
					<div className="flex items-center justify-center py-8">
						<Loader2 className="w-6 h-6 animate-spin text-primary" />
						<span className="ml-2 text-sm text-muted-foreground">Loading recommendations...</span>
					</div>
				) : recommendations.length === 0 ? (
					<div className="text-center py-8">
						<Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
						<h3 className="text-lg font-medium mb-2">No active recommendations</h3>
						<p className="text-sm text-muted-foreground mb-4">
							Generate personalized activity recommendations based on your current mood and progress.
						</p>
						<Button
							onClick={() => generateNewRecommendations(false)}
							disabled={isGenerating}
							className="cursor-pointer"
						>
							{isGenerating ? (
								<>
									<Loader2 className="w-4 h-4 mr-2 animate-spin" />
									Generating...
								</>
							) : (
								<>
									<Zap className="w-4 h-4 mr-2" />
									Generate Recommendations
								</>
							)}
						</Button>
					</div>
				) : (
					<div className="space-y-4">
						{recommendations.map((recommendation) => (
							<div
								key={recommendation.id}
								className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
							>
								<div className="flex items-start justify-between gap-4">
									<div className="flex-1 space-y-3">
										{/* Header */}
										<div className="flex items-center gap-3">
											<span className="text-2xl">{getActivityTypeIcon(recommendation.activityType)}</span>
											<div className="flex-1">
												<h4 className="font-semibold text-foreground">{recommendation.title}</h4>
												<p className="text-sm text-muted-foreground">{recommendation.description}</p>
											</div>
										</div>

										{/* Badges */}
										<div className="flex items-center gap-2 flex-wrap">
											<Badge
												variant="outline"
												className={cn("text-xs", getDifficultyColor(recommendation.difficultyLevel))}
											>
												{recommendation.difficultyLevel}
											</Badge>
											{recommendation.estimatedDuration && (
												<Badge variant="outline" className="text-xs">
													<Clock className="w-3 h-3 mr-1" />
													{recommendation.estimatedDuration} min
												</Badge>
											)}
											<Badge variant="outline" className="text-xs">
												<TrendingUp className="w-3 h-3 mr-1" />
												{recommendation.activityType}
											</Badge>
										</div>

										{/* Benefits */}
										{recommendation.expectedBenefits.length > 0 && (
											<div>
												<p className="text-xs font-medium text-muted-foreground mb-1">Expected Benefits:</p>
												<div className="flex flex-wrap gap-1">
													{recommendation.expectedBenefits.slice(0, 3).map((benefit, index) => (
														<span key={index} className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">
															{benefit}
														</span>
													))}
													{recommendation.expectedBenefits.length > 3 && (
														<span className="px-2 py-1 text-xs rounded-md bg-muted text-muted-foreground">
															+{recommendation.expectedBenefits.length - 3} more
														</span>
													)}
												</div>
											</div>
										)}

										{/* Reasoning */}
										<p className="text-xs text-muted-foreground italic">💡 {recommendation.reasoning}</p>
									</div>

									{/* Action Button */}
									<Button
										onClick={() => markAsCompleted(recommendation.id)}
										disabled={completingIds.has(recommendation.id)}
										size="sm"
										className="cursor-pointer shrink-0"
									>
										{completingIds.has(recommendation.id) ? (
											<>
												<Loader2 className="w-4 h-4 mr-2 animate-spin" />
												Completing...
											</>
										) : (
											<>
												<CheckCircle className="w-4 h-4 mr-2" />
												Mark Done
											</>
										)}
									</Button>
								</div>
							</div>
						))}

						{/* Generate More Button */}
						<div className="pt-2 border-t border-border">
							<Button
								variant="outline"
								onClick={() => generateNewRecommendations(true)}
								disabled={isGenerating}
								className="w-full cursor-pointer"
							>
								{isGenerating ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Generating New Recommendations...
									</>
								) : (
									<>
										<Target className="w-4 h-4 mr-2" />
										Generate New Recommendations
									</>
								)}
							</Button>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
