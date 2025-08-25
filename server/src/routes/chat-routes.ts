import express from "express";
import { createChatSession, getChatHistory, getChatSession, sendMessage } from "../controllers/chat-controller";

const router = express.Router();

// Create a new chat session
router.post("/sessions", createChatSession);

// Get a specific chat session
router.get("/sessions/:sessionId", getChatSession);

// Send a message in a chat session
router.post("/sessions/:sessionId/messages", sendMessage);

// Get chat history for a session
router.get("/sessions/:sessionId/history", getChatHistory);

export default router;
