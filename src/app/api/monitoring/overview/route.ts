import { NextRequest } from "next/server";
import { resolveDemoUser } from "@/lib/auth/demo-user";
import { enforcePermission } from "@/lib/permissions/access-control";
import { monitoringRepository } from "@/lib/repositories";
import { successResponse } from "@/lib/utils/api-response";
import { handleApiError } from "@/lib/utils/error-handler";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveDemoUser(request);
    // Permission check
    enforcePermission(user, "platform_overview");

    const stats = await monitoringRepository.getPlatformOverview();
    return successResponse(stats);
  } catch (error) {
    return handleApiError(error);
  }
}
