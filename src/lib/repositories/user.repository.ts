import { getDb } from "@/lib/db";
import { demoUsers } from "@/lib/db/schema";
import { DemoUser } from "@/types";
import { IUserRepository } from "./interfaces";
import { eq } from "drizzle-orm";

export class UserRepository implements IUserRepository {
  async findById(id: string): Promise<DemoUser | null> {
    const db = getDb();
    const rows = await db.select().from(demoUsers).where(eq(demoUsers.id, id)).limit(1);
    if (!rows.length) return null;
    const r = rows[0];
    return {
      id: r.id,
      name: r.name,
      role: r.role as any,
      isActive: Boolean(r.isActive),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    };
  }

  async findAll(): Promise<DemoUser[]> {
    const db = getDb();
    const rows = await db.select().from(demoUsers);
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role as any,
      isActive: Boolean(r.isActive),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async findByRole(role: string): Promise<DemoUser[]> {
    const db = getDb();
    const rows = await db.select().from(demoUsers).where(eq(demoUsers.role, role));
    return rows.map((r) => ({
      id: r.id,
      name: r.name,
      role: r.role as any,
      isActive: Boolean(r.isActive),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));
  }

  async upsert(user: DemoUser): Promise<void> {
    const db = getDb();
    const now = new Date();
    await db
      .insert(demoUsers)
      .values({
        id: user.id,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: new Date(user.createdAt || now),
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: demoUsers.id,
        set: {
          name: user.name,
          role: user.role,
          isActive: user.isActive,
          updatedAt: now,
        },
      });
  }
}
