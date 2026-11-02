import { getPublicOrigin } from "mcp-handler";
import { isValidCodeVerifier } from "@/lib/oauth/clients";
import { getMcpResourceUrl } from "@/lib/oauth/endpoints";
import {
  ACCESS_TOKEN_DURATION_IN_SECONDS,
  GrantClaims,
  signAccessToken,
  signRefreshToken,
  verifyAuthorizationCode,
  verifyRefreshToken,
} from "@/lib/oauth/tokens";

const NO_STORE_HEADERS = { "Cache-Control": "no-store", Pragma: "no-cache" };

const tokenError = (error: string, description: string) =>
  Response.json(
    { error, error_description: description },
    { status: 400, headers: NO_STORE_HEADERS },
  );

const issueTokens = async (grant: GrantClaims) =>
  Response.json(
    {
      access_token: await signAccessToken(grant),
      token_type: "Bearer",
      expires_in: ACCESS_TOKEN_DURATION_IN_SECONDS,
      refresh_token: await signRefreshToken(grant),
      scope: grant.scope,
    },
    { headers: NO_STORE_HEADERS },
  );

const getStringParameter = (formData: FormData, name: string) => {
  const value = formData.get(name);
  return typeof value === "string" && value !== "" ? value : null;
};

const exchangeAuthorizationCode = async (formData: FormData, expectedResource: string) => {
  const code = getStringParameter(formData, "code");
  const codeVerifier = getStringParameter(formData, "code_verifier");
  const clientId = getStringParameter(formData, "client_id");
  const redirectUri = getStringParameter(formData, "redirect_uri");
  const resource = getStringParameter(formData, "resource");
  if (!code || !codeVerifier || !clientId || !redirectUri) {
    return tokenError(
      "invalid_request",
      "code, code_verifier, client_id and redirect_uri are required.",
    );
  }

  const authorizationCode = await verifyAuthorizationCode(code);
  if (
    !authorizationCode ||
    authorizationCode.client_id !== clientId ||
    authorizationCode.redirect_uri !== redirectUri ||
    authorizationCode.resource !== expectedResource ||
    (resource !== null && resource !== expectedResource) ||
    !isValidCodeVerifier(codeVerifier, authorizationCode.code_challenge)
  ) {
    return tokenError("invalid_grant", "The authorization code is invalid or expired.");
  }

  return issueTokens({
    client_id: authorizationCode.client_id,
    resource: authorizationCode.resource,
    scope: authorizationCode.scope,
  });
};

const refreshTokens = async (formData: FormData, expectedResource: string) => {
  const refreshToken = getStringParameter(formData, "refresh_token");
  const clientId = getStringParameter(formData, "client_id");
  const resource = getStringParameter(formData, "resource");
  if (!refreshToken) return tokenError("invalid_request", "refresh_token is required.");

  const grant = await verifyRefreshToken(refreshToken);
  if (
    !grant ||
    grant.resource !== expectedResource ||
    (clientId !== null && grant.client_id !== clientId) ||
    (resource !== null && resource !== expectedResource)
  ) {
    return tokenError("invalid_grant", "The refresh token is invalid or expired.");
  }

  return issueTokens({ client_id: grant.client_id, resource: grant.resource, scope: grant.scope });
};

export const POST = async (request: Request) => {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return tokenError("invalid_request", "Expected an application/x-www-form-urlencoded body.");
  }

  const expectedResource = getMcpResourceUrl(getPublicOrigin(request));
  const grantType = getStringParameter(formData, "grant_type");
  if (grantType === "authorization_code") {
    return exchangeAuthorizationCode(formData, expectedResource);
  }
  if (grantType === "refresh_token") return refreshTokens(formData, expectedResource);
  return tokenError("unsupported_grant_type", "Use authorization_code or refresh_token.");
};
