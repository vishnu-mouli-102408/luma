import pino, { type Logger as PinoLogger } from "pino";
import pretty from "pino-pretty";

// Create a global logger instance
export const logger: PinoLogger = pino(
	pretty({
		colorize: true,
	})
);
