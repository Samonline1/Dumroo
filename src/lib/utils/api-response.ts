import { NextResponse } from "next/server";
import { ApiResponse } from "@/types";

export function successResponse<T>(data: T, status = 200, meta?: ApiResponse<T>["meta"]): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
    },
    { status }
  );
}

export function errorResponse(message: string, status = 400): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status }
  );
}
