import { NextRequest } from "next/server";
import { resolveDemoUser } from "@/lib/auth/demo-user";
import { enforcePermission } from "@/lib/permissions/access-control";
import { monitoringRepository } from "@/lib/repositories";
import { paginationQuerySchema } from "@/lib/validations/schemas";
import { successResponse } from "@/lib/utils/api-response";
import { handleApiError } from "@/lib/utils/error-handler";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveDemoUser(request);
    // Permission check
    enforcePermission(user, "view_teacher_activity");

    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = paginationQuerySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
    });

    const result = await monitoringRepository.getTeachersMonitoring(page, limit);

    return successResponse(result.items, 200, {
      total: result.total,
      page,
      limit,
      hasMore: page * limit < result.total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
