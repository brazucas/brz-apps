output "brz_gg_nameservers" {
  value = aws_route53_zone.brz_gg.name_servers
}

output "brz_gg_zone_id" {
  value = aws_route53_zone.brz_gg.id
}

output "brz_gg_primary_nameserver" {
  value = aws_route53_zone.brz_gg.primary_name_server
}
