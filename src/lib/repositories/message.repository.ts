import { getDb } from "@/lib/db";
import { messages } from "@/lib/db/schema";
import { Message, MessageRole, SearchSource } from "@/types";
import { IMessageRepository } from "./interfaces";
import { eq, asc, desc, sql } from "drizzle-orm";
import crypto from "crypto";

export class MessageRepository implements IMessageRepository {
  async create(data: {
    id?: string;
    conversationId: string;
    role: "user" | "assistant";
    content: string;
    sources?: unknown;
  }): Promise<Message> {
    const db = getDb();
    const id = data.id || crypto.randomUUID();
    const now = new Date();

    await db.insert(messages).values({
      id,
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      sources: data.sources as any,
      createdAt: now,
    });

    return {
      id,
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      sources: (data.sources as SearchSource[]) ?? null,
      createdAt: now.toISOString(),
    };
  }

  async findByConversationId(
    conversationId: string,
    page = 1,
    limit = 50
  ): Promise<{ items: Message[]; total: number; page: number; limit: number }> {
    const db = getDb();
    const offset = (page - 1) * limit;

    const [countRes] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(messages)
      .where(eq(messages.conversationId, conversationId));
    const total = Number(countRes?.count ?? 0);

    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(asc(messages.createdAt))
      .limit(limit)
      .offset(offset);

    return {
      items: rows.map((r) => ({
        id: r.id,
        conversationId: r.conversationId,
        role: r.role as MessageRole,
        content: r.content,
        sources: (r.sources as SearchSource[]) || null,
        createdAt: r.createdAt.toISOString(),
      })),
      total,
      page,
      limit,
    };
  }

  async getRecentContext(conversationId: string, limit = 20): Promise<Message[]> {
    const db = getDb();
    const rows = await db
      .select()
      .from(messages)
      .where(eq(messages.conversationId, conversationId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    return rows.reverse().map((r) => ({
      id: r.id,
      conversationId: r.conversationId,
      role: r.role as MessageRole,
      content: r.content,
      sources: (r.sources as SearchSource[]) || null,
      createdAt: r.createdAt.toISOString(),
    }));
  }
}
