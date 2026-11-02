export const MCP_PATH = "/api/mcp";
export const PROTECTED_RESOURCE_METADATA_PATH = `/.well-known/oauth-protected-resource${MCP_PATH}`;
export const AUTHORIZATION_PATH = "/oauth/authorize";
export const TOKEN_PATH = "/api/oauth/token";
export const REGISTRATION_PATH = "/api/oauth/register";

export const OAUTH_SCOPES = ["plants", "offline_access"];

export const getMcpResourceUrl = (origin: string) => `${origin}${MCP_PATH}`;
