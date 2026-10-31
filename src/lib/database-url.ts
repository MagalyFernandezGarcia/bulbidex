const LEGACY_SSL_MODES = new Set(["prefer", "require", "verify-ca"]);

export const getDatabaseConnectionString = (databaseUrl: string) => {
  const url = new URL(databaseUrl);
  const sslMode = url.searchParams.get("sslmode");
  if (sslMode !== null && LEGACY_SSL_MODES.has(sslMode)) {
    url.searchParams.set("sslmode", "verify-full");
  }
  return url.toString();
};
