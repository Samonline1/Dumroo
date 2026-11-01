import { DemoUser, Conversation, Message, SearchSource, StudentActivity, TeacherSearch } from "./database";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    hasMore?: boolean;
  };
}

export interface TutoringRequestPayload {
  conversationId?: string;
  message: string;
}

export interface TutoringResponsePayload {
  conversationId: string;
  message: Message;
}

export interface SearchRequestPayload {
  query: string;
  conversationId?: string;
}

export interface SearchResponsePayload {
  conversationId: string;
  query: string;
  answer: string;
  sources: SearchSource[];
  createdAt: string;
}

export interface StudentMonitoringItem {
  id: string;
  name: string;
  isActive: boolean;
  totalConversations: number;
  totalMessages: number;
  lastActive: string | null;
  recentActivities: StudentActivity[];
}

export interface TeacherMonitoringItem {
  id: string;
  name: string;
  isActive: boolean;
  totalSearches: number;
  lastActive: string | null;
  recentSearches: TeacherSearch[];
}

export interface PlatformOverviewStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalConversations: number;
  totalMessages: number;
  totalSearches: number;
  recentActivity: Array<{
    id: string;
    userName: string;
    userRole: string;
    type: string;
    description: string;
    timestamp: string;
  }>;
}
