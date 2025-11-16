import { EventBridgeEvent, Context } from "aws-lambda";
import { Client } from "discord.js";
import { config } from "../config";
import {
  getUpcomingEvents,
  addNotificationSent,
} from "../database/events-repository";
import { createDiscordClient } from "../discord/client";
import { postStartNotification } from "../discord/client";

export const handler = async (
  event: EventBridgeEvent<string, any>,
  context: Context
): Promise<void> => {
  const client = createDiscordClient();
  await client.login(config.discord.token);

  try {
    const now = new Date();
    const events = await getUpcomingEvents();

    for (const raidEvent of events) {
      if (raidEvent.cancelled) {
        continue;
      }

      const startTime = new Date(raidEvent.startDate);
      const minutesUntilStart = Math.floor(
        (startTime.getTime() - now.getTime()) / 60000
      );

      for (const noticeMinute of raidEvent.noticeMinutes) {
        if (raidEvent.notificationsSent.includes(noticeMinute)) {
          continue;
        }

        const shouldNotify =
          minutesUntilStart <= noticeMinute &&
          minutesUntilStart > noticeMinute - 5;

        if (shouldNotify) {
          await postStartNotification(client, raidEvent, noticeMinute);
          await addNotificationSent(raidEvent.id, noticeMinute);
        }
      }
    }
  } finally {
    client.destroy();
  }
};
