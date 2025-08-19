import TherapyMainContent from "@/components/therapy/therapy-main-content";
import React from "react";

const TherapySessionPage = async ({ params }: { params: Promise<{ sessionId: string }> }) => {
	const { sessionId } = await params;
	return <TherapyMainContent sessionId={sessionId} />;
};

export default TherapySessionPage;
