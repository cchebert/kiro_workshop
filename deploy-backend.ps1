# PowerShell script for backend deployment
$ErrorActionPreference = "Stop"

# Save the original directory to restore at the end
$OriginalDir = Get-Location

# Get the directory where this script is located
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$InfrastructureDir = Join-Path $ScriptDir "infrastructure"

# Stack name (can be overridden via environment variable)
$StackName = if ($env:STACK_NAME) { $env:STACK_NAME } else { "AppStack" }

Write-Host "Starting backend deployment..." -ForegroundColor Cyan
Write-Host "Stack name: $StackName" -ForegroundColor Cyan

# Navigate to infrastructure directory
Set-Location $InfrastructureDir

# Install dependencies if needed
Write-Host "Installing infrastructure dependencies..." -ForegroundColor Yellow
yarn install

# Build the infrastructure code
Write-Host "Building infrastructure code..." -ForegroundColor Yellow
yarn build

# Deploy backend infrastructure using CDK
Write-Host "Deploying backend infrastructure..." -ForegroundColor Yellow

# Bootstrap CDK environment (idempotent - safe to run multiple times)
Write-Host "Ensuring CDK environment is bootstrapped..." -ForegroundColor Yellow
cdk bootstrap --profile kiro-ws

cdk deploy $StackName --require-approval never --profile kiro-ws

Write-Host "Backend deployment completed successfully!" -ForegroundColor Green

# Return to the original directory
Set-Location $OriginalDir
