import { z } from "better-auth";

export const activitySchema = z.object({
	type: z.enum(["meditation", "exercise", "walking", "reading", "journaling", "therapy"]),
	name: z.string(),
	description: z.string().optional(),
	duration: z.number().optional(),
	timestamp: z.date(),
});

export type Activity = z.infer<typeof activitySchema>;
