import { z } from "zod";

export const VALIDATION_ERROR_MESSAGE = "Certains champs sont à corriger.";

export const toFieldErrors = (error: z.ZodError) => {
  const fieldErrors: Record<string, string> = {};
  for (const issue of error.issues) {
    const path = issue.path.join(".");
    fieldErrors[path] ??= issue.message;
  }
  return fieldErrors;
};
