# Terraform Backend Configuration
# Local backend - state stored in terraform.tfstate in current directory

terraform {
  backend "local" {
    path = "terraform.tfstate"
  }
}
