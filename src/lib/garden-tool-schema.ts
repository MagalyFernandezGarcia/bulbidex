import { z } from "zod";

export const GARDEN_TOOL_NAME_MAXIMUM_LENGTH = 200;
export const GARDEN_TOOL_NOTES_MAXIMUM_LENGTH = 5000;

export const gardenToolFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Le nom est obligatoire.")
    .max(GARDEN_TOOL_NAME_MAXIMUM_LENGTH, `${GARDEN_TOOL_NAME_MAXIMUM_LENGTH} caractères maximum.`),
  notes: z
    .string()
    .trim()
    .max(
      GARDEN_TOOL_NOTES_MAXIMUM_LENGTH,
      `${GARDEN_TOOL_NOTES_MAXIMUM_LENGTH} caractères maximum.`,
    )
    .transform((value) => value || null),
});

export type GardenToolFormInput = z.input<typeof gardenToolFormSchema>;
