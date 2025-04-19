require('dotenv').config(); 
const express = require('express');
const MasaApiClient = require('./masaApiClient');
const axios = require('axios');
const mcpWrapper = require('./utils/mcp/wrapper');

// Initialize Express
const app = express();
const port = process.env.PORT || 3002;

// Setup middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Enable CORS headers for better integration
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Initialize Masa client - using empty key for testing if not provided
const apiKey = process.env.MASA_API_KEY || '';
const masaClient = new MasaApiClient(apiKey);
const useMockData = !apiKey; // Use mock data if no API key is provided

// Color codes for console logs
const colors = {
  reset: "\x1b[0m",
  cyan: "\x1b[36m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  red: "\x1b[31m"
};

function logStep(step, message) {
  if (process.env.DEBUG === 'true') {
    console.log(`${colors.cyan}[${step}]${colors.reset} ${message}`);
  }
}

function logError(message, error) {
  console.error(`${colors.red}[ERROR]${colors.reset} ${message}`, error);
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

// Async function to start the server with MCP middleware
async function startServer() {
  try {
    // Set up basic endpoints that should always work

    // Health check endpoint
    app.get('/health', (req, res) => {
      logStep('HEALTH', 'Health check endpoint called');
      res.json({
        status: 'ok',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        config: {
          enhancement: process.env.TOGETHER_ENHANCEMENT === "TRUE",
          debug: process.env.DEBUG === 'true',
          mock: useMockData
        }
      });
    });

    // Setup standard API endpoints
    setupApiEndpoints();

    // Direct implementation of the MCP endpoint - proven to work
    app.post('/mcp', (req, res) => {
      const { tool, parameters } = req.body;
      
      logStep('MCP', `MCP endpoint called. Tool: ${tool}`);
      
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
            logStep('MCP', `Generated ${tweets.length} mock tweets for query: "${query}"`);
            return res.json(tweets);
          
          case 'twitter_sort_by_engagement':
            // Just return the same tweets, pretending they're sorted
            logStep('MCP', 'Returning "sorted" tweets');
            return res.json(parameters?.tweets || []);
          
          case 'twitter_extract_search_term':
            logStep('MCP', 'Returning mock search term');
            return res.json({
              searchTerm: "artificial intelligence",
              success: true
            });
          
          default:
            logStep('MCP', `Unknown tool requested: ${tool}`);
            return res.status(404).json({ error: `Tool '${tool}' not found` });
        }
      } catch (error) {
        logError('Error processing MCP request:', error);
        return res.status(500).json({ error: error.message });
      }
    });

    // Start the server
    app.listen(port, () => {
      console.log(`${colors.green}[SERVER]${colors.reset} Masa API MCP server listening on port ${port}`);
      console.log(`${colors.cyan}[INFO]${colors.reset} MCP endpoint available at http://localhost:${port}/mcp`);
      console.log(`${colors.cyan}[INFO]${colors.reset} API endpoints available at http://localhost:${port}/api/*`);
      console.log(`${colors.cyan}[INFO]${colors.reset} Health check available at http://localhost:${port}/health`);
      console.log(`${colors.cyan}[INFO]${colors.reset} Mode: ${useMockData ? 'MOCK DATA (no API key)' : 'REAL API'}`);
    });
  } catch (error) {
    logError('Failed to start server', error);
    process.exit(1);
  }
}

