"use client";

import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "../ui/spinner";

const AuthWrapper = ({ children }: { children: React.ReactNode }) => {
	const router = useRouter();
	const { data: session, isPending } = authClient.useSession();

	useEffect(() => {
		if (!isPending && !session) {
			router.replace("/sign-in");
		}
	}, [isPending, session, router]);

	if (isPending || !session)
		return (
			<div className="flex h-screen w-screen items-center justify-center">
				<Spinner variant="circle-filled" />
			</div>
		);

	return <>{children}</>;
};

export default AuthWrapper;
