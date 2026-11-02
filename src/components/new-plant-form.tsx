"use client";

import { useState } from "react";
import { savePlant } from "@/actions/plants";
import { ImportPlantDialog } from "@/components/import-plant-dialog";
import { PlantForm } from "@/components/plant-form";
import { PlantFormInput } from "@/lib/plant-form-schema";

const EMPTY_PLANT: PlantFormInput = {
  name: "",
  variety: "",
  location: "",
  sunExposure: "",
  soil: "",
  watering: "",
  notes: "",
  careTasks: [],
};

const createPlant = savePlant.bind(null, null);

export const NewPlantForm = () => {
  const [initialValues, setInitialValues] = useState(EMPTY_PLANT);
  const [importCount, setImportCount] = useState(0);

  const importPlant = (values: PlantFormInput) => {
    setInitialValues(values);
    setImportCount((previousCount) => previousCount + 1);
  };

  return (
    <div className="flex flex-col gap-6">
      <ImportPlantDialog onImport={importPlant} />
      <PlantForm
        key={importCount}
        action={createPlant}
        initialValues={initialValues}
        cancelHref="/plants"
        submitLabel="Ajouter la plante"
      />
    </div>
  );
};
