import z from "zod";
import type { AppConfig as ClientAppConfig } from "./client";
import clientConfig, { envSchema as clientEnvSchema } from "./client";

const envSchema = z
  .object({
    DATABASE_URL: z.url(),
    SECRET_KEY: z.string().min(32),
    CHAINHOOKS_API_KEY: z.string().min(32),
  })
  .extend(clientEnvSchema.shape);

export type AppConfig = ClientAppConfig & {
  databaseUrl: string;
  secretKey: string;
  chainhooksApiKey: string;
};

const unparsedEnv = {
  DATABASE_URL: process.env.DATABASE_URL,
  SECRET_KEY: process.env.SECRET_KEY,
  CHAINHOOKS_API_KEY: process.env.CHAINHOOKS_API_KEY,
};

const parsed = envSchema.safeParse(unparsedEnv);

if (!parsed.success) {
  let message = "Invalid environment variables:";
  for (const issue of parsed.error.issues) {
    message += `\n${issue.path.join(".")}: ${issue.message}`;
  }
  throw new Error(message);
}

const config: AppConfig = {
  ...clientConfig,
  databaseUrl: parsed.data.DATABASE_URL,
  secretKey: parsed.data.SECRET_KEY,
  chainhooksApiKey: parsed.data.CHAINHOOKS_API_KEY,
};

export default config;
