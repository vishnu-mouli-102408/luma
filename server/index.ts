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
import { inngest } from "./src/inngest/client";
import { serve } from "inngest/express";
import helmet from "helmet";
import { errorHandler } from "./src/middleware/error-handler";
import { loggerMiddleware } from "./src/middleware/logger-middleware";
import { functions as inngestFunctions } from "./src/inngest/functions";

dotenv.config();

function main() {
	try {
		const PORT = process.env.PORT || 8080;

		const app = express();
		app.use(
			cors({
				origin: ["http://localhost:3000", "http://localhost:8080"],
				methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
				credentials: true,
			})
		);
		app.all("/api/auth/{*any}", toNodeHandler(auth));
		app.use(express.json());
		app.use(helmet()); // Security headers
		// app.use(loggerMiddleware); // Logger middleware
		app.use(errorHandler); // Error handling middleware

		// Set up Inngest endpoint
		app.use("/api/inngest", serve({ client: inngest, functions: inngestFunctions }));

		app.use("/api", authenticate); // Authentication middleware
		app.use(rateLimiter({ windowInSeconds: RATE_LIMIT_WINDOW, maxRequests: RATE_LIMIT_MAX_REQUESTS })); // Rate limiting middleware
		app.use("/api", apiRoutes);
		app.get("/health", (req, res) => {
			res.status(200).json({ message: "Server is running" });
		});

		app.listen(PORT, () => {
			logger.info(`Server is running on port ${PORT}`);
			logger.info(`Inngest endpoint is running on http://localhost:${PORT}/api/inngest`);
		});
	} catch (error) {
		logger.error(error, "Error starting server");
		process.exit(1);
	}
}

main();
