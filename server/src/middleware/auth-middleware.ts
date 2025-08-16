import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "../lib/auth";
import { logger } from "../lib/logger";
import type { Session, User } from "../generated/prisma";

declare global {
	namespace Express {
		interface Request {
			session?: Session;
			user?: User;
		}
	}
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
	try {
		const session = await auth.api.getSession({
			headers: fromNodeHeaders(req.headers),
		});
		if (!session) {
			return res.status(401).json({ message: "Unauthorized", status: 401 });
		}

		req.session = session.session as Session;
		req.user = session.user as User;
		next();
	} catch (err) {
		logger.error(err, "Auth validation failed:");
		res.status(500).json({ message: "Failed to validate session", status: 500 });
	}
}
