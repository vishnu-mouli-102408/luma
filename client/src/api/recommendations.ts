export interface ActivityRecommendation {
	id: string;
	activityType: string;
	title: string;
	description: string;
	reasoning: string;
	expectedBenefits: string[];
	difficultyLevel: "easy" | "medium" | "hard";
	estimatedDuration: number | null;
	basedOnMoodScore: number | null;
	isCompleted: boolean;
	completedAt: Date | null;
	createdAt: Date;
}

export interface RecommendationStats {
	totalRecommendations: number;
	completedRecommendations: number;
	recentRecommendations: number;
	completionRate: number;
	activityTypeBreakdown: Array<{ type: string; count: number }>;
}

export async function fetchActiveRecommendations(): Promise<ActivityRecommendation[]> {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/active`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch recommendations: ${response.statusText}`);
	}

	const data = await response.json();
	if (!data.success) {
		throw new Error(data.error || "Failed to fetch recommendations");
	}

	return data.data || [];
}

export async function fetchRecommendationStats(): Promise<RecommendationStats> {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/stats`, {
		method: "GET",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (!response.ok) {
		throw new Error(`Failed to fetch stats: ${response.statusText}`);
	}

	const data = await response.json();
	if (!data.success) {
		throw new Error(data.error || "Failed to fetch stats");
	}

	return data.data;
}

export async function generateRecommendations(options: {
	moodScore?: number;
	forceRegenerate?: boolean;
}): Promise<ActivityRecommendation[] | null> {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/generate`, {
		method: "POST",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(options),
	});

	if (!response.ok) {
		throw new Error(`Failed to generate recommendations: ${response.statusText}`);
	}

	const data = await response.json();
	if (!data.success) {
		throw new Error(data.error || "Failed to generate recommendations");
	}

	return Array.isArray(data.data) ? data.data : null;
}

export async function markRecommendationCompleted(recommendationId: string): Promise<ActivityRecommendation> {
	const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommendations/complete`, {
		method: "PATCH",
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			recommendationId,
		}),
	});

	if (!response.ok) {
		throw new Error(`Failed to mark as completed: ${response.statusText}`);
	}

	const data = await response.json();
	if (!data.success) {
		throw new Error(data.error || "Failed to mark as completed");
	}

	return data.data;
}
