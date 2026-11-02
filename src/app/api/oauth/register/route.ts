import { z } from "zod";
import { isAllowedRedirectUri } from "@/lib/oauth/clients";
import { signRegisteredClientId } from "@/lib/oauth/tokens";

const registrationRequestSchema = z.object({
  redirect_uris: z.array(z.string()).min(1).max(10),
  client_name: z.string().max(200).optional(),
  token_endpoint_auth_method: z.literal("none").optional(),
});

const registrationError = (error: string, description: string) =>
  Response.json(
    { error, error_description: description },
    { status: 400, headers: { "Cache-Control": "no-store" } },
  );

export const POST = async (request: Request) => {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return registrationError("invalid_client_metadata", "Invalid JSON body.");
  }

  const result = registrationRequestSchema.safeParse(body);
  if (!result.success) {
    return registrationError(
      "invalid_client_metadata",
      "redirect_uris is required and only public clients are supported.",
    );
  }

  const { redirect_uris: redirectUris, client_name: clientName } = result.data;
  if (!redirectUris.every(isAllowedRedirectUri)) {
    return registrationError("invalid_redirect_uri", "Only Claude callback URLs are allowed.");
  }

  const clientId = await signRegisteredClientId({
    redirect_uris: redirectUris,
    client_name: clientName,
  });

  return Response.json(
    {
      client_id: clientId,
      client_id_issued_at: Math.floor(Date.now() / 1000),
      client_name: clientName,
      redirect_uris: redirectUris,
      token_endpoint_auth_method: "none",
      grant_types: ["authorization_code", "refresh_token"],
      response_types: ["code"],
    },
    { status: 201, headers: { "Cache-Control": "no-store" } },
  );
};
