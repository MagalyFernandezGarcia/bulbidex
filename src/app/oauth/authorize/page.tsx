import { Metadata } from "next";
import { Suspense } from "react";
import { AuthorizeConnectionForm } from "@/components/authorize-connection-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { validateAuthorizationRequest } from "@/lib/oauth/authorization-request";

export const metadata: Metadata = {
  title: "Autoriser une connexion",
};

type AuthorizationContentProps = {
  searchParams: PageProps<"/oauth/authorize">["searchParams"];
};

const AuthorizationContent = async ({ searchParams }: AuthorizationContentProps) => {
  const parameters = await searchParams;
  const validation = await validateAuthorizationRequest(parameters);

  if (!validation.isValid) {
    return (
      <CardContent>
        <p role="alert" className="text-sm text-destructive">
          {validation.message}
        </p>
      </CardContent>
    );
  }

  const { client, request } = validation;
  const formParameters: Record<string, string> = {
    response_type: "code",
    client_id: request.clientId,
    redirect_uri: request.redirectUri,
    code_challenge: request.codeChallenge,
    code_challenge_method: "S256",
    scope: request.scope,
    resource: request.resource,
    ...(request.state !== undefined && { state: request.state }),
  };

  return (
    <>
      <CardHeader>
        <CardTitle className="text-2xl">Autoriser {client.clientName} ?</CardTitle>
        <CardDescription>
          {client.clientName} pourra lire vos plantes, en ajouter et modifier leurs informations et
          tâches d&apos;entretien. Vous serez ensuite renvoyé vers{" "}
          <strong className="text-foreground">{new URL(request.redirectUri).host}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <AuthorizeConnectionForm parameters={formParameters} />
      </CardContent>
    </>
  );
};

const AuthorizePage = ({ searchParams }: PageProps<"/oauth/authorize">) => (
  <main className="flex flex-1 items-center justify-center p-4">
    <Card className="w-full max-w-sm">
      <Suspense
        fallback={
          <CardContent>
            <p className="text-sm text-muted-foreground">Vérification de la demande…</p>
          </CardContent>
        }
      >
        <AuthorizationContent searchParams={searchParams} />
      </Suspense>
    </Card>
  </main>
);

export default AuthorizePage;
