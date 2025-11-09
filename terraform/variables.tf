variable "budget_alert_email" {
  description = "Email address for budget alert notifications"
  type        = string
  default     = "pedro.papadopolis@gmail.com"
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Tag1 = "BRZ.GG"
    Tag2 = "Production"
  }
}
