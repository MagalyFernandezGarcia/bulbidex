"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { deletePlantPhoto, isAllowedPhotoType, uploadPlantPhoto } from "@/lib/photo-storage";
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

const MAXIMUM_PHOTO_SIZE_IN_BYTES = 3 * 1024 * 1024;
const MAXIMUM_THUMBNAIL_SIZE_IN_BYTES = 1024 * 1024;

enum PhotoChangeKind {
  Keep = "keep",
  Remove = "remove",
  Replace = "replace",
  Invalid = "invalid",
}

type PhotoChange =
  | { kind: PhotoChangeKind.Keep | PhotoChangeKind.Remove | PhotoChangeKind.Invalid }
  | { kind: PhotoChangeKind.Replace; photo: File; thumbnail: File };

const INVALID_PHOTO_MESSAGE = "La photo n'est pas valide ou est trop lourde.";

const isValidPhotoFile = (value: FormDataEntryValue | null, maximumSize: number): value is File =>
  value instanceof File &&
  isAllowedPhotoType(value.type) &&
  value.size > 0 &&
  value.size <= maximumSize;

const parsePhotoChange = (formData: FormData): PhotoChange => {
  if (formData.get("removePhoto") === "true") return { kind: PhotoChangeKind.Remove };

  const photo = formData.get("photo");
  const thumbnail = formData.get("photoThumbnail");
  if (photo === null && thumbnail === null) return { kind: PhotoChangeKind.Keep };

  if (
    isValidPhotoFile(photo, MAXIMUM_PHOTO_SIZE_IN_BYTES) &&
    isValidPhotoFile(thumbnail, MAXIMUM_THUMBNAIL_SIZE_IN_BYTES)
  ) {
    return { kind: PhotoChangeKind.Replace, photo, thumbnail };
  }
  return { kind: PhotoChangeKind.Invalid };
};

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

  const photoChange = parsePhotoChange(formData);
  if (photoChange.kind === PhotoChangeKind.Invalid) {
    return { message: INVALID_PHOTO_MESSAGE, fieldErrors: { photo: INVALID_PHOTO_MESSAGE } };
  }

  const { careTasks, ...plantData } = result.data;

  const existingPlant =
    plantId === null
      ? null
      : await prisma.plant.findUnique({
          where: { id: plantId },
          select: { photoPath: true, careTasks: { select: { id: true } } },
        });
  if (plantId !== null && !existingPlant) {
    return { message: "Cette plante n'existe plus." };
  }

  let newPhotoPath: string | null | undefined;
  if (photoChange.kind === PhotoChangeKind.Replace) {
    newPhotoPath = await uploadPlantPhoto(photoChange.photo, photoChange.thumbnail);
  } else if (photoChange.kind === PhotoChangeKind.Remove) {
    newPhotoPath = null;
  }

  let savedPlantId: string;
  try {
    if (plantId === null || !existingPlant) {
      const plant = await prisma.plant.create({
        data: {
          ...plantData,
          photoPath: newPhotoPath,
          careTasks: { create: careTasks.map((task) => ({ ...task, id: undefined })) },
        },
      });
      savedPlantId = plant.id;
    } else {
      const existingTaskIds = new Set(existingPlant.careTasks.map((task) => task.id));
      const keptTaskIds = careTasks.flatMap((task) =>
        task.id && existingTaskIds.has(task.id) ? [task.id] : [],
      );

      await prisma.$transaction([
        prisma.plant.update({
          where: { id: plantId },
          data: { ...plantData, photoPath: newPhotoPath },
        }),
        prisma.careTask.deleteMany({ where: { plantId, id: { notIn: keptTaskIds } } }),
        ...careTasks.map(({ id, ...task }) =>
          id && existingTaskIds.has(id)
            ? prisma.careTask.update({ where: { id }, data: task })
            : prisma.careTask.create({ data: { ...task, plantId } }),
        ),
      ]);
      savedPlantId = plantId;
    }
  } catch (error) {
    if (newPhotoPath) await deletePlantPhoto(newPhotoPath);
    throw error;
  }

  const previousPhotoPath = existingPlant?.photoPath;
  if (newPhotoPath !== undefined && previousPhotoPath && previousPhotoPath !== newPhotoPath) {
    await deletePlantPhoto(previousPhotoPath);
  }

  revalidatePath("/", "layout");
  redirect(`/plants/${savedPlantId}`);
};

export const deletePlant = async (plantId: string) => {
  await requireSession();
  const plant = await prisma.plant.findUnique({
    where: { id: plantId },
    select: { photoPath: true },
  });
  await prisma.plant.deleteMany({ where: { id: plantId } });
  if (plant?.photoPath) await deletePlantPhoto(plant.photoPath);
  revalidatePath("/", "layout");
  redirect("/plants");
};
