import { Metadata } from "next";
import { Suspense } from "react";
import { EditPlantForm } from "@/components/edit-plant-form";

export const metadata: Metadata = {
  title: "Modifier la plante",
};

const EditPlantPage = ({ params }: PageProps<"/plants/[id]/edit">) => (
  <div className="flex flex-col gap-6">
    <h1 className="text-2xl font-semibold tracking-tight">Modifier la plante</h1>
    <Suspense fallback={<p className="text-muted-foreground">Chargement de la plante…</p>}>
      <EditPlantForm params={params} />
    </Suspense>
  </div>
);

export default EditPlantPage;
