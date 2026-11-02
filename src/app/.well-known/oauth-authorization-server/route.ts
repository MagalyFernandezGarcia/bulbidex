import { getPublicOrigin } from "mcp-handler";
import {
  AUTHORIZATION_PATH,
  OAUTH_SCOPES,
  REGISTRATION_PATH,
  TOKEN_PATH,
} from "@/lib/oauth/endpoints";

export const GET = (request: Request) => {
  const origin = getPublicOrigin(request);
  return Response.json(
    {
      issuer: origin,
      authorization_endpoint: `${origin}${AUTHORIZATION_PATH}`,
      token_endpoint: `${origin}${TOKEN_PATH}`,
      registration_endpoint: `${origin}${REGISTRATION_PATH}`,
      scopes_supported: OAUTH_SCOPES,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"],
      token_endpoint_auth_methods_supported: ["none"],
      client_id_metadata_document_supported: true,
      authorization_response_iss_parameter_supported: true,
    },
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
};
