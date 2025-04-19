FROM node:18-slim

# Create app directory
WORKDIR /app

# Install app dependencies
COPY package*.json ./

RUN npm ci

# Copy app source
COPY . .

# Create required directories
RUN mkdir -p logs

# Expose port
EXPOSE 3002

# Set environment variables
ENV PORT=3002
ENV DEBUG=false
ENV NODE_ENV=production

# Create startup script
RUN echo '#!/bin/bash' > /app/start.sh && \
    echo 'echo "Starting Masa API MCP Server..."' >> /app/start.sh && \
    echo 'node server.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Start the server
CMD ["/app/start.sh"]