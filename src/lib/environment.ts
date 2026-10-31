import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.url(),
  APP_PASSWORD: z.string().min(1),
  SESSION_SECRET: z.string().min(32),
  BLOB_READ_WRITE_TOKEN: z.string().min(1),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const environment = environmentSchema.parse(process.env);
