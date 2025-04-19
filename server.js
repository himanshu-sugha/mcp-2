require('dotenv').config(); 
const express = require('express');
const MasaApiClient = require('./masaApiClient');
const axios = require('axios');

const app = express();
const port = 3002;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Initialize Masa client
const apiKey = process.env.TOGETHER_API_KEY;
const masaClient = new MasaApiClient(apiKey);

// Initialize Together AI

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

// API endpoint


app.post('/api/playright/enhance', async (req, res) => {
  logStep('REQUEST', 'Incoming /api/playright/enhance request');
  
  const { 
    query, 
    max_results = 10,
    enhance_top_x = max_results,
    custom_instruction = ''
  } = req.body;

  if (!query) {
    logError('Missing "query" field in request body.', null);
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
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
          'http://localhost:3000/enhance-tweets-playwright',
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
    logError('Exception during /api/playright/enhance:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/masa/enhance', async (req, res) => {
  logStep('REQUEST', 'Incoming /api/masa/enhance request');
  
  const { 
    query, 
    max_results = 10,
    enhance_top_x = max_results,
    custom_instruction = ''
  } = req.body;

  if (!query) {
    logError('Missing "query" field in request body.', null);
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
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
          'http://localhost:3000/enhance-tweets-masa',
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
    return res.status(500).json({ error: error.message });
  }
});

app.post('/api/masa/searchTerm', async (req, res) => {
  console.log('--- Incoming /api/search request ---');
  console.log('Request body:', JSON.stringify(req.body, null, 2));

  const { 
    query, 
    max_results = 10,
    enhance_top_x = max_results
  } = req.body;

  if (!query) {
    console.warn('[WARN] Missing "query" field in request body.');
    return res.status(400).json({ error: 'Query is required' });
  }

  try {
    console.log(`[INFO] Searching Twitter for query: "${query}", max_results: ${max_results}`);
    const results = await masaClient.performTwitterSearch(query, parseInt(max_results));

    console.log(`[INFO] ${results.length} tweets retrieved from Masa API`);

    // Sort tweets by engagement metrics
    console.log('[INFO] Sorting tweets by engagement score...');
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

    console.log('[INFO] Tweets sorted by engagement.');

    // Check enhancement flag
    if (process.env.MASA_ENHANCEMENT === "TRUE") {
      console.log(`[INFO] Enhancing top ${enhance_top_x} tweets...`);
      try {
        const tweetsToEnhance = sortedResults.slice(0, parseInt(enhance_top_x));
        const enhancedResults = [];

        for (const tweet of tweetsToEnhance) {
          try {
            // Get search term for the tweet
            const extractionResponse = await axios.post(
              'https://data.dev.masalabs.ai/api/v1/search/extraction',
              { userInput: tweet.Content }
            );

            const searchTerm = extractionResponse.data.searchTerm;
            console.log(`[INFO] Extracted search term: "${searchTerm}" for tweet: "${tweet.Content.substring(0, 50)}..."`);

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
            console.error('[ERROR] Enhancement failed for tweet:', enhanceError.message);
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

        console.log(`[INFO] Sending combined result set of ${finalResults.length} tweets.`);
        return res.json({ results: finalResults });
      } catch (err) {
        console.error('[ERROR] Enhancement process failed:', err.message);
        console.log('[INFO] Returning sorted raw results as fallback.');
        return res.json({ results: sortedResults });
      }
    } else {
      console.log('[INFO] Enhancement disabled. Returning raw sorted tweets.');
      return res.json({ results: sortedResults });
    }
  } catch (error) {
    console.error('[ERROR] Exception during /api/search:', error.message);
    return res.status(500).json({ error: error.message });
  }
});



// Start server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
  console.log(`API Key in use: ${apiKey.substring(0, 5)}...${apiKey.substring(apiKey.length - 5)}`);
});