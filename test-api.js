/**
 * Simple API Test Script
 * This script tests both the /mcp and /api endpoints
 */

require('dotenv').config();
const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testEndpoints() {
  console.log('Testing MCP and API endpoints...');

  // Test health endpoint first (should always work)
  try {
    console.log('\n1. Testing health endpoint:');
    const healthResponse = await axios.get(`${BASE_URL}/health`);
    console.log(`Health check status: ${healthResponse.data.status}`);
    console.log(`Server version: ${healthResponse.data.version}`);
    console.log(`Timestamp: ${healthResponse.data.timestamp}`);
  } catch (error) {
    console.error('❌ Health check failed:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }

  // Test API endpoint
  try {
    console.log('\n2. Testing /api/masa/enhance endpoint:');
    const apiResponse = await axios.post(`${BASE_URL}/api/masa/enhance`, {
      query: 'test query',
      max_results: 1
    });
    
    if (apiResponse.data.error) {
      console.log('⚠️ API response returned an error:', apiResponse.data.error);
    } else {
      console.log('✅ API endpoint is working');
      console.log(`Results received: ${apiResponse.data.results ? apiResponse.data.results.length : 0}`);
    }
  } catch (error) {
    console.error('❌ API test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }

  // Test MCP endpoint
  try {
    console.log('\n3. Testing /mcp endpoint:');
    const mcpResponse = await axios.post(`${BASE_URL}/mcp`, {
      tool: 'twitter_search',
      parameters: {
        query: 'test query',
        max_results: 1
      }
    });
    
    console.log('✅ MCP endpoint is working');
    console.log(`Response: ${typeof mcpResponse.data === 'object' ? 'Valid JSON object' : typeof mcpResponse.data}`);
  } catch (error) {
    console.error('❌ MCP test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testEndpoints(); 