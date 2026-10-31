"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { setTimeout } from "node:timers/promises";
import { redirect } from "next/navigation";
import { environment } from "@/lib/environment";
import { createSession, deleteSession } from "@/lib/session";

export type LoginState = {
  error?: string;
};

const FAILED_LOGIN_DELAY_IN_MILLISECONDS = 1000;

const hashValue = (value: string) => createHash("sha256").update(value).digest();

const isCorrectPassword = (password: string) =>
  timingSafeEqual(hashValue(password), hashValue(environment.APP_PASSWORD));

export const login = async (_previousState: LoginState, formData: FormData) => {
  const password = formData.get("password");

  if (typeof password !== "string" || !isCorrectPassword(password)) {
    await setTimeout(FAILED_LOGIN_DELAY_IN_MILLISECONDS);
    return { error: "Mot de passe incorrect." };
  }

  await createSession();
  redirect("/");
};

export const logout = async () => {
  await deleteSession();
  redirect("/login");
};
