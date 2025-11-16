resource "aws_s3_bucket" "cdn_brz_gg" {
  bucket = "cdn.brz.gg-2"

  tags = var.common_tags
}

resource "aws_s3_bucket_website_configuration" "cdn_brz_gg" {
  bucket = aws_s3_bucket.cdn_brz_gg.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "error.html"
  }
}

resource "aws_s3_bucket_policy" "cdn_brz_gg" {
  bucket = aws_s3_bucket.cdn_brz_gg.id

  policy = data.aws_iam_policy_document.aws_s3_bucket_policy.json
}

data "aws_iam_policy_document" "aws_s3_bucket_policy" {
  statement {
    principals {
      type        = "AWS"
      identifiers = [aws_cloudfront_origin_access_identity.cdn_brz_gg.iam_arn]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${aws_s3_bucket.cdn_brz_gg.arn}/*",
    ]
  }
}

resource "aws_s3_bucket_versioning" "cdn_brz_gg" {
  bucket = aws_s3_bucket.cdn_brz_gg.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_public_access_block" "cdn_brz_gg" {
  bucket = aws_s3_bucket.cdn_brz_gg.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ACM Certificate for cdn.brz.gg (must be in us-east-1 for CloudFront)
resource "aws_acm_certificate" "cdn_brz_gg" {
  provider          = aws.us-east-1
  domain_name       = "cdn.brz.gg"
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }

  tags = var.common_tags
}

# Route53 record for certificate validation
resource "aws_route53_record" "cdn_cert_validation" {
  for_each = {
    for dvo in aws_acm_certificate.cdn_brz_gg.domain_validation_options : dvo.domain_name => {
      name   = dvo.resource_record_name
      record = dvo.resource_record_value
      type   = dvo.resource_record_type
    }
  }

  allow_overwrite = true
  name            = each.value.name
  records         = [each.value.record]
  ttl             = 60
  type            = each.value.type
  zone_id         = aws_route53_zone.brz_gg.zone_id
}

# Certificate validation
resource "aws_acm_certificate_validation" "cdn_brz_gg" {
  provider                = aws.us-east-1
  certificate_arn         = aws_acm_certificate.cdn_brz_gg.arn
  validation_record_fqdns = [for record in aws_route53_record.cdn_cert_validation : record.fqdn]
}

# CloudFront Origin Access Identity
resource "aws_cloudfront_origin_access_identity" "cdn_brz_gg" {
  comment = "OAI for cdn.brz.gg"
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "cdn_brz_gg" {
  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CDN distribution for cdn.brz.gg"
  default_root_object = "index.html"
  aliases             = ["cdn.brz.gg"]

  origin {
    domain_name = aws_s3_bucket.cdn_brz_gg.bucket_regional_domain_name
    origin_id   = "S3-cdn.brz.gg"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.cdn_brz_gg.cloudfront_access_identity_path
    }
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-cdn.brz.gg"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 3600
    max_ttl                = 86400
    compress               = true
  }

  price_class = "PriceClass_100"

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    acm_certificate_arn      = aws_acm_certificate_validation.cdn_brz_gg.certificate_arn
    ssl_support_method       = "sni-only"
    minimum_protocol_version = "TLSv1.2_2021"
  }

  tags = var.common_tags
}

# Update Route53 record to point to CloudFront
resource "aws_route53_record" "cdn_cloudfront" {
  zone_id = aws_route53_zone.brz_gg.zone_id
  name    = "cdn.brz.gg"
  type    = "A"

  alias {
    name                   = aws_cloudfront_distribution.cdn_brz_gg.domain_name
    zone_id                = aws_cloudfront_distribution.cdn_brz_gg.hosted_zone_id
    evaluate_target_health = false
  }
}