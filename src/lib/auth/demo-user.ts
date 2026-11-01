import { NextRequest } from "next/server";
import { userRepository } from "@/lib/repositories";
import { DemoUser } from "@/types";
import { ApiError } from "@/lib/utils/error-handler";

export async function resolveDemoUser(request: NextRequest): Promise<DemoUser> {
  const headerId = request.headers.get("x-demo-user-id");
  const cookieId = request.cookies.get("demo_user_id")?.value;
  const searchParamId = request.nextUrl.searchParams.get("demoUserId");

  const userId = headerId || cookieId || searchParamId;

  if (!userId) {
    throw new ApiError("Unauthorized: Missing demo user identity", 401);
  }

  const user = await userRepository.findById(userId);

  if (!user) {
    throw new ApiError("Unauthorized: Invalid demo user identity", 401);
  }

  if (!user.isActive) {
    throw new ApiError("Forbidden: User account is inactive", 403);
  }

  return user;
}
