import { NextRequest, NextResponse } from "next/server";

const API_BASE_URL = process.env.BACKEND_API_URL || "http://localhost:8080";

export async function GET(request: NextRequest) {
	try {
		const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
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
		console.error("Error proxying GET /api/chat/sessions:", error);
		return NextResponse.json({ error: "Failed to fetch chat sessions" }, { status: 500 });
	}
}

export async function POST(request: NextRequest) {
	try {
		const body = await request.json().catch(() => ({}));

		const response = await fetch(`${API_BASE_URL}/api/chat/sessions`, {
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
		console.error("Error proxying POST /api/chat/sessions:", error);
		return NextResponse.json({ error: "Failed to create chat session" }, { status: 500 });
	}
}
