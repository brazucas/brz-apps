terraform {
    backend "s3" {
        bucket = "brz.gg-terraform-state"
        key    = "terraform/brz.gg-terraform.tfstate"
        region = "us-east-1"
    }
}