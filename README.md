# Masa API Client MCP

A Model Context Protocol (MCP) implementation for the Masa API, allowing LLMs to search Twitter, sort tweets, and extract information from social media content.

## Features

- Twitter search via MCP interface
- Tweet sorting by engagement
- Search term extraction from tweets
- Web page content scraping with Playwright
- Cloud-ready deployment with Docker

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/masa-api-client-mcp.git
cd masa-api-client-mcp

# Install dependencies
npm install
```

## Configuration

Create a `.env` file in the root directory with the following variables:

```
PORT=3002
DEBUG=true
NODE_ENV=development
```

## Usage

### Starting the Server

```bash
# Start the development server
npm run dev

# Start the production server
npm start
```

### MCP Client Usage

```javascript
const { MasaMcpClient } = require('./mcp-client');

async function example() {
  // Initialize the client
  const client = new MasaMcpClient('http://localhost:3002');
  
  // Search for tweets
  const tweets = await client.searchTwitter('artificial intelligence news', 3);
  console.log(`Found ${tweets.length} tweets`);
  
  // Sort tweets by engagement
  const sortedTweets = await client.sortTweetsByEngagement(tweets);
  console.log(`Sorted ${sortedTweets.length} tweets by engagement`);
  
  // Extract search term from tweet
  if (tweets.length > 0) {
    const searchTerm = await client.extractSearchTerm(tweets[0].text);
    console.log(`Extracted search term: ${searchTerm}`);
  }
}

example();
```

## API Endpoints

### MCP Endpoint

- **URL**: `/mcp`
- **Method**: `POST`
- **Description**: Main MCP endpoint for tool calls

### Twitter Search

- **URL**: `/api/masa/enhance`
- **Method**: `POST`
- **Body**:
  ```json
  {
    "query": "artificial intelligence news",
    "max_results": 3
  }
  ```
- **Response**: Array of tweet objects

### Health Check

- **URL**: `/health`
- **Method**: `GET`
- **Response**: Server status information

## MCP Tools

The following tools are available through the MCP interface:

### twitter_search

Searches Twitter for tweets matching a query.

**Parameters**:
- `query` (string): The search query
- `max_results` (number, optional): Maximum number of results to return

**Returns**: Array of tweet objects

### twitter_sort_by_engagement

Sorts a list of tweets by engagement metrics.

**Parameters**:
- `tweets` (array): Array of tweet objects

**Returns**: Sorted array of tweet objects

### twitter_extract_search_term

Extracts a search term from tweet text.

**Parameters**:
- `text` (string): The tweet text

**Returns**: Extracted search term

## Integration

See [INTEGRATION.md](./INTEGRATION.md) for detailed instructions on integrating with:

- Claude and other LLMs
- VS Code
- Direct API calls
- MCP-compatible applications

## Deployment

### Local Development

```bash
npm run dev
```

### Docker

```bash
# Build the Docker image
docker build -t masa-mcp .

# Run the container
docker run -p 3002:3002 masa-mcp
```

### Google Cloud Run

Use the included deployment script:

```bash
chmod +x deploy-cloud-run.sh
./deploy-cloud-run.sh
```

Or deploy manually:

```bash
# Build and push Docker image
docker build -t gcr.io/[PROJECT_ID]/masa-mcp .
docker push gcr.io/[PROJECT_ID]/masa-mcp

# Deploy to Cloud Run
gcloud run deploy masa-mcp \
  --image gcr.io/[PROJECT_ID]/masa-mcp \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Testing

```bash
# Run integration tests
npm run test-mcp
```

## License

MIT 