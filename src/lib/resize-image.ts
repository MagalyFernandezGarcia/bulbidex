const PHOTO_MAXIMUM_DIMENSION = 1600;
const THUMBNAIL_MAXIMUM_DIMENSION = 480;
const WEBP_QUALITY = 0.8;
const JPEG_QUALITY = 0.82;

const encodeCanvas = (canvas: HTMLCanvasElement, type: string, quality: number) =>
  new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, quality));

const resizeBitmap = async (bitmap: ImageBitmap, maximumDimension: number) => {
  const scale = Math.min(1, maximumDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);

  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is not supported.");
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const webpBlob = await encodeCanvas(canvas, "image/webp", WEBP_QUALITY);
  if (webpBlob?.type === "image/webp") return webpBlob;

  const jpegBlob = await encodeCanvas(canvas, "image/jpeg", JPEG_QUALITY);
  if (!jpegBlob) throw new Error("Image encoding failed.");
  return jpegBlob;
};

export const preparePlantPhoto = async (file: File) => {
  const bitmap = await createImageBitmap(file);
  try {
    const photo = await resizeBitmap(bitmap, PHOTO_MAXIMUM_DIMENSION);
    const thumbnail = await resizeBitmap(bitmap, THUMBNAIL_MAXIMUM_DIMENSION);
    return { photo, thumbnail };
  } finally {
    bitmap.close();
  }
};
