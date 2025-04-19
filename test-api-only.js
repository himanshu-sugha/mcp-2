/**
 * API Endpoint Tester
 * This script focuses only on testing the API endpoint
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testApiEndpoint() {
  console.log(`Testing API endpoint at ${BASE_URL}/api/masa/enhance\n`);
  
  try {
    console.log('Sending request to API endpoint...');
    const response = await axios.post(
      `${BASE_URL}/api/masa/enhance`,
      {
        query: 'test query from API tester',
        max_results: 3
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('\n✅ API endpoint working!\n');
    console.log(`Response status: ${response.status}`);
    
    if (response.data && response.data.results) {
      console.log(`Received ${response.data.results.length} tweets`);
      
      if (response.data.results.length > 0) {
        console.log('\nFirst tweet:');
        console.log(`- ID: ${response.data.results[0].ID}`);
        console.log(`- Content: ${response.data.results[0].Content}`);
      }
    } else {
      console.log('Response data:', response.data);
    }
    
  } catch (error) {
    console.error('\n❌ Error testing API endpoint:');
    
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

testApiEndpoint(); 