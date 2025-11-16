# EC2 instance for Discord bot - cheapest option using t4g.nano (ARM-based)
# Cost: ~$3.80/month for t4g.nano (on-demand) or ~$2.74/month with 1-year savings plan

# SSH Key Pair
resource "aws_key_pair" "discord_bot" {
  key_name   = "discord-zina-bot-key"
  public_key = var.ssh_public_key

  tags = {
    Name        = "discord-zina-bot-key"
    Application = "discord-zina-bot"
    ManagedBy   = "terraform"
  }
}

data "aws_ami" "amazon_linux_2023_arm" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023.*-arm64"]
  }

  filter {
    name   = "architecture"
    values = ["arm64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# Security group for Discord bot
resource "aws_security_group" "discord_bot" {
  name        = "discord-zina-bot-sg"
  description = "Security group for Discord Zina Bot EC2 instance"

  # Outbound internet access (required for Discord API)
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
    description = "Allow all outbound traffic"
  }

  # SSH access
  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
    description = "SSH access"
  }

  tags = {
    Name        = "discord-zina-bot-sg"
    Application = "discord-zina-bot"
    ManagedBy   = "terraform"
  }
}

# IAM role for EC2 instance
resource "aws_iam_role" "discord_bot" {
  name = "discord-zina-bot-ec2-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "discord-zina-bot-ec2-role"
    Application = "discord-zina-bot"
    ManagedBy   = "terraform"
  }
}

# IAM policy for DynamoDB access
resource "aws_iam_role_policy" "discord_bot_dynamodb" {
  name = "discord-zina-bot-dynamodb-policy"
  role = aws_iam_role.discord_bot.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:GetItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          aws_dynamodb_table.events.arn,
          "${aws_dynamodb_table.events.arn}/index/*"
        ]
      }
    ]
  })
}

# IAM instance profile
resource "aws_iam_instance_profile" "discord_bot" {
  name = "discord-zina-bot-instance-profile"
  role = aws_iam_role.discord_bot.name

  tags = {
    Name        = "discord-zina-bot-instance-profile"
    Application = "discord-zina-bot"
    ManagedBy   = "terraform"
  }
}

# EC2 instance for Discord bot
resource "aws_instance" "discord_bot" {
  ami                    = data.aws_ami.amazon_linux_2023_arm.id
  instance_type          = "t4g.nano" # Cheapest ARM-based instance: 2 vCPU, 0.5 GB RAM
  iam_instance_profile   = aws_iam_instance_profile.discord_bot.name
  vpc_security_group_ids = [aws_security_group.discord_bot.id]
  key_name               = aws_key_pair.discord_bot.key_name

  # Enable detailed monitoring (optional, adds ~$2.10/month)
  monitoring = false

  # Root volume configuration (8 GB is enough, gp3 is cheaper than gp2)
  root_block_device {
    volume_size           = 8
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name        = "discord-zina-bot-root"
      Application = "discord-zina-bot"
    }
  }

  # User data script to install Node.js 20 and run the bot
  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    discord_bot_token      = var.discord_bot_token
    discord_application_id = var.discord_application_id
    discord_admin_role_id  = var.discord_admin_role_id
    raid_events_table_name = var.table_name
    aws_region             = var.aws_region
  }))

  # Ensure instance is replaced when user_data changes
  user_data_replace_on_change = true

  tags = {
    Name        = "discord-zina-bot"
    Application = "discord-zina-bot"
    ManagedBy   = "terraform"
    Environment = "production"
  }
}

# Outputs
output "discord_bot_instance_id" {
  description = "EC2 instance ID for Discord bot"
  value       = aws_instance.discord_bot.id
}

output "discord_bot_public_ip" {
  description = "Public IP address of Discord bot (dynamic, changes on restart)"
  value       = aws_instance.discord_bot.public_ip
}

output "discord_bot_private_ip" {
  description = "Private IP address of Discord bot"
  value       = aws_instance.discord_bot.private_ip
}
