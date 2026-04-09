# IAM User and Policy for Jenkins Deployment

variable "project_name" {
  description = "Project name"
  type        = string
}

variable "environment" {
  description = "Environment name"
  type        = string
}

variable "s3_bucket_arn" {
  description = "S3 bucket ARN for permissions"
  type        = string
}

variable "cloudfront_distribution_arn" {
  description = "CloudFront distribution ARN"
  type        = string
}

# IAM user for Jenkins deployment
resource "aws_iam_user" "jenkins_deploy" {
  name = "${var.project_name}-jenkins-deploy"

  tags = {
    Name        = "Jenkins deployment user"
    Environment = var.environment
    ManagedBy   = "Terraform"
    Module      = "iam"
  }
}

# IAM policy with minimal permissions
resource "aws_iam_user_policy" "jenkins_deploy" {
  name = "${var.project_name}-jenkins-deploy-policy"
  user = aws_iam_user.jenkins_deploy.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "S3DeployPermissions"
        Effect = "Allow"
        Action = [
          "s3:PutObject",
          "s3:GetObject",
          "s3:DeleteObject",
          "s3:ListBucket"
        ]
        Resource = [
          var.s3_bucket_arn,
          "${var.s3_bucket_arn}/*"
        ]
      },
      {
        Sid    = "CloudFrontInvalidation"
        Effect = "Allow"
        Action = [
          "cloudfront:CreateInvalidation",
          "cloudfront:GetInvalidation",
          "cloudfront:ListInvalidations"
        ]
        Resource = var.cloudfront_distribution_arn
      },
      {
        Sid    = "CloudFrontRead"
        Effect = "Allow"
        Action = [
          "cloudfront:GetDistribution",
          "cloudfront:GetDistributionConfig"
        ]
        Resource = "*"
      }
    ]
  })
}

# Access key for Jenkins
resource "aws_iam_access_key" "jenkins_deploy" {
  user = aws_iam_user.jenkins_deploy.name
}

output "iam_user_name" {
  description = "IAM user name"
  value       = aws_iam_user.jenkins_deploy.name
}

output "access_key_id" {
  description = "AWS Access Key ID"
  value       = aws_iam_access_key.jenkins_deploy.id
  sensitive   = true
}

output "secret_access_key" {
  description = "AWS Secret Access Key"
  value       = aws_iam_access_key.jenkins_deploy.secret
  sensitive   = true
}
