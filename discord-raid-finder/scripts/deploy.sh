#!/bin/bash
set -e

echo "Building Discord Raid Finder..."
cd "$(dirname "$0")/.."

echo "Installing dependencies..."
npm install

echo "Building TypeScript..."
npm run build

echo "Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Configure your .env file with Discord credentials"
echo "2. Run 'terraform init && terraform apply' in .cicd/terraform/"
echo "3. Run 'serverless deploy' to deploy the Lambda functions"
