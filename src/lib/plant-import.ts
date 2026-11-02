import { toFieldErrors } from "@/lib/form-errors";
import { PlantFormInput, PlantFormOutput, plantFormSchema } from "@/lib/plant-form-schema";

export type PlantImportResult =
  | { success: true; values: PlantFormInput }
  | { success: false; message: string; details: string[] };

const FIELD_LABELS: Record<string, string> = {
  name: "Nom",
  variety: "Variété",
  location: "Emplacement",
  sunExposure: "Exposition",
  soil: "Sol",
  watering: "Arrosage",
  notes: "Notes",
  careTasks: "Tâches",
  type: "Type",
  title: "Titre",
  instructions: "Instructions",
  startMonth: "Mois de début",
  startPart: "Partie du mois de début",
  endMonth: "Mois de fin",
  endPart: "Partie du mois de fin",
  recurrence: "Fréquence",
  interval: "Intervalle",
};

const formatFieldPath = (path: string) => {
  const [field, taskIndex, taskField] = path.split(".");
  if (field === "careTasks" && taskIndex !== undefined && taskField !== undefined) {
    return `Tâche ${Number(taskIndex) + 1} – ${FIELD_LABELS[taskField] ?? taskField}`;
  }
  return FIELD_LABELS[field] ?? (path || "Contenu");
};

const extractJson = (text: string): unknown => {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end <= start) return undefined;
  try {
    const parsedJson: unknown = JSON.parse(text.slice(start, end + 1), (key, value: unknown) =>
      value === null && key !== "interval" ? "" : value,
    );
    return parsedJson;
  } catch {
    return undefined;
  }
};

const toFormInput = (plant: PlantFormOutput): PlantFormInput => ({
  name: plant.name,
  variety: plant.variety ?? "",
  location: plant.location ?? "",
  sunExposure: plant.sunExposure ?? "",
  soil: plant.soil ?? "",
  watering: plant.watering ?? "",
  notes: plant.notes ?? "",
  careTasks: plant.careTasks.map((task) => ({
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
});

export const parsePlantImport = (text: string): PlantImportResult => {
  const json = extractJson(text);
  if (json === undefined) {
    return {
      success: false,
      message: "Aucun JSON valide trouvé. Collez la réponse complète de Claude.",
      details: [],
    };
  }

  const result = plantFormSchema.safeParse(json);
  if (!result.success) {
    return {
      success: false,
      message: "Le JSON ne correspond pas au format attendu.",
      details: Object.entries(toFieldErrors(result.error)).map(
        ([path, message]) => `${formatFieldPath(path)} : ${message}`,
      ),
    };
  }

  return { success: true, values: toFormInput(result.data) };
};
