import "dotenv/config";
import { Client, Events } from "discord.js";
import { config } from "./config";
import { createDiscordClient } from "./discord/client";
import { registerCommands, setupEventHandlers } from "./discord/handlers";

export const initializeBot = async (): Promise<Client> => {
  const client = createDiscordClient();

  client.once(Events.ClientReady, async () => {
    console.log(`Logged in as ${client.user?.tag}`);
    await registerCommands(client);
    console.log("Commands registered");
  });

  setupEventHandlers(client);

  await client.login(config.discord.token);

  return client;
};

export const startBot = async (): Promise<void> => {
  await initializeBot();
};

if (require.main === module) {
  startBot().catch(console.error);
}
