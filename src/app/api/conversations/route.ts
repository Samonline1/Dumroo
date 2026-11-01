import { NextRequest } from "next/server";
import { resolveDemoUser } from "@/lib/auth/demo-user";
import { conversationRepository } from "@/lib/repositories";
import { createConversationSchema, paginationQuerySchema } from "@/lib/validations/schemas";
import { successResponse } from "@/lib/utils/api-response";
import { handleApiError, ApiError } from "@/lib/utils/error-handler";
import { ConversationType } from "@/types";
import { hasPermission } from "@/lib/permissions/access-control";

export async function GET(request: NextRequest) {
  try {
    const user = await resolveDemoUser(request);
    const searchParams = request.nextUrl.searchParams;

    const { page, limit } = paginationQuerySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 20,
    });

    const targetUserId = searchParams.get("userId");
    let resolvedUserId = user.id;

    if (targetUserId && targetUserId !== user.id) {
      // Permission check
      if (!hasPermission(user, "view_student_activity")) {
        throw new ApiError("Forbidden: You cannot inspect other users' conversations", 403);
      }
      resolvedUserId = targetUserId;
    }

    const typeParam = searchParams.get("type") as ConversationType | null;
    const type = typeParam === "tutoring" || typeParam === "web_search" ? typeParam : undefined;

    const result = await conversationRepository.findByUserId(resolvedUserId, type, page, limit);

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

export async function POST(request: NextRequest) {
  try {
    const user = await resolveDemoUser(request);
    const json = await request.json();
    const data = createConversationSchema.parse(json);

    const title = data.title || (data.conversationType === "tutoring" ? "New Tutoring Session" : "New Web Search");

    const conversation = await conversationRepository.create({
      userId: user.id,
      conversationType: data.conversationType,
      title,
    });

    return successResponse(conversation, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
