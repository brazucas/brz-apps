variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Name        = "brz-gg"
    Environment = "Production"
  }
}
