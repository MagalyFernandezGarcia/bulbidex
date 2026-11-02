import "server-only";
import { createHash } from "node:crypto";
import { z } from "zod";
import { verifyRegisteredClientId } from "@/lib/oauth/tokens";

const CLAUDE_CALLBACK_URL = "https://claude.ai/api/mcp/auth_callback";
const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1"]);
const CLIENT_METADATA_DOMAINS = ["claude.ai", "claude.com", "anthropic.com"];
const CLIENT_METADATA_TIMEOUT_IN_MILLISECONDS = 5000;

export type OAuthClient = {
  clientId: string;
  clientName: string;
  redirectUris: string[];
};

const parseUrl = (value: string) => {
  try {
    return new URL(value);
  } catch {
    return null;
  }
};

const isTrustedClientMetadataHost = (hostname: string) =>
  CLIENT_METADATA_DOMAINS.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`));

const isLoopbackCallback = (url: URL) =>
  url.protocol === "http:" &&
  LOOPBACK_HOSTNAMES.has(url.hostname) &&
  url.pathname === "/callback" &&
  url.search === "" &&
  url.hash === "";

export const isAllowedRedirectUri = (redirectUri: string) => {
  if (redirectUri === CLAUDE_CALLBACK_URL) return true;
  const url = parseUrl(redirectUri);
  return url !== null && isLoopbackCallback(url);
};

const withoutPort = (url: URL) => `${url.protocol}//${url.hostname}${url.pathname}`;

export const isRegisteredRedirectUri = (client: OAuthClient, redirectUri: string) => {
  if (!isAllowedRedirectUri(redirectUri)) return false;
  const requestedUrl = parseUrl(redirectUri);
  return client.redirectUris.some((registeredUri) => {
    if (registeredUri === redirectUri) return true;
    const registeredUrl = parseUrl(registeredUri);
    return (
      requestedUrl !== null &&
      registeredUrl !== null &&
      isLoopbackCallback(requestedUrl) &&
      isLoopbackCallback(registeredUrl) &&
      withoutPort(requestedUrl) === withoutPort(registeredUrl)
    );
  });
};

const clientMetadataDocumentSchema = z.object({
  client_id: z.string(),
  redirect_uris: z.array(z.string()).min(1),
});

const fetchClientMetadataDocument = async (clientUrl: URL): Promise<OAuthClient | null> => {
  try {
    const response = await fetch(clientUrl, {
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(CLIENT_METADATA_TIMEOUT_IN_MILLISECONDS),
      headers: { Accept: "application/json" },
    });
    if (!response.ok) return null;
    const result = clientMetadataDocumentSchema.safeParse(await response.json());
    if (!result.success || result.data.client_id !== clientUrl.href) return null;
    return {
      clientId: result.data.client_id,
      clientName: clientUrl.hostname,
      redirectUris: result.data.redirect_uris,
    };
  } catch {
    return null;
  }
};

export const resolveClient = async (clientId: string): Promise<OAuthClient | null> => {
  const clientUrl = parseUrl(clientId);
  if (clientUrl !== null && clientUrl.protocol === "https:") {
    if (!isTrustedClientMetadataHost(clientUrl.hostname)) return null;
    return fetchClientMetadataDocument(clientUrl);
  }

  const registeredClient = await verifyRegisteredClientId(clientId);
  if (!registeredClient) return null;
  return {
    clientId,
    clientName: registeredClient.client_name ?? "Client MCP",
    redirectUris: registeredClient.redirect_uris,
  };
};

export const isValidCodeVerifier = (codeVerifier: string, codeChallenge: string) =>
  /^[A-Za-z0-9\-._~]{43,128}$/.test(codeVerifier) &&
  createHash("sha256").update(codeVerifier).digest("base64url") === codeChallenge;
