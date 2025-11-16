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
  description = "DynamoDB table name for events"
  type        = string
  default     = "raid-finder-events"
}
