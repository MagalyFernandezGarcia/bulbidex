import { PHOTO_PATH_PATTERN } from "@/lib/photo-paths";
import { readPlantPhoto } from "@/lib/photo-storage";
import { hasValidSession } from "@/lib/session";

export const GET = async (_request: Request, { params }: RouteContext<"/api/photos/[...path]">) => {
  if (!(await hasValidSession())) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { path } = await params;
  const photoPath = path.join("/");
  if (!PHOTO_PATH_PATTERN.test(photoPath)) {
    return new Response("Not found", { status: 404 });
  }

  const result = await readPlantPhoto(photoPath);
  if (result?.statusCode !== 200) {
    return new Response("Not found", { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType,
      "Cache-Control": "private, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
    },
  });
};
