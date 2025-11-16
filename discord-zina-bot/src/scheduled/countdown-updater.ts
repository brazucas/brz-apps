import { EventBridgeEvent, Context } from "aws-lambda";
import { Client } from "discord.js";
import { config } from "../config";
import { getUpcomingEvents } from "../database/events-repository";
import { createDiscordClient, updateEventMessage } from "../discord/client";

export const handler = async (
  event: EventBridgeEvent<string, any>,
  context: Context
): Promise<void> => {
  const client = createDiscordClient();
  await client.login(config.discord.token);

  try {
    const events = await getUpcomingEvents();
    const now = new Date();

    for (const raidEvent of events) {
      if (raidEvent.cancelled) {
        continue;
      }

      const startTime = new Date(raidEvent.startDate);
      const diffMs = startTime.getTime() - now.getTime();

      if (diffMs < 0) {
        continue;
      }

      const diffHours = diffMs / 3600000;

      if (diffHours <= 48) {
        try {
          await updateEventMessage(client, raidEvent);
        } catch (error) {
          console.error(`Failed to update event ${raidEvent.id}:`, error);
        }
      }
    }
  } catch (error) {
    console.error("Error in countdown updater:", error);
  } finally {
    client.destroy();
  }
};
