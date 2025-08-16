import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/components/global/providers";

export const metadata: Metadata = {
	title: "Luma",
	icons: [{ rel: "icon", url: "/favicon/favicon.ico" }],
	description:
		"Meet your AI therapy companion—blending the warmth of a friend with the insight of a guide, so you never have to face life's challenges alone",
};

export const viewport: Viewport = {
	maximumScale: 1, // Disable auto-zoom on mobile Safari, credit to https://github.com/ai-ng
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
				<link rel="icon" type="image/svg+xml" href="/favicon/favicon.svg" />
				<link rel="shortcut icon" href="/favicon/favicon.ico" />
				<link rel="apple-touch-icon" sizes="180x180" href="/favicon/apple-touch-icon.png" />
				<meta name="apple-mobile-web-app-title" content="Luma" />
				<link rel="manifest" href="/favicon/site.webmanifest" />
			</head>
			<body className={`antialiased`}>
				<Providers>{children}</Providers>
				<Toaster closeButton position="bottom-center" theme="system" richColors />
			</body>
		</html>
	);
}
