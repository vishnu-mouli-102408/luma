"use client";

import { motion } from "motion/react";
import React, { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Bell } from "lucide-react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Logout } from "../global/logout";

const DashboardHeader = () => {
	const [mounted, setMounted] = useState(false);
	const [currentTime, setCurrentTime] = useState(new Date());
	const router = useRouter();
	const { data: user } = authClient.useSession();

	useEffect(() => {
		setMounted(true);
		const timer = setInterval(() => setCurrentTime(new Date()), 1000);
		return () => clearInterval(timer);
	}, []);
	return (
		<div className="flex justify-between items-center">
			<motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-2">
				<h1 className="text-3xl font-bold text-foreground">Welcome back, {user?.user?.name || "there"}</h1>
				<p className="text-muted-foreground">
					{currentTime.toLocaleDateString("en-US", {
						weekday: "long",
						month: "long",
						day: "numeric",
					})}
				</p>
			</motion.div>
			<div className="flex items-center gap-4">
				<Logout />
			</div>
		</div>
	);
};

export default DashboardHeader;
