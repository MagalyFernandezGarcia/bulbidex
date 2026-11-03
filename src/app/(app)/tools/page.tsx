import { Metadata } from "next";
import { Suspense } from "react";
import { GardenToolDialog } from "@/components/garden-tool-dialog";
import { GardenToolList } from "@/components/garden-tool-list";

export const metadata: Metadata = {
  title: "Outils",
};

const ToolsPage = () => (
  <div className="flex flex-col gap-6">
    <div className="flex items-center justify-between gap-2">
      <h1 className="text-2xl font-semibold tracking-tight">Outils</h1>
      <GardenToolDialog />
    </div>
    <Suspense fallback={<p className="text-muted-foreground">Chargement des outils…</p>}>
      <GardenToolList />
    </Suspense>
  </div>
);

export default ToolsPage;
