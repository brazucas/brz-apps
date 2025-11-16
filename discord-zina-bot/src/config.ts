export const config = {
  discord: {
    token: process.env.DISCORD_BOT_TOKEN!,
    applicationId: process.env.DISCORD_APPLICATION_ID!,
    adminRoleId: process.env.DISCORD_ADMIN_ROLE_ID!,
  },
  aws: {
    region: process.env.AWS_REGION || "us-east-1",
    raidEventsTable: process.env.RAID_EVENTS_TABLE_NAME!,
  },
};
