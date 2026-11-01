import { NextRequest } from "next/server";
import { resolveDemoUser } from "@/lib/auth/demo-user";
import { conversationRepository, messageRepository } from "@/lib/repositories";
import { paginationQuerySchema } from "@/lib/validations/schemas";
import { successResponse } from "@/lib/utils/api-response";
import { handleApiError, ApiError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await resolveDemoUser(request);
    const { id } = await params;

    const conversation = await conversationRepository.findById(id);
    if (!conversation) {
      throw new ApiError("Conversation not found", 404);
    }

    // Access control
    if (
      conversation.userId !== user.id &&
      user.role !== "principal" &&
      user.role !== "teacher"
    ) {
      throw new ApiError("Forbidden: Access to these messages is denied", 403);
    }

    const searchParams = request.nextUrl.searchParams;
    const { page, limit } = paginationQuerySchema.parse({
      page: searchParams.get("page") || 1,
      limit: searchParams.get("limit") || 50,
    });

    const result = await messageRepository.findByConversationId(id, page, limit);

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
