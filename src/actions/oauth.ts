"use server";

import { redirect } from "next/navigation";
import {
  buildRedirectUrl,
  getRequestOrigin,
  validateAuthorizationRequest,
} from "@/lib/oauth/authorization-request";
import { signAuthorizationCode } from "@/lib/oauth/tokens";
import { verifyAppPassword } from "@/lib/password";

export type AuthorizeState = {
  error?: string;
};

export const authorizeConnection = async (_previousState: AuthorizeState, formData: FormData) => {
  const validation = await validateAuthorizationRequest(Object.fromEntries(formData));
  if (!validation.isValid) return { error: validation.message };
  const { request } = validation;

  if (formData.get("decision") !== "allow") {
    redirect(buildRedirectUrl(request, { error: "access_denied", iss: await getRequestOrigin() }));
  }

  if (!(await verifyAppPassword(formData.get("password")))) {
    return { error: "Mot de passe incorrect." };
  }

  const code = await signAuthorizationCode({
    client_id: request.clientId,
    redirect_uri: request.redirectUri,
    code_challenge: request.codeChallenge,
    resource: request.resource,
    scope: request.scope,
  });
  redirect(buildRedirectUrl(request, { code, iss: await getRequestOrigin() }));
};
