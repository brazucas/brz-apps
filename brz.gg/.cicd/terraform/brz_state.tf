data "terraform_remote_state" "brz_state" {
  backend = "s3"
  config = {
    bucket = "brz.gg-terraform-state"
    key    = "terraform.tfstate"
    region = "us-east-1"
  }
}