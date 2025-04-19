/**
 * Simple Express Server with Basic MCP and API Functionality
 * This is a stripped-down version focused just on making the endpoints work
 */

require('dotenv').config();
const express = require('express');
const axios = require('axios');

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

// ----------- ENDPOINTS -----------

// 1. Health check endpoint
app.get('/health', (req, res) => {
  log('Health check endpoint called');
  res.json({
    status: 'ok',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// 2. MCP endpoint
app.post('/mcp', (req, res) => {
  const { tool, parameters } = req.body;
  
  log(`MCP endpoint called. Tool: ${tool}`);
  
  if (!tool) {
    return res.status(400).json({ error: 'Missing tool name in request' });
  }
  
  try {
    // Handle each tool type
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
  } catch (error) {
    console.error(`Error processing MCP request:`, error);
    return res.status(500).json({ error: error.message });
  }
});

// 3. API endpoint for Twitter search
app.post('/api/masa/enhance', (req, res) => {
  log('API endpoint called: /api/masa/enhance');
  
  const { 
    query = 'test query', 
    max_results = 5 
  } = req.body;
  
  try {
    // Generate mock tweets
    const mockTweets = generateMockTweets(query, max_results);
    
    log(`Returning ${mockTweets.length} mock tweets for API endpoint`);
    
    // Return with expected structure
    return res.json({ results: mockTweets });
  } catch (error) {
    console.error('Error in API endpoint:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Simple server listening on port ${port}`);
  console.log(`Health check: http://localhost:${port}/health`);
  console.log(`MCP endpoint: http://localhost:${port}/mcp`);
  console.log(`API endpoint: http://localhost:${port}/api/masa/enhance`);
}); 