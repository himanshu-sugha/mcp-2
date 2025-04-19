# MCP Integration Guide

This guide explains how to integrate the Masa API Client MCP with various applications that support the Model Context Protocol.

## Overview

The Masa API Client MCP provides tools for searching Twitter and retrieving social media content through a standard MCP interface. This allows Large Language Models (LLMs) and other applications to interact with Twitter data in a structured way.

## Integration Methods

There are several ways to integrate with the Masa API Client MCP:

### 1. Direct API Integration

You can make direct HTTP requests to the MCP endpoint:

```javascript
const axios = require('axios');

// Call MCP tool
async function callMcpTool(toolName, parameters) {
  const response = await axios.post('http://localhost:3002/mcp', {
    tool: toolName,
    parameters
  });
  
  return response.data;
}

// Example: Search Twitter
callMcpTool('twitter_search', {
  query: 'artificial intelligence',
  max_results: 10
}).then(tweets => {
  console.log(`Found ${tweets.length} tweets`);
});
```

### 2. Using the MCP Client

We provide a JavaScript client that makes it easy to integrate with the MCP:

```javascript
const MasaMcpClient = require('@modelcontextprotocol/masa-api-client/mcp-client');

const client = new MasaMcpClient({
  baseUrl: 'http://localhost:3002',
  timeout: 30000
});

// Search Twitter
client.searchTwitter('artificial intelligence', 10)
  .then(tweets => {
    console.log(`Found ${tweets.length} tweets`);
  });
```

### 3. Integration with VS Code

To integrate with VS Code, add the following to your settings.json:

```json
{
  "mcpServers": {
    "masa": {
      "command": "npx",
      "args": [
        "@modelcontextprotocol/masa-api-client"
      ]
    }
  }
}
```

Or use the command line:

```bash
code --add-mcp '{"name":"masa","command":"npx","args":["@modelcontextprotocol/masa-api-client"]}'
```

### 4. Integration with Claude and Other LLMs

#### For Claude:

Claude and other AI assistants that support the Model Context Protocol can use the Masa API Client as a tool. The integration depends on the specific platform, but generally follows this pattern:

1. Register the MCP server URL with the AI platform
2. The AI can then call the available tools:
   - `twitter_search`: Search Twitter for tweets
   - `twitter_sort_by_engagement`: Sort tweets by engagement metrics
   - `twitter_extract_search_term`: Extract a search term from a tweet

#### Example Claude Integration:

```
Tool: masa-mcp
URL: http://localhost:3002/mcp
```

When integrated, Claude can call tools like this:

```
<tool name="masa-mcp.twitter_search">
{
  "query": "artificial intelligence news",
  "max_results": 5
}
</tool>
```

## Available Tools

The Masa API Client MCP provides the following tools:

### twitter_search

Search Twitter for tweets matching a query.

Parameters:
- `query`: The search query using Twitter search syntax
- `max_results`: Maximum number of results to return (default: 10)

### twitter_sort_by_engagement

Sort tweets by engagement metrics (likes, retweets, etc).

Parameters:
- `tweets`: Array of tweet objects to sort

### twitter_extract_search_term

Extract a search term from a tweet for additional context gathering.

Parameters:
- `tweet_content`: The content of the tweet to analyze

## Deployment

### Local Development

To run the MCP server locally:

```bash
# Install dependencies
npm install

# Start the server
npm run server
```

### Cloud Deployment

To deploy the MCP server to the cloud:

```bash
# Build the Docker image
docker build -t gcr.io/your-project/masa-mcp:latest .

# Push to Google Container Registry
docker push gcr.io/your-project/masa-mcp:latest

# Deploy to Google Cloud Run
gcloud run deploy masa-mcp --image gcr.io/your-project/masa-mcp:latest --platform managed --region us-central1 --allow-unauthenticated
```

## Using CommonJS Modules

If you're experiencing issues with ESM modules, the Masa API Client MCP includes a compatibility wrapper that allows it to work with CommonJS modules. This is handled automatically, but you can also access these utilities directly:

```javascript
const mcpWrapper = require('@modelcontextprotocol/masa-api-client/utils/mcp/wrapper');

// Initialize MCP tools
const z = await mcpWrapper.getZod();
const tools = await mcpWrapper.defineTools({
  // Your tool definitions
});
```

## Troubleshooting

If you encounter issues with the MCP integration:

1. Check that the MCP server is running and accessible
2. Verify that you're using the correct URL for the MCP endpoint
3. Ensure that any authentication headers are properly set
4. Check the server logs for error messages

For more assistance, please open an issue on the GitHub repository. 