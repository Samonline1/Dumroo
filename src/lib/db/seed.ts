import "./load-env";
import { getPostgresDb } from "./connection";
import {
  demoUsers,
  conversations,
  messages,
} from "./schema";

export const SEED_USERS = [
  {
    id: "demo-student-1",
    name: "Alex Rivera",
    role: "student" as const,
    isActive: true,
  },
  {
    id: "demo-teacher-1",
    name: "Prof. Clara Edwards",
    role: "teacher" as const,
    isActive: true,
  },
  {
    id: "demo-principal-1",
    name: "Dr. Arthur Vance (Principal)",
    role: "principal" as const,
    isActive: true,
  },
  {
    id: "demo-inactive-1",
    name: "Jordan Smith (Inactive Student)",
    role: "student" as const,
    isActive: false,
  },
];

export async function runSeed() {
  console.log("Seeding PostgreSQL database with demo personas...");
  const { db, client } = getPostgresDb();
  const now = new Date();

  for (const u of SEED_USERS) {
    await db
      .insert(demoUsers)
      .values({
        id: u.id,
        name: u.name,
        role: u.role,
        isActive: u.isActive,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: demoUsers.id,
        set: {
          name: u.name,
          role: u.role,
          isActive: u.isActive,
          updatedAt: now,
        },
      });
  }

  const sampleConvId = "conv-student-math-1";
  await db
    .insert(conversations)
    .values({
      id: sampleConvId,
      userId: "demo-student-1",
      conversationType: "tutoring",
      title: "Understanding Quadratic Equations",
      createdAt: new Date(Date.now() - 3600000 * 2),
      updatedAt: new Date(Date.now() - 3600000),
    })
    .onConflictDoNothing();

  await db
    .insert(messages)
    .values([
      {
        id: "msg-sample-1",
        conversationId: sampleConvId,
        role: "user",
        content: "Hi! Can you help me understand how to solve x^2 - 5x + 6 = 0?",
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        id: "msg-sample-2",
        conversationId: sampleConvId,
        role: "assistant",
        content:
          "Hello Alex! Let's work through this step by step.\n\nFirst, take a look at the equation: **x² - 5x + 6 = 0**.\n\n**Hint:** We can factor this trinomial! Think of two numbers that multiply to give **+6** (the constant term) and add up to give **-5** (the coefficient of x).\n\nWhat two numbers come to mind?",
        createdAt: new Date(Date.now() - 3600000 * 2 + 10000),
      },
    ])
    .onConflictDoNothing();

  await client.end();
  console.log("PostgreSQL database seeding complete.");
}

if (require.main === module || process.argv[1]?.endsWith("seed.ts")) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
