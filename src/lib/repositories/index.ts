import { UserRepository } from "./user.repository";
import { ConversationRepository } from "./conversation.repository";
import { MessageRepository } from "./message.repository";
import { ActivityRepository } from "./activity.repository";
import { SearchRepository } from "./search.repository";
import { MonitoringRepository } from "./monitoring.repository";

export * from "./interfaces";
export * from "./user.repository";
export * from "./conversation.repository";
export * from "./message.repository";
export * from "./activity.repository";
export * from "./search.repository";
export * from "./monitoring.repository";

export const userRepository = new UserRepository();
export const conversationRepository = new ConversationRepository();
export const messageRepository = new MessageRepository();
export const activityRepository = new ActivityRepository();
export const searchRepository = new SearchRepository();
export const monitoringRepository = new MonitoringRepository();
