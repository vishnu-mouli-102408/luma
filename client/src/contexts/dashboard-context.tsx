"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from "react";
import { authClient } from "@/lib/auth-client";

interface DashboardStats {
	moodScore: number | null;
	completionRate: number;
	totalActivities: number;
	therapySessions: number;
	lastUpdated: Date;
	moodHistory: Array<{ score: number; timestamp: Date }>;
	activityBreakdown: Array<{ type: string; count: number }>;
}

interface DashboardState {
	stats: DashboardStats | null;
	isLoading: boolean;
	error: string | null;
	lastRefresh: Date | null;
}

type DashboardAction =
	| { type: "FETCH_START" }
	| { type: "FETCH_SUCCESS"; payload: DashboardStats }
	| { type: "FETCH_ERROR"; payload: string }
	| { type: "UPDATE_MOOD"; payload: { score: number; timestamp: Date } }
	| { type: "UPDATE_ACTIVITY"; payload: { type: string; name: string; timestamp: Date } }
	| { type: "RESET_ERROR" };

// Initial state
const initialState: DashboardState = {
	stats: null,
	isLoading: false,
	error: null,
	lastRefresh: null,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
	switch (action.type) {
		case "FETCH_START":
			return {
				...state,
				isLoading: true,
				error: null,
			};

		case "FETCH_SUCCESS":
			return {
				...state,
				isLoading: false,
				error: null,
				stats: {
					...action.payload,
					lastUpdated: new Date(action.payload.lastUpdated), // Ensure Date object
				},
				lastRefresh: new Date(),
			};

		case "FETCH_ERROR":
			return {
				...state,
				isLoading: false,
				error: action.payload,
			};

		case "UPDATE_MOOD":
			if (!state.stats) return state;

			// Optimistic update for mood (immediate UI feedback)
			const updatedMoodHistory = [...state.stats.moodHistory, action.payload];
			const todaysMoods = updatedMoodHistory.filter(
				(mood) => new Date(mood.timestamp).toDateString() === new Date().toDateString()
			);
			const newAverageMood =
				todaysMoods.length > 0
					? Math.round(todaysMoods.reduce((sum, mood) => sum + mood.score, 0) / todaysMoods.length)
					: null;

			return {
				...state,
				stats: {
					...state.stats,
					moodScore: newAverageMood,
					moodHistory: updatedMoodHistory,
					lastUpdated: new Date(),
				},
			};

		case "UPDATE_ACTIVITY":
			if (!state.stats) return state;

			const existingActivityType = state.stats.activityBreakdown.find((item) => item.type === action.payload.type);

			let updatedActivityBreakdown;
			if (existingActivityType) {
				updatedActivityBreakdown = state.stats.activityBreakdown.map((item) =>
					item.type === action.payload.type ? { ...item, count: item.count + 1 } : item
				);
			} else {
				updatedActivityBreakdown = [...state.stats.activityBreakdown, { type: action.payload.type, count: 1 }];
			}

			return {
				...state,
				stats: {
					...state.stats,
					totalActivities: state.stats.totalActivities + 1,
					therapySessions:
						action.payload.type === "therapy" ? state.stats.therapySessions + 1 : state.stats.therapySessions,
					activityBreakdown: updatedActivityBreakdown,
					lastUpdated: new Date(),
				},
			};

		case "RESET_ERROR":
			return {
				...state,
				error: null,
			};

		default:
			return state;
	}
}

// Context interface
interface DashboardContextType {
	state: DashboardState;
	fetchDashboardStats: () => Promise<void>;
	updateMoodOptimistically: (score: number) => void;
	updateActivityOptimistically: (type: string, name: string) => void;
	clearError: () => void;
	refreshData: () => Promise<void>;
}

// Create context
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
	const [state, dispatch] = useReducer(dashboardReducer, initialState);
	const { data: user } = authClient.useSession();

	// Fetch dashboard statistics from API
	const fetchDashboardStats = useCallback(async () => {
		if (!user) return;

		dispatch({ type: "FETCH_START" });

		try {
			const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard/stats`, {
				method: "GET",
				credentials: "include",
				headers: {
					"Content-Type": "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`Failed to fetch dashboard stats: ${response.statusText}`);
			}

			const data = await response.json();

			if (!data.success) {
				throw new Error(data.error || "Failed to fetch dashboard stats");
			}

			dispatch({ type: "FETCH_SUCCESS", payload: data.data });
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Failed to fetch dashboard stats";
			dispatch({ type: "FETCH_ERROR", payload: errorMessage });
			console.error("Dashboard fetch error:", error);
		}
	}, [user]);

	// Optimistic updates for immediate UI feedback
	const updateMoodOptimistically = useCallback((score: number) => {
		dispatch({
			type: "UPDATE_MOOD",
			payload: { score, timestamp: new Date() },
		});
	}, []);

	const updateActivityOptimistically = useCallback((type: string, name: string) => {
		dispatch({
			type: "UPDATE_ACTIVITY",
			payload: { type, name, timestamp: new Date() },
		});
	}, []);

	const clearError = useCallback(() => {
		dispatch({ type: "RESET_ERROR" });
	}, []);

	// Refresh data (manual refresh)
	const refreshData = useCallback(async () => {
		await fetchDashboardStats();
	}, [fetchDashboardStats]);

	// Auto-fetch data when user becomes available
	useEffect(() => {
		if (user) {
			fetchDashboardStats();
		}
	}, [user, fetchDashboardStats]);

	// Auto-refresh every 5 minutes for real-time updates
	useEffect(() => {
		if (!user) return;

		const interval = setInterval(() => {
			fetchDashboardStats();
		}, 5 * 60 * 1000); // 5 minutes

		return () => clearInterval(interval);
	}, [user, fetchDashboardStats]);

	const contextValue: DashboardContextType = {
		state,
		fetchDashboardStats,
		updateMoodOptimistically,
		updateActivityOptimistically,
		clearError,
		refreshData,
	};

	return <DashboardContext.Provider value={contextValue}>{children}</DashboardContext.Provider>;
}

export function useDashboard() {
	const context = useContext(DashboardContext);

	if (context === undefined) {
		throw new Error("useDashboard must be used within a DashboardProvider");
	}

	return context;
}

export type { DashboardStats, DashboardState };
