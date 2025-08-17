"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, easeInOut } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "../ui/button";
import { AnimatedThemeToggler } from "../magicui/animated-theme-toggler";

interface NavItem {
	name: string;
	href: string;
}

const navItems: NavItem[] = [
	{ name: "Home", href: "/" },
	{ name: "Features", href: "/features" },
	{ name: "Contact", href: "/contact" },
];

export default function Header() {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const [hoveredItem, setHoveredItem] = useState<string | null>(null);

	useEffect(() => {
		const handleScroll = () => {
			setIsScrolled(window.scrollY > 10);
		};
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const containerVariants = {
		hidden: { opacity: 0, y: -20 },
		visible: {
			opacity: 1,
			y: 0,
			transition: {
				duration: 0.6,
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { opacity: 0, y: -10 },
		visible: { opacity: 1, y: 0 },
	};

	const mobileMenuVariants = {
		closed: {
			opacity: 0,
			x: "100%",
			transition: {
				duration: 0.3,
				ease: easeInOut,
			},
		},
		open: {
			opacity: 1,
			x: 0,
			transition: {
				duration: 0.3,
				ease: easeInOut,
				staggerChildren: 0.1,
			},
		},
	};

	const mobileItemVariants = {
		closed: { opacity: 0, x: 20 },
		open: { opacity: 1, x: 0 },
	};

	return (
		<>
			<motion.header
				className={`fixed top-0 right-0 left-0 z-50 transition-all duration-500 ${
					isScrolled ? "border-border/50 bg-background/80 border-b shadow-sm backdrop-blur-md" : "bg-transparent"
				}`}
				variants={containerVariants}
				initial="hidden"
				animate="visible"
			>
				<div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
					<div className="flex h-16 items-center justify-between">
						<motion.div
							className="flex items-center space-x-3"
							variants={itemVariants}
							whileHover={{ scale: 1.02 }}
							transition={{ type: "spring", stiffness: 400, damping: 25 }}
						>
							<Link prefetch={false} href="/" className="flex items-center space-x-3">
								<div className="relative">
									<div className="flex h-9 w-9 items-center justify-center rounded-xl">
										<Image src="/logo.svg" alt="Luma AI" width={60} height={60} />
									</div>
								</div>
								<div className="flex flex-col">
									<span className="text-foreground text-lg font-bold">Luma AI</span>
									<span className="text-muted-foreground -mt-1 text-xs">Your safe space, anytime.</span>
								</div>
							</Link>
						</motion.div>

						<nav className="hidden items-center space-x-1 lg:flex">
							{navItems.map((item) => (
								<motion.div
									key={item.name}
									variants={itemVariants}
									className="relative"
									onMouseEnter={() => setHoveredItem(item.name)}
									onMouseLeave={() => setHoveredItem(null)}
								>
									<Link
										prefetch={false}
										href={item.href}
										className="text-foreground/80 hover:text-foreground relative rounded-lg px-4 py-2 text-sm font-medium transition-colors duration-200"
									>
										{hoveredItem === item.name && (
											<motion.div
												className="bg-muted absolute inset-0 rounded-lg"
												layoutId="navbar-hover"
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												exit={{ opacity: 0 }}
												transition={{
													type: "spring",
													stiffness: 400,
													damping: 30,
												}}
											/>
										)}
										<span className="relative z-10">{item.name}</span>
									</Link>
								</motion.div>
							))}
						</nav>

						<div className="flex items-center space-x-3">
							{/* <ToggleTheme /> */}
							<AnimatedThemeToggler />

							<motion.div className="hidden items-center space-x-3 lg:flex" variants={itemVariants}>
								<motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
									<Link prefetch={false} href="/sign-in">
										<Button className="cursor-pointer">Sign In</Button>
									</Link>
								</motion.div>
							</motion.div>
						</div>

						<motion.button
							className="text-foreground hover:bg-muted rounded-lg p-2 transition-colors duration-200 lg:hidden"
							onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
							variants={itemVariants}
							whileTap={{ scale: 0.95 }}
						>
							{isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
						</motion.button>
					</div>
				</div>
			</motion.header>

			<AnimatePresence>
				{isMobileMenuOpen && (
					<>
						<motion.div
							className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsMobileMenuOpen(false)}
						/>
						<motion.div
							className="border-border bg-background fixed top-16 right-4 z-50 w-80 overflow-hidden rounded-2xl border shadow-2xl lg:hidden"
							variants={mobileMenuVariants}
							initial="closed"
							animate="open"
							exit="closed"
						>
							<div className="space-y-6 p-6">
								<div className="space-y-1">
									{navItems.map((item) => (
										<motion.div key={item.name} variants={mobileItemVariants}>
											<Link
												prefetch={false}
												href={item.href}
												className="text-foreground hover:bg-muted block rounded-lg px-4 py-3 font-medium transition-colors duration-200"
												onClick={() => setIsMobileMenuOpen(false)}
											>
												{item.name}
											</Link>
										</motion.div>
									))}
								</div>

								<motion.div className="border-border space-y-3 border-t pt-6" variants={mobileItemVariants}>
									<Link
										prefetch={false}
										href="/sign-in"
										className="text-foreground hover:bg-muted block w-full rounded-lg py-3 text-center font-medium transition-colors duration-200"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										Sign In
									</Link>
									<Link
										prefetch={false}
										href="/sign-in"
										className="bg-foreground text-background hover:bg-foreground/90 block w-full rounded-lg py-3 text-center font-medium transition-all duration-200"
										onClick={() => setIsMobileMenuOpen(false)}
									>
										Get Started
									</Link>
								</motion.div>
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>
		</>
	);
}
