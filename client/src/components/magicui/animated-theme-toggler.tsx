"use client";

import { MoonStarIcon, SunIcon } from "lucide-react";
import { useRef } from "react";
import { flushSync } from "react-dom";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useClickSound } from "@/hooks/use-click-sound";
import { useTheme } from "next-themes";

type props = {
	className?: string;
};

export const AnimatedThemeToggler = ({ className }: props) => {
	const { resolvedTheme, setTheme } = useTheme();
	const buttonRef = useRef<HTMLButtonElement | null>(null);
	const playClick = useClickSound();
	const changeTheme = async () => {
		if (!buttonRef.current) return;

		await document.startViewTransition(() => {
			flushSync(() => {
				playClick();
				setTheme(resolvedTheme === "dark" ? "light" : "dark");
			});
		}).ready;

		const { top, left, width, height } = buttonRef.current.getBoundingClientRect();
		const y = top + height / 2;
		const x = left + width / 2;

		const right = window.innerWidth - left;
		const bottom = window.innerHeight - top;
		const maxRad = Math.hypot(Math.max(left, right), Math.max(top, bottom));

		document.documentElement.animate(
			{
				clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${maxRad}px at ${x}px ${y}px)`],
			},
			{
				duration: 700,
				easing: "ease-in-out",
				pseudoElement: "::view-transition-new(root)",
			}
		);
	};
	return (
		<Button ref={buttonRef} onClick={changeTheme} className={cn(className)} variant="outline" size="icon">
			<MoonStarIcon className="hidden [html.dark_&]:block" />
			<SunIcon className="hidden [html.light_&]:block" />
			<span className="sr-only">Toggle Theme</span>
		</Button>
	);
};
