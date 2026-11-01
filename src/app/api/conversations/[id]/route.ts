import { NextRequest } from "next/server";
import { resolveDemoUser } from "@/lib/auth/demo-user";
import { conversationRepository } from "@/lib/repositories";
import { successResponse } from "@/lib/utils/api-response";
import { handleApiError, ApiError } from "@/lib/utils/error-handler";

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

    // Authorization
    if (conversation.userId !== user.id && user.role !== "principal") {
      throw new ApiError("Forbidden: Access to this conversation is denied", 403);
    }

    return successResponse(conversation);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const user = await resolveDemoUser(request);
    const { id } = await params;

    const conversation = await conversationRepository.findById(id);
    if (!conversation) {
      throw new ApiError("Conversation not found", 404);
    }

    if (conversation.userId !== user.id && user.role !== "principal") {
      throw new ApiError("Forbidden: Cannot delete another user's conversation", 403);
    }

    await conversationRepository.delete(id);
    return successResponse({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
