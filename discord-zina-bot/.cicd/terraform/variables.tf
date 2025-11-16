variable "aws_region" {
  description = "AWS region for resources"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "table_name" {
  description = "DynamoDB table name for raid events"
  type        = string
  default     = "zina-bot-raid-events"
}

variable "discord_bot_token" {
  description = "Discord bot token"
  type        = string
  sensitive   = true
  # No default - must be provided via TF_VAR_discord_bot_token or terraform.tfvars
}

variable "discord_application_id" {
  description = "Discord application ID"
  type        = string
  # No default - must be provided via TF_VAR_discord_application_id or terraform.tfvars
}

variable "discord_admin_role_id" {
  description = "Discord admin role ID"
  type        = string
  # No default - must be provided via TF_VAR_discord_admin_role_id or terraform.tfvars
}

variable "ssh_public_key" {
  description = "SSH public key for EC2 access"
  type        = string
  # No default - must be provided via TF_VAR_ssh_public_key or terraform.tfvars
  # In GitHub Actions, this comes from BRZ_SSH_PUBLIC_KEY secret
}
