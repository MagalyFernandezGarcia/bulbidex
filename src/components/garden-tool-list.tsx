import { Shovel } from "lucide-react";
import { GardenToolDialog } from "@/components/garden-tool-dialog";
import { Card, CardContent } from "@/components/ui/card";
import { getGardenTools } from "@/lib/data/garden-tools";

export const GardenToolList = async () => {
  const gardenTools = await getGardenTools();

  if (gardenTools.length === 0) {
    return (
      <p className="text-muted-foreground">
        Aucun outil pour l&apos;instant. Ajoutez ceux que vous avez pour que Claude puisse vous dire
        lequel utiliser.
      </p>
    );
  }

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {gardenTools.map((gardenTool) => (
        <li key={gardenTool.id}>
          <Card className="h-full">
            <CardContent className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-green-50 text-green-700">
                <Shovel className="size-5" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="font-medium break-words">{gardenTool.name}</p>
                {gardenTool.notes && (
                  <p className="text-sm whitespace-pre-line text-muted-foreground">
                    {gardenTool.notes}
                  </p>
                )}
              </div>
              <GardenToolDialog gardenTool={gardenTool} />
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
};
