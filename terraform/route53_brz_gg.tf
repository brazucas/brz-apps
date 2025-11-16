resource "aws_route53_zone" "brz_gg" {
    name = "brz.gg"
    
    tags = var.common_tags
}