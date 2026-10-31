import { Metadata } from "next";
import { Suspense } from "react";
import { PlantDetails } from "@/components/plant-details";

export const metadata: Metadata = {
  title: "Plante",
};

const PlantPage = ({ params }: PageProps<"/plants/[id]">) => (
  <Suspense fallback={<p className="text-muted-foreground">Chargement de la plante…</p>}>
    <PlantDetails params={params} />
  </Suspense>
);

export default PlantPage;
