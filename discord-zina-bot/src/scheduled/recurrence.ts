import { EventBridgeEvent, Context } from "aws-lambda";
import { Client } from "discord.js";
import { config } from "../config";
import { getUpcomingEvents, createEvent } from "../database/events-repository";
import { createDiscordClient, postEventMessage } from "../discord/client";
import { updateEventMessageId } from "../database/events-repository";

export const handler = async (
  event: EventBridgeEvent<string, any>,
  context: Context
): Promise<void> => {
  const client = createDiscordClient();
  await client.login(config.discord.token);

  try {
    const events = await getUpcomingEvents();

    for (const raidEvent of events) {
      if (!raidEvent.recurrence?.enabled || raidEvent.cancelled) {
        continue;
      }

      const startTime = new Date(raidEvent.startDate);
      const now = new Date();

      const daysSinceStart = Math.floor(
        (now.getTime() - startTime.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (raidEvent.recurrence.frequency === "weekly") {
        const shouldCreateNew = daysSinceStart >= 7 && daysSinceStart % 7 === 0;

        if (shouldCreateNew) {
          const nextStartTime = new Date(startTime);
          nextStartTime.setDate(nextStartTime.getDate() + 7);

          const nextEndTime = raidEvent.endDate
            ? new Date(
                new Date(raidEvent.endDate).getTime() + 7 * 24 * 60 * 60 * 1000
              )
            : undefined;

          const newEvent = await createEvent({
            guildId: raidEvent.guildId,
            channelId: raidEvent.channelId,
            name: raidEvent.name,
            description: raidEvent.description,
            startDate: nextStartTime.toISOString(),
            endDate: nextEndTime?.toISOString(),
            timezone: raidEvent.timezone,
            language: raidEvent.language,
            roles: raidEvent.roles,
            createdBy: raidEvent.createdBy,
            noticeMinutes: raidEvent.noticeMinutes,
            recurrence: raidEvent.recurrence,
          });

          const messageId = await postEventMessage(client, newEvent);
          await updateEventMessageId(newEvent.id, messageId);
        }
      }
    }
  } finally {
    client.destroy();
  }
};
