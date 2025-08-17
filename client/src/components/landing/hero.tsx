"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Brain, Shield, Sparkles, Waves } from "lucide-react";
import { Slider } from "../ui/slider";
import { Button } from "../ui/button";
import { Cover } from "../ui/cover";
import { AnimatedGradientText } from "../magicui/animated-gradient-text";
import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../ui/dialog";

const welcomeSteps = [
	{
		title: "Welcome to Luma AI ✨",
		description:
			"Your intelligent AI companion designed to understand and support your emotional journey. Let's create a safe space together.",
		icon: Sparkles,
	},
	{
		title: "Smart Emotional Intelligence 🧠",
		description:
			"I use advanced AI to recognize emotional patterns and provide personalized insights, helping you navigate life's challenges with confidence.",
		icon: Brain,
	},
	{
		title: "Complete Privacy & Security 🔒",
		description:
			"Your conversations are encrypted and private. We prioritize your trust with industry-leading security and ethical AI practices.",
		icon: Shield,
	},
];

const emotions = [
	{ value: 0, label: "💙 Down", color: "from-slate-600/50" },
	{ value: 25, label: "🌿 Content", color: "from-emerald-500/50" },
	{ value: 50, label: "🌸 Peaceful", color: "from-indigo-500/50" },
	{ value: 75, label: "☀️ Happy", color: "from-amber-500/50" },
	{ value: 100, label: "🌟 Excited", color: "from-rose-500/50" },
];

