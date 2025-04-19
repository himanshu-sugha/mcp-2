#!/bin/bash

# Setup script for deploying MCP on Google Cloud VM
# Usage: ./setup-vm.sh

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== MCP VM Setup Script ===${NC}"
echo -e "This script will set up Docker, Docker Compose, and deploy the MCP services."
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Please run this script with sudo or as root.${NC}"
  exit 1
fi

# Update and install dependencies
echo -e "\n${CYAN}Updating system and installing dependencies...${NC}"
apt-get update
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git

# Install Docker if not already installed
if ! command -v docker &> /dev/null; then
    echo -e "\n${CYAN}Installing Docker...${NC}"
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update
    apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Start and enable Docker
    systemctl start docker
    systemctl enable docker
    
    echo -e "${GREEN}Docker installed successfully!${NC}"
else
    echo -e "${GREEN}Docker is already installed.${NC}"
fi

# Install Docker Compose if not already installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "\n${CYAN}Installing Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-linux-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    echo -e "${GREEN}Docker Compose installed successfully!${NC}"
else
    echo -e "${GREEN}Docker Compose is already installed.${NC}"
fi

# Check if project directory exists, if not clone it
PROJECT_DIR="/opt/mcp-project"
if [ ! -d "$PROJECT_DIR" ]; then
    echo -e "\n${CYAN}Setting up project directory...${NC}"
    mkdir -p "$PROJECT_DIR"
    
    # Ask for Git repository URL
    echo -e "\n${YELLOW}Please enter your Git repository URL (or press Enter to skip cloning):${NC}"
    read -r GIT_REPO
    
    if [ -n "$GIT_REPO" ]; then
        git clone "$GIT_REPO" "$PROJECT_DIR"
        echo -e "${GREEN}Repository cloned successfully!${NC}"
    else
        echo -e "${YELLOW}Skipping repository cloning. Please copy your project files to $PROJECT_DIR${NC}"
    fi
else
    echo -e "${GREEN}Project directory already exists at $PROJECT_DIR.${NC}"
fi

# Change to project directory
cd "$PROJECT_DIR" || {
    echo -e "${RED}Failed to change to project directory.${NC}"
    exit 1
}

# Configure environment variables
echo -e "\n${CYAN}Configuring environment variables...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating .env file...${NC}"
    cat > .env << EOL
# MCP Configuration
NODE_ENV=production
DEBUG=false
PORT=3002

# API Keys (replace with your actual keys)
MASA_API_KEY=
TOGETHER_API_KEY=

# Feature flags
TOGETHER_ENHANCEMENT=FALSE
MASA_ENHANCEMENT=FALSE
EOL

    echo -e "${GREEN}.env file created successfully!${NC}"
    echo -e "${YELLOW}Please edit the .env file to add your API keys: nano .env${NC}"
else
    echo -e "${GREEN}.env file already exists.${NC}"
fi

# Check if docker-compose.yml exists
if [ ! -f docker-compose.yml ]; then
    echo -e "${RED}docker-compose.yml not found in $PROJECT_DIR.${NC}"
    echo -e "${YELLOW}Please ensure the Docker Compose file is available in this directory.${NC}"
    exit 1
fi

# Prompt user to deploy now or later
echo -e "\n${YELLOW}Would you like to deploy the MCP services now? (y/N):${NC}"
read -r DEPLOY_NOW

if [[ "$DEPLOY_NOW" == "y" || "$DEPLOY_NOW" == "Y" ]]; then
    echo -e "\n${CYAN}Deploying MCP services with Docker Compose...${NC}"
    docker-compose up -d
    
    # Check if the services are running
    if docker-compose ps | grep "Up"; then
        echo -e "\n${GREEN}MCP services deployed successfully!${NC}"
        
        # Get the VM's external IP address
        EXTERNAL_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google")
        
        if [ -n "$EXTERNAL_IP" ]; then
            echo -e "\n${GREEN}Access your services at:${NC}"
            echo -e "${CYAN}Masa MCP:${NC} http://$EXTERNAL_IP:3002"
            echo -e "${CYAN}Health Check:${NC} http://$EXTERNAL_IP:3002/health"
            echo -e "${CYAN}MCP Endpoint:${NC} http://$EXTERNAL_IP:3002/mcp"
            echo -e "${CYAN}Playwright MCP:${NC} http://$EXTERNAL_IP:3000"
        else
            echo -e "\n${YELLOW}Could not determine external IP. Please check your VM's external IP and access the services at:${NC}"
            echo -e "${CYAN}Masa MCP:${NC} http://<YOUR-VM-IP>:3002"
            echo -e "${CYAN}Playwright MCP:${NC} http://<YOUR-VM-IP>:3000"
        fi
    else
        echo -e "\n${RED}Some services might not have started properly. Check the logs with:${NC}"
        echo -e "${YELLOW}docker-compose logs${NC}"
    fi
else
    echo -e "\n${YELLOW}You can deploy the services later with:${NC}"
    echo -e "${CYAN}cd $PROJECT_DIR && docker-compose up -d${NC}"
fi

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "For more information, see the documentation in the project or DEPLOYMENT-GUIDE.md" 