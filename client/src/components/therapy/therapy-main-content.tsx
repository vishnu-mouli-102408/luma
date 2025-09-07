"use client";
import { ChatMessage, ChatSession, chatAPI } from "@/lib/api/chat";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { Bot, Loader2, MessageSquare, Send, Sparkles, User, ChevronRight, MoreHorizontal, Trash2 } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion, Variants } from "motion/react";
import { Badge } from "../ui/badge";
import ReactMarkdown from "react-markdown";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import { LoaderFive } from "../ui/loader";
import { toast } from "sonner";

interface TherapyMainContentProps {
	sessionId: string;
}

const SUGGESTED_QUESTIONS = [
	{ text: "How can I manage my anxiety better?" },
	{ text: "I've been feeling overwhelmed lately" },
	{ text: "Can we talk about improving sleep?" },
	{ text: "I need help with work-life balance" },
];

const glowAnimation = {
	initial: { opacity: 0.5, scale: 1 },
	animate: {
		opacity: [0.5, 1, 0.5],
		scale: [1, 1.05, 1],
		transition: {
			duration: 3,
			repeat: Infinity,
			ease: "easeInOut",
		},
	},
};

const ChatLoadingSkeleton = () => (
	<div className="space-y-4 p-4">
		{[1, 2, 3].map((i) => (
			<div key={i} className="flex gap-3 items-start">
				<div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
				<div className="flex-1 space-y-2">
					<div className="h-4 bg-muted rounded animate-pulse w-3/4" />
					<div className="h-4 bg-muted rounded animate-pulse w-1/2" />
				</div>
			</div>
		))}
	</div>
);

const SidebarLoadingSkeleton = () => (
	<div className="space-y-3 p-4">
		{[1, 2, 3, 4].map((i) => (
			<div key={i} className="p-3 rounded-lg border animate-pulse">
				<div className="flex items-center gap-2 mb-2">
					<div className="w-4 h-4 bg-muted rounded" />
					<div className="h-4 bg-muted rounded flex-1" />
				</div>
				<div className="h-3 bg-muted rounded w-3/4 mb-1" />
				<div className="h-3 bg-muted rounded w-1/2" />
			</div>
		))}
	</div>
);

