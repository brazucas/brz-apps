interface EventRole {
  name: string;
  maxCount: number;
  emoji: string;
}

const exampleCreateRaidCommand = {
  name: "Mythic+ Dungeon Night",
  description: "Weekly M+ dungeon runs. All keys welcome!",
  startTime: "2024-12-20 19:00",
  roles: JSON.stringify([
    { name: "Tank", maxCount: 1, emoji: "🛡️" },
    { name: "Healer", maxCount: 1, emoji: "❤️" },
    { name: "DPS", maxCount: 3, emoji: "⚔️" },
  ]),
  noticeMinutes: "180,120,60,10",
  weekly: true,
};

const setupInstructions = {
  terraform: {
    directory: ".cicd/terraform",
    steps: [
      "cd .cicd/terraform",
      "terraform init",
      "terraform plan",
      "terraform apply",
    ],
  },

  serverless: {
    steps: ["npm install", "npm run build", "serverless deploy"],
  },

  environment: {
    required: [
      "DISCORD_BOT_TOKEN",
      "DISCORD_APPLICATION_ID",
      "DISCORD_ADMIN_ROLE_ID",
      "EVENTS_TABLE_NAME",
      "SLS_LAMBDA_ROLE",
    ],
  },
};

export { exampleCreateRaidCommand, setupInstructions };
