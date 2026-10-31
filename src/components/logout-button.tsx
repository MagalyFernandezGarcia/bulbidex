import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export const LogoutButton = () => (
  <form action={logout}>
    <Button type="submit" variant="ghost" size="sm" aria-label="Déconnexion">
      <LogOut />
      <span className="hidden sm:inline">Déconnexion</span>
    </Button>
  </form>
);
