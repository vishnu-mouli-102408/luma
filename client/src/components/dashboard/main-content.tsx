"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
	Sparkles,
	MessageSquare,
	ArrowRight,
	Heart,
	BrainCircuit,
	Activity,
	Brain,
	Trophy,
	RefreshCw,
} from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { useDashboard } from "@/contexts/dashboard-context";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogOverlay, DialogTitle } from "../ui/dialog";
import { MoodForm } from "./mood-form";
import { format } from "date-fns";
import { ActivityLogger } from "./activity-logger";
import { AnxietyGames } from "../games/anxiety-games";
import { RecommendationWidget } from "./recommendation-widget";
import { useRouter } from "next/navigation";
import { Spinner } from "../ui/spinner";

interface Activity {
	id: string;
	userId: string | null;
	type: string;
	name: string;
	description: string | null;
	timestamp: Date;
	duration: number | null;
	completed: boolean;
	moodScore: number | null;
	moodNote: string | null;
	createdAt: Date;
	updatedAt: Date;
}

const DashboardMainContent = () => {
	const [mounted, setMounted] = useState(false);
	const [showMoodModal, setShowMoodModal] = useState(false);
	const [showActivityLogger, setShowActivityLogger] = useState(false);
	const router = useRouter();

	const { state, refreshData, clearError } = useDashboard();
	const { stats, isLoading, error } = state;

	const handleStartTherapy = () => {
		const tempSessionId = crypto.randomUUID();

		router.push(`/therapy/${tempSessionId}`);
	};

	useEffect(() => {
		setMounted(true);
	}, []);

	const handleRefreshStats = async () => {
		try {
			await refreshData();
			toast.success("Dashboard refreshed successfully!");
		} catch (error) {
			console.error("Error refreshing dashboard:", error);
			toast.error("Failed to refresh dashboard");
		}
	};

	useEffect(() => {
		if (error) {
			const timer = setTimeout(() => {
				clearError();
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [error, clearError]);

	const wellnessStats = [
		{
			title: "Mood Score",
			value: stats?.moodScore ? `${stats.moodScore}%` : "No data",
			icon: Brain,
			color: "text-purple-500",
			bgColor: "bg-purple-500/10",
			description: "Today's average mood",
		},
		{
			title: "Completion Rate",
			value: `${stats?.completionRate || 0}%`,
			icon: Trophy,
			color: "text-yellow-500",
			bgColor: "bg-yellow-500/10",
			description: "Recommendations completed",
		},
		{
			title: "Therapy Sessions",
			value: `${stats?.therapySessions || 0} sessions`,
			icon: Heart,
			color: "text-rose-500",
			bgColor: "bg-rose-500/10",
			description: "Total sessions completed",
		},
		{
			title: "Total Activities",
			value: (stats?.totalActivities || 0).toString(),
			icon: Activity,
			color: "text-blue-500",
			bgColor: "bg-blue-500/10",
			description: "Activities completed today",
		},
	];

	const handleGamePlayed = useCallback(async () => {
		try {
			console.log("handle games played");
		} catch (error) {
			console.error("Error logging game activity:", error);
		}
	}, []);

	if (!mounted) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Spinner variant="circle-filled" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				<Card className="relative overflow-hidden py-0 group rounded-xl border border-border bg-card/80 supports-[backdrop-filter]:bg-card/60 backdrop-blur shadow-sm">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
					<CardContent className="p-6 relative">
						<div className="space-y-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-primary/10 ring-1 ring-border flex items-center justify-center">
									<Sparkles className="w-5 h-5 text-primary" />
								</div>
								<div>
									<h3 className="font-semibold text-lg tracking-tight">
										<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
											Quick Actions
										</span>
									</h3>
									<p className="text-sm text-muted-foreground">Start your wellness journey</p>
								</div>
							</div>

							<div className="grid gap-4">
								<Button
									variant="default"
									className={cn(
										"w-full justify-between rounded-xl cursor-pointer items-center p-6 h-auto group/button",
										"bg-gradient-to-r from-primary to-primary/90 hover:to-primary",
										"transition-all duration-200 group-hover:translate-y-[-2px]"
									)}
									onClick={handleStartTherapy}
								>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-white/10 ring-1 ring-white/20 flex items-center justify-center">
											<MessageSquare className="w-4 h-4 text-white" />
										</div>
										<div className="text-left">
											<div className="font-semibold text-white">Start Therapy</div>
											<div className="text-xs text-white/80">Begin a new session</div>
										</div>
									</div>
									<div className="opacity-0 group-hover/button:opacity-100 transition-opacity">
										<ArrowRight className="w-5 h-5 text-white" />
									</div>
								</Button>

								<div className="grid grid-cols-2 gap-4">
									<Button
										variant="outline"
										className={cn(
											"flex flex-col cursor-pointer rounded-lg h-[120px] px-4 py-3 group/mood hover:border-primary/50",
											"justify-center items-center text-center",
											"transition-all duration-300 group-hover:translate-y-[-2px]"
										)}
										onClick={() => setShowMoodModal(true)}
									>
										<div className="w-10 h-10 rounded-full bg-rose-500/10 flex items-center justify-center mb-2">
											<Heart className="w-5 h-5 text-rose-500" />
										</div>
										<div>
											<div className="font-medium text-sm">Track Mood</div>
											<div className="text-xs text-muted-foreground mt-0.5">How are you feeling?</div>
										</div>
									</Button>

									<Button
										variant="outline"
										className={cn(
											"flex flex-col rounded-lg cursor-pointer h-[120px] px-4 py-3 group/ai hover:border-primary/50",
											"justify-center items-center text-center",
											"transition-all duration-200 group-hover:translate-y-[-2px]"
										)}
										onClick={() => setShowActivityLogger(true)}
									>
										<div className="w-10 h-10 rounded-full bg-blue-500/10 ring-1 ring-border flex items-center justify-center mb-2">
											<BrainCircuit className="w-5 h-5 text-blue-500" />
										</div>
										<div>
											<div className="font-medium text-sm">Check-in</div>
											<div className="text-xs text-muted-foreground mt-0.5">Quick wellness check</div>
										</div>
									</Button>
								</div>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="rounded-xl border border-border bg-card/80 supports-[backdrop-filter]:bg-card/60 backdrop-blur shadow-sm">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle className="tracking-tight">Today&apos;s Overview</CardTitle>
								<CardDescription>Your wellness metrics for {format(new Date(), "MMMM d, yyyy")}</CardDescription>
							</div>
							<Button
								variant="link"
								size="icon"
								onClick={handleRefreshStats}
								disabled={isLoading}
								className="h-8 w-8 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02]"
							>
								<RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-4">
							{wellnessStats.map((stat) => (
								<div
									key={stat.title}
									className={cn("p-4 rounded-lg ring-1 ring-border transition-colors duration-200", stat.bgColor)}
								>
									<div className="flex items-center gap-2">
										<stat.icon className={cn("w-5 h-5", stat.color)} />
										<p className="text-sm font-medium">{stat.title}</p>
									</div>
									<p className="text-lg font-bold mt-2">{stat.value}</p>
									<p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
								</div>
							))}
						</div>
						<div className="mt-4 text-xs text-muted-foreground text-right">
							{stats?.lastUpdated ? (
								<span>Last updated: {format(new Date(stats.lastUpdated), "h:mm a")}</span>
							) : (
								<span>No data available</span>
							)}
						</div>
						{error && (
							<div className="mt-2 text-xs text-red-500 text-center">
								Error loading dashboard data. Retrying automatically...
							</div>
						)}
					</CardContent>
				</Card>

				<RecommendationWidget />
				{showActivityLogger && <ActivityLogger open={showActivityLogger} onOpenChange={setShowActivityLogger} />}
			</div>

			<div className="w-full">
				<AnxietyGames onGamePlayed={handleGamePlayed} />
			</div>

			{showMoodModal && (
				<Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
					<DialogOverlay className="bg-black/40 supports-[backdrop-filter]:bg-black/30 backdrop-blur-sm" />
					<DialogContent className="sm:max-w-[425px] rounded-xl border border-border bg-card/95 supports-[backdrop-filter]:bg-card/75 backdrop-blur shadow-lg">
						<DialogHeader>
							<DialogTitle className="tracking-tight">How are you feeling?</DialogTitle>
							<DialogDescription>Move the slider to track your current mood</DialogDescription>
						</DialogHeader>
						<MoodForm
							onSuccess={() => {
								setShowMoodModal(false);
							}}
						/>
					</DialogContent>
				</Dialog>
			)}
		</div>
	);
};

export default DashboardMainContent;
