import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { toNodeHandler } from "better-auth/node";
import apiRoutes from "./src/routes";
import { rateLimiter } from "./src/lib/rate-limiter";
import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW } from "./src/constants/helper";
import { logger } from "./src/lib/logger";
import { auth } from "./src/lib/auth";
import { authenticate } from "./src/middleware/auth-middleware";

dotenv.config();

function main() {
	const PORT = process.env.PORT || 8080;

	const app = express();
	app.use(
		cors({
			origin: ["http://localhost:3000", "http://localhost:8080"],
			methods: ["GET", "POST", "PUT", "DELETE"],
			credentials: true,
		})
	);
	app.all("/api/auth/{*any}", toNodeHandler(auth));
	app.use("/api", authenticate);
	app.use(rateLimiter({ windowInSeconds: RATE_LIMIT_WINDOW, maxRequests: RATE_LIMIT_MAX_REQUESTS }));
	app.use(express.json());
	app.use("/api", apiRoutes);

	app.listen(PORT, () => {
		logger.info(`Server is running on port ${PORT}`);
	});
}

main();
