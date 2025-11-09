resource "aws_s3_bucket" "brz_terraform_state" {
  bucket = "brz.gg-terraform-state"

  tags = var.common_tags
}
