import {
  Client,
  ChatInputCommandInteraction,
  ButtonInteraction,
  Events,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { config } from "../config";
import {
  createEventCommand,
  cancelEventCommand,
  listEventsCommand,
  editEventCommand,
} from "./commands";
import {
  createEvent,
  getEvent,
  updateEventMessageId,
  addSignup,
  removeSignup,
  cancelEvent,
  getUpcomingEvents,
  updateEvent,
} from "../database/events-repository";
import {
  hasAdminRole,
  postEventMessage,
  updateEventMessage,
  postCancellationMessage,
  buildEventEmbed,
} from "./client";
import { EventRole, EventCreationParams, Signup } from "../types";
import {
  validateRoles,
  validateNoticeMinutes,
  validateEventDates,
} from "../utils/validation";
import { t, Language } from "../utils/i18n";

export const registerCommands = async (client: Client): Promise<void> => {
  const rest = new REST({ version: "10" }).setToken(config.discord.token);

  const commands = [
    createEventCommand.toJSON(),
    cancelEventCommand.toJSON(),
    listEventsCommand.toJSON(),
    editEventCommand.toJSON(),
  ];

  await rest.put(Routes.applicationCommands(config.discord.applicationId), {
    body: commands,
  });
};

export const setupEventHandlers = (client: Client): void => {
  client.on(Events.InteractionCreate, async (interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleCommandInteraction(interaction, client);
    } else if (interaction.isButton()) {
      await handleButtonInteraction(interaction, client);
    }
  });
};

const handleCommandInteraction = async (
  interaction: ChatInputCommandInteraction,
  client: Client
): Promise<void> => {
  try {
    if (interaction.commandName === "create-raid") {
      await handleCreateRaidCommand(interaction, client);
    } else if (interaction.commandName === "cancel-raid") {
      await handleCancelRaidCommand(interaction, client);
    } else if (interaction.commandName === "list-raids") {
      await handleListRaidsCommand(interaction);
    } else if (interaction.commandName === "edit-raid") {
      await handleEditRaidCommand(interaction, client);
    }
  } catch (error) {
    console.error("Error handling command:", error);
    let errorMessage = "An error occurred";

    if (error instanceof Error) {
      if (
        error.message.includes("Missing Access") ||
        error.message.includes("50001")
      ) {
        errorMessage =
          "Bot does not have permission to send messages in this channel. Please check bot permissions.";
      } else if (error.message.includes("Missing Permissions")) {
        errorMessage =
          "Bot is missing required permissions. Please contact an administrator.";
      } else {
        errorMessage = error.message;
      }
    }

    if (interaction.replied || interaction.deferred) {
      await interaction.followUp({
        content: `Error: ${errorMessage}`,
        ephemeral: true,
      });
    } else {
      await interaction.reply({
        content: `Error: ${errorMessage}`,
        ephemeral: true,
      });
    }
  }
};

const handleCreateRaidCommand = async (
  interaction: ChatInputCommandInteraction,
  client: Client
): Promise<void> => {
  const language = (interaction.options.getString("language") ||
    "en") as Language;
  const isAdmin = await hasAdminRole(interaction, config.discord.adminRoleId);
  if (!isAdmin) {
    await interaction.reply({
      content: t("noPermission", language),
      ephemeral: true,
    });
    return;
  }

  const name = interaction.options.getString("name", true);
  const description = interaction.options.getString("description", true);
  const startTimeStr = interaction.options.getString("start-time", true);
  const rolesStr = interaction.options.getString("roles", true);
  const noticeMinutesStr = interaction.options.getString(
    "notice-minutes",
    true
  );
  const endTimeStr = interaction.options.getString("end-time");
  const timezone =
    interaction.options.getString("timezone") || "America/Sao_Paulo";
  const weekly = interaction.options.getBoolean("weekly") || false;

  const roles: EventRole[] = JSON.parse(rolesStr);
  const noticeMinutes = noticeMinutesStr
    .split(",")
    .map((s: string) => parseInt(s.trim()));

  validateRoles(roles);
  validateNoticeMinutes(noticeMinutes);

  const startDate = new Date(startTimeStr).toISOString();
  const endDate = endTimeStr ? new Date(endTimeStr).toISOString() : undefined;

  validateEventDates(startDate, endDate);

  const eventParams: EventCreationParams = {
    guildId: interaction.guildId!,
    channelId: interaction.channelId,
    name,
    description,
    startDate,
    endDate,
    timezone,
    language,
    roles,
    createdBy: interaction.user.id,
    noticeMinutes,
    recurrence: weekly
      ? {
          enabled: true,
          frequency: "weekly",
          dayOfWeek: new Date(startDate).getDay(),
          timeOfDay: new Date(startDate).toISOString().split("T")[1],
        }
      : undefined,
  };

  await interaction.deferReply({ ephemeral: true });

  const event = await createEvent(eventParams);
  const messageId = await postEventMessage(client, event);
  await updateEventMessageId(event.id, messageId);

  await interaction.editReply(`${t("eventCreated", language)} ${event.id}`);
};

const handleCancelRaidCommand = async (
  interaction: ChatInputCommandInteraction,
  client: Client
): Promise<void> => {
  const isAdmin = await hasAdminRole(interaction, config.discord.adminRoleId);
  if (!isAdmin) {
    await interaction.reply({
      content: t("noPermissionCancel", "en"),
      ephemeral: true,
    });
    return;
  }

  const eventId = interaction.options.getString("event-id", true);

  await interaction.deferReply({ ephemeral: true });

  const event = await cancelEvent(eventId);

  if (!event) {
    await interaction.editReply(t("eventNotFound", "en"));
    return;
  }

  await updateEventMessage(client, event);
  await postCancellationMessage(client, event);

  await interaction.editReply(
    `${event.name} ${t("eventCancelledSuccess", event.language as Language)}`
  );
};

