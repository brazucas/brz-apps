export type RaidEvent = {
  id: string;
  guildId: string;
  channelId: string;
  messageId: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  timezone: string;
  roles: EventRole[];
  signups: Signup[];
  bench: Signup[];
  createdBy: string;
  createdAt: string;
  cancelled: boolean;
  noticeMinutes: number[];
  notificationsSent: number[];
  recurrence?: RecurrenceConfig;
};

export type EventRole = {
  name: string;
  maxCount: number;
  emoji: string;
};

export type Signup = {
  userId: string;
  username: string;
  roleName: string;
  timestamp: string;
};

export type RecurrenceConfig = {
  enabled: boolean;
  frequency: "weekly" | "daily";
  dayOfWeek?: number;
  timeOfDay: string;
};

export type EventCreationParams = {
  guildId: string;
  channelId: string;
  name: string;
  description: string;
  startDate: string;
  endDate?: string;
  timezone: string;
  roles: EventRole[];
  createdBy: string;
  noticeMinutes: number[];
  recurrence?: RecurrenceConfig;
};

export type SignupAction = {
  eventId: string;
  userId: string;
  username: string;
  roleName: string;
};

export type NotificationJob = {
  eventId: string;
  minutesBefore: number;
  scheduledFor: string;
};
