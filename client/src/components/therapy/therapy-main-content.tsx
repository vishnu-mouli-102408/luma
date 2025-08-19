"use client";
import { ChatMessage, ChatSession } from "@/lib/api/chat";
import React, { useEffect, useRef, useState } from "react";
import { Spinner } from "../ui/spinner";
import { Button } from "../ui/button";
import { Bot, Loader2, MessageSquare, PlusCircle, Send, Sparkles, User } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { AnimatePresence, motion, Variants } from "motion/react";
import { Badge } from "../ui/badge";
import ReactMarkdown from "react-markdown";
import { Textarea } from "../ui/textarea";
import { useRouter } from "next/navigation";
import { LoaderFive } from "../ui/loader";

interface TherapyMainContentProps {
	sessionId: string;
}

interface StressPrompt {
	trigger: string;
	activity: {
		type: "breathing" | "garden" | "forest" | "waves";
		title: string;
		description: string;
	};
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

const TherapyMainContent = ({ sessionId }: TherapyMainContentProps) => {
	console.log("Session ID", sessionId);
	const [message, setMessage] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const router = useRouter();
	const [messages, setMessages] = useState<ChatMessage[]>([]);
	const [mounted, setMounted] = useState(false);
	const [isLoading, setIsLoading] = useState(false);
	const [isCompletingSession, setIsCompletingSession] = useState(false);
	const [sessions, setSessions] = useState<ChatSession[]>([]);

	const scrollToBottom = () => {
		if (messagesEndRef.current) {
			setTimeout(() => {
				messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
			}, 100);
		}
	};

	useEffect(() => {
		if (!isTyping) {
			scrollToBottom();
		}
	}, [messages, isTyping]);

	useEffect(() => {
		setMounted(true);
	}, []);

	const detectStressSignals = (message: string): StressPrompt | null => {
		const stressKeywords = [
			"stress",
			"anxiety",
			"worried",
			"panic",
			"overwhelmed",
			"nervous",
			"tense",
			"pressure",
			"can't cope",
			"exhausted",
		];

		const lowercaseMsg = message.toLowerCase();
		const foundKeyword = stressKeywords.find((keyword) => lowercaseMsg.includes(keyword));

		if (foundKeyword) {
			const activities = [
				{
					type: "breathing" as const,
					title: "Breathing Exercise",
					description: "Follow calming breathing exercises with visual guidance",
				},
				{
					type: "garden" as const,
					title: "Zen Garden",
					description: "Create and maintain your digital peaceful space",
				},
				{
					type: "forest" as const,
					title: "Mindful Forest",
					description: "Take a peaceful walk through a virtual forest",
				},
				{
					type: "waves" as const,
					title: "Ocean Waves",
					description: "Match your breath with gentle ocean waves",
				},
			];

			return {
				trigger: foundKeyword,
				activity: activities[Math.floor(Math.random() * activities.length)],
			};
		}

		return null;
	};

	if (!mounted || isLoading) {
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
							<Button
								variant="ghost"
								size="icon"
								onClick={() => {}}
								className="hover:bg-primary/10 transition-transform active:scale-95"
								disabled={isLoading}
							>
								{isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlusCircle className="w-5 h-5" />}
							</Button>
						</div>
						<Button
							variant="outline"
							className="w-full justify-start gap-2 rounded-lg hover:border-primary/40 hover:bg-primary/5 transition-colors"
							onClick={() => {}}
							disabled={isLoading}
						>
							{isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageSquare className="w-4 h-4" />}
							New Session
						</Button>
					</div>

					<ScrollArea className="flex-1 p-4">
						<div className="space-y-4">
							{sessions.map((session) => (
								<div
									key={session.sessionId}
									className={cn(
										"group relative p-3 rounded-lg text-sm cursor-pointer border transition-all",
										session.sessionId === sessionId
											? "bg-primary/5 text-primary border-primary/30 ring-1 ring-primary/20"
											: "bg-background/60 hover:bg-muted/40 border-transparent"
									)}
									onClick={() => {}}
								>
									<div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 rounded-r-full bg-primary/60 opacity-0 group-hover:opacity-100 transition-opacity" />
									<div className="flex items-center gap-2 mb-1">
										<MessageSquare className="w-4 h-4" />
										<span className="font-medium">{session.messages[0]?.content.slice(0, 30) || "New Chat"}</span>
									</div>
									<p className="line-clamp-2 text-muted-foreground">
										{session.messages[session.messages.length - 1]?.content || "No messages yet"}
									</p>
									<div className="flex items-center justify-between mt-2">
										<span className="text-xs text-muted-foreground">{session.messages.length} messages</span>
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
							))}
						</div>
					</ScrollArea>
				</div>

				{/* Main chat area */}
				<div className="flex-1 flex flex-col overflow-hidden rounded-2xl border bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
					{/* Chat header */}
					<div className="p-4 border-b sticky top-0 z-10 bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between">
						<div className="flex items-center gap-2">
							<div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
								<Bot className="w-5 h-5" />
							</div>
							<div className="flex items-center gap-2">
								<h2 className="font-semibold tracking-tight">Luma AI</h2>
								<div className="flex items-center gap-1">
									<span className="relative inline-flex h-2.5 w-2.5">
										<span className="absolute inline-flex h-full w-full rounded-full bg-emerald-500/40 animate-ping" />
										<span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
									</span>
									<span className="text-xs text-muted-foreground">online</span>
								</div>
							</div>
						</div>
						<div className="text-xs text-muted-foreground px-4 pt-2">{messages.length} messages</div>
					</div>

					{messages.length === 0 ? (
						// Welcome screen with suggested questions
						<div className="flex-1 flex items-center justify-center p-4">
							<div className="max-w-2xl w-full space-y-8">
								<div className="text-center space-y-4">
									<div className="relative inline-flex flex-col items-center">
										<motion.div
											className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
											initial="initial"
											animate="animate"
											variants={glowAnimation as Variants}
										/>
										<div className="relative flex items-center gap-2 text-2xl font-semibold">
											<div className="relative">
												<Sparkles className="w-6 h-6 text-primary" />
												<motion.div
													className="absolute inset-0 text-primary"
													initial="initial"
													animate="animate"
													variants={glowAnimation as Variants}
												>
													<Sparkles className="w-6 h-6" />
												</motion.div>
											</div>
											<span className="bg-gradient-to-r from-primary/90 to-primary bg-clip-text text-transparent">
												Luma AI
											</span>
										</div>
										<p className="text-muted-foreground mt-2">How can I assist you today?</p>
									</div>
								</div>

								<div className="grid gap-3 relative">
									<motion.div
										className="absolute cursor-pointer -inset-4 bg-gradient-to-b from-primary/5 to-transparent blur-xl"
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
												className="w-full cursor-pointer h-auto py-4 px-6 text-left justify-start hover:bg-muted/50 hover:border-primary/50 transition-all duration-300"
												onClick={() => {}}
											>
												{q.text}
											</Button>
										</motion.div>
									))}
								</div>
							</div>
						</div>
					) : (
						// Chat messages
						<div className="flex-1 overflow-y-auto scroll-smooth">
							<div className="max-w-3xl mx-auto">
								<AnimatePresence initial={false}>
									{messages.map((msg) => {
										const isAssistant = msg.role === "assistant";
										return (
											<motion.div
												key={msg.timestamp.toISOString()}
												initial={{ opacity: 0, y: 12 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.25 }}
												className="px-4 py-3"
											>
												<div className={cn("flex gap-3 items-end", isAssistant ? "justify-start" : "justify-end")}>
													{isAssistant && (
														<div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
															<Bot className="w-5 h-5" />
														</div>
													)}

													<div
														className={cn(
															"max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
															isAssistant
																? "bg-white/80 dark:bg-zinc-900/60 border border-border/60"
																: "bg-primary text-primary-foreground shadow-md"
														)}
													>
														<div className="flex items-center justify-between gap-3 mb-1">
															<p className="font-medium text-xs opacity-80">{isAssistant ? "AI Therapist" : "You"}</p>
															{msg.metadata?.technique && isAssistant && (
																<Badge variant="secondary" className="text-[10px]">
																	{msg.metadata.technique}
																</Badge>
															)}
														</div>
														<div
															className={cn(
																"leading-relaxed",
																isAssistant ? "prose prose-sm dark:prose-invert max-w-none" : ""
															)}
														>
															{isAssistant ? <ReactMarkdown>{msg.content}</ReactMarkdown> : <p>{msg.content}</p>}
														</div>
														<div className="mt-1 text-[10px] text-muted-foreground">
															{formatDistanceToNow(msg.timestamp, { addSuffix: true })}
														</div>
														{msg.metadata?.goal && isAssistant && (
															<p className="text-[10px] text-muted-foreground mt-1">Goal: {msg.metadata.goal}</p>
														)}
													</div>

													{!isAssistant && (
														<div className="w-8 h-8 shrink-0 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
															<User className="w-5 h-5" />
														</div>
													)}
												</div>
											</motion.div>
										);
									})}
								</AnimatePresence>

								{isTyping && (
									<motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="px-4 py-3">
										<div className="flex items-end gap-3">
											<div className="w-8 h-8 shrink-0 rounded-full bg-primary/10 text-primary flex items-center justify-center ring-1 ring-primary/20">
												<Bot className="w-5 h-5" />
											</div>
											<div className="max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm bg-white/80 dark:bg-zinc-900/60 border border-border/60">
												<p className="font-medium text-xs opacity-80 mb-1">Luma AI</p>
												<LoaderFive text="Generating chat..." />
											</div>
										</div>
									</motion.div>
								)}
								<div ref={messagesEndRef} />
							</div>
						</div>
					)}

					{/* Input area */}
					<div className="border-t bg-background/60 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
						<form onSubmit={() => {}} className="max-w-3xl mx-auto flex gap-4 items-end relative">
							<div className="flex-1 relative group">
								<Textarea
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder={"Ask me anything..."}
									className={cn(
										"w-full resize-none rounded-2xl border bg-background/70 backdrop-blur supports-[backdrop-filter]:bg-background/70",
										"p-3 pr-12 min-h-[48px] max-h-[200px]",
										"focus:outline-none focus:ring-2 focus:ring-primary/50",
										"transition-all duration-200",
										"placeholder:text-muted-foreground/70",
										isTyping && "opacity-50 cursor-not-allowed"
									)}
									rows={1}
									disabled={isTyping}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
										}
									}}
								/>
								<Button
									type="submit"
									size="icon"
									className={cn(
										"absolute right-1.5 bottom-[6px] cursor-pointer h-[36px] w-[36px]",
										"rounded-xl transition-all duration-200 will-change-transform",
										"bg-primary hover:bg-primary/90 active:scale-95",
										"shadow-sm shadow-primary/20",
										(isTyping || !message.trim()) && "opacity-50 cursor-not-allowed",
										"group-hover:scale-105 group-focus-within:scale-105"
									)}
									disabled={isTyping || !message.trim()}
									onClick={(e) => {
										e.preventDefault();
									}}
								>
									<Send className="w-4 h-4" />
								</Button>
							</div>
						</form>
						<div className="mt-2 text-xs text-center text-muted-foreground">
							Press <kbd className="px-2 py-0.5 rounded bg-muted">Enter ↵</kbd> to send,
							<kbd className="px-2 py-0.5 rounded bg-muted ml-1">Shift + Enter</kbd> for new line
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TherapyMainContent;
