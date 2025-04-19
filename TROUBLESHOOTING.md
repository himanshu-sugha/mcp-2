# Troubleshooting Guide

This guide provides solutions for common issues with the Masa API Client MCP, focusing on the MCP and API endpoints.

## Quick Start with Simple Servers

If you're having trouble with the full server implementation, you can use one of our simplified servers that focus only on the core functionality:

### Option 1: Simple Server (Mock Data Only)

This server provides mock implementations of all endpoints without requiring any API keys or external dependencies:

```bash
# Start the simple server
node simple-server.js
```

### Option 2: Simple Server with MCP Integration

This server uses the MasaApiClient but falls back to mock data if no API key is available:

```bash
# Start the simple server with MCP integration
node simple-server-with-mcp.js
```

## Testing Individual Endpoints

We provide individual test scripts for each endpoint:

```bash
# Test only the health endpoint
curl http://localhost:3002/health

# Test only the MCP endpoint
node test-mcp-only.js

# Test only the API endpoint
node test-api-only.js
```

## Common Issues

### Issue: MCP Endpoint Returns 404 Error

**Symptoms:**
- Error: `Tool 'twitter_search' not found`
- Status code 404 when calling the MCP endpoint

**Solutions:**
1. Make sure the server is properly initializing the MCP tools
2. Try using the `simple-server.js` which has a direct implementation
3. Check for errors in the server logs related to MCP SDK initialization

### Issue: API Endpoint Not Working

**Symptoms:**
- Error when calling `/api/masa/enhance` endpoint
- No tweets returned from the API

**Solutions:**
1. Check if you have a valid MASA_API_KEY in your .env file
2. Try using the `simple-server.js` which works without an API key
3. Look for any error messages in the server logs

### Issue: Server Won't Start

**Symptoms:**
- Error when starting the server
- Server exits immediately after starting

**Solutions:**
1. Check if another process is using port 3002
2. Make sure all dependencies are installed: `npm install`
3. Try using a simpler server implementation: `node simple-server.js`

## MCP Tool Testing

To directly test a specific MCP tool:

```javascript
// Example of directly testing the twitter_search tool
const axios = require('axios');

async function testTool() {
  try {
    const response = await axios.post('http://localhost:3002/mcp', {
      tool: 'twitter_search',  // Tool name
      parameters: {
        query: 'artificial intelligence',
        max_results: 5
      }
    });
    console.log('Tool response:', response.data);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testTool();
```

## API Testing

To directly test the API endpoint:

```javascript
// Example of directly testing the API endpoint
const axios = require('axios');

async function testApi() {
  try {
    const response = await axios.post('http://localhost:3002/api/masa/enhance', {
      query: 'artificial intelligence',
      max_results: 5
    });
    console.log('API response:', response.data.results);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testApi();
```

## Still Having Issues?

If you continue to experience problems:

1. Try clearing node_modules and reinstalling: `rm -rf node_modules && npm install`
2. Check the logs for detailed error messages
3. Make sure your Node.js version is 18 or higher
4. Test with the most basic implementation using `simple-server.js`

## Performance Tips

1. Use mock mode during development by not setting a MASA_API_KEY
2. For production, make sure to set a valid MASA_API_KEY in your .env file
3. If experiencing timeouts, increase the timeout values in the code 