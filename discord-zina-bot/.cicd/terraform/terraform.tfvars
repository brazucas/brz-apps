aws_region  = "us-east-1"
environment = "production"
table_name  = "raid-finder-events"

# Sensitive variables should be set via:
# 1. Environment variables: TF_VAR_discord_bot_token, etc.
# 2. GitHub Actions secrets (for CI/CD)
# 3. Local override: Create terraform.tfvars.local (gitignored)
#
# For local development, create terraform.tfvars.local with:
# discord_bot_token      = "your_token_here"
# discord_application_id = "your_app_id_here"
# discord_admin_role_id  = "your_role_id_here"
