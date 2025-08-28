"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Clock, TrendingUp, ChevronRight } from "lucide-react";
import { useActivityRecommendations } from "@/hooks/use-activity-recommendations";
import { cn } from "@/lib/utils";
import Link from "next/link";

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

interface RecommendationWidgetProps {
	className?: string;
}

export function RecommendationWidget({}: RecommendationWidgetProps) {
	const { recommendations, isLoading, markAsCompleted, isCompleting, hasActiveRecommendations } =
		useActivityRecommendations();

	const topRecommendation = recommendations[0];

	if (isLoading) {
		return (
			<Card className="rounded-xl border border-border bg-card/80 supports-[backdrop-filter]:bg-card/60 backdrop-blur shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm font-medium tracking-tight">
						<Sparkles className="w-4 h-4 text-primary" />
						Today&apos;s Recommendation
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-center py-4">
						<div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
						<span className="ml-2 text-sm text-muted-foreground">Loading...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!hasActiveRecommendations) {
		return (
			<Card className="rounded-xl border border-border bg-card/80 supports-[backdrop-filter]:bg-card/60 backdrop-blur shadow-sm">
				<CardHeader className="pb-3">
					<CardTitle className="flex items-center gap-2 text-sm font-medium tracking-tight">
						<Sparkles className="w-4 h-4 text-primary" />
						Today&apos;s Recommendation
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-4">
						<Sparkles className="w-8 h-8 mx-auto mb-2 text-muted-foreground opacity-50" />
						<p className="text-sm text-muted-foreground mb-2">No recommendations yet</p>
						<Link href="/recommendations">
							<Button variant="outline" size="sm" className="cursor-pointer">
								Generate Recommendations
							</Button>
						</Link>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="rounded-xl border border-border bg-card/80 supports-[backdrop-filter]:bg-card/60 backdrop-blur shadow-sm">
			<CardHeader className="pb-3">
				<div className="flex items-center justify-between">
					<CardTitle className="flex items-center gap-2 text-sm font-medium tracking-tight">
						<Sparkles className="w-4 h-4 text-primary" />
						Today&apos;s Recommendation
					</CardTitle>
					{recommendations.length > 1 && (
						<Link href="/recommendations">
							<Button variant="ghost" size="sm" className="text-xs cursor-pointer h-auto p-1">
								View All ({recommendations.length})
								<ChevronRight className="w-3 h-3 ml-1" />
							</Button>
						</Link>
					)}
				</div>
			</CardHeader>
			<CardContent>
				{topRecommendation && (
					<div className="space-y-3">
						{/* Main content */}
						<div className="flex items-start gap-3">
							<span className="text-xl flex-shrink-0">{getActivityTypeIcon(topRecommendation.activityType)}</span>
							<div className="flex-1 min-w-0">
								<h4 className="font-medium text-sm text-foreground truncate">{topRecommendation.title}</h4>
								<p className="text-xs text-muted-foreground line-clamp-2">{topRecommendation.description}</p>
							</div>
						</div>

						{/* Badges */}
						<div className="flex items-center gap-1 flex-wrap">
							<Badge variant="outline" className={cn("text-xs", getDifficultyColor(topRecommendation.difficultyLevel))}>
								{topRecommendation.difficultyLevel}
							</Badge>
							{topRecommendation.estimatedDuration && (
								<Badge variant="outline" className="text-xs">
									<Clock className="w-3 h-3 mr-1" />
									{topRecommendation.estimatedDuration}m
								</Badge>
							)}
							<Badge variant="outline" className="text-xs">
								<TrendingUp className="w-3 h-3 mr-1" />
								{topRecommendation.activityType}
							</Badge>
						</div>

						{/* Benefits */}
						{topRecommendation.expectedBenefits.length > 0 && (
							<div className="text-xs text-muted-foreground">
								💡 {topRecommendation.expectedBenefits.slice(0, 2).join(", ")}
								{topRecommendation.expectedBenefits.length > 2 && "..."}
							</div>
						)}

						{/* Action */}
						<div className="flex items-center gap-2 pt-1">
							<Button
								size="sm"
								onClick={() => markAsCompleted(topRecommendation.id)}
								disabled={isCompleting(topRecommendation.id)}
								className="cursor-pointer flex-1 h-8 text-xs"
							>
								{isCompleting(topRecommendation.id) ? "Completing..." : "Mark Done"}
							</Button>
							<Link href="/recommendations">
								<Button variant="outline" size="sm" className="cursor-pointer h-8 text-xs">
									View All
								</Button>
							</Link>
						</div>
					</div>
				)}
			</CardContent>
		</Card>
	);
}
