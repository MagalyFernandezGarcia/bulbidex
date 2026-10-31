import { jwtVerify, SignJWT } from "jose";
import { environment } from "@/lib/environment";

export const SESSION_COOKIE_NAME = "bulbidex_session";

export const SESSION_DURATION_IN_SECONDS = 30 * 24 * 60 * 60;

const secretKey = new TextEncoder().encode(environment.SESSION_SECRET);

export const signSessionToken = () =>
  new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_IN_SECONDS}s`)
    .sign(secretKey);

export const isValidSessionToken = async (token: string | undefined) => {
  if (!token) return false;
  try {
    await jwtVerify(token, secretKey, { algorithms: ["HS256"] });
    return true;
  } catch {
    return false;
  }
};
