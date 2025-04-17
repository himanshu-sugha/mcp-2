/**
 * Simple Express server to demonstrate Masa API client functionality
 */

const express = require('express');
const MasaApiClient = require('./masaApiClient');

// Create Express app
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize Masa client with API key from environment or use a placeholder
// IMPORTANT: Set your actual API key as an environment variable
const apiKey = "RpqsYn9xUEg4sZaXcgp7Gt338qncogambjyFC1rDGFjZCF3l";
const masaClient = new MasaApiClient(apiKey);

// Home route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <head>
        <title>Masa API Client Demo</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
          form { margin-bottom: 20px; }
          input, button { padding: 8px; margin-right: 10px; }
          button { cursor: pointer; background: #4CAF50; color: white; border: none; }
          pre { background: #f4f4f4; padding: 15px; border-radius: 5px; overflow: auto; }
        </style>
      </head>
      <body>
        <h1>Masa API Client Demo</h1>
        <form id="searchForm">
          <input type="text" id="query" placeholder="Enter search query (e.g., #AI trending)" required style="width: 300px;">
          <input type="number" id="maxResults" placeholder="Max results" value="10" min="1" max="100">
          <button type="submit">Search</button>
        </form>
        <div id="results">
          <p>Results will appear here...</p>
        </div>
        
        <script>
          document.getElementById('searchForm').addEventListener('submit', async (e) => {
            e.preventDefault();
            const query = document.getElementById('query').value;
            const maxResults = document.getElementById('maxResults').value;
            const resultsDiv = document.getElementById('results');
            
            resultsDiv.innerHTML = '<p>Searching... please wait.</p>';
            
            try {
              const response = await fetch('/api/search', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query, maxResults }),
              });
              
              const data = await response.json();
              
              if (data.error) {
                resultsDiv.innerHTML = \`<p style="color: red;">Error: \${data.error}</p>\`;
              } else {
                resultsDiv.innerHTML = \`
                  <h3>Search Results for "\${query}"</h3>
                  <p>Found \${data.results.length} tweets</p>
                  <pre>\${JSON.stringify(data.results, null, 2)}</pre>
                \`;
              }
            } catch (error) {
              resultsDiv.innerHTML = \`<p style="color: red;">Error: \${error.message}</p>\`;
            }
          });
        </script>
      </body>
    </html>
  `);
});

// API endpoint to handle searches
app.post('/api/search', async (req, res) => {
    console.log(req.body);
  const { query, maxResults = 10 } = req.body;
  
  if (!query) {
    return res.status(400).json({ error: 'Query is required' });
  }
  
  try {
    console.log(`Performing search for: "${query}" with max results: ${maxResults}`);
    
    // Submit the search
    const results = await masaClient.performTwitterSearch(query, parseInt(maxResults));
    
    // Return the results
    return res.json({ results });
  } catch (error) {
    console.error('Error performing search:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API Key in use: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
}); 