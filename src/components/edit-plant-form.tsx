import { notFound } from "next/navigation";
import { savePlant } from "@/actions/plants";
import { PlantForm } from "@/components/plant-form";
import { getPlant } from "@/lib/data/plants";

type EditPlantFormProps = {
  params: Promise<{ id: string }>;
};

export const EditPlantForm = async ({ params }: EditPlantFormProps) => {
  const { id } = await params;
  const { plant } = await getPlant(id);
  if (!plant) notFound();

  return (
    <PlantForm
      action={savePlant.bind(null, plant.id)}
      initialValues={{
        name: plant.name,
        variety: plant.variety ?? "",
        location: plant.location ?? "",
        sunExposure: plant.sunExposure ?? "",
        soil: plant.soil ?? "",
        watering: plant.watering ?? "",
        notes: plant.notes ?? "",
        careTasks: plant.careTasks.map((task) => ({
          id: task.id,
          type: task.type,
          title: task.title ?? "",
          instructions: task.instructions ?? "",
          startMonth: task.startMonth,
          startPart: task.startPart,
          endMonth: task.endMonth,
          endPart: task.endPart,
          recurrence: task.recurrence,
          interval: task.interval,
        })),
      }}
      cancelHref={`/plants/${plant.id}`}
      submitLabel="Enregistrer"
    />
  );
};
