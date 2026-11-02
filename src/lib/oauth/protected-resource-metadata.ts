import { generateProtectedResourceMetadata, getPublicOrigin } from "mcp-handler";
import { getMcpResourceUrl } from "@/lib/oauth/endpoints";

export const getProtectedResourceMetadata = (request: Request) => {
  const origin = getPublicOrigin(request);
  return Response.json(
    generateProtectedResourceMetadata({
      authServerUrls: [origin],
      resourceUrl: getMcpResourceUrl(origin),
      additionalMetadata: {
        scopes_supported: ["plants"],
        bearer_methods_supported: ["header"],
        resource_name: "Bulbidex",
      },
    }),
    { headers: { "Access-Control-Allow-Origin": "*" } },
  );
};
