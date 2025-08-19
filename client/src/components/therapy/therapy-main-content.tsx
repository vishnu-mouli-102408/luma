import React from "react";

interface TherapyMainContentProps {
	sessionId: string;
}

const TherapyMainContent = ({ sessionId }: TherapyMainContentProps) => {
	console.log("Session ID", sessionId);

	return <div>TherapyMainContent</div>;
};

export default TherapyMainContent;
