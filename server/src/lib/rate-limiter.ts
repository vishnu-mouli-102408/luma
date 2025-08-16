import { type Request, type Response, type NextFunction } from "express";
import { logger } from "./logger";
import { getRedisClient } from "./redis";

interface RateLimiterOptions {
	windowInSeconds: number; // e.g., 60 seconds
	maxRequests: number; // e.g., 10 requests per window
}

export function rateLimiter({ windowInSeconds, maxRequests }: RateLimiterOptions) {
	const redis = getRedisClient();

	return async (req: Request, res: Response, next: NextFunction) => {
		try {
			const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
			const key = `rate_limit:${ip}`;

			// Increment request count for this IP
			const current = await redis.incr(key);

			if (current === 1) {
				// First request → set expiry time
				await redis.expire(key, windowInSeconds);
			}

			if (current > maxRequests) {
				const ttl = await redis.ttl(key);
				return res.status(429).json({
					error: "Too many requests. Please try again later.",
					retryAfter: ttl,
				});
			}

			next();
		} catch (error) {
			logger.error(error, "Rate limiter error:");
			// Allow request if Redis is down
			next();
		}
	};
}
