# Terraform Modules Documentation

This document describes each reusable module in the Terraform configuration.

## Module Structure

All modules follow this pattern:
- `main.tf` - Resource definitions
- Variables passed as inputs
- Outputs exported for use by root module or other modules

## S3 Module (`modules/s3/`)

Manages S3 bucket configuration for static website hosting.

### Purpose
- Create a private S3 bucket
- Enable versioning for build history
- Block public access
- Provide bucket details to other modules (CloudFront)

### Inputs

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `bucket_name` | string | S3 bucket name (must be globally unique) | Yes |
| `project_name` | string | Project name for tags | Yes |
| `environment` | string | Environment name (dev/staging/production) | Yes |

### Outputs

| Output | Description |
|--------|-------------|
| `bucket_id` | S3 bucket ID |
| `bucket_arn` | S3 bucket ARN |
| `bucket_regional_domain_name` | S3 bucket regional domain name (used by CloudFront) |

### Key Features
- ✅ Versioning enabled (automatic version history)
- ✅ Public access blocked (private by default)
- ✅ Proper tagging for easy resource tracking

### Usage Example
```hcl
module "s3" {
  source = "./modules/s3"
  
  bucket_name  = "my-app-bucket"
  project_name = "my-app"
  environment  = "production"
}
```

---

## CloudFront Module (`modules/cloudfront/`)

Manages CloudFront CDN distribution with SPA routing support.

### Purpose
- Create CloudFront distribution for global content delivery
- Set up Origin Access Identity for secure S3 access
- Configure SPA routing (404 → index.html)
- Apply S3 bucket policy to restrict access

### Inputs

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `bucket_domain_name` | string | S3 bucket domain name (from S3 module) | Yes |
| `bucket_arn` | string | S3 bucket ARN (from S3 module) | Yes |
| `project_name` | string | Project name | Yes |
| `environment` | string | Environment name | Yes |
| `origin_access_identity_path` | string | CloudFront OAI path | Yes |

### Outputs

| Output | Description |
|--------|-------------|
| `distribution_id` | CloudFront distribution ID (used for cache invalidation) |
| `distribution_domain_name` | CloudFront domain name (site URL) |
| `distribution_arn` | CloudFront distribution ARN |
| `origin_access_identity_iam_arn` | OAI IAM ARN (used in S3 bucket policy) |

### Key Features
- ✅ HTTPS enforcement (redirects HTTP to HTTPS)
- ✅ SPA routing (404/403 errors redirect to index.html)
- ✅ Cache optimization (3600 seconds default TTL)
- ✅ Compression enabled (reduces bandwidth)
- ✅ Origin Access Identity (S3 only accessible via CloudFront)
- ✅ S3 bucket policy (grants CloudFront read access)

### Cache Invalidation
After deploy, invalidate cache to serve new files:
```bash
aws cloudfront create-invalidation \
  --distribution-id <distribution-id> \
  --paths "/*"
```

### Usage Example
```hcl
module "cloudfront" {
  source = "./modules/cloudfront"
  
  bucket_domain_name          = module.s3.bucket_regional_domain_name
  bucket_arn                  = module.s3.bucket_arn
  project_name                = "my-app"
  environment                 = "production"
  origin_access_identity_path = "/cloudfront/ABCDEFG1234567"
}
```

---

## IAM Module (`modules/iam/`)

Manages IAM user and policies for Jenkins deployment automation.

### Purpose
- Create dedicated IAM user for Jenkins
- Apply minimal-privilege policy (principle of least privilege)
- Generate access keys for Jenkins authentication
- Grant S3 sync and CloudFront invalidation permissions

### Inputs

| Variable | Type | Description | Required |
|----------|------|-------------|----------|
| `project_name` | string | Project name | Yes |
| `environment` | string | Environment name | Yes |
| `s3_bucket_arn` | string | S3 bucket ARN (from S3 module) | Yes |
| `cloudfront_distribution_arn` | string | CloudFront distribution ARN (from CloudFront module) | Yes |

### Outputs

| Output | Description |
|--------|-------------|
| `iam_user_name` | IAM user name |
| `access_key_id` | AWS Access Key ID (sensitive) |
| `secret_access_key` | AWS Secret Access Key (sensitive) |

### Key Features
- ✅ Scoped permissions (only S3 and CloudFront)
- ✅ Automatic access key generation
- ✅ Sensitive output marking (won't print to logs)
- ✅ Follows AWS best practices

### Permissions Granted
The policy includes:
- S3: `PutObject`, `GetObject`, `DeleteObject`, `ListBucket`
- CloudFront: `CreateInvalidation`, `GetInvalidation`, `ListInvalidations`
- CloudFront: `GetDistribution`, `GetDistributionConfig` (read-only)

### Usage Example
```hcl
module "iam" {
  source = "./modules/iam"
  
  project_name                = "my-app"
  environment                 = "production"
  s3_bucket_arn               = module.s3.bucket_arn
  cloudfront_distribution_arn = module.cloudfront.distribution_arn
}
```

---

## Module Dependencies

```
S3 Module
  ↓
  ├─→ CloudFront Module (depends on S3 outputs)
  │     ├─ bucket_regional_domain_name
  │     ├─ bucket_arn
  │     └─ Creates S3 bucket policy
  │
  └─→ IAM Module (depends on module outputs)
        ├─ s3_bucket_arn
        └─ cloudfront_distribution_arn
```

## Root Module Integration

The root `main.tf` orchestrates all three modules:

```hcl
module "s3" {
  source = "./modules/s3"
  # Pass inputs from root variables
}

module "cloudfront" {
  source = "./modules/cloudfront"
  # Pass inputs from root variables + s3 module outputs
}

module "iam" {
  source = "./modules/iam"
  # Pass inputs from root variables + module outputs
}
```

## Advantages of Modular Approach

✅ **Reusability** - Use modules in other projects  
✅ **Maintainability** - Changes in one module don't affect others  
✅ **Testability** - Test each module independently  
✅ **Scalability** - Easy to add new modules or duplicate existing ones  
✅ **Organization** - Clear separation of concerns  
✅ **Documentation** - Module purpose is self-evident  

## Using These Modules in Other Projects

```hcl
# In another project's main.tf
module "app_infrastructure" {
  source = "../jenkins/terraform/modules"
  
  # Pass project-specific values
  bucket_name  = "another-app-bucket"
  project_name = "another-app"
  environment  = "staging"
  aws_region   = "eu-west-1"
}
```

## Extending Modules

To add a new module:

1. Create `modules/new_module/main.tf`
2. Define inputs as `variable` blocks
3. Define outputs as `output` blocks
4. Call the module from root `main.tf`
5. Update this documentation

Example new module structure:
```
modules/
├── s3/
├── cloudfront/
├── iam/
└── monitoring/          ← New module
    ├── main.tf
    ├── variables.tf
    └── outputs.tf
```

## Troubleshooting Module Issues

### Module not found
```
Error: module "s3": module not found
```
Ensure the `source` path is correct and module files exist.

### Invalid variable type
```
Error: Invalid variable type for module input
```
Check variable types in module definition match root module outputs.

### Circular dependency
Modules should not depend on each other indirectly. Keep dependency flow one-way.

## Contributing to Modules

When updating modules:
1. Test changes with `terraform plan` first
2. Document changes in this file
3. Update module inputs/outputs in the table above
4. Maintain backward compatibility when possible
