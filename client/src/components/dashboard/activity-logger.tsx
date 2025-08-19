"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogOverlay,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";

const activityTypes = [
	{ id: "meditation", name: "Meditation" },
	{ id: "exercise", name: "Exercise" },
	{ id: "walking", name: "Walking" },
	{ id: "reading", name: "Reading" },
	{ id: "journaling", name: "Journaling" },
	{ id: "therapy", name: "Therapy Session" },
];

const ACTIVITY_TYPE_IDS = ["meditation", "exercise", "walking", "reading", "journaling", "therapy"] as const;

const activityFormSchema = z.object({
	type: z.enum(ACTIVITY_TYPE_IDS),
	name: z.string().min(1, "Name is required"),
	duration: z
		.number()
		.int("Duration must be a whole number")
		.positive("Duration must be greater than 0")
		.max(10000, "Duration seems too large"),
	description: z.string().max(200, "Description too long").optional().or(z.literal("")),
});

type ActivityFormValues = z.infer<typeof activityFormSchema>;

interface ActivityLoggerProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onActivityLogged: () => void;
}

export function ActivityLogger({ open, onOpenChange, onActivityLogged }: ActivityLoggerProps) {
	const [isLoading, setIsLoading] = useState(false);
	const { data, isPending } = authClient.useSession();
	const user = data?.user;

	const form = useForm<ActivityFormValues>({
		resolver: zodResolver(activityFormSchema),
		defaultValues: {
			name: "",
			type: undefined as unknown as ActivityFormValues["type"],
			duration: undefined as unknown as number,
			description: "",
		},
		mode: "onChange",
	});

	const onSubmit = async (values: ActivityFormValues) => {
		console.log("Values", values);

		if (!user) {
			toast.error("Oops! Something went wrong.", {
				description: "You need to be logged in to track your activity. Please log in to continue.",
			});
			return;
		}

		setIsLoading(true);
		try {
			// TODO: send values to API if needed
			onActivityLogged();
			onOpenChange(false);
			form.reset();
		} catch (error) {
			console.error("Error logging activity:", error);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogOverlay className="bg-black/40 supports-[backdrop-filter]:bg-black/30 backdrop-blur-sm" />
			<DialogContent className="rounded-xl border border-border bg-card/95 supports-[backdrop-filter]:bg-card/75 backdrop-blur shadow-lg">
				<DialogHeader>
					<DialogTitle className="tracking-tight">Log Activity</DialogTitle>
					<DialogDescription>Record your wellness activity</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
						<FormField
							control={form.control}
							name="type"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>Activity Type</FormLabel>
									<Select onValueChange={field.onChange} value={field.value}>
										<FormControl>
											<SelectTrigger className="w-full cursor-pointer">
												<SelectValue placeholder="Select activity type" />
											</SelectTrigger>
										</FormControl>
										<SelectContent>
											{activityTypes.map((t) => (
												<SelectItem className="cursor-pointer" key={t.id} value={t.id}>
													{t.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input placeholder="Morning Meditation, Evening Walk, etc." {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="duration"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Duration (minutes)</FormLabel>
									<FormControl>
										<Input
											type="number"
											inputMode="numeric"
											placeholder="15"
											value={field.value ?? ""}
											className="[&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
											onChange={(e) => {
												const value = e.target.value;
												const parsed = value === "" ? undefined : Number(value);
												field.onChange(parsed);
											}}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<FormField
							control={form.control}
							name="description"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Description (optional)</FormLabel>
									<FormControl>
										<Input placeholder="How did it go?" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>

						<div className="flex justify-end gap-2">
							<Button type="button" variant="secondary" className="cursor-pointer" onClick={() => onOpenChange(false)}>
								Cancel
							</Button>
							<Button type="submit" className="cursor-pointer" disabled={isLoading || isPending}>
								{isLoading ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : isPending ? (
									"Loading..."
								) : (
									"Save Activity"
								)}
							</Button>
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
}
