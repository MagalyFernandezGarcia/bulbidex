import "server-only";
import { McpServer } from "@modelcontextprotocol/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { Prisma } from "@/generated/prisma/client";
import { MonthPart, Recurrence, TaskType } from "@/generated/prisma/enums";
import { toFieldErrors } from "@/lib/form-errors";
import { careTaskFormSchema, plantFormSchema } from "@/lib/plant-form-schema";
import { prisma } from "@/lib/prisma";

const MAXIMUM_CARE_TASKS_PER_PLANT = 50;

const careTaskInputSchema = z.object({
  type: z.enum(TaskType).describe("Kind of task."),
  title: z
    .string()
    .max(200)
    .optional()
    .describe("Short title in French. Omit to display the task type label."),
  instructions: z
    .string()
    .max(5000)
    .optional()
    .describe("How to do it, in French: steps, tools, tips."),
  startMonth: z.number().int().min(1).max(12).describe("Month the window starts (1-12)."),
  startPart: z
    .enum(MonthPart)
    .describe("Part of the start month: EARLY = days 1-10, MID = 11-20, LATE = 21-end."),
  endMonth: z
    .number()
    .int()
    .min(1)
    .max(12)
    .describe("Month the window ends (1-12). May be before startMonth to cross New Year."),
  endPart: z
    .enum(MonthPart)
    .describe("Part of the end month: EARLY = days 1-10, MID = 11-20, LATE = 21-end."),
  recurrence: z
    .enum(Recurrence)
    .describe(
      "ONCE = a single time in the window, EVERY_DAYS / EVERY_WEEKS = repeated every `interval` days/weeks within the window.",
    ),
  interval: z
    .number()
    .int()
    .min(1)
    .max(365)
    .optional()
    .describe("Required for EVERY_DAYS and EVERY_WEEKS, ignored for ONCE."),
});

const plantFieldsSchema = z.object({
  name: z.string().min(1).max(200).describe("Common plant name in French, e.g. « Hortensia »."),
  variety: z.string().max(200).optional().describe("Species or cultivar."),
  location: z
    .string()
    .max(200)
    .optional()
    .describe("Where it grows in the garden. Only set it if the user said so."),
  sunExposure: z.string().max(200).optional().describe("Sun exposure, in French."),
  soil: z.string().max(200).optional().describe("Soil needs, in French."),
  watering: z.string().max(1000).optional().describe("Watering needs, in French."),
  notes: z.string().max(10000).optional().describe("Other useful information, in French."),
});

type CareTaskInput = z.output<typeof careTaskInputSchema>;

const toCareTaskFormInput = (task: CareTaskInput) => ({
  ...task,
  title: task.title ?? "",
  instructions: task.instructions ?? "",
  interval: task.interval ?? null,
});

type ToolResult = {
  content: { type: "text"; text: string }[];
  isError?: boolean;
};

const textResult = (value: unknown): ToolResult => ({
  content: [{ type: "text", text: JSON.stringify(value, null, 2) }],
});

const errorResult = (message: string, details?: Record<string, string>): ToolResult => ({
  content: [
    {
      type: "text",
      text: details ? `${message}\n${JSON.stringify(details, null, 2)}` : message,
    },
  ],
  isError: true,
});

const careTaskSelect = {
  id: true,
  type: true,
  title: true,
  instructions: true,
  startMonth: true,
  startPart: true,
  endMonth: true,
  endPart: true,
  recurrence: true,
  interval: true,
} satisfies Prisma.CareTaskSelect;

