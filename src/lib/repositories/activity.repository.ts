import { getDb } from "@/lib/db";
import { studentActivity } from "@/lib/db/schema";
import { StudentActivity } from "@/types";
import { IActivityRepository } from "./interfaces";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

export class ActivityRepository implements IActivityRepository {
  async log(data: {
    studentId: string;
    activityType: string;
    conversationId?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<StudentActivity> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(studentActivity).values({
      id,
      studentId: data.studentId,
      activityType: data.activityType,
      conversationId: data.conversationId || null,
      metadata: data.metadata || null,
      createdAt: now,
    });

    return {
      id,
      studentId: data.studentId,
      activityType: data.activityType,
      conversationId: data.conversationId || null,
      metadata: data.metadata || null,
      createdAt: now.toISOString(),
    };
  }

  async findByStudentId(
    studentId: string,
    page = 1,
    limit = 20
  ): Promise<{ items: StudentActivity[]; total: number; page: number; limit: number }> {
    const db = getDb();
    const offset = (page - 1) * limit;

    const [countRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(studentActivity)
      .where(eq(studentActivity.studentId, studentId));
    const total = Number(countRes?.count ?? 0);

    const rows = await db
      .select()
      .from(studentActivity)
      .where(eq(studentActivity.studentId, studentId))
      .orderBy(desc(studentActivity.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items: rows.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        activityType: r.activityType,
        conversationId: r.conversationId,
        metadata: r.metadata as Record<string, unknown> | null,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async findAll(
    page = 1,
    limit = 20
  ): Promise<{ items: StudentActivity[]; total: number; page: number; limit: number }> {
    const db = getDb();
    const offset = (page - 1) * limit;

    const [countRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(studentActivity);
    const total = Number(countRes?.count ?? 0);

    const rows = await db
      .select()
      .from(studentActivity)
      .orderBy(desc(studentActivity.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items: rows.map((r) => ({
        id: r.id,
        studentId: r.studentId,
        activityType: r.activityType,
        conversationId: r.conversationId,
        metadata: r.metadata as Record<string, unknown> | null,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }
}
