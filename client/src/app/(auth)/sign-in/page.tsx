"use client";

import { useState } from "react";

import { authClient } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import Icons from "@/components/global/icons";

export default function SignInPage() {
	const [loading, setLoading] = useState<"github" | "google" | null>(null);

	const { data: session } = authClient.useSession();

	console.log("SESSION", session);

	const handleSignIn = async (provider: "github" | "google") => {
		setLoading(provider);
		try {
			await authClient.signIn.social({
				provider,
				callbackURL: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
			});
		} catch (e) {
			console.log("ERROR IN SIGN IN", e);
		} finally {
			setLoading(null);
		}
	};

	return (
		<div className="flex min-h-screen items-center justify-center bg-background">
			<Card className="w-full max-w-sm animate-fade-in shadow-lg border border-border/60 bg-sidebar">
				<CardHeader>
					<CardTitle className="text-center text-2xl font-bold">Sign in to your account</CardTitle>
				</CardHeader>
				<CardContent className="flex flex-col gap-4">
					<Button
						variant="outline"
						size="lg"
						className="w-full flex cursor-pointer font-medium items-center gap-2"
						onClick={() => handleSignIn("github")}
						disabled={loading === "github"}
						aria-label="Sign in with GitHub"
					>
						{loading === "github" ? <Spinner variant="circle" /> : <Icons.github />}
						Continue with GitHub
					</Button>
					<div className="relative flex items-center justify-center">
						<span className="absolute left-0 w-full border-t border-border/40" />
						<span className="bg-background px-2 py-1 font-medium rounded-lg text-xs text-muted-foreground z-10">
							or
						</span>
					</div>
					<Button
						variant="outline"
						size="lg"
						className="w-full flex cursor-pointer font-medium items-center gap-2"
						onClick={() => handleSignIn("google")}
						disabled={loading === "google"}
						aria-label="Sign in with Google"
					>
						{loading === "google" ? <Spinner variant="circle" /> : <Icons.google />}
						Continue with Google
					</Button>
				</CardContent>
			</Card>
		</div>
	);
}
