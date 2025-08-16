"use client";

import { MoonStarIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useCallback } from "react";

import { useClickSound } from "@/hooks/use-click-sound";
import { Button } from "../ui/button";

export function ToggleTheme() {
	const { resolvedTheme, setTheme } = useTheme();

	const playClick = useClickSound();

	const handleToggle = useCallback(() => {
		playClick();
		setTheme(resolvedTheme === "dark" ? "light" : "dark");
	}, [resolvedTheme, setTheme, playClick]);

	return (
		<Button variant="outline" size="icon" onClick={handleToggle}>
			<MoonStarIcon className="hidden [html.dark_&]:block" />
			<SunIcon className="hidden [html.light_&]:block" />
			<span className="sr-only">Toggle Theme</span>
		</Button>
	);
}
