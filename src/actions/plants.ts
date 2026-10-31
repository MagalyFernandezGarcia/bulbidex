"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { plantFormSchema } from "@/lib/plant-form-schema";
import { requireSession } from "@/lib/session";

export type PlantFormState = {
  message?: string;
  fieldErrors?: Record<string, string>;
};

const parsePayload = (formData: FormData) => {
  const payload = formData.get("payload");
  if (typeof payload !== "string") return null;
  try {
    const parsedJson: unknown = JSON.parse(payload);
    return parsedJson;
  } catch {
    return null;
  }
};

const toFieldErrors = (error: z.ZodError) => {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    fieldErrors[path] ??= issue.message;
  }
  return fieldErrors;
};

const VALIDATION_ERROR_MESSAGE = "Certains champs sont à corriger.";

export const savePlant = async (
  plantId: string | null,
  _previousState: PlantFormState,
  formData: FormData,
): Promise<PlantFormState> => {
  await requireSession();

  const result = plantFormSchema.safeParse(parsePayload(formData));
  if (!result.success) {
    return { message: VALIDATION_ERROR_MESSAGE, fieldErrors: toFieldErrors(result.error) };
  }

  const { careTasks, ...plantData } = result.data;
  let savedPlantId: string;

  if (plantId === null) {
    const plant = await prisma.plant.create({
      data: {
        ...plantData,
        careTasks: { create: careTasks.map((task) => ({ ...task, id: undefined })) },
      },
    });
    savedPlantId = plant.id;
  } else {
    const existingPlant = await prisma.plant.findUnique({
      where: { id: plantId },
      select: { careTasks: { select: { id: true } } },
    });
    if (!existingPlant) {
      return { message: "Cette plante n'existe plus." };
    }

    const existingTaskIds = new Set(existingPlant.careTasks.map((task) => task.id));
    const keptTaskIds = careTasks.flatMap((task) =>
      task.id && existingTaskIds.has(task.id) ? [task.id] : [],
    );

    await prisma.$transaction([
      prisma.plant.update({ where: { id: plantId }, data: plantData }),
      prisma.careTask.deleteMany({ where: { plantId, id: { notIn: keptTaskIds } } }),
      ...careTasks.map(({ id, ...task }) =>
        id && existingTaskIds.has(id)
          ? prisma.careTask.update({ where: { id }, data: task })
          : prisma.careTask.create({ data: { ...task, plantId } }),
      ),
    ]);
    savedPlantId = plantId;
  }

  revalidatePath("/", "layout");
  redirect(`/plants/${savedPlantId}`);
};

export const deletePlant = async (plantId: string) => {
  await requireSession();
  await prisma.plant.deleteMany({ where: { id: plantId } });
  revalidatePath("/", "layout");
  redirect("/plants");
};
