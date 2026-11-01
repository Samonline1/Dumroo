import { DemoUser, UserRole } from "@/types";
import { ApiError } from "@/lib/utils/error-handler";

export type AppFeature =
  | "ai_tutoring"
  | "web_search"
  | "search_history_own"
  | "search_history_all"
  | "view_student_activity"
  | "view_teacher_activity"
  | "platform_overview";

const ROLE_PERMISSIONS: Record<UserRole, Set<AppFeature>> = {
  student: new Set<AppFeature>(["ai_tutoring"]),
  teacher: new Set<AppFeature>([
    "web_search",
    "search_history_own",
    "view_student_activity",
  ]),
  principal: new Set<AppFeature>([
    "web_search",
    "search_history_own",
    "search_history_all",
    "view_student_activity",
    "view_teacher_activity",
    "platform_overview",
  ]),
};

export function hasPermission(user: DemoUser, feature: AppFeature): boolean {
  if (!user.isActive) return false;
  const permissions = ROLE_PERMISSIONS[user.role];
  return Boolean(permissions && permissions.has(feature));
}

export function enforcePermission(user: DemoUser, feature: AppFeature): void {
  if (!hasPermission(user, feature)) {
    throw new ApiError(
      `Forbidden: Role '${user.role}' is not authorized to access feature '${feature}'`,
      403
    );
  }
}

export function enforceRoles(user: DemoUser, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(user.role)) {
    throw new ApiError(
      `Forbidden: Role '${user.role}' is not authorized for this action`,
      403
    );
  }
}
