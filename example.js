/**
 * Example usage of the Masa API Client
 */

const MasaApiClient = require('./masaApiClient');

// Replace with your actual API key
const API_KEY = 'M2KYV5QmDwPRAZ91OEKfCfHMTq5HaF8C61qgowSfFlYxI1Hf';

const masaClient = new MasaApiClient(API_KEY);

// Example 1: Simple search with automatic polling
async function simpleSearch() {
  try {
    console.log('Starting simple search with automatic polling...');
    const results = await masaClient.performTwitterSearch('#AI trending', 10);
    console.log(`Found ${results.length} tweets:`);
    results.forEach(tweet => {
      console.log(`- ${tweet.ID}: ${tweet.Content}`);
    });
  } catch (error) {
    console.error('Error in simple search:', error.message);
  }
}

// Example 2: Manual step-by-step search with custom polling
async function manualSearch() {
  try {
    console.log('Starting manual search process...');
    
    // Step 1: Submit the search job
    console.log('Submitting search job...');
    const { uuid, error } = await masaClient.submitTwitterSearch('#crypto', 20);
    
    if (error) {
      throw new Error(`Failed to submit job: ${error}`);
    }
    
    console.log(`Job submitted successfully. UUID: ${uuid}`);
    
    // Step 2: Implement custom polling for job status
    console.log('Polling for job completion...');
    let isComplete = false;
    let attempts = 0;
    
    while (!isComplete && attempts < 15) {
      attempts++;
      
      const statusResponse = await masaClient.checkJobStatus(uuid);
      console.log(`Attempt ${attempts}: Job status: ${statusResponse.status}`);
      
      if (statusResponse.status === 'done') {
        isComplete = true;
      } else if (statusResponse.status === 'error') {
        throw new Error('Job failed with error');
      } else {
        // Wait 3 seconds before checking again
        console.log('Waiting 3 seconds before next check...');
        await new Promise(resolve => setTimeout(resolve, 3000));
      }
    }
    
    if (!isComplete) {
      throw new Error('Job timed out or exceeded maximum attempts');
    }
    
    // Step 3: Retrieve and display results
    console.log('Job completed. Retrieving results...');
    const results = await masaClient.getSearchResults(uuid);
    
    console.log(`Found ${results.length} tweets:`);
    results.forEach((tweet, index) => {
      console.log(`${index + 1}. [${tweet.ID}] ${tweet.Content}`);
    });
    
  } catch (error) {
    console.error('Error in manual search:', error.message);
  }
}

// Example 3: Search with specific query parameters
async function advancedSearch() {
  try {
    console.log('Starting advanced search...');
    // Using Twitter search operators in the query
    const query = 'from:elonmusk #Bitcoin since:2023-01-01';
    
    console.log(`Searching for: "${query}"`);
    const results = await masaClient.performTwitterSearch(query, 50);
    
    console.log(`Found ${results.length} tweets from Elon Musk about Bitcoin:`);
    results.forEach((tweet, index) => {
      console.log(`${index + 1}. [${tweet.ID}] ${tweet.Content}`);
    });
  } catch (error) {
    console.error('Error in advanced search:', error.message);
  }
}

// Execute examples (uncomment to run)
// simpleSearch();
// manualSearch();
// advancedSearch();

// Or run them sequentially
async function runAllExamples() {
  console.log('=== EXAMPLE 1: SIMPLE SEARCH ===');
  await simpleSearch();
  
  console.log('\n=== EXAMPLE 2: MANUAL SEARCH ===');
  await manualSearch();
  
  console.log('\n=== EXAMPLE 3: ADVANCED SEARCH ===');
  await advancedSearch();
}

// Run all examples - uncomment to execute
// runAllExamples().then(() => console.log('All examples completed.')); 