import { NextRequest } from "next/server";
import { resolveDemoUser } from "@/lib/auth/demo-user";
import { successResponse } from "@/lib/utils/api-response";
import { handleApiError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveDemoUser(request);
    return successResponse(user);
  } catch (error) {
    return handleApiError(error);
  }
}
