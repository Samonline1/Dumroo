export type UserRole = "student" | "teacher" | "principal";

export interface DemoUser {
  id: string;
  name: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ConversationType = "tutoring" | "web_search";

export interface Conversation {
  id: string;
  userId: string;
  conversationType: ConversationType;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export type MessageRole = "user" | "assistant";

export interface SearchSource {
  title: string;
  url: string;
  snippet?: string;
}

export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  sources?: SearchSource[] | null;
  createdAt: string;
}

export interface StudentActivity {
  id: string;
  studentId: string;
  activityType: string;
  conversationId?: string | null;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface TeacherSearch {
  id: string;
  teacherId: string;
  conversationId: string;
  query: string;
  response: string;
  sources?: SearchSource[] | null;
  createdAt: string;
}
