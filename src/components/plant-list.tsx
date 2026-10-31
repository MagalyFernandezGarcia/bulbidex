import { MapPin, Search, Sprout } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getPlants } from "@/lib/data/plants";
import { isTaskDueNow } from "@/lib/task-status";

type PlantListProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export const PlantList = async ({ searchParams }: PlantListProps) => {
  const { q: searchParameter } = await searchParams;
  const search = typeof searchParameter === "string" ? searchParameter.trim() : "";
  const { plants, today } = await getPlants(search);

  return (
    <>
      <form action="/plants" className="flex gap-2" role="search">
        <Input
          name="q"
          type="search"
          defaultValue={search}
          placeholder="Rechercher une plante, une variété, un emplacement…"
          aria-label="Rechercher"
        />
        <Button type="submit" variant="outline" aria-label="Rechercher">
          <Search />
        </Button>
      </form>

      {plants.length === 0 ? (
        <p className="text-muted-foreground">
          {search ? (
            <>Aucune plante ne correspond à « {search} ».</>
          ) : (
            <>
              Aucune plante pour l&apos;instant.{" "}
              <Link href="/plants/new" className="underline underline-offset-4">
                Ajouter une plante
              </Link>
            </>
          )}
        </p>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {plants.map((plant) => {
            const dueTaskCount = plant.careTasks.filter((task) => isTaskDueNow(task, today)).length;
            return (
              <li key={plant.id}>
                <Link href={`/plants/${plant.id}`} className="block h-full">
                  <Card className="h-full transition-colors hover:bg-muted/50">
                    <CardContent className="flex items-start gap-3">
                      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
                        <Sprout className="size-6" />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col gap-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate font-medium">{plant.name}</p>
                          {dueTaskCount > 0 && (
                            <Badge className="bg-green-700 text-white">
                              {dueTaskCount} à faire
                            </Badge>
                          )}
                        </div>
                        {plant.variety && (
                          <p className="truncate text-sm text-muted-foreground">{plant.variety}</p>
                        )}
                        {plant.location && (
                          <p className="flex items-center gap-1 truncate text-sm text-muted-foreground">
                            <MapPin className="size-3.5 shrink-0" />
                            {plant.location}
                          </p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
};
