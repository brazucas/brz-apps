resource "aws_dynamodb_table" "events" {
  name           = var.table_name
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "id"

  attribute {
    name = "id"
    type = "S"
  }

  attribute {
    name = "guildId"
    type = "S"
  }

  attribute {
    name = "startDate"
    type = "S"
  }

  attribute {
    name = "cancelled"
    type = "N"
  }

  global_secondary_index {
    name            = "guildId-index"
    hash_key        = "guildId"
    range_key       = "startDate"
    projection_type = "ALL"
  }

  global_secondary_index {
    name            = "startDate-index"
    hash_key        = "cancelled"
    range_key       = "startDate"
    projection_type = "ALL"
  }

  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  tags = {
    Environment = var.environment
    Application = "discord-raid-finder"
    ManagedBy   = "terraform"
  }
}
