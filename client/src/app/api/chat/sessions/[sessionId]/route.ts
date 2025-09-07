import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function GET(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
	try {
		const { sessionId } = await params;

		const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}`, {
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
		console.error("Error proxying GET /api/chat/sessions/[sessionId]:", error);
		return NextResponse.json({ error: "Failed to fetch chat session" }, { status: 500 });
	}
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ sessionId: string }> }) {
	try {
		const { sessionId } = await params;

		const response = await fetch(`${API_BASE_URL}/api/chat/sessions/${sessionId}`, {
			method: "DELETE",
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
		console.error("Error proxying DELETE /api/chat/sessions/[sessionId]:", error);
		return NextResponse.json({ error: "Failed to delete chat session" }, { status: 500 });
	}
}
