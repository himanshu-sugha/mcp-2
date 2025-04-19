#!/bin/bash

# Easy setup script for MCP on a Google Cloud VM
# Usage: curl -sSL https://raw.githubusercontent.com/your-repo/easy-vm-setup.sh | bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}=== MCP VM Easy Setup Script ===${NC}"
echo -e "This script will set up Docker, Docker Compose, and deploy the MCP services."
echo ""

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then
  echo -e "${YELLOW}Running without root privileges. Some commands may fail.${NC}"
  echo -e "${YELLOW}It's recommended to run this script with sudo.${NC}"
  read -p "Continue anyway? (y/N): " CONTINUE
  if [[ "$CONTINUE" != "y" && "$CONTINUE" != "Y" ]]; then
    echo -e "${RED}Aborted.${NC}"
    exit 1
  fi
fi

# Install Docker if not already installed
install_docker() {
  if ! command -v docker &> /dev/null; then
    echo -e "\n${CYAN}Installing Docker...${NC}"
    sudo apt-get update
    sudo apt-get install -y \
      apt-transport-https \
      ca-certificates \
      curl \
      gnupg \
      lsb-release
    
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io
    
    # Start and enable Docker
    sudo systemctl start docker
    sudo systemctl enable docker
    
    # Add current user to docker group
    sudo usermod -aG docker $USER
    
    echo -e "${GREEN}Docker installed successfully!${NC}"
    echo -e "${YELLOW}NOTE: You may need to log out and back in for group changes to take effect.${NC}"
  else
    echo -e "${GREEN}Docker is already installed.${NC}"
  fi
}

# Install Docker Compose if not already installed
install_docker_compose() {
  if ! command -v docker-compose &> /dev/null; then
    echo -e "\n${CYAN}Installing Docker Compose...${NC}"
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-linux-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    sudo ln -sf /usr/local/bin/docker-compose /usr/bin/docker-compose
    
    echo -e "${GREEN}Docker Compose installed successfully!${NC}"
  else
    echo -e "${GREEN}Docker Compose is already installed.${NC}"
  fi
}

# Set up project
setup_project() {
  PROJECT_DIR="$HOME/mcp-project"
  
  echo -e "\n${CYAN}Setting up project directory at ${PROJECT_DIR}...${NC}"
  mkdir -p "$PROJECT_DIR"
  cd "$PROJECT_DIR"
  
  # Download docker-compose.yml
  echo -e "\n${CYAN}Downloading Docker Compose configuration...${NC}"
  curl -sSL https://raw.githubusercontent.com/your-repo/docker-compose.yml -o docker-compose.yml
  
  # Create .env file
  echo -e "\n${CYAN}Creating environment file...${NC}"
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

  echo -e "${GREEN}Environment file created at ${PROJECT_DIR}/.env${NC}"
  echo -e "${YELLOW}IMPORTANT: Edit the .env file to add your API keys before deployment.${NC}"
  
  # Create directory structure
  mkdir -p logs playwright-logs
  
  echo -e "\n${CYAN}Setting up project structure...${NC}"
  
  # Clone or download project repositories
  git clone https://github.com/your-repo/mcp-2.git .
  mkdir -p playwright-mcp
  git clone https://github.com/your-repo/playwright-mcp.git playwright-mcp
  
  echo -e "${GREEN}Project structure set up successfully!${NC}"
}

