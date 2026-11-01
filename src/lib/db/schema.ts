import { pgTable, text, boolean, jsonb, index, timestamp } from "drizzle-orm/pg-core";

export const demoUsers = pgTable(
  "demo_users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    role: text("role").notNull(), // "student" | "teacher" | "principal"
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    roleIdx: index("users_role_idx").on(table.role),
  })
);

export const conversations = pgTable(
  "conversations",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => demoUsers.id, { onDelete: "cascade" }),
    conversationType: text("conversation_type").notNull(), // "tutoring" | "web_search"
    title: text("title").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index("conversations_user_id_idx").on(table.userId),
    createdAtIdx: index("conversations_created_at_idx").on(table.createdAt),
  })
);

export const messages = pgTable(
  "messages",
  {
    id: text("id").primaryKey(),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    role: text("role").notNull(), // "user" | "assistant"
    content: text("content").notNull(),
    sources: jsonb("sources"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    conversationIdIdx: index("messages_conversation_id_idx").on(table.conversationId),
    createdAtIdx: index("messages_created_at_idx").on(table.createdAt),
  })
);

export const studentActivity = pgTable(
  "student_activity",
  {
    id: text("id").primaryKey(),
    studentId: text("student_id")
      .notNull()
      .references(() => demoUsers.id, { onDelete: "cascade" }),
    activityType: text("activity_type").notNull(),
    conversationId: text("conversation_id").references(() => conversations.id, {
      onDelete: "set null",
    }),
    metadata: jsonb("metadata"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    studentIdIdx: index("student_activity_student_id_idx").on(table.studentId),
    createdAtIdx: index("student_activity_created_at_idx").on(table.createdAt),
  })
);

export const teacherSearches = pgTable(
  "teacher_searches",
  {
    id: text("id").primaryKey(),
    teacherId: text("teacher_id")
      .notNull()
      .references(() => demoUsers.id, { onDelete: "cascade" }),
    conversationId: text("conversation_id")
      .notNull()
      .references(() => conversations.id, { onDelete: "cascade" }),
    query: text("query").notNull(),
    response: text("response").notNull(),
    sources: jsonb("sources"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    teacherIdIdx: index("teacher_searches_teacher_id_idx").on(table.teacherId),
    createdAtIdx: index("teacher_searches_created_at_idx").on(table.createdAt),
  })
);
