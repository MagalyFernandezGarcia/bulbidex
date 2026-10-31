import Link from "next/link";
import { DashboardSection } from "@/components/dashboard-section";
import { getDashboard } from "@/lib/data/dashboard";

const todayFormatter = new Intl.DateTimeFormat("fr-BE", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: "UTC",
});

export const Dashboard = async () => {
  const { today, hasTasks, overdue, dueNow, upcoming } = await getDashboard();

  return (
    <div className="flex flex-col gap-8">
      <p className="text-muted-foreground first-letter:uppercase">{todayFormatter.format(today)}</p>
      {!hasTasks ? (
        <p className="text-muted-foreground">
          Aucune tâche d&apos;entretien pour l&apos;instant.{" "}
          <Link href="/plants/new" className="underline underline-offset-4">
            Ajouter une plante
          </Link>
        </p>
      ) : (
        <>
          {overdue.length > 0 && (
            <DashboardSection
              title="En retard"
              description="La période est passée et la tâche n'a pas été cochée."
              items={overdue}
              titleClassName="text-destructive"
            />
          )}
          <DashboardSection
            title="À faire maintenant"
            description="Tâches dont la période est en cours."
            items={dueNow}
            emptyMessage="Rien à faire pour le moment."
          />
          <DashboardSection
            title="Bientôt"
            description="Tâches qui commencent dans les 14 prochains jours."
            items={upcoming}
            emptyMessage="Rien de prévu dans les 14 prochains jours."
          />
        </>
      )}
    </div>
  );
};
