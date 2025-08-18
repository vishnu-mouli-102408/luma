"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Sparkles, MessageSquare, ArrowRight, Heart, BrainCircuit, Loader2, Activity } from "lucide-react";
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

const DashboardMainContent = () => {
	const [showMoodModal, setShowMoodModal] = useState(false);
	const handleStartTherapy = () => {
		toast.success("Therapy started");
	};

	const handleAICheckIn = () => {
		toast.success("AI check-in started");
	};

	const fetchDailyStats = () => {
		toast.success("Daily stats fetched");
	};
	return (
		<div className="space-y-6">
			{/* Top Cards Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
				{/* Quick Actions Card */}
				<Card className="border-primary/10 relative overflow-hidden group">
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

							<div className="grid gap-3">
								<Button
									variant="default"
									className={cn(
										"w-full justify-between items-center p-6 h-auto group/button",
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

								<div className="grid grid-cols-2 gap-3">
									<Dialog open={showMoodModal} onOpenChange={setShowMoodModal}>
										<DialogTrigger asChild>
											<Button
												variant="outline"
												className={cn(
													"flex flex-col h-[120px] px-4 py-3 group/mood hover:border-primary/50",
													"justify-center items-center text-center",
													"transition-all duration-200 group-hover:translate-y-[-2px]"
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
											"flex flex-col h-[120px] px-4 py-3 group/ai hover:border-primary/50",
											"justify-center items-center text-center",
											"transition-all duration-200 group-hover:translate-y-[-2px]"
										)}
										onClick={handleAICheckIn}
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
			</div>
		</div>
	);
};

export default DashboardMainContent;
