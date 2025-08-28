"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
	Loader2,
	Sparkles,
	CheckCircle,
	Clock,
	Zap,
	Target,
	RefreshCw,
	TrendingUp,
	ChevronLeft,
	ChevronRight,
	ArrowLeft,
	Filter,
	Calendar,
	Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

interface PaginationInfo {
	page: number;
	limit: number;
	totalCount: number;
	totalPages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
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

export function RecommendationsPage() {
	const [recommendations, setRecommendations] = useState<ActivityRecommendation[]>([]);
	const [stats, setStats] = useState<RecommendationStats | null>(null);
	const [pagination, setPagination] = useState<PaginationInfo>({
		page: 1,
		limit: 10,
		totalCount: 0,
		totalPages: 0,
		hasNextPage: false,
		hasPrevPage: false,
	});
	const [isLoading, setIsLoading] = useState(true);
	const [isGenerating, setIsGenerating] = useState(false);
	const [completingIds, setCompletingIds] = useState<Set<string>>(new Set());
	const [filterStatus, setFilterStatus] = useState<"all" | "active" | "completed">("all");
	const [sortBy, setSortBy] = useState<"newest" | "oldest" | "difficulty">("newest");

	const { data: user } = authClient.useSession();

	// Fetch recommendations with pagination
	const fetchRecommendations = useCallback(
		async (page = 1, limit = 10) => {
			if (!user) return;

			try {
				setIsLoading(true);
				const response = await fetch(
					`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/history?page=${page}&limit=${limit}`,
					{
						method: "GET",
						credentials: "include",
						headers: {
							"Content-Type": "application/json",
						},
					}
				);

				if (!response.ok) {
					throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
				}

				const data = await response.json();
				if (data.success) {
					setRecommendations(data.data.recommendations);
					setPagination(data.data.pagination);
				} else {
					throw new Error(data.error || "Failed to fetch recommendations");
				}
			} catch (error) {
				console.error("Error fetching recommendations:", error);
				toast.error((error as Error).message || "Failed to load recommendations");
			} finally {
				setIsLoading(false);
			}
		},
		[user]
	);

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
					toast.success("New recommendations generated!");
					// Refresh the current page
					fetchRecommendations(pagination.page, pagination.limit);
				} else {
					toast.success("Generating new recommendations...");
					// Refresh after a delay
					setTimeout(() => {
						fetchRecommendations(pagination.page, pagination.limit);
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
				// Update the recommendation in place
				setRecommendations((prev) =>
					prev.map((rec) =>
						rec.id === recommendationId ? { ...rec, isCompleted: true, completedAt: new Date() } : rec
					)
				);
				toast.success("Great job! Activity completed 🎉");

				// Refresh stats
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

	// Handle page change
	const handlePageChange = (newPage: number) => {
		fetchRecommendations(newPage, pagination.limit);
	};

	// Filter and sort recommendations
	const filteredAndSortedRecommendations = recommendations
		.filter((rec) => {
			if (filterStatus === "active") return !rec.isCompleted;
			if (filterStatus === "completed") return rec.isCompleted;
			return true;
		})
		.sort((a, b) => {
			switch (sortBy) {
				case "newest":
					return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
				case "oldest":
					return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
				case "difficulty":
					const difficultyOrder = { easy: 1, medium: 2, hard: 3 };
					return difficultyOrder[a.difficultyLevel] - difficultyOrder[b.difficultyLevel];
				default:
					return 0;
			}
		});

	useEffect(() => {
		if (user) {
			Promise.all([fetchRecommendations(1, 10), fetchStats()]);
		}
	}, [user, fetchRecommendations, fetchStats]);

	if (!user) {
		return null;
	}

	return (
		<div className="container mx-auto px-4 py-8 space-y-6">
			{/* Header */}
			<div className="flex items-center justify-between">
				<div>
					<div className="flex items-center gap-3 mb-2">
						<Link
							href="/dashboard"
							className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
						>
							<ArrowLeft className="w-4 h-4" />
							Back to Dashboard
						</Link>
					</div>
					<h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
						<Sparkles className="w-8 h-8 text-primary" />
						Activity Recommendations
					</h1>
					<p className="text-muted-foreground">AI-powered personalized activities to enhance your wellness journey</p>
				</div>
				<Button onClick={() => generateNewRecommendations(true)} disabled={isGenerating} className="cursor-pointer">
					{isGenerating ? (
						<>
							<Loader2 className="w-4 h-4 mr-2 animate-spin" />
							Generating...
						</>
					) : (
						<>
							<Zap className="w-4 h-4 mr-2" />
							Generate New
						</>
					)}
				</Button>
			</div>

			{/* Statistics Cards */}
			{stats && (
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-2">
								<Target className="w-5 h-5 text-blue-500" />
								<p className="text-sm font-medium">Total Generated</p>
							</div>
							<p className="text-2xl font-bold mt-2">{stats.totalRecommendations}</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-2">
								<CheckCircle className="w-5 h-5 text-green-500" />
								<p className="text-sm font-medium">Completed</p>
							</div>
							<p className="text-2xl font-bold mt-2">{stats.completedRecommendations}</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-2">
								<Trophy className="w-5 h-5 text-yellow-500" />
								<p className="text-sm font-medium">Completion Rate</p>
							</div>
							<p className="text-2xl font-bold mt-2">{stats.completionRate}%</p>
						</CardContent>
					</Card>
					<Card>
						<CardContent className="p-6">
							<div className="flex items-center gap-2">
								<Calendar className="w-5 h-5 text-purple-500" />
								<p className="text-sm font-medium">Recent (30d)</p>
							</div>
							<p className="text-2xl font-bold mt-2">{stats.recentRecommendations}</p>
						</CardContent>
					</Card>
				</div>
			)}

			{/* Filters and Controls */}
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<div>
							<CardTitle className="flex items-center gap-2">
								<Filter className="w-5 h-5" />
								Filter & Sort
							</CardTitle>
							<CardDescription>Customize your recommendations view</CardDescription>
						</div>
						<Button
							variant="outline"
							size="sm"
							onClick={() => fetchRecommendations(pagination.page, pagination.limit)}
							disabled={isLoading}
						>
							{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-4">
						<div className="flex items-center gap-2">
							<label className="text-sm font-medium">Status:</label>
							<Select
								value={filterStatus}
								onValueChange={(value: "all" | "active" | "completed") => setFilterStatus(value)}
							>
								<SelectTrigger className="w-32">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All</SelectItem>
									<SelectItem value="active">Active</SelectItem>
									<SelectItem value="completed">Completed</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="flex items-center gap-2">
							<label className="text-sm font-medium">Sort by:</label>
							<Select value={sortBy} onValueChange={(value: "newest" | "oldest" | "difficulty") => setSortBy(value)}>
								<SelectTrigger className="w-32">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="newest">Newest</SelectItem>
									<SelectItem value="oldest">Oldest</SelectItem>
									<SelectItem value="difficulty">Difficulty</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="ml-auto text-sm text-muted-foreground">
							Showing {filteredAndSortedRecommendations.length} of {pagination.totalCount} recommendations
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Recommendations List */}
			<Card>
				<CardHeader>
					<CardTitle>Your Recommendations</CardTitle>
					<CardDescription>Personalized activities based on your mood patterns and wellness goals</CardDescription>
				</CardHeader>
				<CardContent>
					{isLoading ? (
						<div className="flex items-center justify-center py-8">
							<Loader2 className="w-6 h-6 animate-spin text-primary" />
							<span className="ml-2 text-sm text-muted-foreground">Loading recommendations...</span>
						</div>
					) : filteredAndSortedRecommendations.length === 0 ? (
						<div className="text-center py-12">
							<Sparkles className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
							<h3 className="text-lg font-medium mb-2">No recommendations found</h3>
							<p className="text-sm text-muted-foreground mb-4">
								{filterStatus === "all"
									? "Generate your first set of personalized recommendations!"
									: `No ${filterStatus} recommendations found. Try changing your filter.`}
							</p>
							{filterStatus === "all" && (
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
							)}
						</div>
					) : (
						<div className="space-y-4">
							{filteredAndSortedRecommendations.map((recommendation) => (
								<div
									key={recommendation.id}
									className={cn(
										"p-6 rounded-lg border transition-all duration-200",
										recommendation.isCompleted ? "bg-muted/30 border-muted" : "bg-card border-border hover:shadow-md"
									)}
								>
									<div className="flex items-start justify-between gap-4">
										<div className="flex-1 space-y-4">
											{/* Header */}
											<div className="flex items-center gap-3">
												<span className="text-2xl">{getActivityTypeIcon(recommendation.activityType)}</span>
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<h4
															className={cn(
																"font-semibold text-lg",
																recommendation.isCompleted && "line-through text-muted-foreground"
															)}
														>
															{recommendation.title}
														</h4>
														{recommendation.isCompleted && <CheckCircle className="w-5 h-5 text-green-500" />}
													</div>
													<p className="text-muted-foreground">{recommendation.description}</p>
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
												{recommendation.basedOnMoodScore && (
													<Badge variant="outline" className="text-xs">
														Mood: {recommendation.basedOnMoodScore}%
													</Badge>
												)}
											</div>

											{/* Benefits */}
											{recommendation.expectedBenefits.length > 0 && (
												<div>
													<p className="text-xs font-medium text-muted-foreground mb-2">Expected Benefits:</p>
													<div className="flex flex-wrap gap-1">
														{recommendation.expectedBenefits.map((benefit, index) => (
															<span key={index} className="px-2 py-1 text-xs rounded-md bg-primary/10 text-primary">
																{benefit}
															</span>
														))}
													</div>
												</div>
											)}

											{/* Reasoning */}
											<p className="text-sm text-muted-foreground italic">💡 {recommendation.reasoning}</p>

											{/* Timestamps */}
											<div className="flex items-center gap-4 text-xs text-muted-foreground">
												<span>Created: {new Date(recommendation.createdAt).toLocaleDateString()}</span>
												{recommendation.completedAt && (
													<span>Completed: {new Date(recommendation.completedAt).toLocaleDateString()}</span>
												)}
											</div>
										</div>

										{/* Action Button */}
										{!recommendation.isCompleted && (
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
										)}
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Pagination */}
			{pagination.totalPages > 1 && (
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center justify-between">
							<div className="text-sm text-muted-foreground">
								Page {pagination.page} of {pagination.totalPages}({pagination.totalCount} total recommendations)
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePageChange(pagination.page - 1)}
									disabled={!pagination.hasPrevPage || isLoading}
									className="cursor-pointer"
								>
									<ChevronLeft className="w-4 h-4" />
									Previous
								</Button>

								{/* Page numbers */}
								<div className="flex items-center gap-1">
									{Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => {
										const pageNum = Math.max(1, pagination.page - 2) + i;
										if (pageNum > pagination.totalPages) return null;

										return (
											<Button
												key={pageNum}
												variant={pageNum === pagination.page ? "default" : "outline"}
												size="sm"
												onClick={() => handlePageChange(pageNum)}
												disabled={isLoading}
												className="cursor-pointer w-8 h-8 p-0"
											>
												{pageNum}
											</Button>
										);
									})}
								</div>

								<Button
									variant="outline"
									size="sm"
									onClick={() => handlePageChange(pagination.page + 1)}
									disabled={!pagination.hasNextPage || isLoading}
									className="cursor-pointer"
								>
									Next
									<ChevronRight className="w-4 h-4" />
								</Button>
							</div>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
