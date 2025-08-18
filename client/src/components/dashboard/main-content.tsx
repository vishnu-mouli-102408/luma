"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
	Sparkles,
	MessageSquare,
	ArrowRight,
	Heart,
	BrainCircuit,
	Loader2,
	Activity,
	Brain,
	Trophy,
	RefreshCw,
	LucideIcon,
	X,
} from "lucide-react";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogOverlay,
	DialogTitle,
	DialogTrigger,
} from "../ui/dialog";
import { MoodForm } from "./mood-form";
import { format } from "date-fns";
import { ActivityLogger } from "./activity-logger";

interface DailyStats {
	moodScore: number | null;
	completionRate: number;
	mindfulnessCount: number;
	totalActivities: number;
	lastUpdated: Date;
}

const DashboardMainContent = () => {
	const [showMoodModal, setShowMoodModal] = useState(false);
	const [insights, setInsights] = useState<
		{
			title: string;
			description: string;
			icon: LucideIcon;
			priority: "low" | "medium" | "high";
		}[]
	>([]);
	const [dailyStats, setDailyStats] = useState<DailyStats>({
		moodScore: null,
		completionRate: 100,
		mindfulnessCount: 0,
		totalActivities: 0,
		lastUpdated: new Date(),
	});

	const [showActivityLogger, setShowActivityLogger] = useState(false);
	const handleStartTherapy = () => {
		toast.success("Therapy started");
	};

	const handleAICheckIn = () => {
		toast.success("AI check-in started");
	};

	const fetchDailyStats = () => {
		toast.success("Daily stats fetched");
	};

	const wellnessStats = [
		{
			title: "Mood Score",
			value: dailyStats.moodScore ? `${dailyStats.moodScore}%` : "No data",
			icon: Brain,
			color: "text-purple-500",
			bgColor: "bg-purple-500/10",
			description: "Today's average mood",
		},
		{
			title: "Completion Rate",
			value: "100%",
			icon: Trophy,
			color: "text-yellow-500",
			bgColor: "bg-yellow-500/10",
			description: "Perfect completion rate",
		},
		{
			title: "Therapy Sessions",
			value: `${dailyStats.mindfulnessCount} sessions`,
			icon: Heart,
			color: "text-rose-500",
			bgColor: "bg-rose-500/10",
			description: "Total sessions completed",
		},
		{
			title: "Total Activities",
			value: dailyStats.totalActivities.toString(),
			icon: Activity,
			color: "text-blue-500",
			bgColor: "bg-blue-500/10",
			description: "Planned for today",
		},
	];
	return (
		<div className="space-y-6">
			{/* Top Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* Quick Actions Card */}
				<Card className="border-primary/10 relative overflow-hidden py-0 group">
					<div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent" />
					<CardContent className="p-6 relative">
						<div className="space-y-6">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
									<Sparkles className="w-5 h-5 text-primary" />
								</div>
								<div>
									<h3 className="font-semibold text-lg">Quick Actions</h3>
									<p className="text-sm text-muted-foreground">Start your wellness journey</p>
								</div>
							</div>

							<div className="grid gap-4">
								<Button
									variant="default"
									className={cn(
										"w-full justify-between rounded-xl cursor-pointer items-center p-6 h-auto group/button",
										"bg-gradient-to-r from-primary/90 to-primary hover:from-primary hover:to-primary/90",
										"transition-all duration-200 group-hover:translate-y-[-2px]"
									)}
									onClick={handleStartTherapy}
								>
									<div className="flex items-center gap-3">
										<div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
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
									<Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
										<DialogTrigger asChild>
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
										</DialogTrigger>
										<DialogOverlay className="bg-black/50 backdrop-blur-sm" />
										<DialogContent className="sm:max-w-[425px]">
											<DialogHeader>
												<DialogTitle>How are you feeling?</DialogTitle>
												<DialogDescription>Move the slider to track your current mood</DialogDescription>
											</DialogHeader>
											<MoodForm onSuccess={() => setShowMoodModal(false)} />
										</DialogContent>
									</Dialog>

									<Button
										variant="outline"
										className={cn(
											"flex flex-col rounded-lg cursor-pointer h-[120px] px-4 py-3 group/ai hover:border-primary/50",
											"justify-center items-center text-center",
											"transition-all duration-200 group-hover:translate-y-[-2px]"
										)}
										onClick={() => setShowActivityLogger(true)}
									>
										<div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
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

				{/* Today's Overview Card */}
				<Card className="border-primary/10">
					<CardHeader>
						<div className="flex items-center justify-between">
							<div>
								<CardTitle>Today&apos;s Overview</CardTitle>
								<CardDescription>Your wellness metrics for {format(new Date(), "MMMM d, yyyy")}</CardDescription>
							</div>
							<Button
								variant="link"
								size="icon"
								onClick={fetchDailyStats}
								className="h-8 w-8 cursor-pointer transition-all duration-300 ease-in-out hover:scale-[1.02]"
							>
								<RefreshCw className={cn("h-4 w-4")} />
							</Button>
						</div>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-2 gap-3">
							{wellnessStats.map((stat) => (
								<div
									key={stat.title}
									className={cn("p-4 rounded-lg transition-all duration-200 hover:scale-[1.02]", stat.bgColor)}
								>
									<div className="flex items-center gap-2">
										<stat.icon className={cn("w-5 h-5", stat.color)} />
										<p className="text-sm font-medium">{stat.title}</p>
									</div>
									<p className="text-2xl font-bold mt-2">{stat.value}</p>
									<p className="text-sm text-muted-foreground mt-1">{stat.description}</p>
								</div>
							))}
						</div>
						<div className="mt-4 text-xs text-muted-foreground text-right">
							Last updated: {format(dailyStats.lastUpdated, "h:mm a")}
						</div>
					</CardContent>
				</Card>

				{/* Insights Card */}
				<Card className="border-primary/10">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<BrainCircuit className="w-5 h-5 text-primary" />
							Insights
						</CardTitle>
						<CardDescription>Personalized recommendations based on your activity patterns</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="space-y-4">
							{insights.length > 0 ? (
								insights.map((insight, index) => (
									<div
										key={index}
										className={cn(
											"p-4 rounded-lg space-y-2 transition-all hover:scale-[1.02]",
											insight.priority === "high"
												? "bg-primary/10"
												: insight.priority === "medium"
												? "bg-primary/5"
												: "bg-muted"
										)}
									>
										<div className="flex items-center gap-2">
											<insight.icon className="w-5 h-5 text-primary" />
											<p className="font-medium">{insight.title}</p>
										</div>
										<p className="text-sm text-muted-foreground">{insight.description}</p>
									</div>
								))
							) : (
								<div className="text-center text-muted-foreground py-8">
									<Activity className="w-8 h-8 mx-auto mb-3 opacity-50" />
									<p>Complete more activities to receive personalized insights</p>
								</div>
							)}
						</div>
					</CardContent>
				</Card>
				{showActivityLogger && (
					<ActivityLogger open={showActivityLogger} onOpenChange={setShowActivityLogger} onActivityLogged={() => {}} />
				)}
			</div>
		</div>
	);
};

export default DashboardMainContent;
