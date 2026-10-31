"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { toFieldErrors, VALIDATION_ERROR_MESSAGE } from "@/lib/form-errors";
import { careTaskFormSchema } from "@/lib/plant-form-schema";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export type CareTaskFormState = {
  isSaved: boolean;
  message?: string;
  fieldErrors?: Record<string, string>;
};

const careTaskIdSchema = z.string().min(1);

const MISSING_TASK_MESSAGE = "Cette tâche n'existe plus.";

export const updateCareTask = async (
  careTaskId: string,
  input: unknown,
): Promise<CareTaskFormState> => {
  await requireSession();

  const id = careTaskIdSchema.parse(careTaskId);
  const result = careTaskFormSchema.safeParse(input);
  if (!result.success) {
    return {
      isSaved: false,
      message: VALIDATION_ERROR_MESSAGE,
      fieldErrors: toFieldErrors(result.error),
    };
  }

  const { count } = await prisma.careTask.updateMany({
    where: { id },
    data: { ...result.data, id: undefined },
  });
  if (count === 0) return { isSaved: false, message: MISSING_TASK_MESSAGE };

  revalidatePath("/", "layout");
  return { isSaved: true };
};

export const deleteCareTask = async (careTaskId: string) => {
  await requireSession();

  await prisma.careTask.deleteMany({ where: { id: careTaskIdSchema.parse(careTaskId) } });

  revalidatePath("/", "layout");
};
