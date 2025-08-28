import { genAI } from "../lib/ai";
import { logger } from "../lib/logger";
import { prisma } from "../lib/db";
import { inngest } from "./client";

// Function to handle chat message processing
export const processChatMessage = inngest.createFunction(
	{
		id: "process-chat-message",
		retries: 2,
	},
	{ event: "therapy/session.message" },
	async ({ event, step }) => {
		try {
			// Validate required data
			if (!event.data.message || typeof event.data.message !== "string") {
				throw new Error("Message is required and must be a string");
			}

			const {
				message,
				history = [],
				memory = {
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
				goals = [],
				systemPrompt = "You are a helpful AI therapy assistant. Provide supportive and professional responses.",
			} = event.data;

			logger.info({ message, historyLength: history?.length }, "Processing chat message:");

			// Analyze the message using Gemini
			const analysis = await step.run("analyze-message", async () => {
				try {
					const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

					const prompt = `Analyze this therapy message and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
									Message: ${message}
									Context: ${JSON.stringify({ memory, goals })}
									
									Required JSON structure:
									{
									"emotionalState": "string",
									"themes": ["string"],
									"riskLevel": number,
									"recommendedApproach": "string",
									"progressIndicators": ["string"]
									}`;

					const result = await model.generateContent(prompt);
					const response = result.response;
					const text = response.text().trim();

					logger.info({ text }, "Received analysis from Gemini:");

					// Clean the response text to ensure it's valid JSON
					const cleanText = text.replace(/```json\n|\n```/g, "").trim();
					const parsedAnalysis = JSON.parse(cleanText);

					logger.info({ parsedAnalysis }, "Successfully parsed analysis:");
					return parsedAnalysis;
				} catch (error) {
					logger.error({ error, message }, "Error in message analysis:");
					// Return a default analysis instead of throwing
					return {
						emotionalState: "neutral",
						themes: [],
						riskLevel: 0,
						recommendedApproach: "supportive",
						progressIndicators: [],
					};
				}
			});

			// Update memory based on analysis
			const updatedMemory = await step.run("update-memory", async () => {
				if (analysis.emotionalState) {
					memory.userProfile.emotionalState.push(analysis.emotionalState);
				}
				if (analysis.themes) {
					memory.sessionContext.conversationThemes.push(...analysis.themes);
				}
				if (analysis.riskLevel) {
					memory.userProfile.riskLevel = analysis.riskLevel;
				}
				return memory;
			});

			// If high risk is detected, trigger an alert
			if (analysis.riskLevel > 4) {
				await step.run("trigger-risk-alert", async () => {
					logger.warn(
						{
							message,
							riskLevel: analysis.riskLevel,
						},
						"High risk level detected in chat message"
					);
				});
			}

			// Generate therapeutic response
			const response = await step.run("generate-response", async () => {
				try {
					const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

					const prompt = `${systemPrompt}
			
						Based on the following context, generate a therapeutic response:
						Message: ${message}
						Analysis: ${JSON.stringify(analysis)}
						Memory: ${JSON.stringify(memory)}
						Goals: ${JSON.stringify(goals)}
						
						Provide a response that:
						1. Addresses the immediate emotional needs
						2. Uses appropriate therapeutic techniques
						3. Shows empathy and understanding
						4. Maintains professional boundaries
						5. Considers safety and well-being`;

					const result = await model.generateContent(prompt);
					const responseText = result.response.text().trim();

					logger.info({ responseText }, "Generated response:");
					return responseText;
				} catch (error) {
					logger.error({ error, message }, "Error generating response:");
					// Return a default response instead of throwing
					return "I'm here to support you. Could you tell me more about what's on your mind?";
				}
			});

			// Return the response in the expected format
			return {
				response,
				analysis,
				updatedMemory,
			};
		} catch (error) {
			logger.error({ error, message: event.data.message }, "Error in chat message processing:");
			// Return a default response instead of throwing
			return {
				response: "I'm here to support you. Could you tell me more about what's on your mind?",
				analysis: {
					emotionalState: "neutral",
					themes: [],
					riskLevel: 0,
					recommendedApproach: "supportive",
					progressIndicators: [],
				},
				updatedMemory: event.data.memory,
			};
		}
	}
);

// Function to analyze therapy session content
export const analyzeTherapySession = inngest.createFunction(
	{ id: "analyze-therapy-session" },
	{ event: "therapy/session.created" },
	async ({ event, step }) => {
		try {
			// Validate required data
			if (!event.data.sessionId) {
				throw new Error("Session ID is required for therapy session analysis");
			}

			// Get the session content
			const sessionContent = await step.run("get-session-content", async () => {
				const content = event?.data?.notes || event?.data?.transcript;
				if (!content || typeof content !== "string" || content.trim().length === 0) {
					throw new Error("Session content (notes or transcript) is required and cannot be empty");
				}
				return content.trim();
			});

			// Analyze the session using Gemini
			const analysis = await step.run("analyze-with-gemini", async () => {
				try {
					const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

					const prompt = `Analyze this therapy session and provide insights. Return ONLY a valid JSON object with no markdown formatting or additional text.
						Session Content: ${sessionContent}
						
						Required JSON structure:
						{
							"keyThemes": ["string"],
							"emotionalState": "string",
							"areasOfConcern": ["string"],
							"recommendations": ["string"],
							"progressIndicators": ["string"],
							"riskLevel": number
						}`;

					const result = await model.generateContent(prompt);
					const response = result.response;
					const text = response.text().trim();

					// Clean the response text to ensure it's valid JSON
					const cleanText = text.replace(/```json\n|\n```/g, "").trim();
					const parsedAnalysis = JSON.parse(cleanText);

					// Validate required fields and provide defaults
					return {
						keyThemes: Array.isArray(parsedAnalysis.keyThemes) ? parsedAnalysis.keyThemes : [],
						emotionalState: parsedAnalysis.emotionalState || "neutral",
						areasOfConcern: Array.isArray(parsedAnalysis.areasOfConcern) ? parsedAnalysis.areasOfConcern : [],
						recommendations: Array.isArray(parsedAnalysis.recommendations) ? parsedAnalysis.recommendations : [],
						progressIndicators: Array.isArray(parsedAnalysis.progressIndicators)
							? parsedAnalysis.progressIndicators
							: [],
						riskLevel:
							typeof parsedAnalysis.riskLevel === "number" ? Math.max(0, Math.min(10, parsedAnalysis.riskLevel)) : 0,
					};
				} catch (error) {
					logger.error({ error, sessionContent }, "Error in session analysis with Gemini:");
					// Return default analysis structure
					return {
						keyThemes: [],
						emotionalState: "neutral",
						areasOfConcern: [],
						recommendations: ["Continue regular sessions"],
						progressIndicators: [],
						riskLevel: 0,
					};
				}
			});

			// Store the analysis in database
			const storedAnalysis = await step.run("store-analysis", async () => {
				try {
					// Get session and user data
					const sessionData = await prisma.chatSession.findUnique({
						where: { sessionId: event.data.sessionId },
						include: { user: true },
					});

					if (!sessionData) {
						throw new Error(`Chat session not found: ${event.data.sessionId}`);
					}

					// Create session analysis record
					const sessionAnalysis = await prisma.sessionAnalysis.create({
						data: {
							sessionId: sessionData.id,
							userId: sessionData.userId,
							keyThemes: analysis.keyThemes,
							emotionalState: analysis.emotionalState,
							areasOfConcern: analysis.areasOfConcern,
							recommendations: analysis.recommendations,
							progressIndicators: analysis.progressIndicators,
							riskLevel: analysis.riskLevel,
							analysisData: analysis, // Store full analysis as JSON
						},
					});

					logger.info(
						{
							sessionAnalysisId: sessionAnalysis.id,
							sessionId: event.data.sessionId,
							userId: sessionData.userId,
							riskLevel: analysis.riskLevel,
						},
						"Session analysis stored successfully"
					);

					return sessionAnalysis;
				} catch (error) {
					logger.error({ error, sessionId: event.data.sessionId }, "Error storing session analysis:");
					throw error;
				}
			});

			// If there are concerning indicators, trigger an alert
			if (analysis.areasOfConcern?.length > 0 || analysis.riskLevel > 5) {
				await step.run("trigger-concern-alert", async () => {
					logger.warn(
						{
							sessionAnalysisId: storedAnalysis.id,
							sessionId: event.data.sessionId,
							userId: storedAnalysis.userId,
							concerns: analysis.areasOfConcern,
							riskLevel: analysis.riskLevel,
						},
						"Concerning indicators detected in session analysis"
					);

					// TODO: Add notification system integration here
					// - Send email to therapist
					// - Create urgent task in admin dashboard
					// - Send push notification to care team
				});
			}

			return {
				message: "Session analysis completed",
				analysis,
			};
		} catch (error) {
			logger.error({ error }, "Error in therapy session analysis:");
			throw error;
		}
	}
);

// Function to generate personalized activity recommendations
export const generateActivityRecommendations = inngest.createFunction(
	{ id: "generate-activity-recommendations" },
	{ event: "mood/updated" },
	async ({ event, step }) => {
		try {
			// Get user's mood history and activity history from database
			const userContext = await step.run("get-user-context", async () => {
				try {
					const userId = event.data.userId;
					if (!userId) {
						throw new Error("User ID is required for activity recommendations");
					}

					// Get recent mood data (last 7 days)
					const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
					const recentMoods = await prisma.mood.findMany({
						where: {
							userId,
							timestamp: { gte: sevenDaysAgo },
						},
						orderBy: { timestamp: "desc" },
						take: 10,
					});

					// Get recent activities (last 14 days)
					const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
					const recentActivities = await prisma.activity.findMany({
						where: {
							userId,
							timestamp: { gte: fourteenDaysAgo },
						},
						orderBy: { timestamp: "desc" },
						take: 20,
					});

					// Get user profile for preferences
					const user = await prisma.user.findUnique({
						where: { id: userId },
						select: { id: true, name: true, email: true },
					});

					return {
						recentMoods: recentMoods.map((mood) => ({
							score: mood.score,
							note: mood.note,
							timestamp: mood.timestamp,
						})),
						completedActivities: recentActivities.map((activity) => ({
							type: activity.type,
							name: activity.name,
							duration: activity.duration,
							timestamp: activity.timestamp,
						})),
						preferences: user ? { name: user.name } : {},
						currentMoodScore: event.data.score || null,
					};
				} catch (error) {
					logger.error({ error, userId: event.data.userId }, "Error fetching user context for recommendations:");
					// Return fallback data
					return {
						recentMoods: [],
						completedActivities: [],
						preferences: {},
						currentMoodScore: event.data.score || null,
					};
				}
			});

			// Generate recommendations using Gemini
			const recommendations = await step.run("generate-recommendations", async () => {
				try {
					const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

					const prompt = `Based on the following user context, generate personalized activity recommendations. Return ONLY a valid JSON object with no markdown formatting or additional text.
					
					User Context: ${JSON.stringify(userContext)}
					
					Required JSON structure:
					{
						"recommendations": [
							{
								"activityType": "string",
								"title": "string",
								"description": "string", 
								"reasoning": "string",
								"expectedBenefits": ["string"],
								"difficultyLevel": "easy|medium|hard",
								"estimatedDuration": number
							}
						]
					}
					
					Provide 3-5 personalized recommendations based on mood patterns and activity history.`;

					const result = await model.generateContent(prompt);
					const response = result.response;
					const text = response.text().trim();

					// Clean the response text to ensure it's valid JSON
					const cleanText = text.replace(/```json\n|\n```/g, "").trim();
					const parsedRecommendations = JSON.parse(cleanText);

					// Validate and structure the recommendations
					const validRecommendations = Array.isArray(parsedRecommendations.recommendations)
						? parsedRecommendations.recommendations.map((rec: any) => ({
								activityType: rec.activityType || "meditation",
								title: rec.title || "Wellness Activity",
								description: rec.description || "A beneficial wellness activity",
								reasoning: rec.reasoning || "Good for overall wellbeing",
								expectedBenefits: Array.isArray(rec.expectedBenefits) ? rec.expectedBenefits : ["Improved mood"],
								difficultyLevel: ["easy", "medium", "hard"].includes(rec.difficultyLevel)
									? rec.difficultyLevel
									: "easy",
								estimatedDuration:
									typeof rec.estimatedDuration === "number" ? Math.max(5, Math.min(120, rec.estimatedDuration)) : 15,
						  }))
						: [];

					return validRecommendations;
				} catch (error) {
					logger.error({ error, userContext }, "Error generating activity recommendations with Gemini:");
					// Return default recommendations
					return [
						{
							activityType: "meditation",
							title: "5-Minute Breathing Exercise",
							description: "A simple breathing exercise to help center yourself",
							reasoning: "Breathing exercises are effective for immediate stress relief",
							expectedBenefits: ["Reduced stress", "Improved focus"],
							difficultyLevel: "easy",
							estimatedDuration: 5,
						},
						{
							activityType: "exercise",
							title: "10-Minute Walk",
							description: "Take a gentle walk outside or around your space",
							reasoning: "Light movement can boost mood and energy",
							expectedBenefits: ["Improved mood", "Increased energy"],
							difficultyLevel: "easy",
							estimatedDuration: 10,
						},
					];
				}
			});

			// Store the recommendations in database
			const storedRecommendations = await step.run("store-recommendations", async () => {
				try {
					const userId = event.data.userId;
					if (!userId) {
						throw new Error("User ID is required to store recommendations");
					}

					// Store each recommendation as a separate database record
					const createdRecommendations = await Promise.all(
						recommendations.map(async (rec: any) => {
							return await prisma.activityRecommendation.create({
								data: {
									userId,
									activityType: rec.activityType,
									title: rec.title,
									description: rec.description,
									reasoning: rec.reasoning,
									expectedBenefits: rec.expectedBenefits,
									difficultyLevel: rec.difficultyLevel,
									estimatedDuration: rec.estimatedDuration,
									basedOnMoodScore: userContext.currentMoodScore,
									contextData: {
										recentMoodAverage:
											userContext.recentMoods.length > 0
												? userContext.recentMoods.reduce((sum: number, mood: any) => sum + mood.score, 0) /
												  userContext.recentMoods.length
												: null,
										recentActivityCount: userContext.completedActivities.length,
										generatedAt: new Date(),
									},
								},
							});
						})
					);

					logger.info(
						{
							userId,
							recommendationCount: createdRecommendations.length,
							recommendationIds: createdRecommendations.map((r) => r.id),
							basedOnMoodScore: userContext.currentMoodScore,
						},
						"Activity recommendations stored successfully"
					);

					return createdRecommendations;
				} catch (error) {
					logger.error({ error, userId: event.data.userId }, "Error storing activity recommendations:");
					throw error;
				}
			});

			return {
				message: "Activity recommendations generated and stored",
				recommendations: storedRecommendations,
				count: storedRecommendations.length,
			};
		} catch (error) {
			logger.error({ error }, "Error generating activity recommendations:");
			throw error;
		}
	}
);

// Add the functions to the exported array
export const functions = [processChatMessage, analyzeTherapySession, generateActivityRecommendations];
