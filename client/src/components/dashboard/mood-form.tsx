"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

interface MoodFormProps {
	onSuccess?: () => void;
}

export function MoodForm({ onSuccess }: MoodFormProps) {
	const [moodScore, setMoodScore] = useState(50);
	const [isLoading, setIsLoading] = useState(false);
	const { data: user, isPending } = authClient.useSession();
	const router = useRouter();

	const emotions = [
		{ value: 0, label: "😭", description: "Very Low" },
		{ value: 25, label: "😞", description: "Low" },
		{ value: 50, label: "😐", description: "Neutral" },
		{ value: 75, label: "😄", description: "Good" },
		{ value: 100, label: "🥳", description: "Great" },
	];

	const currentEmotion = emotions.find((em) => Math.abs(moodScore - em.value) < 15) || emotions[2];

	const handleSubmit = async () => {
		console.log("MoodForm: Starting submission");

		if (!user) {
			console.log("MoodForm: User not authenticated");
			toast.error("Oops! Something went wrong.", {
				description: "You need to be logged in to track your mood. Please log in to continue.",
			});
			router.push("/sign-in");
			return;
		}

		try {
			setIsLoading(true);
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/mood/create-mood`, {
				method: "POST",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ score: moodScore, timestamp: new Date().toISOString() }),
			});

			console.log("MoodForm: Response status:", response);

			if (!response.ok) {
				const error = await response.json();
				console.error("MoodForm: Error response:", error);
				throw new Error(error.error || "Failed to track mood");
			}

			const data = await response.json();
			console.log("MoodForm: Success response:", data);

			toast.success("Mood tracked successfully!");

			// Call onSuccess to close the modal
			onSuccess?.();
		} catch (error) {
			console.error("MoodForm: Error:", error);
			toast.error(error instanceof Error ? error.message : "Failed to track mood");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6 py-4">
			{/* Emotion display */}
			<div className="text-center space-y-2">
				<div className="text-4xl">{currentEmotion.label}</div>
				<div className="text-sm text-muted-foreground">{currentEmotion.description}</div>
			</div>

			{/* Emotion slider */}
			<div className="space-y-4">
				<div className="flex justify-between px-2">
					{emotions.map((em) => (
						<div
							key={em.value}
							className={`cursor-pointer transition-opacity ${
								Math.abs(moodScore - em.value) < 15 ? "opacity-100" : "opacity-50"
							}`}
							onClick={() => setMoodScore(em.value)}
						>
							<div className="text-2xl">{em.label}</div>
						</div>
					))}
				</div>

				<Slider
					value={[moodScore]}
					onValueChange={(value) => setMoodScore(value[0])}
					min={0}
					max={100}
					step={1}
					className="py-4 cursor-pointer"
				/>
			</div>

			{/* Submit button */}
			<Button className="w-full cursor-pointer" onClick={handleSubmit} disabled={isLoading || isPending}>
				{isLoading ? (
					<>
						<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						Saving...
					</>
				) : isPending ? (
					"Loading..."
				) : (
					"Save Mood"
				)}
			</Button>
		</div>
	);
}
