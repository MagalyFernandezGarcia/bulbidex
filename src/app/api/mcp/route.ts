import { createMcpHandler, getPublicOrigin, withMcpAuth } from "mcp-handler";
import { registerPlantTools } from "@/lib/mcp/plant-tools";
import { getMcpResourceUrl, PROTECTED_RESOURCE_METADATA_PATH } from "@/lib/oauth/endpoints";
import { verifyAccessToken } from "@/lib/oauth/tokens";

const SERVER_INSTRUCTIONS =
  "Bulbidex is the user's personal garden app. All plant and care task text must be written in French. When the user asks to add a plant, check list_plants first to avoid duplicates. Photos cannot be added through this connector: tell the user to add them in the app using the returned url.";

const handleMcpRequest = (request: Request) => {
  const origin = getPublicOrigin(request);
  const handler = createMcpHandler((server) => registerPlantTools(server, origin), {
    serverInfo: { name: "bulbidex", version: "1.0.0" },
    instructions: SERVER_INSTRUCTIONS,
  });
  return handler(request);
};

const verifyBearerToken = async (request: Request, bearerToken?: string) => {
  if (!bearerToken) return undefined;
  const claims = await verifyAccessToken(bearerToken);
  if (!claims || claims.resource !== getMcpResourceUrl(getPublicOrigin(request))) {
    return undefined;
  }
  return {
    token: bearerToken,
    clientId: claims.client_id,
    scopes: claims.scope.split(" "),
    expiresAt: claims.exp,
  };
};

const authenticatedHandler = withMcpAuth(handleMcpRequest, verifyBearerToken, {
  required: true,
  resourceMetadataPath: PROTECTED_RESOURCE_METADATA_PATH,
});

export {
  authenticatedHandler as GET,
  authenticatedHandler as POST,
  authenticatedHandler as DELETE,
};
