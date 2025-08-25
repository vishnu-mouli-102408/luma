import { genAI } from "../lib/ai";
import { logger } from "../lib/logger";
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
			const {
				message,
				history,
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
				systemPrompt,
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
			// Get the session content
			const sessionContent = await step.run("get-session-content", async () => {
				return event?.data?.notes || event?.data?.transcript;
			});

			// Analyze the session using Gemini
			const analysis = await step.run("analyze-with-gemini", async () => {
				const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

				const prompt = `Analyze this therapy session and provide insights:
					Session Content: ${sessionContent}
					
					Please provide:
					1. Key themes and topics discussed
					2. Emotional state analysis
					3. Potential areas of concern
					4. Recommendations for follow-up
					5. Progress indicators
					
					Format the response as a JSON object.`;

				const result = await model.generateContent(prompt);
				const response = result.response;
				const text = response.text().trim();

				return JSON.parse(text ?? "{}");
			});

			// Store the analysis
			await step.run("store-analysis", async () => {
				// Here you would typically store the analysis in your database
				logger.info({ analysis }, "Session analysis stored successfully");
				return analysis;
			});

			// If there are concerning indicators, trigger an alert
			if (analysis.areasOfConcern?.length > 0) {
				await step.run("trigger-concern-alert", async () => {
					logger.warn(
						{
							sessionId: event.data.sessionId,
							concerns: analysis.areasOfConcern,
						},
						"Concerning indicators detected in session analysis"
					);
					// Add your alert logic here
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
			// Get user's mood history and activity history
			const userContext = await step.run("get-user-context", async () => {
				// Here you would typically fetch user's history from your database
				return {
					recentMoods: event.data.recentMoods,
					completedActivities: event.data.completedActivities,
					preferences: event.data.preferences,
				};
			});

			// Generate recommendations using Gemini
			const recommendations = await step.run("generate-recommendations", async () => {
				const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

				const prompt = `Based on the following user context, generate personalized activity recommendations:
				User Context: ${JSON.stringify(userContext)}
				
				Please provide:
				1. 3-5 personalized activity recommendations
				2. Reasoning for each recommendation
				3. Expected benefits
				4. Difficulty level
				5. Estimated duration
				
				Format the response as a JSON object.`;

				const result = await model.generateContent(prompt);
				const response = result.response;
				const text = response.text().trim();

				return JSON.parse(text);
			});

			// Store the recommendations
			await step.run("store-recommendations", async () => {
				// Here you would typically store the recommendations in your database
				logger.info({ recommendations }, "Activity recommendations stored successfully");
				return recommendations;
			});

			return {
				message: "Activity recommendations generated",
				recommendations,
			};
		} catch (error) {
			logger.error({ error }, "Error generating activity recommendations:");
			throw error;
		}
	}
);

// Add the functions to the exported array
export const functions = [processChatMessage, analyzeTherapySession, generateActivityRecommendations];