const HeroSection = () => {
	const [emotion, setEmotion] = useState(50);
	const [mounted, setMounted] = useState(false);
	const [showDialog, setShowDialog] = useState(false);
	const [currentStep, setCurrentStep] = useState(0);

	useEffect(() => {
		setMounted(true);
	}, []);

	const currentEmotion = emotions.find((em) => Math.abs(emotion - em.value) < 15) || emotions[2];
	return (
		<section className="relative min-h-[90vh] flex flex-col items-center justify-center py-12 px-4">
			{/* Enhanced background elements */}
			<div className="absolute inset-0 -z-10 overflow-hidden">
				<div
					className={`absolute w-[500px] h-[500px] rounded-full blur-3xl top-0 -left-20 transition-all duration-700 ease-in-out bg-gradient-to-r ${currentEmotion.color} to-transparent opacity-60`}
				/>
				<div className="absolute w-[400px] h-[400px] rounded-full bg-secondary/10 blur-3xl bottom-0 right-0 animate-pulse delay-700" />
				<div className="absolute inset-0 bg-background/80 backdrop-blur-3xl" />
			</div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
				transition={{ duration: 1, ease: "easeOut" }}
				className="relative space-y-8 text-center"
			>
				{/* Enhanced badge with subtle animation */}
				<div className="group relative mx-auto inline-flex items-center justify-center rounded-full px-4 py-1.5 shadow-[inset_0_-8px_10px_#8fdfff1f] transition-shadow duration-500 ease-out hover:shadow-[inset_0_-5px_10px_#8fdfff3f] ">
					<span
						className={cn(
							"absolute inset-0 block h-full w-full animate-gradient rounded-[inherit] bg-gradient-to-r from-[#ffaa40]/50 via-[#9c40ff]/50 to-[#ffaa40]/50 bg-[length:300%_100%] p-[1px]"
						)}
						style={{
							WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
							WebkitMaskComposite: "destination-out",
							mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
							maskComposite: "subtract",
							WebkitClipPath: "padding-box",
						}}
					/>
					<Waves className="w-4 h-4 animate-wave text-primary" />
					<hr className="mx-2 h-4 w-px shrink-0 bg-neutral-500" />
					<AnimatedGradientText className="text-sm font-medium">
						Your AI Agent Mental Health Companion
					</AnimatedGradientText>
				</div>

				{/* Enhanced main heading with smoother gradient */}
				<h1 className="text-4xl md:text-6xl lg:text-7xl font-bold font-plus-jakarta tracking-tight">
					<span className="inline-block bg-gradient-to-r from-primary via-primary/90 to-secondary bg-clip-text text-transparent [text-shadow:_0_1px_0_rgb(0_0_0_/_50%)] hover:to-primary transition-all ease-in-out duration-300">
						Peace of Mind,
					</span>
					<br />
					<span className="inline-block mt-2 bg-gradient-to-b from-foreground to-foreground/90 bg-clip-text text-transparent">
						<Cover>Anytime.</Cover>
					</span>
				</h1>

				{/* Enhanced description with better readability */}
				<p className="max-w-[600px] mx-auto text-base md:text-md text-muted-foreground leading-relaxed tracking-wide">
					Discover a new approach to emotional well-being. Our AI companion is always here to listen, understand, and
					gently guide you through life&apos;s ups and downs.
				</p>

				{/* Emotion slider section with enhanced transitions */}
				<motion.div
					className="w-full max-w-[600px] mx-auto space-y-6 py-8"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
					transition={{ delay: 0.3, duration: 0.8 }}
				>
					<div className="space-y-4 text-center">
						<p className="text-sm text-muted-foreground font-medium">
							Whatever you&apos;re feeling, we&apos;re here to listen
						</p>
						<div className="flex justify-between items-center px-2">
							{emotions.map((em) => (
								<div
									key={em.value}
									className={`transition-all duration-500 ease-out cursor-pointer hover:scale-105 ${
										Math.abs(emotion - em.value) < 15 ? "opacity-100 scale-110 transform-gpu" : "opacity-50 scale-100"
									}`}
									onClick={() => setEmotion(em.value)}
								>
									<div className="text-2xl transform-gpu">{em.label.split(" ")[0]}</div>
									<div className="text-xs text-muted-foreground mt-1 font-medium">{em.label.split(" ")[1]}</div>
								</div>
							))}
						</div>
					</div>

					{/* Enhanced slider with dynamic gradient */}
					<div className="relative px-2">
						<div
							className={`absolute inset-0 bg-gradient-to-r ${currentEmotion.color} to-transparent blur-2xl -z-10 transition-all duration-500`}
						/>
						<Slider
							value={[emotion]}
							onValueChange={(value) => setEmotion(value[0])}
							min={0}
							max={100}
							step={1}
							className="py-4"
						/>
					</div>

					<div className="text-center">
						<p className="text-sm text-muted-foreground animate-pulse">
							Slide to express how you&apos;re feeling today
						</p>
					</div>
				</motion.div>

				{/* Enhanced CTA button and welcome dialog */}
				<motion.div
					className="flex flex-col cursor-pointer sm:flex-row gap-4 justify-center items-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : 20 }}
					transition={{ delay: 0.2, duration: 0.8 }}
				>
					<Button
						size="lg"
						onClick={() => setShowDialog(true)}
						className="relative cursor-pointer group h-12 px-8 rounded-full bg-gradient-to-r from-primary via-primary/90 to-secondary shadow-lg shadow-primary/20 transition-all ease-in-out duration-700 hover:shadow-xl hover:shadow-primary/30 overflow-hidden"
					>
						{/* Background gradient overlay for smooth transition */}
						<div className="absolute inset-0 rounded-full bg-gradient-to-r from-primary via-primary/95 to-primary opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out" />

						<span className="relative z-10 font-medium flex items-center gap-2">
							Begin Your Journey
							<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
						</span>

						{/* Shimmer effect */}
						<div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-out transform translate-x-[-100%] group-hover:translate-x-[100%]" />
					</Button>
				</motion.div>
			</motion.div>

			<Dialog open={showDialog} onOpenChange={setShowDialog}>
				<DialogContent className="sm:max-w-[425px] bg-card/80 backdrop-blur-lg">
					<DialogHeader>
						<motion.div
							key={currentStep}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -20 }}
							transition={{ duration: 0.3 }}
							className="space-y-4"
						>
							<div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
								{welcomeSteps[currentStep] && (
									<div>
										{React.createElement(welcomeSteps[currentStep].icon, {
											className: "w-8 h-8 text-primary",
										})}
									</div>
								)}
							</div>
							<DialogTitle className="text-2xl text-center">{welcomeSteps[currentStep]?.title}</DialogTitle>
							<DialogDescription className="text-center text-base leading-relaxed">
								{welcomeSteps[currentStep]?.description}
							</DialogDescription>
						</motion.div>
					</DialogHeader>
					<div className="flex justify-between items-center mt-8">
						<div className="flex gap-2">
							{welcomeSteps.map((_, index) => (
								<div
									key={index}
									className={`w-2 h-2 rounded-full transition-all duration-300 ${
										index === currentStep ? "bg-primary w-4" : "bg-primary/20"
									}`}
								/>
							))}
						</div>
						<Button
							onClick={() => {
								if (currentStep < welcomeSteps.length - 1) {
									setCurrentStep((c) => c + 1);
								} else {
									setShowDialog(false);
									setCurrentStep(0);
									// Here you would navigate to the chat interface
								}
							}}
							className="relative cursor-pointer group px-6"
						>
							<span className="flex items-center gap-2">
								{currentStep === welcomeSteps.length - 1 ? (
									<>
										Let&apos;s Begin
										<Sparkles className="w-4 h-4 animate-pulse" />
									</>
								) : (
									<>
										Next
										<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
									</>
								)}
							</span>
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</section>
	);
};

export default HeroSection;
