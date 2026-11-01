import {
  DemoUser,
  Conversation,
  ConversationType,
  Message,
  StudentActivity,
  TeacherSearch,
  StudentMonitoringItem,
  TeacherMonitoringItem,
  PlatformOverviewStats,
} from "@/types";

export interface IUserRepository {
  findById(id: string): Promise<DemoUser | null>;
  findAll(): Promise<DemoUser[]>;
  findByRole(role: string): Promise<DemoUser[]>;
  upsert(user: DemoUser): Promise<void>;
}

export interface IConversationRepository {
  create(data: { id?: string; userId: string; conversationType: ConversationType; title: string }): Promise<Conversation>;
  findById(id: string): Promise<Conversation | null>;
  findByUserId(
    userId: string,
    type?: ConversationType,
    page?: number,
    limit?: number
  ): Promise<{ items: Conversation[]; total: number; page: number; limit: number }>;
  updateTitle(id: string, title: string): Promise<void>;
  touch(id: string): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IMessageRepository {
  create(data: {
    id?: string;
    conversationId: string;
    role: "user" | "assistant";
    content: string;
    sources?: unknown;
  }): Promise<Message>;
  findByConversationId(
    conversationId: string,
    page?: number,
    limit?: number
  ): Promise<{ items: Message[]; total: number; page: number; limit: number }>;
  getRecentContext(conversationId: string, limit?: number): Promise<Message[]>;
}

export interface IActivityRepository {
  log(data: {
    studentId: string;
    activityType: string;
    conversationId?: string | null;
    metadata?: Record<string, unknown> | null;
  }): Promise<StudentActivity>;
  findByStudentId(
    studentId: string,
    page?: number,
    limit?: number
  ): Promise<{ items: StudentActivity[]; total: number; page: number; limit: number }>;
  findAll(
    page?: number,
    limit?: number
  ): Promise<{ items: StudentActivity[]; total: number; page: number; limit: number }>;
}

export interface ISearchRepository {
  create(data: {
    teacherId: string;
    conversationId: string;
    query: string;
    response: string;
    sources?: unknown;
  }): Promise<TeacherSearch>;
  findByTeacherId(
    teacherId: string,
    page?: number,
    limit?: number
  ): Promise<{ items: TeacherSearch[]; total: number; page: number; limit: number }>;
  findByRole(
    role: "teacher" | "principal",
    page?: number,
    limit?: number
  ): Promise<{ items: TeacherSearch[]; total: number; page: number; limit: number }>;
  findAll(
    page?: number,
    limit?: number
  ): Promise<{ items: TeacherSearch[]; total: number; page: number; limit: number }>;
}

export interface IMonitoringRepository {
  getStudentsMonitoring(page?: number, limit?: number): Promise<{ items: StudentMonitoringItem[]; total: number }>;
  getTeachersMonitoring(page?: number, limit?: number): Promise<{ items: TeacherMonitoringItem[]; total: number }>;
  getPlatformOverview(): Promise<PlatformOverviewStats>;
}
