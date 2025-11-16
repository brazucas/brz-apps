import {
  Client,
  GatewayIntentBits,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  ButtonInteraction,
  TextChannel,
} from "discord.js";
import { RaidEvent, Signup } from "../types";
import { formatDateWithTimezone } from "../utils/timezone-utils";

export const createDiscordClient = (): Client => {
  const client = new Client({
    intents: [GatewayIntentBits.Guilds],
  });

  return client;
};

export const buildEventEmbed = (event: RaidEvent): EmbedBuilder => {
  const embed = new EmbedBuilder()
    .setTitle(event.name)
    .setDescription(event.description)
    .setColor(event.cancelled ? 0xff0000 : 0x00ff00)
    .addFields(
      {
        name: "Start Time",
        value: formatDateWithTimezone(event.startDate, event.timezone),
        inline: true,
      },
      {
        name: "End Time",
        value: event.endDate
          ? formatDateWithTimezone(event.endDate, event.timezone)
          : "N/A",
        inline: true,
      }
    );

  event.roles.forEach((role) => {
    const roleSignups = event.signups.filter((s) => s.roleName === role.name);
    const signupList =
      roleSignups.length > 0
        ? roleSignups.map((s) => `<@${s.userId}>`).join("\n")
        : "No signups";

    embed.addFields({
      name: `${role.emoji} ${role.name} (${roleSignups.length}/${role.maxCount})`,
      value: signupList,
      inline: true,
    });
  });

  if (event.bench.length > 0) {
    const benchList = event.bench
      .map((s) => `<@${s.userId}> (${s.roleName})`)
      .join("\n");
    embed.addFields({ name: "🪑 Bench", value: benchList, inline: false });
  }

  return embed;
};

export const buildRoleButtons = (
  event: RaidEvent
): ActionRowBuilder<ButtonBuilder>[] => {
  const rows: ActionRowBuilder<ButtonBuilder>[] = [];
  let currentRow = new ActionRowBuilder<ButtonBuilder>();
  let buttonCount = 0;

  event.roles.forEach((role) => {
    if (buttonCount === 5) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder<ButtonBuilder>();
      buttonCount = 0;
    }

    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`signup:${event.id}:${role.name}`)
        .setLabel(role.name)
        .setEmoji(role.emoji)
        .setStyle(ButtonStyle.Primary)
        .setDisabled(event.cancelled)
    );

    buttonCount++;
  });

  if (buttonCount > 0) {
    rows.push(currentRow);
  }

  const actionRow = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`unsignup:${event.id}`)
      .setLabel("Leave Event")
      .setStyle(ButtonStyle.Danger)
      .setDisabled(event.cancelled)
  );

  rows.push(actionRow);

  return rows;
};

export const postEventMessage = async (
  client: Client,
  event: RaidEvent
): Promise<string> => {
  const channel = (await client.channels.fetch(event.channelId)) as TextChannel;
  const embed = buildEventEmbed(event);
  const buttons = buildRoleButtons(event);

  const message = await channel.send({
    embeds: [embed],
    components: buttons,
  });

  return message.id;
};

export const updateEventMessage = async (
  client: Client,
  event: RaidEvent
): Promise<void> => {
  const channel = (await client.channels.fetch(event.channelId)) as TextChannel;
  const message = await channel.messages.fetch(event.messageId);

  const embed = buildEventEmbed(event);
  const buttons = buildRoleButtons(event);

  await message.edit({
    embeds: [embed],
    components: buttons,
  });
};

export const postCancellationMessage = async (
  client: Client,
  event: RaidEvent
): Promise<void> => {
  const channel = (await client.channels.fetch(event.channelId)) as TextChannel;

  const embed = new EmbedBuilder()
    .setTitle(`❌ Event Cancelled: ${event.name}`)
    .setDescription(
      `The event scheduled for ${formatDateWithTimezone(
        event.startDate,
        event.timezone
      )} has been cancelled.`
    )
    .setColor(0xff0000);

  const allSignups = [...event.signups, ...event.bench];
  if (allSignups.length > 0) {
    const mentions = allSignups.map((s) => `<@${s.userId}>`).join(" ");
    await channel.send({
      content: mentions,
      embeds: [embed],
    });
  } else {
    await channel.send({ embeds: [embed] });
  }
};

export const postStartNotification = async (
  client: Client,
  event: RaidEvent,
  minutesBefore: number
): Promise<void> => {
  const channel = (await client.channels.fetch(event.channelId)) as TextChannel;

  const timeText =
    minutesBefore >= 60
      ? `${Math.floor(minutesBefore / 60)} hour${
          Math.floor(minutesBefore / 60) > 1 ? "s" : ""
        }`
      : `${minutesBefore} minute${minutesBefore > 1 ? "s" : ""}`;

  const embed = new EmbedBuilder()
    .setTitle(`⏰ Event Starting Soon: ${event.name}`)
    .setDescription(`This event starts in ${timeText}!`)
    .setColor(0xffaa00);

  const signups = event.signups;
  if (signups.length > 0) {
    const mentions = signups.map((s) => `<@${s.userId}>`).join(" ");
    await channel.send({
      content: mentions,
      embeds: [embed],
    });
  }
};

export const hasAdminRole = async (
  interaction: ChatInputCommandInteraction | ButtonInteraction,
  adminRoleId: string
): Promise<boolean> => {
  if (!interaction.member || !("roles" in interaction.member)) {
    return false;
  }

  const roles = interaction.member.roles;
  if ("cache" in roles) {
    return roles.cache.has(adminRoleId);
  }

  return false;
};