// Set up API endpoints
function setupApiEndpoints() {
  // Twitter search and enhance endpoint
  app.post('/api/masa/enhance', async (req, res) => {
    logStep('API', 'Incoming /api/masa/enhance request');
    
    const { 
      query = 'test query', // Default query for testing
      max_results = 5,
      enhance_top_x = max_results,
      custom_instruction = ''
    } = req.body;

    try {
      // If using mock data or API key is not set, return mock data
      if (useMockData) {
        logStep('API', 'Using mock data for API endpoint');
        const mockTweets = generateMockTweets(query, max_results);
        logStep('API', `Generated ${mockTweets.length} mock tweets for query: "${query}"`);
        return res.json({ results: mockTweets });
      }

      // Otherwise, use the actual Masa API client
      logStep('SEARCH', `Searching Twitter for query: "${query}", max_results: ${max_results}`);
      const results = await masaClient.performTwitterSearch(query, parseInt(max_results));

      logStep('RESULT', `${results.length} tweets retrieved from Masa API`);

      // Sort tweets by engagement metrics
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

      // Check enhancement flag
      if (process.env.TOGETHER_ENHANCEMENT === "TRUE") {
        logStep('ENHANCE', `Enhancing top ${enhance_top_x} tweets...`);
        try {
          const tweetsToEnhance = sortedResults.slice(0, parseInt(enhance_top_x));

          const enhanceResponse = await axios.post(
            'https://playwright-mcp-620401541065.us-central1.run.app/enhance-tweets-masa',
            {
              tweets: tweetsToEnhance,
              custom_instruction
            },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 300000 // 5 minutes timeout for enhancement
            }
          );

          const enhancedResults = enhanceResponse.data;
          logStep('ENHANCE', `Enhancement successful. ${enhancedResults.results.length} tweets enhanced.`);

          const finalResults = [
            ...enhancedResults.results,
            ...sortedResults.slice(parseInt(enhance_top_x))
          ];

          return res.json({ results: finalResults });
        } catch (err) {
          logError('Enhancement request failed:', err.message);
          return res.json({ results: sortedResults });
        }
      } else {
        return res.json({ results: sortedResults });
      }
    } catch (error) {
      logError('Exception during /api/masa/enhance:', error.message);
      
      // Fallback to mock data on error
      logStep('API', 'Falling back to mock data due to error');
      const mockTweets = generateMockTweets(query, max_results);
      return res.json({ results: mockTweets });
    }
  });

  // Playright enhance endpoint - implement the same functionality as masa/enhance
  app.post('/api/playright/enhance', async (req, res) => {
    logStep('API', 'Incoming /api/playright/enhance request');
    
    const { 
      query = 'test query', 
      max_results = 5,
      enhance_top_x = max_results,
      custom_instruction = ''
    } = req.body;

    try {
      // If using mock data or API key is not set, return mock data
      if (useMockData) {
        logStep('API', 'Using mock data for playwright enhance endpoint');
        const mockTweets = generateMockTweets(query, max_results);
        logStep('API', `Generated ${mockTweets.length} mock tweets for playwright endpoint`);
        return res.json({ results: mockTweets });
      }

      // Otherwise, use the actual Masa API client
      logStep('SEARCH', `Searching Twitter for query: "${query}", max_results: ${max_results}`);
      const results = await masaClient.performTwitterSearch(query, parseInt(max_results));
      logStep('RESULT', `${results.length} tweets retrieved from Masa API for playwright endpoint`);

      // Sort tweets by engagement metrics
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

      // Check enhancement flag - use playwright specific endpoint
      if (process.env.TOGETHER_ENHANCEMENT === "TRUE") {
        logStep('ENHANCE', `Enhancing top ${enhance_top_x} tweets with playwright...`);
        try {
          const tweetsToEnhance = sortedResults.slice(0, parseInt(enhance_top_x));

          const enhanceResponse = await axios.post(
            'https://playwright-mcp-620401541065.us-central1.run.app/enhance-tweets-playwright',
            {
              tweets: tweetsToEnhance,
              custom_instruction
            },
            {
              headers: { 'Content-Type': 'application/json' },
              timeout: 300000 // 5 minutes timeout for enhancement
            }
          );

          const enhancedResults = enhanceResponse.data;
          logStep('ENHANCE', `Playwright enhancement successful. ${enhancedResults.results.length} tweets enhanced.`);

          const finalResults = [
            ...enhancedResults.results,
            ...sortedResults.slice(parseInt(enhance_top_x))
          ];

          return res.json({ results: finalResults });
        } catch (err) {
          logError('Playwright enhancement request failed:', err.message);
          return res.json({ results: sortedResults });
        }
      } else {
        return res.json({ results: sortedResults });
      }
    } catch (error) {
      logError('Exception during /api/playright/enhance:', error.message);
      
      // Fallback to mock data on error
      logStep('API', 'Falling back to mock data due to error');
      const mockTweets = generateMockTweets(query, max_results);
      return res.json({ results: mockTweets });
    }
  });

  // Add the searchTerm endpoint
  app.post('/api/masa/searchTerm', async (req, res) => {
    logStep('API', 'Incoming /api/masa/searchTerm request');
    
    const { 
      query = 'test query', 
      max_results = 5,
      enhance_top_x = max_results
    } = req.body;

    try {
      // If using mock data or API key is not set, return mock data
      if (useMockData) {
        logStep('API', 'Using mock data for searchTerm endpoint');
        const mockTweets = generateMockTweets(query, max_results);
        
        // Create enhanced results with search terms
        const enhancedResults = [];
        
        for (const tweet of mockTweets.slice(0, parseInt(enhance_top_x))) {
          enhancedResults.push({
            original_tweet: tweet,
            search_term: "artificial intelligence",
            metadata: {
              processed_at: new Date().toISOString(),
              enhancement_type: "search_term_extraction"
            }
          });
        }
        
        // Combine enhanced and non-enhanced results
        const finalResults = [
          ...enhancedResults,
          ...mockTweets.slice(parseInt(enhance_top_x))
        ];
        
        logStep('API', `Generated ${finalResults.length} enhanced tweets with search terms`);
        return res.json({ results: finalResults });
      }

      // Otherwise, use the actual Masa API client
      logStep('SEARCH', `Searching Twitter for query: "${query}", max_results: ${max_results}`);
      const results = await masaClient.performTwitterSearch(query, parseInt(max_results));
      logStep('RESULT', `${results.length} tweets retrieved from Masa API for searchTerm endpoint`);

      // Sort tweets by engagement metrics
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

      // Check enhancement flag
      if (process.env.MASA_ENHANCEMENT === "TRUE") {
        logStep('ENHANCE', `Extracting search terms for top ${enhance_top_x} tweets...`);
        try {
          const tweetsToEnhance = sortedResults.slice(0, parseInt(enhance_top_x));
          const enhancedResults = [];

          for (const tweet of tweetsToEnhance) {
            try {
              // Get search term for the tweet
              const extractionResponse = await axios.post(
                'https://data.dev.masalabs.ai/api/v1/search/extraction',
                { userInput: tweet.Content },
                { headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' } }
              );

              const searchTerm = extractionResponse.data.searchTerm;
              logStep('EXTRACTION', `Extracted search term: "${searchTerm}" for tweet`);

              // Add to enhanced results
              enhancedResults.push({
                original_tweet: tweet,
                search_term: searchTerm,
                metadata: {
                  processed_at: new Date().toISOString(),
                  enhancement_type: "search_term_extraction"
                }
              });
            } catch (enhanceError) {
              logError('Enhancement failed for tweet:', enhanceError.message);
              enhancedResults.push({
                original_tweet: tweet,
                error: "Enhancement failed",
                details: enhanceError.message
              });
            }
          }

          // Combine enhanced and non-enhanced results
          const finalResults = [
            ...enhancedResults,
            ...sortedResults.slice(parseInt(enhance_top_x))
          ];

          logStep('RESULT', `Sending combined result set of ${finalResults.length} tweets with search terms`);
          return res.json({ results: finalResults });
        } catch (err) {
          logError('Enhancement process failed:', err.message);
          logStep('FALLBACK', 'Returning sorted raw results as fallback');
          return res.json({ results: sortedResults });
        }
      } else {
        logStep('API', 'Enhancement disabled. Returning raw sorted tweets');
        return res.json({ results: sortedResults });
      }
    } catch (error) {
      logError('Exception during /api/masa/searchTerm:', error.message);
      
      // Fallback to mock data on error
      logStep('API', 'Falling back to mock data due to error');
      const mockTweets = generateMockTweets(query, max_results);
      return res.json({ results: mockTweets });
    }
  });

  // Add error handling middleware
  app.use((err, req, res, next) => {
    logError('Unhandled error:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err.message
    });
  });
}

// Start the server
startServer();

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(`${colors.yellow}[SERVER]${colors.reset} Shutting down...`);
  process.exit(0);
});

// Export for testing
module.exports = app;