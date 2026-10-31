import { z } from "zod";
import { MonthPart, Recurrence, TaskType } from "@/generated/prisma/enums";

const optionalText = (maximumLength: number) =>
  z
    .string()
    .trim()
    .max(maximumLength, `${maximumLength} caractères maximum.`)
    .transform((value) => value || null);

const month = z.number().int().min(1, "Mois invalide.").max(12, "Mois invalide.");

export const careTaskFormSchema = z
  .object({
    id: z.string().optional(),
    type: z.enum(TaskType, "Type de tâche invalide."),
    title: optionalText(200),
    instructions: optionalText(5000),
    startMonth: month,
    startPart: z.enum(MonthPart),
    endMonth: month,
    endPart: z.enum(MonthPart),
    recurrence: z.enum(Recurrence),
    interval: z
      .number("Indiquez un nombre.")
      .int("Indiquez un nombre entier.")
      .min(1, "Au moins 1.")
      .max(365, "365 maximum.")
      .nullable(),
  })
  .refine((task) => task.recurrence === Recurrence.ONCE || task.interval !== null, {
    path: ["interval"],
    message: "Indiquez la fréquence.",
  })
  .transform((task) => ({
    ...task,
    interval: task.recurrence === Recurrence.ONCE ? null : task.interval,
  }));

export const plantFormSchema = z.object({
  name: z.string().trim().min(1, "Le nom est obligatoire.").max(200, "200 caractères maximum."),
  variety: optionalText(200),
  location: optionalText(200),
  sunExposure: optionalText(200),
  soil: optionalText(200),
  watering: optionalText(1000),
  notes: optionalText(10000),
  careTasks: z.array(careTaskFormSchema).max(50, "50 tâches maximum."),
});

export type PlantFormInput = z.input<typeof plantFormSchema>;
export type CareTaskFormInput = z.input<typeof careTaskFormSchema>;
