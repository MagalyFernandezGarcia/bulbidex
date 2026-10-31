"use client";

import { useRouter } from "next/navigation";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";
import { buildCalendarHref, CalendarState } from "@/lib/calendar-url";

type PlantFilterProps = {
  state: CalendarState;
  plants: { id: string; name: string }[];
};

export const PlantFilter = ({ state, plants }: PlantFilterProps) => {
  const router = useRouter();

  return (
    <NativeSelect
      aria-label="Filtrer par plante"
      className="w-full sm:w-56"
      value={state.plantId ?? ""}
      onChange={(event) =>
        router.push(buildCalendarHref({ ...state, plantId: event.target.value || undefined }))
      }
    >
      <NativeSelectOption value="">Toutes les plantes</NativeSelectOption>
      {plants.map((plant) => (
        <NativeSelectOption key={plant.id} value={plant.id}>
          {plant.name}
        </NativeSelectOption>
      ))}
    </NativeSelect>
  );
};
