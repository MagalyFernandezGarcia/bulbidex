import { ArrowLeft, CalendarDays, Pencil, Sprout } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { deletePlant } from "@/actions/plants";
import { CareTaskCard } from "@/components/care-task-card";
import { DeletePlantButton } from "@/components/delete-plant-button";
import { buttonVariants } from "@/components/ui/button";
import { getPlant } from "@/lib/data/plants";

type PlantDetailsProps = {
  params: Promise<{ id: string }>;
};

export const PlantDetails = async ({ params }: PlantDetailsProps) => {
  const { id } = await params;
  const { plant, today } = await getPlant(id);
  if (!plant) notFound();

  const informations = [
    { label: "Emplacement", value: plant.location },
    { label: "Exposition", value: plant.sunExposure },
    { label: "Sol", value: plant.soil },
    { label: "Arrosage", value: plant.watering },
  ].filter((information) => information.value);

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/plants"
        className="flex w-fit items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Toutes les plantes
      </Link>

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex size-24 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-700">
          <Sprout className="size-10" />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">{plant.name}</h1>
          {plant.variety && <p className="text-muted-foreground">{plant.variety}</p>}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/calendar?plant=${plant.id}`}
          className={buttonVariants({ variant: "outline" })}
        >
          <CalendarDays />
          Voir dans le calendrier
        </Link>
        <Link href={`/plants/${plant.id}/edit`} className={buttonVariants({ variant: "outline" })}>
          <Pencil />
          Modifier
        </Link>
        <DeletePlantButton plantName={plant.name} deleteAction={deletePlant.bind(null, plant.id)} />
      </div>

      {informations.length > 0 && (
        <dl className="grid gap-3 sm:grid-cols-2">
          {informations.map((information) => (
            <div key={information.label} className="rounded-lg border p-3">
              <dt className="text-sm text-muted-foreground">{information.label}</dt>
              <dd className="whitespace-pre-line">{information.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {plant.notes && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Notes</h2>
          <p className="whitespace-pre-line">{plant.notes}</p>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">Entretien</h2>
        {plant.careTasks.length === 0 ? (
          <p className="text-muted-foreground">Aucune tâche d&apos;entretien pour cette plante.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {plant.careTasks.map((task) => (
              <li key={task.id}>
                <CareTaskCard task={task} today={today} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};
