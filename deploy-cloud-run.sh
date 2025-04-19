#!/bin/bash

# Deployment script for Masa API MCP to Google Cloud Run

# Configuration
PROJECT_ID=${PROJECT_ID:-"playright-masa-web-scrapper"}
REGION=${REGION:-"us-central1"}
SERVICE_NAME=${SERVICE_NAME:-"masa-mcp"}
MEMORY=${MEMORY:-"1Gi"}
CPU=${CPU:-"1"}
CONCURRENCY=${CONCURRENCY:-"80"}
TIMEOUT=${TIMEOUT:-"300s"}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== Masa API MCP Deployment ===${NC}"
echo -e "${CYAN}Project:${NC} $PROJECT_ID"
echo -e "${CYAN}Region:${NC} $REGION"
echo -e "${CYAN}Service:${NC} $SERVICE_NAME"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
  echo -e "${RED}Error: gcloud CLI is not installed. Please install it first.${NC}"
  exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
  echo -e "${YELLOW}You are not authenticated with gcloud.${NC}"
  gcloud auth login
fi

# Set the project
echo -e "${CYAN}Setting project to $PROJECT_ID...${NC}"
gcloud config set project $PROJECT_ID

# Build the Docker image
echo -e "${CYAN}Building Docker image...${NC}"
docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest .

# Push the image to Google Container Registry
echo -e "${CYAN}Pushing image to Google Container Registry...${NC}"
docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest

# Deploy to Cloud Run
echo -e "${CYAN}Deploying to Cloud Run...${NC}"
gcloud run deploy $SERVICE_NAME \
  --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --memory $MEMORY \
  --cpu $CPU \
  --timeout $TIMEOUT \
  --concurrency $CONCURRENCY \
  --set-env-vars="NODE_ENV=production,DEBUG=false"

# Get the URL
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --platform managed --region $REGION --format="value(status.url)")

echo -e "${GREEN}Deployment complete!${NC}"
echo -e "${CYAN}Service URL:${NC} $SERVICE_URL"
echo -e "${CYAN}MCP Endpoint:${NC} $SERVICE_URL/mcp"
echo -e "${CYAN}API Endpoint:${NC} $SERVICE_URL/api"
echo -e "${CYAN}Health Check:${NC} $SERVICE_URL/health"

# Make the script executable with: chmod +x deploy-cloud-run.sh 