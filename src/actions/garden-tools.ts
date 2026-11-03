"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { toFieldErrors, VALIDATION_ERROR_MESSAGE } from "@/lib/form-errors";
import { gardenToolFormSchema } from "@/lib/garden-tool-schema";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type GardenToolFormState = {
  isSaved: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

const gardenToolIdSchema = z.string().min(1);

const MISSING_TOOL_MESSAGE = "Cet outil n'existe plus.";

export const saveGardenTool = async (
  gardenToolId: string | null,
  input: unknown,
): Promise<GardenToolFormState> => {
  await requireSession();

  const result = gardenToolFormSchema.safeParse(input);
  if (!result.success) {
    return {
      isSaved: false,
      message: VALIDATION_ERROR_MESSAGE,
      fieldErrors: toFieldErrors(result.error),
    };
  }

  if (gardenToolId === null) {
    await prisma.gardenTool.create({ data: result.data });
  } else {
    const { count } = await prisma.gardenTool.updateMany({
      where: { id: gardenToolIdSchema.parse(gardenToolId) },
      data: result.data,
    });
    if (count === 0) return { isSaved: false, message: MISSING_TOOL_MESSAGE };
  }

  revalidatePath("/tools");
  return { isSaved: true };
};

export const deleteGardenTool = async (gardenToolId: string) => {
  await requireSession();

  await prisma.gardenTool.deleteMany({ where: { id: gardenToolIdSchema.parse(gardenToolId) } });

  revalidatePath("/tools");
};
