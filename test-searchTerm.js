/**
 * Test Script for the searchTerm API Endpoint
 * This script focuses only on testing the /api/masa/searchTerm endpoint
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3002';

async function testSearchTermEndpoint() {
  console.log(`Testing searchTerm endpoint at ${BASE_URL}/api/masa/searchTerm\n`);
  
  try {
    console.log('Sending request to searchTerm endpoint...');
    const response = await axios.post(
      `${BASE_URL}/api/masa/searchTerm`,
      {
        query: 'test query for search term extraction',
        max_results: 3,
        enhance_top_x: 2
      },
      {
        headers: { 'Content-Type': 'application/json' }
      }
    );
    
    console.log('\n✅ SearchTerm endpoint working!\n');
    console.log(`Response status: ${response.status}`);
    
    if (response.data && response.data.results) {
      console.log(`Received ${response.data.results.length} results`);
      
      let enhancedCount = 0;
      
      // Count how many tweets have search terms
      response.data.results.forEach(result => {
        if (result.search_term || result.original_tweet) {
          enhancedCount++;
        }
      });
      
      console.log(`Enhanced tweets with search terms: ${enhancedCount}`);
      
      if (enhancedCount > 0) {
        // Show the first enhanced tweet
        const enhanced = response.data.results.find(r => r.search_term || r.original_tweet);
        console.log('\nFirst enhanced tweet:');
        
        if (enhanced.original_tweet) {
          console.log(`- Tweet: "${enhanced.original_tweet.Content.substring(0, 50)}..."`);
        }
        
        if (enhanced.search_term) {
          console.log(`- Extracted search term: "${enhanced.search_term}"`);
        }
      }
    } else {
      console.log('Response data:', response.data);
    }
    
  } catch (error) {
    console.error('\n❌ Error testing searchTerm endpoint:');
    
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

testSearchTermEndpoint(); 