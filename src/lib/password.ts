import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { environment } from "@/lib/environment";

const FAILED_PASSWORD_DELAY_IN_MILLISECONDS = 1000;

const hashValue = (value: string) => createHash("sha256").update(value).digest();

export const verifyAppPassword = async (password: unknown) => {
  const isCorrect =
    typeof password === "string" &&
    timingSafeEqual(hashValue(password), hashValue(environment.APP_PASSWORD));
  if (!isCorrect) await setTimeout(FAILED_PASSWORD_DELAY_IN_MILLISECONDS);
  return isCorrect;
};
