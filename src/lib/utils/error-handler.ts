import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { errorResponse } from "./api-response";

export class ApiError extends Error {
  constructor(public message: string, public statusCode = 400) {
    super(message);
    this.name = "ApiError";
  }
}

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return errorResponse(error.message, error.statusCode);
  }

  if (error instanceof ZodError) {
    const formattedErrors = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
    return errorResponse(`Validation error: ${formattedErrors}`, 422);
  }

  console.error("Unhandled API Error:", error);
  const message = error instanceof Error ? error.message : "Internal server error";
  return errorResponse(message, 500);
}
