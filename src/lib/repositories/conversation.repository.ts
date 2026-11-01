import { getDb } from "@/lib/db";
import { conversations } from "@/lib/db/schema";
import { Conversation, ConversationType } from "@/types";
import { IConversationRepository } from "./interfaces";
import { eq, and, desc, sql } from "drizzle-orm";
import crypto from "crypto";

export class ConversationRepository implements IConversationRepository {
  async create(data: {
    id?: string;
    userId: string;
    conversationType: ConversationType;
    title: string;
  }): Promise<Conversation> {
    const db = getDb();
    const id = data.id || crypto.randomUUID();
    const now = new Date();

    await db.insert(conversations).values({
      id,
      userId: data.userId,
      conversationType: data.conversationType,
      title: data.title,
      createdAt: now,
      updatedAt: now,
    });

    return {
      id,
      userId: data.userId,
      conversationType: data.conversationType,
      title: data.title,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
  }

  async findById(id: string): Promise<Conversation | null> {
    const db = getDb();
    const rows = await db.select().from(conversations).where(eq(conversations.id, id)).limit(1);
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      userId: r.userId,
      conversationType: r.conversationType as ConversationType,
      title: r.title,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  async findByUserId(
    userId: string,
    type?: ConversationType,
    page = 1,
    limit = 20
  ): Promise<{ items: Conversation[]; total: number; page: number; limit: number }> {
    const db = getDb();
    const offset = (page - 1) * limit;

    const condition = type
      ? and(eq(conversations.userId, userId), eq(conversations.conversationType, type))
      : eq(conversations.userId, userId);

    const [countRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(conversations)
      .where(condition);
    const total = Number(countRes?.count ?? 0);

    const rows = await db
      .select()
      .from(conversations)
      .where(condition)
      .orderBy(desc(conversations.updatedAt))
      .limit(limit)
      .offset(offset);

    return {
      items: rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        conversationType: r.conversationType as ConversationType,
        title: r.title,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async updateTitle(id: string, title: string): Promise<void> {
    const db = getDb();
    await db
      .update(conversations)
      .set({ title, updatedAt: new Date() })
      .where(eq(conversations.id, id));
  }

  async touch(id: string): Promise<void> {
    const db = getDb();
    await db
      .update(conversations)
      .set({ updatedAt: new Date() })
      .where(eq(conversations.id, id));
  }

  async delete(id: string): Promise<void> {
    const db = getDb();
    await db.delete(conversations).where(eq(conversations.id, id));
  }
}
