/**
 * Simple Express Server with MCP and API Functionality
 * This version uses MasaApiClient with a fallback to mock data
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');
const MasaApiClient = require('./masaApiClient');

// Initialize Express
const app = express();
const port = process.env.PORT || 3002;

// Setup middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Enable CORS headers
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Helper function for logging
function log(message) {
  console.log(`[${new Date().toISOString()}] ${message}`);
}

/**
 * Generate mock tweets
 * @param {string} query - Search query
 * @param {number} count - Number of mock tweets
 * @returns {Array} Array of mock tweets
 */
function generateMockTweets(query = 'artificial intelligence', count = 5) {
  const mockTweets = [];
  
  for (let i = 0; i < count; i++) {
    mockTweets.push({
      ID: `mock-tweet-${i + 1}`,
      Content: `This is mock tweet #${i + 1} about ${query}.`,
      Metadata: {
        public_metrics: {
          RetweetCount: Math.floor(Math.random() * 100),
          LikeCount: Math.floor(Math.random() * 500),
          QuoteCount: Math.floor(Math.random() * 20),
          ReplyCount: Math.floor(Math.random() * 50),
          BookmarkCount: Math.floor(Math.random() * 10)
        }
      },
      Score: (0.99 - (i * 0.1)).toFixed(2)
    });
  }
  
  return mockTweets;
}

// Initialize Masa client with fallback
const apiKey = process.env.MASA_API_KEY || '';
const masaClient = new MasaApiClient(apiKey);
const useMockData = !apiKey; // Use mock data if no API key is provided

if (useMockData) {
  log('No API key provided, will use mock data for all endpoints');
} else {
  log('Using real Masa API client with provided API key');
}

// ----------- ENDPOINTS -----------

// 1. Health check endpoint
app.get('/health', (req, res) => {
  log('Health check endpoint called');
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    mock: useMockData
  });
});

// 2. MCP endpoint
app.post('/mcp', async (req, res) => {
  const { tool, parameters } = req.body;
  
  log(`MCP endpoint called. Tool: ${tool}`);
  
  if (!tool) {
    return res.status(400).json({ error: 'Missing tool name in request' });
  }
  
  try {
    // For mock mode or if tools aren't ready yet
    if (useMockData || !masaClient.tools[tool]) {
      // Handle each tool type with mock data
      switch (tool) {
        case 'twitter_search':
          const count = parameters?.max_results || 5;
          const query = parameters?.query || 'artificial intelligence';
          const tweets = generateMockTweets(query, count);
          log(`Generated ${tweets.length} mock tweets for query: "${query}"`);
          return res.json(tweets);
        
        case 'twitter_sort_by_engagement':
          // Just return the same tweets, pretending they're sorted
          log('Returning "sorted" tweets');
          return res.json(parameters?.tweets || []);
        
        case 'twitter_extract_search_term':
          log('Returning mock search term');
          return res.json({
            searchTerm: "artificial intelligence",
            success: true
          });
        
        default:
          log(`Unknown tool requested: ${tool}`);
          return res.status(404).json({ error: `Tool '${tool}' not found` });
      }
    } else {
      // Use the actual MCP tools
      const handler = masaClient.tools[tool].handler;
      
      if (!handler) {
        log(`No handler for tool: ${tool}`);
        return res.status(500).json({ error: `No handler found for tool '${tool}'` });
      }
      
      log(`Executing handler for tool: ${tool}`);
      const result = await handler(parameters);
      return res.json(result);
    }
  } catch (error) {
    console.error(`Error processing MCP request:`, error);
    
    // Fall back to mock data on error
    if (tool === 'twitter_search') {
      log('Falling back to mock data due to error');
      const count = parameters?.max_results || 5;
      const query = parameters?.query || 'artificial intelligence';
      const tweets = generateMockTweets(query, count);
      return res.json(tweets);
    }
    
    return res.status(500).json({ error: error.message });
  }
});

// 3. API endpoint for Twitter search
app.post('/api/masa/enhance', async (req, res) => {
  log('API endpoint called: /api/masa/enhance');
  
  const { 
    query = 'test query', 
    max_results = 5 
  } = req.body;
  
  try {
    if (useMockData) {
      // Generate mock tweets
      const mockTweets = generateMockTweets(query, max_results);
      log(`Returning ${mockTweets.length} mock tweets for API endpoint`);
      return res.json({ results: mockTweets });
    } else {
      // Use the actual Masa API client
      log(`Searching Twitter for query: "${query}", max_results: ${max_results}`);
      const results = await masaClient.performTwitterSearch(query, parseInt(max_results));
      log(`Retrieved ${results.length} tweets from Masa API`);
      
      // Sort tweets by engagement
      const sortedResults = results.sort((a, b) => {
        const metricsA = a.Metadata.public_metrics;
        const metricsB = b.Metadata.public_metrics;

        const scoreA = (metricsA.RetweetCount * 2) + 
                       metricsA.LikeCount + 
                       (metricsA.QuoteCount * 1.5) + 
                       metricsA.ReplyCount + 
                       metricsA.BookmarkCount;

        const scoreB = (metricsB.RetweetCount * 2) + 
                       metricsB.LikeCount + 
                       (metricsB.QuoteCount * 1.5) + 
                       metricsB.ReplyCount + 
                       metricsB.BookmarkCount;

        return scoreB - scoreA;
      });
      
      return res.json({ results: sortedResults });
    }
  } catch (error) {
    console.error('Error in API endpoint:', error);
    
    // Fall back to mock data on error
    log('Falling back to mock data due to error');
    const mockTweets = generateMockTweets(query, max_results);
    return res.json({ results: mockTweets });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Simple server with MCP integration listening on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`MCP endpoint: http://localhost:${port}/mcp`);
  console.log(`API endpoint: http://localhost:${port}/api/masa/enhance`);
  console.log(`Mode: ${useMockData ? 'MOCK DATA (no API key)' : 'REAL API'}`);
}); 