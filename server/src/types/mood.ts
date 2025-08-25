import { z } from "zod";

export const moodSchema = z.object({
	score: z.number(),
	note: z.string().optional(),
	timestamp: z.date(),
});

export type Mood = z.infer<typeof moodSchema>;
