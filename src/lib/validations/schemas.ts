import { z } from "zod";

export const tutoringRequestSchema = z.object({
  message: z
    .string({ required_error: "Message is required" })
    .trim()
    .min(1, "Message cannot be empty")
    .max(4000, "Message cannot exceed 4000 characters"),
  conversationId: z.string().optional(),
});

export const searchRequestSchema = z.object({
  query: z
    .string({ required_error: "Search query is required" })
    .trim()
    .min(2, "Search query must be at least 2 characters")
    .max(1000, "Search query cannot exceed 1000 characters"),
  conversationId: z.string().optional(),
});

export const createConversationSchema = z.object({
  title: z.string().trim().min(1).max(200).optional(),
  conversationType: z.enum(["tutoring", "web_search"]),
});

export const activityLogSchema = z.object({
  activityType: z.string().trim().min(1).max(100),
  conversationId: z.string().optional().nullable(),
  metadata: z.record(z.any()).optional().nullable(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});
