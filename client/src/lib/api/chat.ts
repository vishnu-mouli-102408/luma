/* eslint-disable @typescript-eslint/no-explicit-any */
export interface ChatMessage {
	role: "user" | "assistant";
	content: string;
	timestamp: Date;
	metadata?: {
		technique?: string;
		goal?: string;
		progress?: string[];
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
	startTime: Date;
	status: string;
}

const API_BASE_URL = "http://localhost:8080";

export const chatAPI = {
	// Create a new chat session
	createSession: async (): Promise<{ sessionId: string; status: string; startTime: Date }> => {
		const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error("Failed to create chat session");
		}

		return response.json();
	},

	// Get all chat sessions for the user
	getAllSessions: async (): Promise<ChatSession[]> => {
		const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error("Failed to fetch chat sessions");
		}

		const sessions = await response.json();
		return sessions.map((session: any) => ({
			...session,
			createdAt: new Date(session.createdAt),
			updatedAt: new Date(session.updatedAt),
			startTime: new Date(session.startTime),
			messages: session.messages.map((msg: any) => ({
				...msg,
				timestamp: new Date(msg.timestamp),
			})),
		}));
	},

	// Get a specific chat session
	getSession: async (sessionId: string): Promise<ChatSession> => {
		const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error("Failed to fetch chat session");
		}

		const session = await response.json();
		return {
			...session,
			createdAt: new Date(session.createdAt),
			updatedAt: new Date(session.updatedAt),
			startTime: new Date(session.startTime),
			messages: session.messages.map((msg: any) => ({
				...msg,
				timestamp: new Date(msg.timestamp),
			})),
		};
	},

	// Send a message
	sendMessage: async (
		sessionId: string,
		message: string
	): Promise<{ response: string; analysis: any; metadata: any }> => {
		const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}/messages`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
			body: JSON.stringify({ message }),
		});

		if (!response.ok) {
			throw new Error("Failed to send message");
		}

		return response.json();
	},

	// Get chat history for a session
	getChatHistory: async (sessionId: string): Promise<ChatMessage[]> => {
		const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}/history`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error("Failed to fetch chat history");
		}

		const messages = await response.json();
		return messages.map((msg: any) => ({
			...msg,
			timestamp: new Date(msg.timestamp),
		}));
	},

	// Delete a chat session
	deleteSession: async (sessionId: string): Promise<{ message: string }> => {
		const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}`, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
			},
			credentials: "include",
		});

		if (!response.ok) {
			throw new Error("Failed to delete chat session");
		}

		return response.json();
	},
};