export const registerPlantTools = (server: McpServer, origin: string) => {
  const getPlantUrl = (plantId: string) => `${origin}/plants/${plantId}`;

  server.registerTool(
    "list_plants",
    {
      title: "Lister les plantes",
      description:
        "List the plants in the user's Bulbidex garden. Use it before creating a plant to avoid duplicates.",
      inputSchema: z.object({
        search: z
          .string()
          .max(200)
          .optional()
          .describe("Filter on name, variety or location (case-insensitive)."),
      }),
      annotations: { readOnlyHint: true },
    },
    async ({ search }) => {
      const plants = await prisma.plant.findMany({
        where: search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { variety: { contains: search, mode: "insensitive" } },
                { location: { contains: search, mode: "insensitive" } },
              ],
            }
          : {},
        orderBy: { name: "asc" },
        select: {
          id: true,
          name: true,
          variety: true,
          location: true,
          _count: { select: { careTasks: true } },
        },
      });
      return textResult(
        plants.map(({ _count, ...plant }) => ({
          ...plant,
          careTaskCount: _count.careTasks,
          url: getPlantUrl(plant.id),
        })),
      );
    },
  );

  server.registerTool(
    "get_plant",
    {
      title: "Voir une plante",
      description: "Get all the information and care tasks of one plant.",
      inputSchema: z.object({ plantId: z.string().min(1).describe("Plant id from list_plants.") }),
      annotations: { readOnlyHint: true },
    },
    async ({ plantId }) => {
      const plant = await prisma.plant.findUnique({
        where: { id: plantId },
        select: {
          id: true,
          name: true,
          variety: true,
          location: true,
          sunExposure: true,
          soil: true,
          watering: true,
          notes: true,
          careTasks: {
            select: careTaskSelect,
            orderBy: [{ startMonth: "asc" }, { startPart: "asc" }],
          },
        },
      });
      if (!plant) return errorResult("Plant not found.");
      return textResult({ ...plant, url: getPlantUrl(plant.id) });
    },
  );

  server.registerTool(
    "create_plant",
    {
      title: "Ajouter une plante",
      description:
        "Create a plant with its care tasks. Write all text in French. Use care periods suited to the user's climate (Belgium unless told otherwise).",
      inputSchema: plantFieldsSchema.extend({
        careTasks: z
          .array(careTaskInputSchema)
          .max(MAXIMUM_CARE_TASKS_PER_PLANT)
          .optional()
          .describe("Care tasks: pruning, fertilizing, watering, mulching, treatments…"),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async ({ careTasks = [], ...plantFields }) => {
      const result = plantFormSchema.safeParse({
        name: plantFields.name,
        variety: plantFields.variety ?? "",
        location: plantFields.location ?? "",
        sunExposure: plantFields.sunExposure ?? "",
        soil: plantFields.soil ?? "",
        watering: plantFields.watering ?? "",
        notes: plantFields.notes ?? "",
        careTasks: careTasks.map(toCareTaskFormInput),
      });
      if (!result.success) {
        return errorResult("Invalid plant.", toFieldErrors(result.error));
      }

      const { careTasks: validCareTasks, ...plantData } = result.data;
      const plant = await prisma.plant.create({
        data: {
          ...plantData,
          careTasks: { create: validCareTasks.map((task) => ({ ...task, id: undefined })) },
        },
        select: { id: true, name: true },
      });
      revalidatePath("/", "layout");
      return textResult({
        ...plant,
        careTaskCount: validCareTasks.length,
        url: getPlantUrl(plant.id),
      });
    },
  );

  server.registerTool(
    "add_care_tasks",
    {
      title: "Ajouter des tâches d'entretien",
      description:
        "Add care tasks to an existing plant. Existing tasks are kept. Write all text in French.",
      inputSchema: z.object({
        plantId: z.string().min(1).describe("Plant id from list_plants."),
        careTasks: z.array(careTaskInputSchema).min(1).max(MAXIMUM_CARE_TASKS_PER_PLANT),
      }),
      annotations: { readOnlyHint: false, destructiveHint: false, idempotentHint: false },
    },
    async ({ plantId, careTasks }) => {
      const result = z.array(careTaskFormSchema).safeParse(careTasks.map(toCareTaskFormInput));
      if (!result.success) {
        return errorResult("Invalid care tasks.", toFieldErrors(result.error));
      }

      const plant = await prisma.plant.findUnique({
        where: { id: plantId },
        select: { id: true, _count: { select: { careTasks: true } } },
      });
      if (!plant) return errorResult("Plant not found.");
      if (plant._count.careTasks + result.data.length > MAXIMUM_CARE_TASKS_PER_PLANT) {
        return errorResult(`A plant can have at most ${MAXIMUM_CARE_TASKS_PER_PLANT} care tasks.`);
      }

      await prisma.careTask.createMany({
        data: result.data.map((task) => ({ ...task, id: undefined, plantId })),
      });
      revalidatePath("/", "layout");
      return textResult({
        plantId,
        addedCareTaskCount: result.data.length,
        url: getPlantUrl(plantId),
      });
    },
  );

  server.registerTool(
    "update_plant",
    {
      title: "Modifier une plante",
      description:
        "Update the information of an existing plant. Only the fields you pass are changed; pass an empty string to clear a field. Care tasks are not changed. Write all text in French.",
      inputSchema: plantFieldsSchema.partial().extend({
        plantId: z.string().min(1).describe("Plant id from list_plants."),
      }),
      annotations: { readOnlyHint: false, destructiveHint: true, idempotentHint: true },
    },
    async ({ plantId, ...plantFields }) => {
      const result = plantFormSchema.omit({ careTasks: true }).partial().safeParse(plantFields);
      if (!result.success) {
        return errorResult("Invalid plant fields.", toFieldErrors(result.error));
      }
      if (Object.keys(result.data).length === 0) {
        return errorResult("Pass at least one field to update.");
      }

      const updatedPlants = await prisma.plant.updateMany({
        where: { id: plantId },
        data: result.data,
      });
      if (updatedPlants.count === 0) return errorResult("Plant not found.");
      revalidatePath("/", "layout");
      return textResult({
        plantId,
        updatedFields: Object.keys(result.data),
        url: getPlantUrl(plantId),
      });
    },
  );
};
