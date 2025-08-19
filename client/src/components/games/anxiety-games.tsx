"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Gamepad2, Flower2, Wind, TreePine, Waves, Music2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { BreathingGame } from "./breathing-game";
import { ZenGarden } from "./zen-garden";
import { ForestGame } from "./forest-game";
import { OceanWaves } from "./ocean-waves";

const games = [
	{
		id: "breathing",
		title: "Breathing Patterns",
		description: "Follow calming breathing exercises with visual guidance",
		icon: Wind,
		color: "text-blue-500",
		bgColor: "bg-blue-500/10",
		duration: "5 mins",
	},
	{
		id: "garden",
		title: "Zen Garden",
		description: "Create and maintain your digital peaceful space",
		icon: Flower2,
		color: "text-rose-500",
		bgColor: "bg-rose-500/10",
		duration: "10 mins",
	},
	{
		id: "forest",
		title: "Mindful Forest",
		description: "Take a peaceful walk through a virtual forest",
		icon: TreePine,
		color: "text-green-500",
		bgColor: "bg-green-500/10",
		duration: "15 mins",
	},
	{
		id: "waves",
		title: "Ocean Waves",
		description: "Match your breath with gentle ocean waves",
		icon: Waves,
		color: "text-cyan-500",
		bgColor: "bg-cyan-500/10",
		duration: "8 mins",
	},
];

interface AnxietyGamesProps {
	onGamePlayed?: (gameName: string, description: string) => Promise<void>;
}

export const AnxietyGames = ({ onGamePlayed }: AnxietyGamesProps) => {
	const [selectedGame, setSelectedGame] = useState<string | null>(null);
	const [showGame, setShowGame] = useState(false);

	const handleGameStart = async (gameId: string) => {
		setSelectedGame(gameId);
		setShowGame(true);

		// Log the activity
		if (onGamePlayed) {
			try {
				await onGamePlayed(gameId, games.find((g) => g.id === gameId)?.description || "");
			} catch (error) {
				console.error("Error logging game activity:", error);
			}
		}
	};

	const renderGame = () => {
		switch (selectedGame) {
			case "breathing":
				return <BreathingGame />;
			case "garden":
				return <ZenGarden />;
			case "forest":
				return <ForestGame />;
			case "waves":
				return <OceanWaves />;
			default:
				return null;
		}
	};

	return (
		<>
			<Card className="border border-border bg-sidebar/80 supports-[backdrop-filter]:bg-sidebar/60 backdrop-blur rounded-xl shadow-sm">
				<CardHeader>
					<CardTitle className="text-xl font-semibold flex items-center gap-2">
						<Gamepad2 className="h-5 w-5 text-primary" />
						<span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">
							Anxiety Relief Activities
						</span>
					</CardTitle>
					<CardDescription>Interactive exercises to help reduce stress and anxiety</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						{games.map((game) => (
							<motion.div key={game.id} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.995 }}>
								<Card
									aria-label={`Open ${game.title}`}
									className={`group rounded-xl border border-border hover:bg-primary/5 transition-colors cursor-pointer shadow-sm hover:shadow-md ${
										selectedGame === game.id ? "ring-2 ring-primary/70" : ""
									}`}
									onClick={() => handleGameStart(game.id)}
								>
									<CardContent className="p-4">
										<div className="flex items-start gap-4">
											<div className={`p-3 rounded-xl ${game.bgColor} ${game.color} ring-1 ring-border shadow-sm`}>
												<game.icon className="h-6 w-6" />
											</div>
											<div className="flex-1">
												<h4 className="font-semibold tracking-tight">{game.title}</h4>
												<p className="text-sm text-muted-foreground mt-1 leading-relaxed">{game.description}</p>
												<div className="flex items-center gap-2 mt-3 text-muted-foreground">
													<Music2 className="h-4 w-4" />
													<span className="text-sm">{game.duration}</span>
												</div>
											</div>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</div>
				</CardContent>
			</Card>

			<Dialog open={showGame} onOpenChange={setShowGame}>
				<DialogOverlay className="bg-background/80 supports-[backdrop-filter]:bg-background/60 backdrop-blur-sm" />
				<DialogContent className="sm:max-w-[600px] rounded-xl border border-border shadow-lg bg-card/95 supports-[backdrop-filter]:bg-card/75 backdrop-blur">
					<DialogHeader>
						<DialogTitle className="text-lg font-semibold tracking-tight">
							{games.find((g) => g.id === selectedGame)?.title}
						</DialogTitle>
					</DialogHeader>
					{renderGame()}
				</DialogContent>
			</Dialog>
		</>
	);
};
