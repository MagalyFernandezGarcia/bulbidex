import { Metadata } from "next";
import { Suspense } from "react";
import { PlantList } from "@/components/plant-list";

export const metadata: Metadata = {
  title: "Plantes",
};

const PlantsPage = ({ searchParams }: PageProps<"/plants">) => (
  <div className="flex flex-col gap-6">
    <h1 className="text-2xl font-semibold tracking-tight">Plantes</h1>
    <Suspense fallback={<p className="text-muted-foreground">Chargement des plantes…</p>}>
      <PlantList searchParams={searchParams} />
    </Suspense>
  </div>
);

export default PlantsPage;
