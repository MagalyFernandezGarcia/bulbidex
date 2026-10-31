import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { environment } from "@/lib/environment";
import {
  isValidSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_DURATION_IN_SECONDS,
  signSessionToken,
} from "@/lib/session-token";

export const createSession = async () => {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, await signSessionToken(), {
    httpOnly: true,
    secure: environment.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION_IN_SECONDS,
  });
};

export const deleteSession = async () => {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
};

export const hasValidSession = async () => {
  const cookieStore = await cookies();
  return isValidSessionToken(cookieStore.get(SESSION_COOKIE_NAME)?.value);
};

export const requireSession = async () => {
  if (!(await hasValidSession())) redirect("/login");
};
