import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
	try {
		const { sessionId } = params;

		const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}/history`, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Cookie: request.headers.get("cookie") || "",
			},
		});

		const data = await response.json();

		return NextResponse.json(data, {
			status: response.status,
			headers: {
				"Set-Cookie": response.headers.get("Set-Cookie") || "",
			},
		});
	} catch (error) {
		console.error("Error proxying GET /api/chat/sessions/[sessionId]/history:", error);
		return NextResponse.json({ error: "Failed to fetch chat history" }, { status: 500 });
	}
}
