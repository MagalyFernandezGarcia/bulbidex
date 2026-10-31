import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

const NotFound = () => (
  <div className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
    <h1 className="text-2xl font-semibold tracking-tight">Page introuvable</h1>
    <p className="text-muted-foreground">Cette page ou cette plante n&apos;existe pas.</p>
    <Link href="/plants" className={buttonVariants({ variant: "outline" })}>
      Retour aux plantes
    </Link>
  </div>
);

export default NotFound;
