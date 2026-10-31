import "server-only";
import { randomUUID } from "node:crypto";
import { del, get, put, PutCommandOptions } from "@vercel/blob";
import { environment } from "@/lib/environment";
import { getThumbnailPath } from "@/lib/photo-paths";

const PHOTO_EXTENSIONS: Record<string, string> = {
  "image/webp": "webp",
  "image/jpeg": "jpg",
};

export const isAllowedPhotoType = (contentType: string) => contentType in PHOTO_EXTENSIONS;

export const uploadPlantPhoto = async (photo: File, thumbnail: File) => {
  const extension = PHOTO_EXTENSIONS[photo.type] ?? "jpg";
  const photoPath = `plants/${randomUUID()}.${extension}`;
  const options: PutCommandOptions = {
    access: "private",
    token: environment.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
    contentType: photo.type,
  };

  await Promise.all([
    put(photoPath, photo, options),
    put(getThumbnailPath(photoPath), thumbnail, options),
  ]);
  return photoPath;
};

export const deletePlantPhoto = async (photoPath: string) => {
  try {
    await del([photoPath, getThumbnailPath(photoPath)], {
      token: environment.BLOB_READ_WRITE_TOKEN,
    });
  } catch (error) {
    console.error(`Failed to delete photo ${photoPath}`, error);
  }
};

export const readPlantPhoto = (photoPath: string) =>
  get(photoPath, { access: "private", token: environment.BLOB_READ_WRITE_TOKEN });
