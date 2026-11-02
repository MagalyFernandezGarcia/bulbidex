"use server";

import { redirect } from "next/navigation";
import { verifyAppPassword } from "@/lib/password";
import { createSession, deleteSession } from "@/lib/session";

export type LoginState = {
  error?: string;
};

export const login = async (_previousState: LoginState, formData: FormData) => {
  if (!(await verifyAppPassword(formData.get("password")))) {
    return { error: "Mot de passe incorrect." };
  }

  await createSession();
  redirect("/");
};

export const logout = async () => {
  await deleteSession();
  redirect("/login");
};
