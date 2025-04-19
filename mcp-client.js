/**
 * MCP Client for Masa API Client
 * This is a demonstration of how to integrate with the MCP server from an external application
 */

const axios = require('axios');

class MasaMcpClient {
  constructor(baseUrl = 'http://localhost:3002') {
    this.baseUrl = typeof baseUrl === 'string' ? baseUrl : 'http://localhost:3002';
    this.mcpEndpoint = `${this.baseUrl}/mcp`;
    this.apiEndpoint = `${this.baseUrl}/api`;
    this.timeout = 30000;
    this.testMode = false;
  }

  /**
   * Enable test mode (for when no API key is available)
   * @returns {MasaMcpClient} This client instance for chaining
   */
  enableTestMode() {
    this.testMode = true;
    console.log('MCP client running in test mode - will use mock data');
    return this;
  }

  /**
   * Call an MCP tool
   * @param {string} toolName - Name of the tool to call
   * @param {Object} parameters - Parameters for the tool
   * @returns {Promise<any>} - Tool response
   */
  async callTool(toolName, parameters) {
    try {
      // In test mode, return mock data
      if (this.testMode) {
        return this._getMockData(toolName, parameters);
      }

      const response = await axios.post(
        this.mcpEndpoint,
        {
          tool: toolName,
          parameters
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: this.timeout
        }
      );
      
      return response.data;
    } catch (error) {
      console.error(`Error calling MCP tool ${toolName}:`, error.message);
      // In case of error, fallback to mock data if in test mode
      if (this.testMode) {
        console.log(`Falling back to mock data for tool ${toolName}`);
        return this._getMockData(toolName, parameters);
      }
      throw error;
    }
  }

  /**
   * Search Twitter for tweets
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results
   * @returns {Promise<Array>} - Array of tweets
   */
  async searchTwitter(query, maxResults = 10) {
    return this.callTool('twitter_search', {
      query,
      max_results: maxResults
    });
  }

  /**
   * Sort tweets by engagement
   * @param {Array} tweets - Array of tweets to sort
   * @returns {Promise<Array>} - Sorted array of tweets
   */
  async sortTweetsByEngagement(tweets) {
    return this.callTool('twitter_sort_by_engagement', {
      tweets
    });
  }

  /**
   * Extract search term from tweet content
   * @param {string} tweetContent - Content of tweet
   * @returns {Promise<Object>} - Object with extracted search term
   */
  async extractSearchTerm(tweetContent) {
    return this.callTool('twitter_extract_search_term', {
      tweet_content: tweetContent
    });
  }

  /**
   * Search and enhance tweets using the API endpoint
   * @param {string} query - Search query
   * @param {number} maxResults - Maximum number of results
   * @param {number} enhanceTopX - Number of top tweets to enhance
   * @param {string} customInstruction - Custom instruction for enhancement
   * @returns {Promise<Object>} - Enhanced tweets
   */
  async enhanceTweets(query, maxResults = 10, enhanceTopX = 3, customInstruction = '') {
    try {
      // In test mode, return mock data
      if (this.testMode) {
        return {
          results: this._getMockTweets(maxResults)
        };
      }

      const response = await axios.post(
        `${this.apiEndpoint}/masa/enhance`,
        {
          query,
          max_results: maxResults,
          enhance_top_x: enhanceTopX,
          custom_instruction: customInstruction
        },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: this.timeout
        }
      );
      
      return response.data;
    } catch (error) {
      console.error('Error enhancing tweets:', error.message);
      // In case of error, fallback to mock data if in test mode
      if (this.testMode) {
        console.log('Falling back to mock data for enhanceTweets');
        return {
          results: this._getMockTweets(maxResults)
        };
      }
      throw error;
    }
  }

  /**
   * Get mock data for different tools
   * @private
   * @param {string} toolName - The name of the tool
   * @param {Object} parameters - The parameters passed to the tool
   * @returns {any} Mock response data
   */
  _getMockData(toolName, parameters) {
    switch (toolName) {
      case 'twitter_search':
        return this._getMockTweets(parameters.max_results || 10);
      
      case 'twitter_sort_by_engagement':
        // Just return the same tweets, pretending they're sorted
        return parameters.tweets || [];
      
      case 'twitter_extract_search_term':
        return {
          searchTerm: "artificial intelligence",
          success: true
        };
      
      default:
        return { error: `No mock data available for tool: ${toolName}` };
    }
  }

  /**
   * Generate mock tweets
   * @private
   * @param {number} count - Number of mock tweets to generate
   * @returns {Array} Array of mock tweets
   */
  _getMockTweets(count = 5) {
    const mockTweets = [];
    
    for (let i = 0; i < count; i++) {
      mockTweets.push({
        ID: `mock-tweet-${i + 1}`,
        Content: `This is mock tweet #${i + 1} about artificial intelligence and its impact on society.`,
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
}

// Example usage:
async function example() {
  require('dotenv').config();
  
  const client = new MasaMcpClient('http://localhost:3002');
  
  if (!process.env.MASA_API_KEY) {
    console.log('No API key found in .env, enabling test mode');
    client.enableTestMode();
  }
  
  try {
    // Search Twitter
    console.log('Searching Twitter...');
    const tweets = await client.searchTwitter('artificial intelligence news', 5);
    console.log(`Found ${tweets.length} tweets`);
    
    // Sort by engagement
    console.log('\nSorting tweets by engagement...');
    const sortedTweets = await client.sortTweetsByEngagement(tweets);
    console.log('Tweets sorted successfully');
    
    // Extract search term from first tweet
    if (sortedTweets.length > 0) {
      console.log('\nExtracting search term from first tweet...');
      const firstTweet = sortedTweets[0];
      const extractionResult = await client.extractSearchTerm(firstTweet.Content);
      console.log('Extracted search term:', extractionResult.searchTerm);
    }
    
    // Enhance tweets
    console.log('\nEnhancing tweets...');
    const enhancedResult = await client.enhanceTweets(
      'artificial intelligence research', 
      5, 
      2, 
      'Focus on recent breakthroughs'
    );
    console.log(`Enhanced ${enhancedResult.results.length} tweets`);
    
  } catch (error) {
    console.error('Example failed:', error.message);
  }
}

// Run the example if this script is executed directly
if (require.main === module) {
  example();
}

module.exports = { MasaMcpClient }; 