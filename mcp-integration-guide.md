# MCP Integration Guide

This guide explains how to integrate your MCP server with various LLMs and software that support the Model Context Protocol (MCP).

## Available Endpoints

Your MCP server provides several endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/mcp` | POST | Main MCP endpoint for tool calls |
| `/api/masa/enhance` | POST | Search Twitter and get tweets |
| `/api/playright/enhance` | POST | Search Twitter with Playwright enhancement |
| `/api/masa/searchTerm` | POST | Extract search terms from tweets |
| `/health` | GET | Server health status |

## Available MCP Tools

The `/mcp` endpoint provides these tools:

| Tool Name | Description |
|-----------|-------------|
| `twitter_search` | Search Twitter for tweets matching a query |
| `twitter_sort_by_engagement` | Sort tweets by engagement metrics |
| `twitter_extract_search_term` | Extract search terms from tweets |

## Integration Methods

### 1. Claude and Anthropic API

To integrate with Claude and other Anthropic models:

1. Set up your MCP server:
   ```bash
   npm run dev
   ```

2. In your Anthropic API requests, include the tool definitions:
   ```json
   {
     "tools": [
       {
         "name": "twitter_search",
         "description": "Search Twitter for tweets matching a query",
         "input_schema": {
           "type": "object",
           "properties": {
             "query": {
               "type": "string",
               "description": "The search query"
             },
             "max_results": {
               "type": "integer",
               "description": "Maximum number of results to return"
             }
           },
           "required": ["query"]
         }
       },
       {
         "name": "twitter_sort_by_engagement",
         "description": "Sort tweets by engagement metrics",
         "input_schema": {
           "type": "object",
           "properties": {
             "tweets": {
               "type": "array",
               "description": "Array of tweet objects to sort"
             }
           },
           "required": ["tweets"]
         }
       },
       {
         "name": "twitter_extract_search_term",
         "description": "Extract a search term from tweet text",
         "input_schema": {
           "type": "object",
           "properties": {
             "tweet_content": {
               "type": "string",
               "description": "The content of the tweet to analyze"
             }
           },
           "required": ["tweet_content"]
         }
       }
     ],
     "tool_choice": "auto"
   }
   ```

3. Configure a tool handler in your application:
   ```javascript
   async function handleToolCall(tool_name, parameters) {
     const response = await fetch('http://localhost:3002/mcp', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         tool: tool_name,
         parameters
       })
     });
     
     return await response.json();
   }
   ```

### 2. OpenAI and GPT Models

For OpenAI and GPT models:

1. Define the function schema:
   ```json
   {
     "functions": [
       {
         "name": "twitter_search",
         "description": "Search Twitter for tweets matching a query",
         "parameters": {
           "type": "object",
           "properties": {
             "query": {
               "type": "string",
               "description": "The search query"
             },
             "max_results": {
               "type": "integer",
               "description": "Maximum number of results to return"
             }
           },
           "required": ["query"]
         }
       }
     ]
   }
   ```

2. Handle function calls in your application:
   ```javascript
   if (response.choices[0]?.message?.function_call) {
     const functionCall = response.choices[0].message.function_call;
     const functionName = functionCall.name;
     const functionArgs = JSON.parse(functionCall.arguments);
     
     // Call MCP endpoint
     const mcpResponse = await fetch('http://localhost:3002/mcp', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify({
         tool: functionName,
         parameters: functionArgs
       })
     });
     
     const mcpData = await mcpResponse.json();
     // Use the data in your next API call
   }
   ```

### 3. Cursor and VS Code

To integrate with VS Code or Cursor:

1. Add this to your VS Code `settings.json`:
   ```json
   {
     "mcpServers": {
       "masaTwitter": {
         "command": "cd PATH_TO_MASA_MCP && npm run server",
         "endpointUrl": "http://localhost:3002/mcp"
       }
     }
   }
   ```

2. For Cursor, you can configure the MCP server in the settings panel or use a command to register it:
   ```
   /use-mcp http://localhost:3002/mcp
   ```

### 4. Direct HTTP Integration

You can call the MCP endpoint directly from any application:

```javascript
const axios = require('axios');

async function searchTwitter(query, maxResults = 10) {
  try {
    const response = await axios.post('http://localhost:3002/mcp', {
      tool: 'twitter_search',
      parameters: {
        query,
        max_results: maxResults
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error calling MCP:', error.message);
    throw error;
  }
}

// Usage
searchTwitter('artificial intelligence')
  .then(tweets => console.log(`Found ${tweets.length} tweets`))
  .catch(err => console.error(err));
```

### 5. REST API Integration

If you prefer using regular REST APIs instead of the MCP endpoint, you can use:

```javascript
// Search Twitter
const response = await fetch('http://localhost:3002/api/masa/enhance', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    query: 'artificial intelligence',
    max_results: 10
  })
});

const data = await response.json();
const tweets = data.results;
```

## Testing Your Integration

1. Test the MCP endpoint:
   ```bash
   npm run test-mcp
   ```

2. Test the API endpoints:
   ```bash
   npm run test-api
   npm run test-search
   ```

3. Test all endpoints:
   ```bash
   npm run test-all
   ```

## Public Hosting

For production use, you should host your MCP server on a public URL:

1. Deploy to Google Cloud Run:
   ```bash
   ./deploy-cloud-run.sh
   ```

2. Update your integration to use the public URL:
   ```javascript
   const MCP_URL = 'https://your-cloud-run-url.run.app/mcp';
   ```

## Security Considerations

1. For public deployments, consider adding authentication to your MCP endpoints.
2. Use HTTPS for all production deployments.
3. Consider rate limiting to prevent abuse.

## Troubleshooting

If you encounter issues, check our [Troubleshooting Guide](./TROUBLESHOOTING.md).

## More Examples

Check out our [examples directory](./examples/) for more integration examples with various LLMs and applications. 