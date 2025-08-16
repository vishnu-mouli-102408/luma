"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Spinner } from "@/components/ui/spinner";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && session) {
			let returnTo = "/dashboard";
			if (typeof window !== "undefined") {
				const ref = document.referrer;
				if (ref && ref.startsWith(window.location.origin)) {
					try {
						const url = new URL(ref);
						returnTo = `${url.pathname}${url.search}${url.hash}` || returnTo;
					} catch {
						returnTo = "/dashboard";
					}
				}
			}
			router.replace(returnTo);
		}
	}, [isPending, session, router]);

	if (isPending || session)
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Spinner variant="circle-filled" />
			</div>
		);

	return <>{children}</>;
}
