"use client";

import { useActionState } from "react";
import { authorizeConnection, AuthorizeState } from "@/actions/oauth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type AuthorizeConnectionFormProps = {
  parameters: Record<string, string>;
};

const initialState: AuthorizeState = {};

export const AuthorizeConnectionForm = ({ parameters }: AuthorizeConnectionFormProps) => {
  const [state, formAction, isPending] = useActionState(authorizeConnection, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      {Object.entries(parameters).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      <div className="flex flex-col gap-2">
        <Label htmlFor="password">Mot de passe Bulbidex</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          autoFocus
          aria-invalid={state.error ? true : undefined}
          aria-describedby={state.error ? "password-error" : undefined}
        />
        {state.error && (
          <p id="password-error" className="text-sm text-destructive">
            {state.error}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-2 sm:flex-row-reverse">
        <Button type="submit" name="decision" value="allow" disabled={isPending}>
          {isPending ? "Autorisation…" : "Autoriser"}
        </Button>
        <Button
          type="submit"
          name="decision"
          value="deny"
          variant="outline"
          formNoValidate
          disabled={isPending}
        >
          Refuser
        </Button>
      </div>
    </form>
  );
};
