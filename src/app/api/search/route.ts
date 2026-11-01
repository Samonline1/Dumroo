import { NextRequest } from "next/server";
import { resolveDemoUser } from "@/lib/auth/demo-user";
import { enforcePermission } from "@/lib/permissions/access-control";
import { searchRequestSchema } from "@/lib/validations/schemas";
import {
  conversationRepository,
  messageRepository,
  searchRepository,
} from "@/lib/repositories";
import { executeWebSearch } from "@/lib/ai/search.service";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { successResponse } from "@/lib/utils/api-response";
import { handleApiError, ApiError } from "@/lib/utils/error-handler";

export async function POST(request: NextRequest) {
  try {
    const user = await resolveDemoUser(request);
    enforcePermission(user, "web_search");

    // Rate check
    const rateCheck = checkRateLimit(user.id, 20);
    if (!rateCheck.allowed) {
      throw new ApiError("Rate limit exceeded. Please wait a moment before initiating another research search.", 429);
    }

    const json = await request.json();
    const { query, conversationId: reqConvId } = searchRequestSchema.parse(json);

    let convId = reqConvId;
    if (convId) {
      const existingConv = await conversationRepository.findById(convId);
      if (!existingConv) {
        throw new ApiError("Conversation not found", 404);
      }
      if (existingConv.userId !== user.id && user.role !== "principal") {
        throw new ApiError("Forbidden: You do not own this search session", 403);
      }
      await conversationRepository.touch(convId);
    } else {
      const title = query.length > 40 ? `${query.slice(0, 37)}...` : query;
      const newConv = await conversationRepository.create({
        userId: user.id,
        conversationType: "web_search",
        title,
      });
      convId = newConv.id;
    }

    await messageRepository.create({
      conversationId: convId,
      role: "user",
      content: query,
    });

    // Web search
    const { answer, sources } = await executeWebSearch(query);

    const assistantMessage = await messageRepository.create({
      conversationId: convId,
      role: "assistant",
      content: answer,
      sources,
    });

    // Persist search
    const searchRecord = await searchRepository.create({
      teacherId: user.id,
      conversationId: convId,
      query,
      response: answer,
      sources,
    });

    return successResponse({
      conversationId: convId,
      searchId: searchRecord.id,
      query,
      answer,
      sources,
      message: assistantMessage,
      createdAt: searchRecord.createdAt,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
