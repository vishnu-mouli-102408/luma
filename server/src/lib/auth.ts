import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import dotenv from "dotenv";
import { prisma } from "./db";

dotenv.config();

export const auth = betterAuth({
	secret: process.env.BETTER_AUTH_SECRET as string,
	trustedOrigins: [
		"http://localhost:3000",
		"https://luma-nu.vercel.app",
		"https://luma-8sjf.onrender.com",
		"http://localhost:8080",
	],
	database: prismaAdapter(prisma, {
		provider: "postgresql",
	}),
	// basePath: process.env.BETTER_AUTH_URL as string,
	socialProviders: {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID as string,
			clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
		},
		google: {
			clientId: process.env.GOOGLE_CLIENT_ID as string,
			clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
		},
	},
	advanced: {
		defaultCookieAttributes: {
			sameSite: "None",
			secure: true,
		},
		useSecureCookies: true,
	},
});
