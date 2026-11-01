import { NextRequest } from "next/server";
import { resolveDemoUser } from "@/lib/auth/demo-user";
import { enforcePermission } from "@/lib/permissions/access-control";
import { tutoringRequestSchema } from "@/lib/validations/schemas";
import {
  conversationRepository,
  messageRepository,
  activityRepository,
} from "@/lib/repositories";
import { generateTutorResponse } from "@/lib/ai/tutor.service";
import { checkRateLimit } from "@/lib/utils/rate-limiter";
import { successResponse } from "@/lib/utils/api-response";
import { handleApiError, ApiError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await resolveDemoUser(request);
    enforcePermission(user, "ai_tutoring");

    // Rate check
    const rateCheck = checkRateLimit(user.id, 30);
    if (!rateCheck.allowed) {
      throw new ApiError("Rate limit exceeded. Please wait a moment before sending more messages.", 429);
    }

    const json = await request.json();
    const { message: userText, conversationId: reqConvId } = tutoringRequestSchema.parse(json);

    let convId = reqConvId;
    if (convId) {
      const existingConv = await conversationRepository.findById(convId);
      if (!existingConv) {
        throw new ApiError("Conversation not found", 404);
      }
      if (existingConv.userId !== user.id) {
        throw new ApiError("Forbidden: You do not own this conversation", 403);
      }
      await conversationRepository.touch(convId);
    } else {
      const title = userText.length > 40 ? `${userText.slice(0, 37)}...` : userText;
      const newConv = await conversationRepository.create({
        userId: user.id,
        conversationType: "tutoring",
        title,
      });
      convId = newConv.id;
    }

    const savedUserMessage = await messageRepository.create({
      conversationId: convId,
      role: "user",
      content: userText,
    });

    const history = await messageRepository.getRecentContext(convId, 15);

    // AI generation
    const tutorResponseText = await generateTutorResponse(userText, history);

    const savedAssistantMessage = await messageRepository.create({
      conversationId: convId,
      role: "assistant",
      content: tutorResponseText,
    });

    // Activity log
    await activityRepository.log({
      studentId: user.id,
      activityType: "question_asked",
      conversationId: convId,
      metadata: {
        snippet: userText.slice(0, 100),
      },
    });

    return successResponse({
      conversationId: convId,
      userMessage: savedUserMessage,
      message: savedAssistantMessage,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
