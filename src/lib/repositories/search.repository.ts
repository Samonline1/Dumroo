import { getDb, teacherSearches, demoUsers } from "@/lib/db";
import { TeacherSearch, SearchSource } from "@/types";
import { ISearchRepository } from "./interfaces";
import { eq, desc, sql } from "drizzle-orm";
import crypto from "crypto";

export class SearchRepository implements ISearchRepository {
  async create(data: {
    teacherId: string;
    conversationId: string;
    query: string;
    response: string;
    sources?: unknown;
  }): Promise<TeacherSearch> {
    const db = getDb();
    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(teacherSearches).values({
      id,
      teacherId: data.teacherId,
      conversationId: data.conversationId,
      query: data.query,
      response: data.response,
      sources: data.sources as any,
      createdAt: now,
    });

    return {
      id,
      teacherId: data.teacherId,
      conversationId: data.conversationId,
      query: data.query,
      response: data.response,
      sources: (data.sources as SearchSource[]) ?? null,
      createdAt: now.toISOString(),
    };
  }

  async findByTeacherId(
    teacherId: string,
    page = 1,
    limit = 20
  ): Promise<{ items: TeacherSearch[]; total: number; page: number; limit: number }> {
    const db = getDb();
    const offset = (page - 1) * limit;

    const [countRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(teacherSearches)
      .where(eq(teacherSearches.teacherId, teacherId));
    const total = Number(countRes?.count ?? 0);

    const rows = await db
      .select()
      .from(teacherSearches)
      .where(eq(teacherSearches.teacherId, teacherId))
      .orderBy(desc(teacherSearches.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items: rows.map((r: any) => ({
        id: r.id,
        teacherId: r.teacherId,
        conversationId: r.conversationId,
        query: r.query,
        response: r.response,
        sources: (r.sources as SearchSource[]) || null,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async findByRole(
    role: "teacher" | "principal",
    page = 1,
    limit = 20
  ): Promise<{ items: TeacherSearch[]; total: number; page: number; limit: number }> {
    const db = getDb();
    const offset = (page - 1) * limit;

    const [countRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(teacherSearches)
      .innerJoin(demoUsers, eq(teacherSearches.teacherId, demoUsers.id))
      .where(eq(demoUsers.role, role));
    const total = Number(countRes?.count ?? 0);

    const rows = await db
      .select({
        id: teacherSearches.id,
        teacherId: teacherSearches.teacherId,
        conversationId: teacherSearches.conversationId,
        query: teacherSearches.query,
        response: teacherSearches.response,
        sources: teacherSearches.sources,
        createdAt: teacherSearches.createdAt,
      })
      .from(teacherSearches)
      .innerJoin(demoUsers, eq(teacherSearches.teacherId, demoUsers.id))
      .where(eq(demoUsers.role, role))
      .orderBy(desc(teacherSearches.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items: rows.map((r: any) => ({
        id: r.id,
        teacherId: r.teacherId,
        conversationId: r.conversationId,
        query: r.query,
        response: r.response,
        sources: (r.sources as SearchSource[]) || null,
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
  ): Promise<{ items: TeacherSearch[]; total: number; page: number; limit: number }> {
    const db = getDb();
    const offset = (page - 1) * limit;

    const [countRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(teacherSearches);
    const total = Number(countRes?.count ?? 0);

    const rows = await db
      .select()
      .from(teacherSearches)
      .orderBy(desc(teacherSearches.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items: rows.map((r: any) => ({
        id: r.id,
        teacherId: r.teacherId,
        conversationId: r.conversationId,
        query: r.query,
        response: r.response,
        sources: (r.sources as SearchSource[]) || null,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }
}
