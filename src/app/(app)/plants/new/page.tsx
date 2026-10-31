import { Metadata } from "next";
import { savePlant } from "@/actions/plants";
import { PlantForm } from "@/components/plant-form";

export const metadata: Metadata = {
  title: "Nouvelle plante",
};

const NewPlantPage = () => (
  <div className="flex flex-col gap-6">
    <h1 className="text-2xl font-semibold tracking-tight">Nouvelle plante</h1>
    <PlantForm
      action={savePlant.bind(null, null)}
      initialValues={{
        name: "",
        variety: "",
        location: "",
        sunExposure: "",
        soil: "",
        watering: "",
        notes: "",
        careTasks: [],
      }}
      cancelHref="/plants"
      submitLabel="Ajouter la plante"
    />
  </div>
);

export default NewPlantPage;
