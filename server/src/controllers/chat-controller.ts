import type { Request, Response } from "express";
import { logger } from "../lib/logger";
import { prisma } from "../lib/db";
import type { InngestEvent } from "../types/inngest";
import { inngest } from "../inngest/client";
import { genAI } from "../lib/ai";

// Create a new chat session
export const createChatSession = async (req: Request, res: Response) => {
	try {
		// Check if user is authenticated
		if (!req.user || !req.user.id) {
			return res.status(401).json({ message: "Unauthorized - User not authenticated" });
		}

		const userId = req.user.id;
		const user = await prisma.user.findUnique({
			where: { id: userId },
		});

		if (!user) {
			return res.status(404).json({ message: "User not found" });
		}

		// Generate a unique sessionId
		const sessionId = Bun.randomUUIDv7();

		const session = await prisma.chatSession.create({
			data: {
				sessionId,
				userId,
				startTime: new Date(),
				status: "active",
			},
		});

		res.status(201).json({
			message: "Chat session created successfully",
			sessionId: session.sessionId,
			status: session.status,
			startTime: session.startTime,
		});
	} catch (error) {
		logger.error(error, "Error creating chat session");
		res.status(500).json({
			message: "Error creating chat session",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

// Send a message in the chat session
export const sendMessage = async (req: Request, res: Response) => {
	try {
		const { sessionId } = req.params;
		const { message } = req.body;
		const userId = req?.user?.id;

		logger.info({ sessionId, message }, "Processing message");

		if (!userId) {
			return res.status(401).json({ message: "Unauthorized - User not authenticated" });
		}

		// Find session by sessionId, create if doesn't exist
		let session = await prisma.chatSession.findUnique({
			where: {
				sessionId,
			},
			include: {
				messages: true,
			},
		});

		// If session doesn't exist, create it (this handles client-side generated session IDs)
		if (!session) {
			logger.info({ sessionId }, "Session not found, creating new session");
			const newSession = await prisma.chatSession.create({
				data: {
					sessionId: sessionId || Bun.randomUUIDv7(),
					userId: userId!,
					startTime: new Date(),
					status: "active",
				},
			});

			// Fetch the created session with messages included
			session = await prisma.chatSession.findUnique({
				where: {
					id: newSession.id,
				},
				include: {
					messages: true,
				},
			});
		}

		if (!session) {
			logger.error({ sessionId }, "Failed to create or find session");
			return res.status(500).json({ message: "Internal server error" });
		}

		if (session.userId !== userId) {
			logger.warn({ sessionId, userId }, "Unauthorized access attempt");
			return res.status(403).json({ message: "Unauthorized" });
		}

		// Create Inngest event for message processing
		const event: InngestEvent = {
			name: "therapy/session.message",
			data: {
				message,
				history: session.messages,
				memory: {
					userProfile: {
						emotionalState: [],
						riskLevel: 0,
						preferences: {},
					},
					sessionContext: {
						conversationThemes: [],
						currentTechnique: null,
					},
				},
				goals: [],
				systemPrompt: `You are an AI therapist assistant. Your role is to:
		  1. Provide empathetic and supportive responses
		  2. Use evidence-based therapeutic techniques
		  3. Maintain professional boundaries
		  4. Monitor for risk factors
		  5. Guide users toward their therapeutic goals`,
			},
		};

		logger.info({ event }, "Sending message to Inngest");

		// Send event to Inngest for logging and analytics
		await inngest.send(event);

		// Process the message directly using Gemini
		const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

		// Analyze the message
		const analysisPrompt = `Analyze this therapy message and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
	  Message: ${message}
	  Context: ${JSON.stringify({
			memory: event.data.memory,
			goals: event.data.goals,
		})}
	  
	  Required JSON structure:
	  {
		"emotionalState": "string",
		"themes": ["string"],
		"riskLevel": number,
		"recommendedApproach": "string",
		"progressIndicators": ["string"]
	  }`;

		const analysisResult = await model.generateContent(analysisPrompt);
		const analysisText = analysisResult.response.text().trim();
		const cleanAnalysisText = analysisText.replace(/```json\n|\n```/g, "").trim();
		const analysis = JSON.parse(cleanAnalysisText);

		logger.info({ analysis }, "Message analysis");

		// Generate therapeutic response
		const responsePrompt = `${event.data.systemPrompt}
	  
	  Based on the following context, generate a therapeutic response:
	  Message: ${message}
	  Analysis: ${JSON.stringify(analysis)}
	  Memory: ${JSON.stringify(event.data.memory)}
	  Goals: ${JSON.stringify(event.data.goals)}
	  
	  Provide a response that:
	  1. Addresses the immediate emotional needs
	  2. Uses appropriate therapeutic techniques
	  3. Shows empathy and understanding
	  4. Maintains professional boundaries
	  5. Considers safety and well-being`;

		const responseResult = await model.generateContent(responsePrompt);
		const response = responseResult.response.text().trim();

		logger.info({ response }, "Generated response");

		// Add message to session history
		await prisma.chatMessage.create({
			data: {
				sessionId: session.id,
				role: "user",
				content: message,
				timestamp: new Date(),
			},
		});

		await prisma.chatMessage.create({
			data: {
				sessionId: session.id,
				role: "assistant",
				content: response,
				metadata: JSON.stringify({
					analysis,
					progress: {
						emotionalState: analysis.emotionalState,
						riskLevel: analysis.riskLevel,
					},
				}),
				timestamp: new Date(),
			},
		});

		// Save the updated session
		logger.info({ sessionId }, "Session updated successfully");

		// Return the response
		res.json({
			response,
			message: response,
			analysis,
			metadata: {
				progress: {
					emotionalState: analysis.emotionalState,
					riskLevel: analysis.riskLevel,
				},
			},
		});
	} catch (error) {
		logger.error(error, "Error in sendMessage");
		res.status(500).json({
			message: "Error processing message",
			error: error instanceof Error ? error.message : "Unknown error",
		});
	}
};

export const getChatSession = async (req: Request, res: Response) => {
	try {
		const { sessionId } = req.params;
		logger.info(`Getting chat session: ${sessionId}`);
		const chatSession = await prisma.chatSession?.findUnique({
			where: {
				sessionId,
			},
			include: {
				messages: true,
			},
		});
		if (!chatSession) {
			logger.warn(`Chat session not found: ${sessionId}`);
			return res.status(404).json({ error: "Chat session not found" });
		}
		logger.info(`Found chat session: ${sessionId}`);
		res.json(chatSession);
	} catch (error) {
		logger.error(error, "Failed to get chat session");
		res.status(500).json({ error: "Failed to get chat session" });
	}
};

export const getChatHistory = async (req: Request, res: Response) => {
	try {
		const { sessionId } = req.params;
		const userId = req.user?.id;

		// Find session by sessionId instead of _id
		const session = await prisma.chatSession?.findUnique({
			where: {
				sessionId,
			},
			include: {
				messages: true,
			},
		});
		if (!session) {
			return res.status(404).json({ message: "Session not found" });
		}

		if (session.userId !== userId) {
			return res.status(403).json({ message: "Unauthorized" });
		}

		res.json(session.messages);
	} catch (error) {
		logger.error(error, "Error fetching chat history");
		res.status(500).json({ message: "Error fetching chat history" });
	}
};

// Get all chat sessions for a user
export const getAllChatSessions = async (req: Request, res: Response) => {
	try {
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		const sessions = await prisma.chatSession.findMany({
			where: {
				userId,
			},
			include: {
				messages: {
					orderBy: {
						timestamp: "asc",
					},
				},
			},
			orderBy: {
				updatedAt: "desc",
			},
		});

		res.json(sessions);
	} catch (error) {
		logger.error(error, "Error fetching chat sessions");
		res.status(500).json({ message: "Error fetching chat sessions" });
	}
};

// Delete a chat session
export const deleteChatSession = async (req: Request, res: Response) => {
	try {
		const { sessionId } = req.params;
		const userId = req.user?.id;

		if (!userId) {
			return res.status(401).json({ message: "Unauthorized" });
		}

		// First check if the session exists and belongs to the user
		const session = await prisma.chatSession.findUnique({
			where: {
				sessionId,
			},
		});

		if (!session) {
			return res.status(404).json({ message: "Chat session not found" });
		}

		if (session.userId !== userId) {
			return res.status(403).json({ message: "Unauthorized to delete this session" });
		}

		// Delete the session (messages will be cascade deleted due to foreign key constraint)
		await prisma.chatSession.delete({
			where: {
				sessionId,
			},
		});

		logger.info({ sessionId, userId }, "Chat session deleted successfully");
		res.json({ message: "Chat session deleted successfully" });
	} catch (error) {
		logger.error(error, "Error deleting chat session");
		res.status(500).json({ message: "Error deleting chat session" });
	}
};
