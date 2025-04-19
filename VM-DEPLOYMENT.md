# Deploying MCP on Google Cloud VM

This guide provides step-by-step instructions for deploying the MCP project on a Google Cloud VM instance using Docker Compose.

## Prerequisites

1. A Google Cloud VM instance running Linux (Ubuntu recommended)
2. SSH access to the VM
3. Root or sudo privileges on the VM

## Setup Steps

### 1. SSH into your Google Cloud VM

First, connect to your VM using SSH:

```bash
gcloud compute ssh YOUR_VM_NAME --zone YOUR_ZONE
```

Or use the SSH button in the Google Cloud Console.

### 2. Install Docker and Docker Compose

Run the following commands to install Docker and Docker Compose:

```bash
# Update package list
sudo apt-get update

# Install dependencies
sudo apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release \
    git

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up the Docker repository
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Update apt and install Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.18.1/docker-compose-linux-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
sudo ln -s /usr/local/bin/docker-compose /usr/bin/docker-compose
```

### 3. Create Project Directory and Copy Files

1. Create a directory for your project:

```bash
sudo mkdir -p /opt/mcp-project
sudo chown $(whoami):$(whoami) /opt/mcp-project
cd /opt/mcp-project
```

2. Copy the project files to your VM. You can either:

   - Clone from Git:
     ```bash
     git clone YOUR_REPOSITORY_URL .
     ```
   
   - Or upload the files using `gcloud compute scp` or SCP:
     ```bash
     # From your local machine
     gcloud compute scp docker-compose.yml YOUR_VM_NAME:/opt/mcp-project/ --zone YOUR_ZONE
     # Upload other necessary files
     ```

3. Ensure you have the `docker-compose.yml` file and both `mcp-2` and `playwright-mcp` directories with their respective Dockerfiles.

### 4. Create Environment File

Create a `.env` file with your configuration:

```bash
cat > .env << EOL
# MCP Configuration
NODE_ENV=production
DEBUG=false
PORT=3002

# API Keys (replace with your actual keys)
MASA_API_KEY=your_masa_api_key
TOGETHER_API_KEY=your_together_api_key

# Feature flags
TOGETHER_ENHANCEMENT=TRUE
MASA_ENHANCEMENT=TRUE
EOL
```

### 5. Configure Firewall Rules

Ensure that the required ports (3000 and 3002) are open in your Google Cloud firewall:

```bash
gcloud compute firewall-rules create allow-mcp-ports \
  --direction=INGRESS \
  --priority=1000 \
  --network=default \
  --action=ALLOW \
  --rules=tcp:3000,tcp:3002 \
  --source-ranges=0.0.0.0/0 \
  --target-tags=YOUR_VM_TAG
```

Replace `YOUR_VM_TAG` with your VM's network tag. If your VM doesn't have a tag, add one through the Google Cloud Console, or omit the `--target-tags` flag to apply the rule to all VMs in the default network.

### 6. Deploy with Docker Compose

Start the services using Docker Compose:

```bash
cd /opt/mcp-project
docker-compose up -d
```

This will:
- Build the Docker images for both services
- Create and start the containers
- Set up the network and volumes

### 7. Verify Deployment

Check if the services are running:

```bash
docker-compose ps
```

You should see both `masa-mcp` and `playwright-mcp` services running.

Check the logs if needed:

```bash
docker-compose logs
```

### 8. Access Your Services

Your services will be available at:

- Masa MCP: `http://YOUR_VM_IP:3002`
- Playwright MCP: `http://YOUR_VM_IP:3000`

You can get your VM's external IP with:

```bash
curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google"
```

Test the health endpoints:
- `http://YOUR_VM_IP:3002/health`
- `http://YOUR_VM_IP:3000/health`

## Managing Your Deployment

### Stopping Services

```bash
cd /opt/mcp-project
docker-compose down
```

### Restarting Services

```bash
cd /opt/mcp-project
docker-compose restart
```

### Viewing Logs

```bash
docker-compose logs -f
```

### Updating Services

If you need to update your services:

1. Pull the latest code:
   ```bash
   git pull
   ```

2. Rebuild and restart:
   ```bash
   docker-compose up -d --build
   ```

## Troubleshooting

### Container not starting

Check the logs:
```bash
docker-compose logs masa-mcp
docker-compose logs playwright-mcp
```

### Cannot access services

1. Verify containers are running:
   ```bash
   docker-compose ps
   ```

2. Check firewall rules:
   ```bash
   gcloud compute firewall-rules list
   ```

3. Verify ports are listening:
   ```bash
   sudo netstat -tuln | grep -E '3000|3002'
   ```

### Resource issues

If you're experiencing resource issues, modify the `deploy.resources.limits` section in `docker-compose.yml` to adjust memory and CPU allocation. 