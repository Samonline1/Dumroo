import { NextRequest } from "next/server";
import { resolveDemoUser } from "@/lib/auth/demo-user";
import { enforcePermission } from "@/lib/permissions/access-control";
import { searchRepository } from "@/lib/repositories";
import { paginationQuerySchema } from "@/lib/validations/schemas";
import { successResponse } from "@/lib/utils/api-response";
import { handleApiError } from "@/lib/utils/error-handler";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveDemoUser(request);
    enforcePermission(user, "web_search");

    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = paginationQuerySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
    });

    const scope = searchParams.get("scope");

    let result;
    // Role scoping
    if (user.role === "teacher") {
      result = await searchRepository.findByTeacherId(user.id, page, limit);
    } else if (user.role === "principal") {
      if (scope === "teachers") {
        result = await searchRepository.findByRole("teacher", page, limit);
      } else if (scope === "all") {
        result = await searchRepository.findAll(page, limit);
      } else {
        result = await searchRepository.findByTeacherId(user.id, page, limit);
      }
    } else {
      result = { items: [], total: 0, page, limit };
    }

    return successResponse(result.items, 200, {
      total: result.total,
      page: result.page,
      limit: result.limit,
      hasMore: result.page * result.limit < result.total,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
