import "server-only";
import { headers } from "next/headers";
import { z } from "zod";
import { isRegisteredRedirectUri, OAuthClient, resolveClient } from "@/lib/oauth/clients";
import { getMcpResourceUrl } from "@/lib/oauth/endpoints";

const authorizationRequestSchema = z.object({
  response_type: z.literal("code"),
  client_id: z.string().min(1),
  redirect_uri: z.string().min(1),
  code_challenge: z.string().regex(/^[A-Za-z0-9\-_]{43,128}$/),
  code_challenge_method: z.literal("S256"),
  state: z.string().max(2000).optional(),
  scope: z.string().max(500).optional(),
  resource: z.string().optional(),
});

export type AuthorizationRequest = {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  state: string | undefined;
  scope: string;
  resource: string;
};

export type AuthorizationRequestValidation =
  | { isValid: true; request: AuthorizationRequest; client: OAuthClient }
  | { isValid: false; message: string };

const getSingleValue = (value: unknown) => (Array.isArray(value) ? value[0] : value);

export const getRequestOrigin = async () => {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost";
  const protocol =
    headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
};

export const validateAuthorizationRequest = async (
  parameters: Record<string, unknown>,
): Promise<AuthorizationRequestValidation> => {
  const result = authorizationRequestSchema.safeParse(
    Object.fromEntries(
      Object.entries(parameters).map(([name, value]) => [name, getSingleValue(value)]),
    ),
  );
  if (!result.success) {
    return { isValid: false, message: "La demande d'autorisation est incomplète ou invalide." };
  }

  const expectedResource = getMcpResourceUrl(await getRequestOrigin());
  if (result.data.resource !== undefined && result.data.resource !== expectedResource) {
    return { isValid: false, message: "Cette demande ne concerne pas ce serveur Bulbidex." };
  }

  const client = await resolveClient(result.data.client_id);
  if (!client || !isRegisteredRedirectUri(client, result.data.redirect_uri)) {
    return { isValid: false, message: "Cette application n'est pas autorisée à se connecter." };
  }

  return {
    isValid: true,
    client,
    request: {
      clientId: result.data.client_id,
      redirectUri: result.data.redirect_uri,
      codeChallenge: result.data.code_challenge,
      state: result.data.state,
      scope: result.data.scope ?? "plants",
      resource: expectedResource,
    },
  };
};

export const buildRedirectUrl = (
  request: AuthorizationRequest,
  parameters: Record<string, string>,
) => {
  const url = new URL(request.redirectUri);
  for (const [name, value] of Object.entries(parameters)) url.searchParams.set(name, value);
  if (request.state !== undefined) url.searchParams.set("state", request.state);
  return url.toString();
};
