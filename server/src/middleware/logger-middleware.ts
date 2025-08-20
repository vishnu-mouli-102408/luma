import type { NextFunction, Request, Response } from "express";
import { logger } from "../lib/logger";

export const loggerMiddleware = (req: Request, res: Response, next: NextFunction) => {
	logger.info({
		message: "Request received",
		method: req.method,
		url: req.url,
		body: req.body,
	});
	next();
};