const handleListRaidsCommand = async (
  interaction: ChatInputCommandInteraction
): Promise<void> => {
  await interaction.deferReply({ ephemeral: true });

  const events = await getUpcomingEvents();

  if (events.length === 0) {
    await interaction.editReply(t("noUpcomingEvents", "en"));
    return;
  }

  const eventList = events
    .map(
      (e) =>
        `**${e.name}** (ID: ${e.id})\n${t(
          "starts",
          e.language as Language
        )}: ${new Date(e.startDate).toLocaleString()}`
    )
    .join("\n\n");

  await interaction.editReply(`${t("upcomingEvents", "en")}:\n\n${eventList}`);
};

const handleEditRaidCommand = async (
  interaction: ChatInputCommandInteraction,
  client: Client
): Promise<void> => {
  const isAdmin = await hasAdminRole(interaction, config.discord.adminRoleId);
  if (!isAdmin) {
    await interaction.reply({
      content: t("noPermissionEdit", "en"),
      ephemeral: true,
    });
    return;
  }

  await interaction.deferReply({ ephemeral: true });

  const eventId = interaction.options.getString("event-id", true);
  const existingEvent = await getEvent(eventId);

  if (!existingEvent) {
    await interaction.editReply(t("eventNotFound", "en"));
    return;
  }

  if (existingEvent.guildId !== interaction.guildId) {
    await interaction.editReply(t("eventNotFoundGuild", "en"));
    return;
  }

  const lang = existingEvent.language as Language;
  const name = interaction.options.getString("name");
  const description = interaction.options.getString("description");
  const startDateStr = interaction.options.getString("start-time");
  const endDateStr = interaction.options.getString("end-time");
  const timezone = interaction.options.getString("timezone");
  const language = interaction.options.getString("language") as
    | "en"
    | "pt"
    | null;
  const noticeMinutesStr = interaction.options.getString("notice-minutes");
  const rolesStr = interaction.options.getString("roles");

  let roles = existingEvent.roles;

  if (rolesStr) {
    try {
      const parsedRoles = JSON.parse(rolesStr);
      validateRoles(parsedRoles);
      roles = parsedRoles;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : t("invalidRolesFormat", lang);
      await interaction.editReply(`${t("invalidRoles", lang)} ${errorMessage}`);
      return;
    }
  }

  let noticeMinutes = existingEvent.noticeMinutes;

  if (noticeMinutesStr) {
    try {
      const parsed = noticeMinutesStr
        .split(",")
        .map((m) => parseInt(m.trim(), 10))
        .filter((m) => !isNaN(m));
      validateNoticeMinutes(parsed);
      noticeMinutes = parsed;
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : t("invalidNoticeMinutes", lang);
      await interaction.editReply(
        `${t("invalidNoticeMinutes", lang)} ${errorMessage}`
      );
      return;
    }
  }

  let startDate = existingEvent.startDate;
  let endDate = existingEvent.endDate;

  if (startDateStr) {
    try {
      startDate = new Date(startDateStr).toISOString();
    } catch (error) {
      await interaction.editReply(t("invalidStartDateFormat", lang));
      return;
    }
  }

  if (endDateStr) {
    try {
      endDate = new Date(endDateStr).toISOString();
    } catch (error) {
      await interaction.editReply(t("invalidEndDateFormat", lang));
      return;
    }
  }

  try {
    validateEventDates(startDate, endDate);
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : t("dateValidationError", lang);
    await interaction.editReply(
      `${t("dateValidationError", lang)} ${errorMessage}`
    );
    return;
  }

  const updatedEvent = await updateEvent(eventId, {
    name: name ?? existingEvent.name,
    description: description ?? existingEvent.description,
    startDate,
    endDate,
    timezone: timezone ?? existingEvent.timezone,
    language: language ?? existingEvent.language,
    roles,
    noticeMinutes,
  });

  await updateEventMessage(client, updatedEvent);
  await interaction.editReply(
    `${updatedEvent.name} ${t(
      "eventUpdated",
      updatedEvent.language as Language
    )}`
  );
};

const handleButtonInteraction = async (
  interaction: ButtonInteraction,
  client: Client
): Promise<void> => {
  try {
    const [action, eventId, roleName] = interaction.customId.split(":");

    await interaction.deferReply({ ephemeral: true });

    const event = await getEvent(eventId);
    if (!event) {
      await interaction.editReply(t("eventNotFound", "en"));
      return;
    }

    const lang = event.language as Language;

    if (action === "signup") {
      const signup: Signup = {
        userId: interaction.user.id,
        username: interaction.user.username,
        roleName: roleName!,
        timestamp: new Date().toISOString(),
      };

      const updatedEvent = await addSignup(eventId, signup);
      await updateEventMessage(client, updatedEvent);

      await interaction.editReply(t("signedUp", lang));
    } else if (action === "unsignup") {
      const updatedEvent = await removeSignup(eventId, interaction.user.id);
      await updateEventMessage(client, updatedEvent);

      await interaction.editReply(t("removed", lang));
    }
  } catch (error) {
    console.error("Error handling button interaction:", error);
    const errorMessage =
      error instanceof Error ? error.message : t("error", "en");
    await interaction.editReply(`${t("error", "en")} ${errorMessage}`);
  }
};