# Configure firewall
configure_firewall() {
  echo -e "\n${CYAN}Configuring firewall for MCP ports...${NC}"
  
  # Check if running in Google Cloud
  if curl -s -i http://metadata.google.internal &> /dev/null; then
    echo -e "${YELLOW}Detected Google Cloud environment.${NC}"
    
    # Get instance network tags
    INSTANCE_NAME=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/name)
    ZONE=$(curl -s -H "Metadata-Flavor: Google" http://metadata.google.internal/computeMetadata/v1/instance/zone | cut -d/ -f4)
    
    echo -e "${YELLOW}Would you like to create a firewall rule to allow incoming traffic to MCP ports? (y/N)${NC}"
    read -r CREATE_RULE
    
    if [[ "$CREATE_RULE" == "y" || "$CREATE_RULE" == "Y" ]]; then
      RULE_NAME="allow-mcp-ports"
      
      # Check if firewall rule already exists
      if gcloud compute firewall-rules describe $RULE_NAME &> /dev/null; then
        echo -e "${YELLOW}Firewall rule '$RULE_NAME' already exists.${NC}"
      else
        echo -e "${CYAN}Creating firewall rule...${NC}"
        gcloud compute firewall-rules create $RULE_NAME \
          --direction=INGRESS \
          --priority=1000 \
          --network=default \
          --action=ALLOW \
          --rules=tcp:3000,tcp:3002 \
          --source-ranges=0.0.0.0/0 \
          --target-tags=http-server,https-server
        
        # Apply tags to instance if they're not already applied
        gcloud compute instances add-tags $INSTANCE_NAME \
          --tags=http-server,https-server \
          --zone=$ZONE
        
        echo -e "${GREEN}Firewall rule created and applied to instance.${NC}"
      fi
    else
      echo -e "${YELLOW}Skipping firewall rule creation.${NC}"
      echo -e "${YELLOW}Remember to manually configure your firewall to allow traffic to ports 3000 and 3002.${NC}"
    fi
  else
    echo -e "${YELLOW}Not running in Google Cloud. Skipping cloud firewall configuration.${NC}"
    echo -e "${YELLOW}If you have a firewall, ensure ports 3000 and 3002 are open.${NC}"
  fi
}

# Deploy services
deploy_services() {
  cd "$PROJECT_DIR"
  
  echo -e "\n${CYAN}Would you like to deploy the services now? (y/N)${NC}"
  read -r DEPLOY_NOW
  
  if [[ "$DEPLOY_NOW" == "y" || "$DEPLOY_NOW" == "Y" ]]; then
    echo -e "\n${CYAN}Deploying MCP services...${NC}"
    sudo docker-compose up -d
    
    # Check if deployment was successful
    if sudo docker-compose ps | grep "Up"; then
      echo -e "${GREEN}MCP services deployed successfully!${NC}"
      
      # Get external IP
      EXTERNAL_IP=$(curl -s http://whatismyip.akamai.com)
      
      if [ -n "$EXTERNAL_IP" ]; then
        echo -e "\n${GREEN}Access your services at:${NC}"
        echo -e "${CYAN}Masa MCP:${NC} http://$EXTERNAL_IP:3002"
        echo -e "${CYAN}Health Check:${NC} http://$EXTERNAL_IP:3002/health"
        echo -e "${CYAN}Playwright MCP:${NC} http://$EXTERNAL_IP:3000"
      else
        echo -e "\n${YELLOW}Could not determine external IP.${NC}"
        echo -e "${YELLOW}Check your VM's IP address and access the services at:${NC}"
        echo -e "${CYAN}Masa MCP:${NC} http://<YOUR-VM-IP>:3002"
        echo -e "${CYAN}Playwright MCP:${NC} http://<YOUR-VM-IP>:3000"
      fi
    else
      echo -e "${RED}Some services might not have started properly.${NC}"
      echo -e "${YELLOW}Check the logs with: docker-compose logs${NC}"
    fi
  else
    echo -e "\n${YELLOW}You can deploy later with:${NC}"
    echo -e "${CYAN}cd $PROJECT_DIR && docker-compose up -d${NC}"
  fi
}

# Main script execution
echo -e "\n${CYAN}Starting installation...${NC}"

# Install requirements
install_docker
install_docker_compose

# Set up project
setup_project

# Configure firewall
configure_firewall

# Deploy services
deploy_services

echo -e "\n${GREEN}Setup complete!${NC}"
echo -e "${YELLOW}If you encounter any issues, refer to the troubleshooting section in the documentation.${NC}" 