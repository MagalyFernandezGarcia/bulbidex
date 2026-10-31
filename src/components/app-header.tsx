import { Leaf, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { LogoutButton } from "@/components/logout-button";
import { NAVIGATION_ITEMS } from "@/components/navigation-items";
import { NavigationLinks } from "@/components/navigation-links";
import { buttonVariants } from "@/components/ui/button";

const NavigationLinksFallback = () => (
  <>
    {NAVIGATION_ITEMS.map(({ href, label, icon: Icon }) => (
      <Link
        key={href}
        href={href}
        className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted-foreground"
      >
        <Icon className="size-4" />
        <span className="hidden sm:inline">{label}</span>
      </Link>
    ))}
  </>
);

export const AppHeader = () => (
  <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur">
    <div className="mx-auto flex h-14 w-full max-w-4xl items-center gap-2 px-4">
      <Link href="/" className="mr-2 flex items-center gap-1.5 font-semibold">
        <Leaf className="size-5 text-green-700" />
        <span className="hidden sm:inline">Bulbidex</span>
      </Link>
      <nav className="flex items-center gap-1">
        <Suspense fallback={<NavigationLinksFallback />}>
          <NavigationLinks />
        </Suspense>
      </nav>
      <div className="ml-auto flex items-center gap-1">
        <Link href="/plants/new" className={buttonVariants({ size: "sm" })}>
          <Plus />
          <span className="hidden sm:inline">Ajouter</span>
        </Link>
        <LogoutButton />
      </div>
    </div>
  </header>
);
