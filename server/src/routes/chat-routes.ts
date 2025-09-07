import express from "express";
import {
	createChatSession,
	getChatHistory,
	getChatSession,
	sendMessage,
	getAllChatSessions,
	deleteChatSession,
} from "../controllers/chat-controller";

const router = express.Router();

// Get all chat sessions for a user
router.get("/sessions", getAllChatSessions);

// Create a new chat session
router.post("/sessions", createChatSession);

// Get a specific chat session
router.get("/sessions/:sessionId", getChatSession);

// Delete a chat session
router.delete("/sessions/:sessionId", deleteChatSession);

// Send a message in a chat session
router.post("/sessions/:sessionId/messages", sendMessage);

// Get chat history for a session
router.get("/sessions/:sessionId/history", getChatHistory);

export default router;
