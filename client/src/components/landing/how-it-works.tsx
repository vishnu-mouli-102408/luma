import React from "react";
import * as motion from "motion/react-client";
import { Card, CardContent, CardHeader } from "../ui/card";
import { HeartPulse, Lightbulb, Lock, MessageSquareHeart } from "lucide-react";

const features = [
	{
		icon: HeartPulse,
		title: "24/7 Support",
		description: "Always here to listen and support you, any time of day",
		color: "from-rose-500/20",
		delay: 0.2,
	},
	{
		icon: Lightbulb,
		title: "Smart Insights",
		description: "Personalized guidance powered by emotional intelligence",
		color: "from-amber-500/20",
		delay: 0.4,
	},
	{
		icon: Lock,
		title: "Private & Secure",
		description: "Your conversations are always confidential and encrypted",
		color: "from-emerald-500/20",
		delay: 0.6,
	},
	{
		icon: MessageSquareHeart,
		title: "Evidence-Based",
		description: "Therapeutic techniques backed by clinical research",
		color: "from-blue-500/20",
		delay: 0.8,
	},
];

const HowItWorks = () => {
	return (
		<section id="how-it-works" className="relative py-20 px-4 overflow-hidden">
			<div className="max-w-6xl mx-auto">
				<motion.div className="text-center mb-16 space-y-4 text-white ">
					<h2 className="text-3xl font-bold bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent dark:text-primary/90">
						How Luma AI Helps You
					</h2>
					<p className="text-foreground dark:text-foreground/95 max-w-2xl mx-auto font-medium text-lg">
						Discover compassionate AI that truly understands your emotions and provides personalized guidance.
					</p>
				</motion.div>

				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative">
					{features.map((feature, index) => (
						<motion.div
							key={index}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: feature.delay, duration: 0.5 }}
							viewport={{ once: true }}
						>
							<Card className="group relative overflow-hidden border border-primary/10 hover:border-primary/20 transition-all duration-300 h-[200px] bg-card/30 dark:bg-card/80 backdrop-blur-sm">
								<div
									className={`absolute inset-0 bg-gradient-to-br ${feature.color} to-transparent opacity-0 group-hover:opacity-20 transition-opacity duration-500 dark:group-hover:opacity-30`}
								/>
								<CardHeader className="pb-4">
									<div className="flex items-center gap-3">
										<div className="p-2 rounded-xl bg-primary/10 dark:bg-primary/20 group-hover:bg-primary/20 dark:group-hover:bg-primary/30 transition-colors duration-300">
											<feature.icon className="w-5 h-5 text-primary dark:text-primary/90" />
										</div>
										<h3 className="font-semibold tracking-tight text-foreground/90 dark:text-foreground">
											{feature.title}
										</h3>
									</div>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground/90 dark:text-muted-foreground leading-relaxed">
										{feature.description}
									</p>
								</CardContent>
								<div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/20 dark:via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							</Card>
						</motion.div>
					))}
				</div>
			</div>
		</section>
	);
};

export default HowItWorks;
