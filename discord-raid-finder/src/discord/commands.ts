import { SlashCommandBuilder } from "discord.js";

export const createEventCommand = new SlashCommandBuilder()
  .setName("create-raid")
  .setDescription("Create a new raid event")
  .addStringOption((option) =>
    option.setName("name").setDescription("Event name").setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("description")
      .setDescription("Event description")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("start-time")
      .setDescription("Start time (ISO 8601 format or YYYY-MM-DD HH:MM)")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("roles")
      .setDescription(
        'Roles as JSON: [{"name":"Tank","maxCount":2,"emoji":"🛡️"}]'
      )
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("notice-minutes")
      .setDescription(
        "Notice times in minutes (comma-separated: 180,120,60,10)"
      )
      .setRequired(true)
  )
  .addStringOption((option) =>
    option
      .setName("end-time")
      .setDescription("End time (ISO 8601 format or YYYY-MM-DD HH:MM)")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("timezone")
      .setDescription(
        "Timezone (e.g., America/Sao_Paulo, America/New_York, UTC)"
      )
      .setRequired(false)
  )
  .addBooleanOption((option) =>
    option.setName("weekly").setDescription("Repeat weekly").setRequired(false)
  );

export const cancelEventCommand = new SlashCommandBuilder()
  .setName("cancel-raid")
  .setDescription("Cancel a raid event")
  .addStringOption((option) =>
    option
      .setName("event-id")
      .setDescription("Event ID to cancel")
      .setRequired(true)
  );

export const listEventsCommand = new SlashCommandBuilder()
  .setName("list-raids")
  .setDescription("List all upcoming raid events");

export const editEventCommand = new SlashCommandBuilder()
  .setName("edit-raid")
  .setDescription("Edit an existing raid event")
  .addStringOption((option) =>
    option
      .setName("event-id")
      .setDescription("Event ID to edit")
      .setRequired(true)
  )
  .addStringOption((option) =>
    option.setName("name").setDescription("New event name").setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("description")
      .setDescription("New event description")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("start-time")
      .setDescription("New start time (ISO 8601 format or YYYY-MM-DD HH:MM)")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("end-time")
      .setDescription("New end time (ISO 8601 format or YYYY-MM-DD HH:MM)")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("timezone")
      .setDescription("Timezone (e.g., America/Sao_Paulo, America/New_York)")
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("roles")
      .setDescription(
        'New roles as JSON: [{"name":"Tank","maxCount":2,"emoji":"🛡️"}]'
      )
      .setRequired(false)
  )
  .addStringOption((option) =>
    option
      .setName("notice-minutes")
      .setDescription(
        "New notice times in minutes (comma-separated: 180,120,60,10)"
      )
      .setRequired(false)
  );
