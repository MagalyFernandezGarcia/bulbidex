import { LogOut } from "lucide-react";
import { logout } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export const LogoutButton = () => (
  <form action={logout}>
    <Button type="submit" variant="ghost" size="sm">
      <LogOut />
      Déconnexion
    </Button>
  </form>
);