const TherapyMainContent = ({ sessionId }: TherapyMainContentProps) => {
	const [message, setMessage] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const [isSending, setIsSending] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [mounted, setMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(true);
	const [sessions, setSessions] = useState<ChatSession[]>([]);
	const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
	const [isLoadingSessions, setIsLoadingSessions] = useState(true);
	const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
	const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

	const scrollToBottom = useCallback(() => {
		if (messagesEndRef.current) {
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		}
	}, []);

	useEffect(() => {
		scrollToBottom();
	}, [messages, scrollToBottom]);

	useEffect(() => {
		setMounted(true);
	}, []);

	const loadSessions = useCallback(async () => {
		try {
			setIsLoadingSessions(true);
			const sessionsData = await chatAPI.getAllSessions();
			setSessions(sessionsData);
		} catch (error) {
			console.error("Error loading sessions:", error);
			toast.error("Failed to load chat sessions");
		} finally {
			setIsLoadingSessions(false);
		}
	}, []);

	const loadCurrentSession = useCallback(async () => {
		try {
			setIsLoading(true);
			const sessionData = await chatAPI.getSession(sessionId);
			setCurrentSession(sessionData);
			setMessages(sessionData.messages);
		} catch {
			// If session doesn't exist in database, it's a new session
			console.log("Session not found in database, treating as new session");
			setCurrentSession({
				sessionId,
				messages: [],
				createdAt: new Date(),
				updatedAt: new Date(),
				startTime: new Date(),
				status: "active",
			});
			setMessages([]);
		} finally {
			setIsLoading(false);
		}
	}, [sessionId]);

	useEffect(() => {
		if (mounted) {
			loadSessions();
			loadCurrentSession();
		}
	}, [mounted, loadSessions, loadCurrentSession]);

	const createNewSession = () => {
		// Generate a temporary UUID for the new session
		const tempSessionId = crypto.randomUUID();

		// Navigate to the new session (will be client-side only until first message)
		router.push(`/therapy/${tempSessionId}`);
	};

	const switchToSession = (sessionId: string) => {
		if (sessionId !== currentSession?.sessionId) {
			router.push(`/therapy/${sessionId}`);
		}
	};

	// Delete session
	const deleteSession = async (sessionIdToDelete: string) => {
		try {
			setDeletingSessionId(sessionIdToDelete);
			await chatAPI.deleteSession(sessionIdToDelete);

			// Remove from sessions list
			setSessions((prev) => prev.filter((session) => session.sessionId !== sessionIdToDelete));

			// If we're deleting the current session, redirect to a new session or dashboard
			if (sessionIdToDelete === sessionId) {
				const remainingSessions = sessions.filter((session) => session.sessionId !== sessionIdToDelete);
				if (remainingSessions.length > 0) {
					router.push(`/therapy/${remainingSessions[0].sessionId}`);
				} else {
					router.push("/dashboard");
				}
			}

			toast.success("Chat session deleted successfully");
		} catch (error) {
			console.error("Error deleting session:", error);
			toast.error("Failed to delete chat session");
		} finally {
			setDeletingSessionId(null);
			setShowDeleteConfirm(null);
		}
	};

	const sendMessage = async (messageText: string) => {
		if (!messageText.trim() || isSending) return;

		const userMessage: ChatMessage = {
			role: "user",
			content: messageText.trim(),
			timestamp: new Date(),
		};

		setIsSending(true);
		setIsTyping(true);
		setMessages((prev) => [...prev, userMessage]);
		setMessage("");

		try {
			const response = await chatAPI.sendMessage(sessionId, messageText.trim());

			const assistantMessage: ChatMessage = {
				role: "assistant",
				content: response.response,
				timestamp: new Date(),
				metadata: response.metadata,
			};

			setMessages((prev) => [...prev, assistantMessage]);

			// Refresh sessions to show the new session in sidebar
			loadSessions();
		} catch (error) {
			console.error("Error sending message:", error);
			toast.error("Failed to send message");
			setMessages((prev) => prev.slice(0, -1));
		} finally {
			setIsTyping(false);
			setIsSending(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (message.trim() && !isSending) {
			sendMessage(message);
		}
	};

	const handleSuggestedQuestion = (questionText: string) => {
		setMessage(questionText);
		sendMessage(questionText);
	};

	if (!mounted) {
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Spinner variant="circle-filled" />
			</div>
		);
	}

	return (
		<div className="relative max-w-7xl h-screen flex min-h-screen mx-auto px-4">
			<div className="flex flex-1 justify-center h-[calc(100vh-4rem)] my-auto gap-6">
				{/* Sidebar with chat history */}
				<div className="w-80 flex flex-col rounded-xl border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm overflow-hidden">
					<div className="p-4 border-b bg-background/50">
						<div className="flex items-center justify-between mb-4">
							<h2 className="text-lg font-semibold tracking-tight">Chat Sessions</h2>
						</div>
						<Button
							variant="outline"
							className="w-full justify-start gap-2 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-colors cursor-pointer"
							onClick={createNewSession}
						>
							New Session
						</Button>
					</div>

					<ScrollArea className="flex-1 p-4">
						<div className="space-y-3">
							{isLoadingSessions ? (
								<SidebarLoadingSkeleton />
							) : sessions.length === 0 ? (
								<div className="text-center py-8 text-muted-foreground">
									<MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
									<p className="text-sm">No chat sessions yet</p>
									<p className="text-xs">Start a new conversation</p>
								</div>
							) : (
								sessions.map((session) => (
									<div
										key={session.sessionId}
										className={cn(
											"group relative p-3 rounded-lg text-sm cursor-pointer border transition-all duration-200 hover:scale-[1.02]",
											session.sessionId === sessionId
												? "bg-primary/10 text-primary border-primary/30 ring-1 ring-primary/20 shadow-sm"
												: "bg-background/60 hover:bg-muted/40 border-transparent hover:border-border/50"
										)}
										onClick={() => switchToSession(session.sessionId)}
									>
										<div
											className={cn(
												"absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 rounded-r-full transition-all duration-200",
												session.sessionId === sessionId
													? "bg-primary opacity-100"
													: "bg-primary/60 opacity-0 group-hover:opacity-100"
											)}
										/>
										<div className="flex items-center gap-2 mb-2">
											<MessageSquare className="w-4 h-4 flex-shrink-0" />
											<span className="font-medium truncate">
												{session.messages[0]?.content.slice(0, 25) || "New Chat"}
												{session.messages[0]?.content.length > 25 && "..."}
											</span>
											<div className="ml-auto flex items-center gap-1">
												{session.sessionId === sessionId && <ChevronRight className="w-3 h-3 text-primary" />}
												<Button
													variant="ghost"
													size="icon"
													className="w-6 h-6 opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive transition-all duration-200"
													onClick={(e) => {
														e.stopPropagation();
														setShowDeleteConfirm(session.sessionId);
													}}
													disabled={deletingSessionId === session.sessionId}
												>
													{deletingSessionId === session.sessionId ? (
														<Loader2 className="w-3 h-3 animate-spin" />
													) : (
														<Trash2 className="w-3 h-3" />
													)}
												</Button>
											</div>
										</div>
										<p className="line-clamp-2 text-muted-foreground text-xs leading-relaxed">
											{session.messages[session.messages.length - 1]?.content || "No messages yet"}
										</p>
										<div className="flex items-center justify-between mt-3">
											<span className="text-xs text-muted-foreground font-medium">
												{session.messages.length} message{session.messages.length !== 1 ? "s" : ""}
											</span>
											<span className="text-xs text-muted-foreground">
												{(() => {
													try {
														const date = new Date(session.updatedAt);
														if (isNaN(date.getTime())) {
															return "Just now";
														}
														return formatDistanceToNow(date, {
															addSuffix: true,
														});
													} catch {
														return "Just now";
													}
												})()}
											</span>
										</div>
									</div>
								))
							)}
						</div>
					</ScrollArea>
				</div>

				{/* Main chat area */}
				<div className="flex-1 flex flex-col overflow-hidden rounded-2xl border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
					{/* Chat header */}
					<div className="p-4 border-b sticky top-0 z-10 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
								<Bot className="w-6 h-6" />
							</div>
							<div className="flex items-center gap-3">
								<div>
									<h2 className="font-semibold tracking-tight text-lg">Luma AI</h2>
									<div className="flex items-center gap-2">
										<div className="flex items-center gap-1">
											<span className="relative inline-flex h-2 w-2">
												<span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/40 animate-ping" />
												<span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
											</span>
											<span className="text-xs text-muted-foreground">online</span>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="text-sm text-muted-foreground">
								{messages.length} message{messages.length !== 1 ? "s" : ""}
							</div>
							<Button variant="ghost" size="icon" className="w-8 h-8">
								<MoreHorizontal className="w-4 h-4" />
							</Button>
						</div>
					</div>

					{isLoading ? (
						<div className="flex-1 flex items-center justify-center">
							<ChatLoadingSkeleton />
						</div>
					) : messages.length === 0 ? (
						<div className="flex-1 flex items-center justify-center p-6">
							<div className="max-w-2xl w-full space-y-8">
								<div className="text-center space-y-6">
									<div className="relative inline-flex flex-col items-center">
										<motion.div
											className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
											initial="initial"
											animate="animate"
											variants={glowAnimation as Variants}
										/>
										<div className="relative flex items-center gap-3 text-3xl font-semibold">
											<div className="relative">
												<Sparkles className="w-8 h-8 text-primary" />
												<motion.div
													className="absolute inset-0 text-primary"
													initial="initial"
													animate="animate"
													variants={glowAnimation as Variants}
												>
													<Sparkles className="w-8 h-8" />
												</motion.div>
											</div>
											<span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
												Welcome to Luma AI
											</span>
										</div>
										<p className="text-muted-foreground mt-3 text-lg">Your AI therapy companion is here to help</p>
									</div>
								</div>

								<div className="grid gap-4 relative">
									<motion.div
										className="absolute cursor-pointer -inset-6 bg-gradient-to-b from-primary/5 to-transparent blur-xl"
										initial={{ opacity: 0 }}
										animate={{ opacity: 1 }}
										transition={{ delay: 0.5 }}
									/>
									{SUGGESTED_QUESTIONS.map((q, index) => (
										<motion.div
											key={q.text}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ delay: index * 0.1 + 0.5 }}
											className="cursor-pointer"
										>
											<Button
												variant="outline"
												className="w-full cursor-pointer h-auto py-5 px-6 text-left justify-start hover:bg-muted/50 hover:border-primary/50 transition-all duration-300 hover:scale-[1.02] text-base"
												onClick={() => handleSuggestedQuestion(q.text)}
											>
												<MessageSquare className="w-5 h-5 mr-3 text-primary" />
												{q.text}
											</Button>
										</motion.div>
									))}
								</div>
							</div>
						</div>
					) : (
						<div className="flex-1 overflow-y-auto scroll-smooth">
							<div className="max-w-4xl mx-auto p-4">
								<AnimatePresence initial={false}>
									{messages.map((msg, index) => {
										const isAssistant = msg.role === "assistant";
										return (
											<motion.div
												key={`${msg.timestamp.toISOString()}-${index}`}
												initial={{ opacity: 0, y: 12 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.25 }}
												className="mb-6"
											>
												<div className={cn("flex gap-4 items-start", isAssistant ? "justify-start" : "justify-end")}>
													{isAssistant && (
														<div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20 shadow-sm">
															<Bot className="w-5 h-5" />
														</div>
													)}

													<div
														className={cn(
															"max-w-[75%] rounded-2xl px-5 py-4 text-sm shadow-sm",
															isAssistant
																? "bg-white/80 dark:bg-zinc-900/60 border border-border/60"
																: "bg-primary text-primary-foreground shadow-md"
														)}
													>
														<div className="flex items-center justify-between gap-3 mb-2">
															<p className="font-medium text-xs opacity-80">{isAssistant ? "Luma AI" : "You"}</p>
															{msg.metadata?.technique && isAssistant && (
																<Badge variant="secondary" className="text-[10px] px-2 py-0.5">
																	{msg.metadata.technique}
																</Badge>
															)}
														</div>
														<div
															className={cn(
																"leading-relaxed",
																isAssistant
																	? "prose prose-sm dark:prose-invert max-w-none prose-p:my-2 prose-li:my-0"
																	: ""
															)}
														>
															{isAssistant ? (
																<ReactMarkdown>{msg.content}</ReactMarkdown>
															) : (
																<p className="text-sm">{msg.content}</p>
															)}
														</div>
														<div className="mt-3 text-[11px] text-muted-foreground">
															{formatDistanceToNow(msg.timestamp, { addSuffix: true })}
														</div>
														{msg.metadata?.goal && isAssistant && (
															<p className="text-[11px] text-muted-foreground mt-2 opacity-70">
																Goal: {msg.metadata.goal}
															</p>
														)}
													</div>

													{!isAssistant && (
														<div className="w-10 h-10 shrink-0 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center ring-1 ring-border shadow-sm">
															<User className="w-5 h-5" />
														</div>
													)}
												</div>
											</motion.div>
										);
									})}
								</AnimatePresence>

								{isTyping && (
									<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
										<div className="flex items-start gap-4">
											<div className="w-10 h-10 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20 shadow-sm">
												<Bot className="w-5 h-5" />
											</div>
											<div className="max-w-[75%] rounded-2xl px-5 py-4 text-sm shadow-sm bg-white/80 dark:bg-zinc-900/60 border border-border/60">
												<p className="font-medium text-xs opacity-80 mb-2">Luma AI</p>
												<LoaderFive text="Thinking..." />
											</div>
										</div>
									</motion.div>
								)}
								<div ref={messagesEndRef} />
							</div>
						</div>
					)}

					<div className="border-t bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
						<form onSubmit={handleSubmit} className="max-w-4xl mx-auto flex gap-4 items-end relative">
							<div className="flex-1 relative group">
								<Textarea
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder="Ask me anything..."
									className={cn(
										"w-full resize-none rounded-2xl border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/70",
										"p-4 pr-14 min-h-[56px] max-h-[200px] text-base",
										"focus:outline-none focus:ring-2 focus:ring-primary/50",
										"transition-all duration-200",
										"placeholder:text-muted-foreground/70",
										(isTyping || isSending) && "opacity-50 cursor-not-allowed"
									)}
									rows={1}
									disabled={isTyping || isSending}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleSubmit(e);
										}
									}}
								/>
								<Button
									type="submit"
									size="icon"
									className={cn(
										"absolute right-2 bottom-2 cursor-pointer h-10 w-10",
										"rounded-xl transition-all duration-200 will-change-transform",
										"bg-primary hover:bg-primary/90 active:scale-95",
										"shadow-sm shadow-primary/20",
										(isTyping || isSending || !message.trim()) && "opacity-50 cursor-not-allowed",
										"group-hover:scale-105 group-focus-within:scale-105"
									)}
									disabled={isTyping || isSending || !message.trim()}
								>
									{isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
								</Button>
							</div>
						</form>
						<div className="mt-3 text-xs text-center text-muted-foreground">
							Press <kbd className="px-2 py-0.5 rounded bg-muted font-mono">Enter ↵</kbd> to send,
							<kbd className="px-2 py-0.5 rounded bg-muted ml-1 font-mono">Shift + Enter</kbd> for new line
						</div>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			{showDeleteConfirm && (
				<div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
					<motion.div
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.95 }}
						className="bg-background border rounded-xl shadow-xl max-w-md w-full p-6"
					>
						<div className="flex items-center gap-3 mb-4">
							<div className="w-10 h-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
								<Trash2 className="w-5 h-5" />
							</div>
							<div>
								<h3 className="font-semibold text-lg">Delete Chat Session</h3>
								<p className="text-sm text-muted-foreground">This action cannot be undone</p>
							</div>
						</div>

						<p className="text-sm text-muted-foreground mb-6">
							Are you sure you want to delete this chat session? All messages in this conversation will be permanently
							removed.
						</p>

						<div className="flex gap-3 justify-end">
							<Button
								variant="outline"
								onClick={() => setShowDeleteConfirm(null)}
								disabled={deletingSessionId === showDeleteConfirm}
							>
								Cancel
							</Button>
							<Button
								variant="destructive"
								onClick={() => deleteSession(showDeleteConfirm)}
								disabled={deletingSessionId === showDeleteConfirm}
								className="gap-2"
							>
								{deletingSessionId === showDeleteConfirm ? (
									<>
										<Loader2 className="w-4 h-4 animate-spin" />
										Deleting...
									</>
								) : (
									<>
										<Trash2 className="w-4 h-4" />
										Delete
									</>
								)}
							</Button>
						</div>
					</motion.div>
				</div>
			)}
		</div>
	);
};

export default TherapyMainContent;
