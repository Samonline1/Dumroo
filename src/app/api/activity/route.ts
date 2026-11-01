import { NextRequest } from "next/server";
import { resolveDemoUser } from "@/lib/auth/demo-user";
import { activityLogSchema } from "@/lib/validations/schemas";
import { activityRepository } from "@/lib/repositories";
import { successResponse } from "@/lib/utils/api-response";
import { handleApiError } from "@/lib/utils/error-handler";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const user = await resolveDemoUser(request);
    const json = await request.json();
    const data = activityLogSchema.parse(json);

    const record = await activityRepository.log({
      studentId: user.id,
      activityType: data.activityType,
      conversationId: data.conversationId,
      metadata: data.metadata,
    });

    return successResponse(record, 201);
  } catch (error) {
    return handleApiError(error);
  }
}
