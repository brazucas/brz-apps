#!/bin/bash
set -e

# Log everything
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting Discord Zina Bot setup..."

# Update system
dnf update -y

# Install Node.js 20.x (Amazon Linux 2023)
dnf install -y nodejs npm git

# Verify Node.js installation
node --version
npm --version

# Create bot user
useradd -r -s /bin/bash -d /opt/discord-bot discord-bot

# Create bot directory
mkdir -p /opt/discord-bot
cd /opt/discord-bot

# Clone or copy bot code (we'll upload the built code)
# For now, we'll create the structure and download from S3 or use npm

# Create .env file with secrets
cat > /opt/discord-bot/.env << 'EOF'
DISCORD_BOT_TOKEN=${discord_bot_token}
DISCORD_APPLICATION_ID=${discord_application_id}
DISCORD_ADMIN_ROLE_ID=${discord_admin_role_id}
RAID_EVENTS_TABLE_NAME=${raid_events_table_name}
EOF

# Download and extract the bot code
# We'll create a deployment package
cat > /opt/discord-bot/package.json << 'EOF'
{
  "name": "discord-zina-bot",
  "version": "1.0.0",
  "description": "Discord Zina Bot",
  "main": "dist/index.js",
  "scripts": {
    "start": "node dist/index.js"
  },
  "dependencies": {
    "@aws-sdk/client-dynamodb": "^3.441.0",
    "@aws-sdk/lib-dynamodb": "^3.441.0",
    "@discordjs/rest": "^2.0.0",
    "discord-api-types": "^0.37.0",
    "discord.js": "^14.13.0",
    "dotenv": "^16.3.1"
  }
}
EOF

# Install dependencies
npm install --production

# Create deployment directory for code
mkdir -p /opt/discord-bot/dist

# Note: You need to upload your built code after EC2 is created
# Option 1: Use SCP to copy dist folder
#   scp -r dist ec2-user@<ip>:/tmp/
#   sudo cp -r /tmp/dist/* /opt/discord-bot/dist/
#   sudo chown -R discord-bot:discord-bot /opt/discord-bot/dist
#
# Option 2: Use S3
#   Build: npm run build && tar -czf dist.tar.gz dist
#   Upload: aws s3 cp dist.tar.gz s3://your-bucket/
#   Download in EC2: aws s3 cp s3://your-bucket/dist.tar.gz /opt/discord-bot/
#   Extract: tar -xzf dist.tar.gz

# Set ownership
chown -R discord-bot:discord-bot /opt/discord-bot

# Create systemd service
cat > /etc/systemd/system/discord-bot.service << 'EOF'
[Unit]
Description=Discord Zina Bot
After=network.target

[Service]
Type=simple
User=discord-bot
WorkingDirectory=/opt/discord-bot
Environment=NODE_ENV=production
ExecStart=/usr/bin/node dist/index.js
Restart=always
RestartSec=10
StandardOutput=journal
StandardError=journal
SyslogIdentifier=discord-bot

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd
systemctl daemon-reload

# Don't start yet - we need to upload the code first
# systemctl enable discord-bot
# systemctl start discord-bot

echo "Discord Zina Bot setup complete!"
echo "Next steps:"
echo "1. Upload bot code: scp -r dist discord-bot@$(hostname):/opt/discord-bot/"
echo "2. SSH in and run: sudo systemctl enable discord-bot && sudo systemctl start discord-bot"
