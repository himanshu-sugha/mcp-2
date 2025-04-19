/**
 * Test script for MCP integration
 * This script demonstrates how to use the MCP wrapper to connect to the Masa API Client MCP
 */

require('dotenv').config();
const axios = require('axios');

async function testMcpIntegration() {
  try {
    console.log('Testing MCP integration...');
    
    // Test direct API endpoint first
    console.log('\n1. Testing direct API endpoint...');
    const apiResponse = await axios.post('http://localhost:3002/api/masa/enhance', {
      query: 'artificial intelligence news',
      max_results: 3
    });
    
    console.log(`API response received: ${apiResponse.data.results.length} tweets`);
    
    // Now test MCP endpoint 
    console.log('\n2. Testing MCP endpoint...');
    const mcpResponse = await axios.post('http://localhost:3002/mcp', {
      tool: 'twitter_search',
      parameters: {
        query: 'artificial intelligence news',
        max_results: 3
      }
    });
    
    console.log(`MCP response received: ${mcpResponse.data.length} tweets`);
    
    // Test sorting by engagement
    if (mcpResponse.data.length > 0) {
      console.log('\n3. Testing twitter_sort_by_engagement tool...');
      const sortResponse = await axios.post('http://localhost:3002/mcp', {
        tool: 'twitter_sort_by_engagement',
        parameters: {
          tweets: mcpResponse.data
        }
      });
      
      console.log(`Sorted ${sortResponse.data.length} tweets by engagement`);
    }
    
    console.log('\nMCP integration test completed successfully!');
  } catch (error) {
    console.error('MCP integration test failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testMcpIntegration(); 