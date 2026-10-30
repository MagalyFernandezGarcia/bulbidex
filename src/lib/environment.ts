import { z } from "zod";

const environmentSchema = z.object({
  DATABASE_URL: z.url(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});

export const environment = environmentSchema.parse(process.env);
