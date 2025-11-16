import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";
import { RaidEvent, EventCreationParams, Signup } from "../types";
import { config } from "../config";
import { calculateTTL } from "../utils/date-utils";

const client = new DynamoDBClient({ region: config.aws.region });
const docClient = DynamoDBDocumentClient.from(client);

export const createEvent = async (
  params: EventCreationParams
): Promise<RaidEvent> => {
  const event: RaidEvent = {
    id: `${params.guildId}-${Date.now()}`,
    guildId: params.guildId,
    channelId: params.channelId,
    messageId: "",
    name: params.name,
    description: params.description,
    startDate: params.startDate,
    endDate: params.endDate,
    timezone: params.timezone,
    language: params.language,
    roles: params.roles,
    signups: [],
    bench: [],
    createdBy: params.createdBy,
    createdAt: new Date().toISOString(),
    cancelled: false,
    noticeMinutes: params.noticeMinutes,
    notificationsSent: [],
    recurrence: params.recurrence,
  };

  const ttl = calculateTTL(event.endDate);

  await docClient.send(
    new PutCommand({
      TableName: config.aws.eventsTable,
      Item: {
        ...event,
        cancelled: event.cancelled ? 1 : 0,
        ttl,
      },
    })
  );

  return event;
};

export const getEvent = async (eventId: string): Promise<RaidEvent | null> => {
  const result = await docClient.send(
    new GetCommand({
      TableName: config.aws.eventsTable,
      Key: { id: eventId },
    })
  );

  if (!result.Item) {
    return null;
  }

  const item = result.Item as any;
  return {
    ...item,
    cancelled: item.cancelled === 1 || item.cancelled === true,
  } as RaidEvent;
};

export const updateEventMessageId = async (
  eventId: string,
  messageId: string
): Promise<void> => {
  await docClient.send(
    new UpdateCommand({
      TableName: config.aws.eventsTable,
      Key: { id: eventId },
      UpdateExpression: "SET messageId = :messageId",
      ExpressionAttributeValues: {
        ":messageId": messageId,
      },
    })
  );
};

export const addSignup = async (
  eventId: string,
  signup: Signup
): Promise<RaidEvent> => {
  const event = await getEvent(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  const role = event.roles.find((r) => r.name === signup.roleName);
  if (!role) {
    throw new Error("Role not found");
  }

  const existingSignupIndex = event.signups.findIndex(
    (s) => s.userId === signup.userId
  );
  if (existingSignupIndex >= 0) {
    event.signups.splice(existingSignupIndex, 1);
  }

  const benchIndex = event.bench.findIndex((s) => s.userId === signup.userId);
  if (benchIndex >= 0) {
    event.bench.splice(benchIndex, 1);
  }

  const roleSignups = event.signups.filter(
    (s) => s.roleName === signup.roleName
  );

  if (roleSignups.length >= role.maxCount) {
    event.bench.push(signup);
  } else {
    event.signups.push(signup);
  }

  await docClient.send(
    new PutCommand({
      TableName: config.aws.eventsTable,
      Item: {
        ...event,
        cancelled: event.cancelled ? 1 : 0,
      },
    })
  );

  return event;
};

export const removeSignup = async (
  eventId: string,
  userId: string
): Promise<RaidEvent> => {
  const event = await getEvent(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  const signupIndex = event.signups.findIndex((s) => s.userId === userId);
  if (signupIndex >= 0) {
    const removedSignup = event.signups.splice(signupIndex, 1)[0];
    const roleName = removedSignup.roleName;

    const benchPlayerIndex = event.bench.findIndex(
      (s) => s.roleName === roleName
    );
    if (benchPlayerIndex >= 0) {
      const benchPlayer = event.bench.splice(benchPlayerIndex, 1)[0];
      event.signups.push(benchPlayer);
    }
  } else {
    const benchIndex = event.bench.findIndex((s) => s.userId === userId);
    if (benchIndex >= 0) {
      event.bench.splice(benchIndex, 1);
    }
  }

  await docClient.send(
    new PutCommand({
      TableName: config.aws.eventsTable,
      Item: {
        ...event,
        cancelled: event.cancelled ? 1 : 0,
      },
    })
  );

  return event;
};

export const cancelEvent = async (eventId: string): Promise<RaidEvent> => {
  const event = await getEvent(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  event.cancelled = true;

  await docClient.send(
    new PutCommand({
      TableName: config.aws.eventsTable,
      Item: {
        ...event,
        cancelled: 1,
      },
    })
  );

  return event;
};

export const getUpcomingEvents = async (): Promise<RaidEvent[]> => {
  const now = new Date().toISOString();

  const result = await docClient.send(
    new QueryCommand({
      TableName: config.aws.eventsTable,
      IndexName: "startDate-index",
      KeyConditionExpression: "cancelled = :cancelled AND startDate > :now",
      ExpressionAttributeValues: {
        ":cancelled": 0,
        ":now": now,
      },
    })
  );

  return (result.Items || []).map((item: any) => ({
    ...item,
    cancelled: item.cancelled === 1 || item.cancelled === true,
  })) as RaidEvent[];
};

export const addNotificationSent = async (
  eventId: string,
  minutesBefore: number
): Promise<void> => {
  const event = await getEvent(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  if (!event.notificationsSent.includes(minutesBefore)) {
    event.notificationsSent.push(minutesBefore);
  }

  await docClient.send(
    new PutCommand({
      TableName: config.aws.eventsTable,
      Item: {
        ...event,
        cancelled: event.cancelled ? 1 : 0,
      },
    })
  );
};

type EventUpdateParams = Partial<
  Pick<
    RaidEvent,
    | "name"
    | "description"
    | "startDate"
    | "endDate"
    | "timezone"
    | "language"
    | "roles"
    | "noticeMinutes"
  >
>;

export const updateEvent = async (
  eventId: string,
  updates: EventUpdateParams
): Promise<RaidEvent> => {
  const event = await getEvent(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  const updatedEvent: RaidEvent = {
    ...event,
    ...updates,
  };

  const ttl = calculateTTL(updatedEvent.endDate);

  await docClient.send(
    new PutCommand({
      TableName: config.aws.eventsTable,
      Item: {
        ...updatedEvent,
        cancelled: updatedEvent.cancelled ? 1 : 0,
        ttl,
      },
    })
  );

  return updatedEvent;
};
