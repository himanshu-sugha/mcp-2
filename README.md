# Masa API Client for Model Context Protocol

This package provides a Model Context Protocol (MCP) client for interacting with the Masa Data API, focusing on social media data retrieval and analysis.

## Installation

```bash
npm install @modelcontextprotocol/masa-api-client
```

## Usage

### Basic Setup

```javascript
const MasaApiClient = require('@modelcontextprotocol/masa-api-client');

// Create a client instance
const client = new MasaApiClient({
  apiKey: process.env.MASA_API_KEY, // Your Masa API key
  timeoutMs: 10000 // Optional timeout in milliseconds
});
```

### Searching for Twitter Data

```javascript
async function searchTwitter() {
  try {
    const results = await client.search('artificial intelligence', {
      count: 10,
      resultType: 'recent',
      includeRetweets: false
    });
    
    console.log(`Found ${results.results.length} tweets`);
    console.log(results);
  } catch (error) {
    console.error('Search failed:', error);
  }
}
```

### Express Server Integration

```javascript
const express = require('express');
const app = express();
const MasaApiClient = require('@modelcontextprotocol/masa-api-client');

const client = new MasaApiClient({
  apiKey: process.env.MASA_API_KEY
});

app.get('/search', async (req, res) => {
  try {
    const { query, count } = req.query;
    const results = await client.search(query, { count: parseInt(count) || 10 });
    res.json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
```

## API Reference

### `new MasaApiClient(config)`

Creates a new instance of the Masa API client.

- `config.apiKey` - Your Masa API key
- `config.baseUrl` - (Optional) Override the default API endpoint
- `config.timeoutMs` - (Optional) Request timeout in milliseconds

### `client.search(query, options)`

Search for tweets matching the query.

- `query` - The search query string
- `options.count` - Number of results to return (default: 10)
- `options.includeRetweets` - Whether to include retweets (default: false)
- `options.resultType` - Type of results: 'mixed', 'recent' or 'popular' (default: 'recent')
- `options.lang` - Filter by language (e.g., 'en' for English)
- `options.since` - Return results after this date (format: YYYY-MM-DD)
- `options.until` - Return results before this date (format: YYYY-MM-DD)

Returns a `SearchResponse` object containing the search results.

## MCP Integration

This package follows the Model Context Protocol standards:

1. Uses the MCP SDK for communication
2. Provides TypeScript definitions
3. Follows the MCP naming convention
4. Has proper error handling
5. Provides clear documentation

## License

MIT 