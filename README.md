# Masa API Client

A JavaScript client for interacting with the Masa Data API, specifically focusing on the Twitter search functionality.

## Installation

```bash
npm install
```

## Usage

### As a Library

```javascript
const MasaApiClient = require('./masaApiClient');

// Initialize the client with your API key
const apiKey = 'your-api-key';
const masaClient = new MasaApiClient(apiKey);

// Example 1: Complete search flow with automatic polling
async function searchTwitter() {
  try {
    const results = await masaClient.performTwitterSearch('#AI trending', 50);
    console.log('Search results:', results);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example 2: Manual step-by-step approach
async function manualSearchTwitter() {
  try {
    // Step 1: Submit search job
    const { uuid } = await masaClient.submitTwitterSearch('#AI trending', 50);
    console.log('Job submitted with UUID:', uuid);
    
    // Step 2: Check job status (you might want to implement your own polling mechanism)
    const statusResponse = await masaClient.checkJobStatus(uuid);
    console.log('Job status:', statusResponse.status);
    
    // Step 3: Retrieve results when job is completed
    if (statusResponse.status === 'done') {
      const results = await masaClient.getSearchResults(uuid);
      console.log('Search results:', results);
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Run the examples
searchTwitter();
// or
// manualSearchTwitter();
```

### Run Example Script

```bash
npm run example
```

### Run Web Server

The project includes a simple web server with a UI for making Twitter searches.

```bash
# Set your Masa API key as an environment variable (recommended)
export MASA_API_KEY=your-api-key-here

# Start the server
npm run server
```

Then open your browser to [http://localhost:3000](http://localhost:3000) to access the web interface.

## API Reference

### Constructor

```javascript
const client = new MasaApiClient(apiKey);
```

### Methods

#### submitTwitterSearch(query, maxResults)
Submits a Twitter search job to the Masa API.

- `query`: String - The search query (supports Twitter search operators)
- `maxResults`: Number - Maximum number of results to return (default: 100, max: 100)
- Returns: Promise with job UUID and any errors

#### checkJobStatus(jobUuid)
Checks the status of a search job.

- `jobUuid`: String - The UUID of the job to check
- Returns: Promise with job status and any errors

#### getSearchResults(jobUuid)
Retrieves the results of a completed search job.

- `jobUuid`: String - The UUID of the job to retrieve results for
- Returns: Promise with array of tweet results

#### performTwitterSearch(query, maxResults, pollingInterval, timeout)
Performs a complete Twitter search operation (submit, wait, retrieve).

- `query`: String - The search query
- `maxResults`: Number - Maximum number of results (default: 100)
- `pollingInterval`: Number - Milliseconds to wait between status checks (default: 2000)
- `timeout`: Number - Maximum milliseconds to wait before timing out (default: 60000)
- Returns: Promise with array of tweet results

## Rate Limiting

The Masa API is currently rate-limited to 3 requests per second per API key.

## API Documentation

For more details, refer to the [official Masa API documentation](https://developers.masa.ai/docs/index-API/masa-api-search). 