/**
 * MCP Endpoint Tester
 * This script focuses only on testing the MCP endpoint
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testMcpEndpoint() {
  console.log(`Testing MCP endpoint at ${BASE_URL}/mcp\n`);
  
  try {
    console.log('Sending request to MCP endpoint...');
    const response = await axios.post(
      `${BASE_URL}/mcp`,
      {
        tool: 'twitter_search',
        parameters: {
          query: 'test query from MCP tester',
          max_results: 3
        }
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('\n✅ MCP endpoint working!\n');
    console.log(`Response status: ${response.status}`);
    console.log(`Response type: ${Array.isArray(response.data) ? 'Array' : typeof response.data}`);
    
    if (Array.isArray(response.data)) {
      console.log(`Received ${response.data.length} tweets`);
      
      if (response.data.length > 0) {
        console.log('\nFirst tweet:');
        console.log(`- ID: ${response.data[0].ID}`);
        console.log(`- Content: ${response.data[0].Content}`);
      }
    } else {
      console.log('Response data:', response.data);
    }
    
  } catch (error) {
    console.error('\n❌ Error testing MCP endpoint:');
    
    if (error.response) {
      // Server responded with non-2xx status
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data, null, 2)}`);
    } else if (error.request) {
      // Request made but no response received
      console.error('No response received from server. Is the server running?');
    } else {
      // Something else went wrong
      console.error(`Error: ${error.message}`);
    }
  }
}

testMcpEndpoint(); 