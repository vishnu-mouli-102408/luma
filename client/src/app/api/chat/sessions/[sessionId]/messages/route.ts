import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
	try {
		const { sessionId } = params;
		const body = await request.json();

		const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}/messages`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Cookie: request.headers.get("cookie") || "",
			},
			body: JSON.stringify(body),
		});

		const data = await response.json();

		return NextResponse.json(data, {
			status: response.status,
			headers: {
				"Set-Cookie": response.headers.get("Set-Cookie") || "",
			},
		});
	} catch (error) {
		console.error("Error proxying POST /api/chat/sessions/[sessionId]/messages:", error);
		return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
	}
}
