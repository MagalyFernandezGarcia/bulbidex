import { Metadata } from "next";
import { NewPlantForm } from "@/components/new-plant-form";

export const metadata: Metadata = {
  title: "Nouvelle plante",
};

const NewPlantPage = () => (
  <div className="flex flex-col gap-6">
    <h1 className="text-2xl font-semibold tracking-tight">Nouvelle plante</h1>
    <NewPlantForm />
  </div>
);

export default NewPlantPage;
