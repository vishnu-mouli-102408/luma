import Redis from "ioredis";
import { logger } from "./logger";

let redis: Redis | null = null;

export function getRedisClient(): Redis {
	if (!redis) {
		redis = new Redis(process.env.REDIS_URL as string, {
			maxRetriesPerRequest: null, // optional: avoid retry limit issues
			enableReadyCheck: true, // ensures Redis is ready before commands
		});

		redis.on("connect", () => {
			logger.info("✅ Connected to Redis");
		});

		redis.on("error", (err) => {
			logger.error(err, "❌ Redis connection error:");
		});
	}

	return redis;
}
