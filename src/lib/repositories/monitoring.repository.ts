import { getDb, demoUsers, conversations, messages, studentActivity, teacherSearches } from "@/lib/db";
import {
  StudentMonitoringItem,
  TeacherMonitoringItem,
  PlatformOverviewStats,
} from "@/types";
import { IMonitoringRepository } from "./interfaces";
import { eq, desc, sql } from "drizzle-orm";

export class MonitoringRepository implements IMonitoringRepository {
  async getStudentsMonitoring(
    page = 1,
    limit = 20
  ): Promise<{ items: StudentMonitoringItem[]; total: number }> {
    const db = getDb();
    const offset = (page - 1) * limit;

    const [totalRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(demoUsers)
      .where(eq(demoUsers.role, "student"));
    const total = Number(totalRes?.count ?? 0);

    const students = await db
      .select()
      .from(demoUsers)
      .where(eq(demoUsers.role, "student"))
      .limit(limit)
      .offset(offset);

    const result: StudentMonitoringItem[] = [];

    for (const student of students) {
      const [convCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(conversations)
        .where(eq(conversations.userId, student.id));

      const [msgCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(messages)
        .innerJoin(conversations, eq(messages.conversationId, conversations.id))
        .where(eq(conversations.userId, student.id));

      const recentActs = await db
        .select()
        .from(studentActivity)
        .where(eq(studentActivity.studentId, student.id))
        .orderBy(desc(studentActivity.createdAt))
        .limit(5);

      const lastActivityTime = recentActs[0]?.createdAt
        ? recentActs[0].createdAt.toISOString()
        : student.createdAt.toISOString();

      result.push({
        id: student.id,
        name: student.name,
        isActive: Boolean(student.isActive),
        totalConversations: Number(convCount?.count ?? 0),
        totalMessages: Number(msgCount?.count ?? 0),
        lastActive: lastActivityTime,
        recentActivities: recentActs.map((a: any) => ({
          id: a.id,
          studentId: a.studentId,
          activityType: a.activityType,
          conversationId: a.conversationId,
          metadata: a.metadata as Record<string, unknown> | null,
          createdAt: a.createdAt.toISOString(),
        })),
      });
    }

    return { items: result, total };
  }

  async getTeachersMonitoring(
    page = 1,
    limit = 20
  ): Promise<{ items: TeacherMonitoringItem[]; total: number }> {
    const db = getDb();
    const offset = (page - 1) * limit;

    const [totalRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(demoUsers)
      .where(eq(demoUsers.role, "teacher"));
    const total = Number(totalRes?.count ?? 0);

    const teachers = await db
      .select()
      .from(demoUsers)
      .where(eq(demoUsers.role, "teacher"))
      .limit(limit)
      .offset(offset);

    const result: TeacherMonitoringItem[] = [];

    for (const teacher of teachers) {
      const [searchCount] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(teacherSearches)
        .where(eq(teacherSearches.teacherId, teacher.id));

      const recentSearches = await db
        .select()
        .from(teacherSearches)
        .where(eq(teacherSearches.teacherId, teacher.id))
        .orderBy(desc(teacherSearches.createdAt))
        .limit(5);

      const lastActiveTime = recentSearches[0]?.createdAt
        ? recentSearches[0].createdAt.toISOString()
        : teacher.createdAt.toISOString();

      result.push({
        id: teacher.id,
        name: teacher.name,
        isActive: Boolean(teacher.isActive),
        totalSearches: Number(searchCount?.count ?? 0),
        lastActive: lastActiveTime,
        recentSearches: recentSearches.map((s: any) => ({
          id: s.id,
          teacherId: s.teacherId,
          conversationId: s.conversationId,
          query: s.query,
          response: s.response,
          sources: (s.sources as any) || null,
          createdAt: s.createdAt.toISOString(),
        })),
      });
    }

    return { items: result, total };
  }

  async getPlatformOverview(): Promise<PlatformOverviewStats> {
    const db = getDb();

    const [allStudents] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`sum(case when is_active = true then 1 else 0 end)::int`,
      })
      .from(demoUsers)
      .where(eq(demoUsers.role, "student"));

    const [allTeachers] = await db
      .select({
        total: sql<number>`count(*)::int`,
        active: sql<number>`sum(case when is_active = true then 1 else 0 end)::int`,
      })
      .from(demoUsers)
      .where(eq(demoUsers.role, "teacher"));

    const [convRes] = await db.select({ count: sql<number>`count(*)::int` }).from(conversations);
    const [msgRes] = await db.select({ count: sql<number>`count(*)::int` }).from(messages);
    const [searchRes] = await db.select({ count: sql<number>`count(*)::int` }).from(teacherSearches);

    const studentActs = await db
      .select({
        id: studentActivity.id,
        userName: demoUsers.name,
        userRole: demoUsers.role,
        type: studentActivity.activityType,
        description: sql<string>`'Student event: ' || ${studentActivity.activityType}`,
        timestamp: studentActivity.createdAt,
      })
      .from(studentActivity)
      .innerJoin(demoUsers, eq(studentActivity.studentId, demoUsers.id))
      .orderBy(desc(studentActivity.createdAt))
      .limit(10);

    const searches = await db
      .select({
        id: teacherSearches.id,
        userName: demoUsers.name,
        userRole: demoUsers.role,
        type: sql<string>`'web_search'`,
        description: sql<string>`'Searched: ' || ${teacherSearches.query}`,
        timestamp: teacherSearches.createdAt,
      })
      .from(teacherSearches)
      .innerJoin(demoUsers, eq(teacherSearches.teacherId, demoUsers.id))
      .orderBy(desc(teacherSearches.createdAt))
      .limit(10);

    const merged = [
      ...studentActs.map((a: any) => ({ ...a, timestamp: a.timestamp.toISOString() })),
      ...searches.map((s: any) => ({ ...s, timestamp: s.timestamp.toISOString() })),
    ]
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 15);

    return {
      totalStudents: Number(allStudents?.total ?? 0),
      activeStudents: Number(allStudents?.active ?? 0),
      totalTeachers: Number(allTeachers?.total ?? 0),
      activeTeachers: Number(allTeachers?.active ?? 0),
      totalConversations: Number(convRes?.count ?? 0),
      totalMessages: Number(msgRes?.count ?? 0),
      totalSearches: Number(searchRes?.count ?? 0),
      recentActivity: merged,
    };
  }
}
