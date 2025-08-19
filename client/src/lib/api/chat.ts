export interface ChatMessage {
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	metadata?: {
		technique: string;
		goal: string;
		progress: string[];
		analysis?: {
			emotionalState: string;
			themes: string[];
			riskLevel: number;
			recommendedApproach: string;
			progressIndicators: string[];
		};
	};
}

export interface ChatSession {
	sessionId: string;
	messages: ChatMessage[];
	createdAt: Date;
	updatedAt: Date;
}
