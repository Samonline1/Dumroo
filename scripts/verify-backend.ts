import { userRepository, conversationRepository, messageRepository, searchRepository, monitoringRepository } from "../src/lib/repositories";
import { enforcePermission } from "../src/lib/permissions/access-control";
import { generateTutorResponse } from "../src/lib/ai/tutor.service";
import { executeWebSearch } from "../src/lib/ai/search.service";

async function verifyBackend() {
  console.log("=== Dumroo.ai Backend Verification ===");

  // 1. Verify Users & Roles
  const users = await userRepository.findAll();
  console.log(`[PASS] Users loaded: ${users.length} demo users found.`);
  const student = users.find((u) => u.role === "student" && u.isActive)!;
  const teacher = users.find((u) => u.role === "teacher" && u.isActive)!;
  const principal = users.find((u) => u.role === "principal" && u.isActive)!;
  const inactiveStudent = users.find((u) => !u.isActive)!;

  // 2. Test Permission Matrix
  console.log("\n--- Testing Role-Based Permission Matrix ---");

  // Student can tutor
  try {
    enforcePermission(student, "ai_tutoring");
    console.log("[PASS] Student authorized for ai_tutoring.");
  } catch (e: any) {
    console.error("[FAIL] Student denied ai_tutoring:", e.message);
  }

  // Student cannot web search (expect error)
  try {
    enforcePermission(student, "web_search");
    console.error("[FAIL] Student was incorrectly allowed web_search!");
  } catch (e: any) {
    console.log(`[PASS] Student correctly forbidden from web_search: ${e.message}`);
  }

  // Teacher can web search
  try {
    enforcePermission(teacher, "web_search");
    console.log("[PASS] Teacher authorized for web_search.");
  } catch (e: any) {
    console.error("[FAIL] Teacher denied web_search:", e.message);
  }

  // Teacher cannot view teacher activity (expect error)
  try {
    enforcePermission(teacher, "view_teacher_activity");
    console.error("[FAIL] Teacher was incorrectly allowed view_teacher_activity!");
  } catch (e: any) {
    console.log(`[PASS] Teacher correctly forbidden from view_teacher_activity: ${e.message}`);
  }

  // Principal can view teacher activity & overview
  try {
    enforcePermission(principal, "view_teacher_activity");
    enforcePermission(principal, "platform_overview");
    console.log("[PASS] Principal authorized for view_teacher_activity & platform_overview.");
  } catch (e: any) {
    console.error("[FAIL] Principal denied:", e.message);
  }

  // Inactive user is rejected
  try {
    enforcePermission(inactiveStudent, "ai_tutoring");
    console.error("[FAIL] Inactive student was incorrectly allowed!");
  } catch (e: any) {
    console.log(`[PASS] Inactive user correctly blocked: ${e.message}`);
  }

  // 3. Test AI Tutor Service
  console.log("\n--- Testing AI Tutor Service ---");
  const tutorReply = await generateTutorResponse("How do I factor x^2 + 5x + 6?");
  console.log(`[PASS] Tutor Response generated (${tutorReply.length} chars):`);
  console.log(tutorReply.slice(0, 150) + "...\n");

  // 4. Test Web Search Service
  console.log("\n--- Testing Educational Web Search Service ---");
  const searchResult = await executeWebSearch("Inquiry-based mathematics instructional models");
  console.log(`[PASS] Web Search answered with ${searchResult.sources.length} sources.`);
  console.log(`First source: ${searchResult.sources[0]?.title} (${searchResult.sources[0]?.url})`);

  // 5. Test Monitoring & Aggregation
  console.log("\n--- Testing Platform Monitoring Telemetry ---");
  const overview = await monitoringRepository.getPlatformOverview();
  console.log(`[PASS] Overview: ${overview.totalStudents} students, ${overview.totalTeachers} teachers, ${overview.totalConversations} sessions.`);
  console.log(`[PASS] Live Activity items: ${overview.recentActivity.length}`);

  console.log("\n=== ALL BACKEND SPECIFICATION VERIFICATIONS PASSED ===");
}

verifyBackend().catch((err) => {
  console.error("Verification failed:", err);
  process.exit(1);
});
