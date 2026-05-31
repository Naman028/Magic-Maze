import { z } from "zod";

const millisecondsPerMinute = 60_000;

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(8000),
  CORS_ORIGIN: z.string().optional(),
  ROOM_TTL_MINUTES: z.coerce.number().int().positive().default(120),
  ROOM_CLEANUP_INTERVAL_MINUTES: z.coerce.number().int().positive().default(15),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const message = parsed.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`).join("; ");
  throw new Error(`Invalid environment configuration: ${message}`);
}

const env = parsed.data;

if (env.NODE_ENV === "production" && !env.CORS_ORIGIN) {
  throw new Error("CORS_ORIGIN must be set when NODE_ENV=production.");
}

export const config = {
  nodeEnv: env.NODE_ENV,
  port: env.PORT,
  corsOrigin: env.CORS_ORIGIN ?? "*",
  roomTtlMs: env.ROOM_TTL_MINUTES * millisecondsPerMinute,
  roomCleanupIntervalMs: env.ROOM_CLEANUP_INTERVAL_MINUTES * millisecondsPerMinute,
  isProduction: env.NODE_ENV === "production",
};
