import { NextRequest } from "next/server";
import { userRepository } from "@/lib/repositories";
import { successResponse } from "@/lib/utils/api-response";
import { handleApiError } from "@/lib/utils/error-handler";

export async function GET() {
  try {
    const users = await userRepository.findAll();
    return successResponse(users);
  } catch (error) {
    return handleApiError(error);
  }
}
