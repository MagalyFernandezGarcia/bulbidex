export const PHOTO_PATH_PATTERN = /^plants\/[0-9a-f-]{36}(-thumb)?\.(webp|jpg)$/;

export const getThumbnailPath = (photoPath: string) =>
  photoPath.replace(/\.(webp|jpg)$/, "-thumb.$1");

export const getPhotoUrl = (photoPath: string) => `/api/photos/${photoPath}`;

export const getThumbnailUrl = (photoPath: string) => getPhotoUrl(getThumbnailPath(photoPath));
