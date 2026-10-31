import { Metadata } from "next";
import { LoginForm } from "@/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Connexion",
};

const LoginPage = () => (
  <main className="flex flex-1 items-center justify-center p-4">
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Bulbidex</CardTitle>
        <CardDescription>Entrez votre mot de passe pour accéder à votre jardin.</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  </main>
);

export default LoginPage;
