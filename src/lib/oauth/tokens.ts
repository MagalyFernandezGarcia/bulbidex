import "server-only";
import { createHash, hkdfSync } from "node:crypto";
import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";
import { environment } from "@/lib/environment";

export const ACCESS_TOKEN_DURATION_IN_SECONDS = 60 * 60;
const REFRESH_TOKEN_DURATION_IN_SECONDS = 30 * 24 * 60 * 60;
const AUTHORIZATION_CODE_DURATION_IN_SECONDS = 2 * 60;

enum TokenUse {
  Client = "client",
  AuthorizationCode = "authorization_code",
  Access = "access",
  Refresh = "refresh",
}

const signingKey = new Uint8Array(
  hkdfSync(
    "sha256",
    environment.SESSION_SECRET,
    createHash("sha256").update(environment.APP_PASSWORD).digest(),
    "bulbidex-oauth",
    32,
  ),
);

const signToken = (
  tokenUse: TokenUse,
  claims: Record<string, unknown>,
  durationInSeconds: number | null,
) => {
  const token = new SignJWT({ ...claims, token_use: tokenUse })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt();
  if (durationInSeconds !== null) token.setExpirationTime(`${durationInSeconds}s`);
  return token.sign(signingKey);
};

const verifyToken = async <Claims extends z.ZodType>(
  token: string,
  tokenUse: TokenUse,
  claimsSchema: Claims,
): Promise<z.output<Claims> | null> => {
  try {
    const { payload } = await jwtVerify(token, signingKey, { algorithms: ["HS256"] });
    if (payload.token_use !== tokenUse) return null;
    const result = claimsSchema.safeParse(payload);
    return result.success ? result.data : null;
  } catch {
    return null;
  }
};

const registeredClientClaimsSchema = z.object({
  redirect_uris: z.array(z.string()).min(1),
  client_name: z.string().optional(),
});

export type RegisteredClientClaims = z.output<typeof registeredClientClaimsSchema>;

export const signRegisteredClientId = (claims: RegisteredClientClaims) =>
  signToken(TokenUse.Client, claims, null);

export const verifyRegisteredClientId = (clientId: string) =>
  verifyToken(clientId, TokenUse.Client, registeredClientClaimsSchema);

const grantClaimsSchema = z.object({
  client_id: z.string(),
  resource: z.string(),
  scope: z.string(),
});

const authorizationCodeClaimsSchema = grantClaimsSchema.extend({
  redirect_uri: z.string(),
  code_challenge: z.string(),
});

export type AuthorizationCodeClaims = z.output<typeof authorizationCodeClaimsSchema>;

export const signAuthorizationCode = (claims: AuthorizationCodeClaims) =>
  signToken(TokenUse.AuthorizationCode, claims, AUTHORIZATION_CODE_DURATION_IN_SECONDS);

export const verifyAuthorizationCode = (code: string) =>
  verifyToken(code, TokenUse.AuthorizationCode, authorizationCodeClaimsSchema);

export type GrantClaims = z.output<typeof grantClaimsSchema>;

export const signAccessToken = (claims: GrantClaims) =>
  signToken(TokenUse.Access, claims, ACCESS_TOKEN_DURATION_IN_SECONDS);

export const verifyAccessToken = (token: string) =>
  verifyToken(token, TokenUse.Access, grantClaimsSchema.extend({ exp: z.number() }));

export const signRefreshToken = (claims: GrantClaims) =>
  signToken(TokenUse.Refresh, claims, REFRESH_TOKEN_DURATION_IN_SECONDS);

export const verifyRefreshToken = (token: string) =>
  verifyToken(token, TokenUse.Refresh, grantClaimsSchema);
