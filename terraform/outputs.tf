output "brz_gg_nameservers" {
  value = aws_route53_zone.brz_gg.name_servers
}

output "brz_gg_zone_id" {
  value = aws_route53_zone.brz_gg.id
}

output "brz_gg_primary_nameserver" {
  value = aws_route53_zone.brz_gg.primary_name_server
}

output "cdn_cloudfront_domain" {
  description = "CloudFront distribution domain name for cdn.brz.gg"
  value       = aws_cloudfront_distribution.cdn_brz_gg.domain_name
}

output "cdn_cloudfront_id" {
  description = "CloudFront distribution ID for cdn.brz.gg"
  value       = aws_cloudfront_distribution.cdn_brz_gg.id
}

output "cdn_s3_bucket" {
  description = "S3 bucket name for cdn.brz.gg"
  value       = aws_s3_bucket.cdn_brz_gg.id
}
