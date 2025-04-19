# MCP Configuration for API Endpoints

## Base URLs

- **MCP-2 Server**: `http://34.31.55.189:8080`
- **Playwright MCP**: `https://playwright-mcp-620401541065.us-central1.run.app`
- **Prophet Service**: `http://34.45.252.228:8000`
- **Code Executor**: `http://34.66.53.176:8002`

## Deployed Endpoints Overview

### MCP-2 Server (Port 3002)

#### Health Check
- **URL**: `/health`
- **Method**: GET
- **Description**: Returns status and configuration of the MCP server
- **Response**:
  ```json
  {
    "status": "ok",
    "version": "1.0.0",
    "timestamp": "2025-04-19T22:15:55.354Z",
    "config": {
      "enhancement": true,
      "debug": false,
      "mock": false
    }
  }
  ```

#### MCP Endpoint
- **URL**: `/mcp`
- **Method**: POST
- **Description**: Model Context Protocol endpoint for tool-based interactions
- **Request Body**:
  ```json
  {
    "tool": "twitter_search",
    "parameters": {
      "query": "artificial intelligence",
      "max_results": 5
    }
  }
  ```
- **Supported Tools**:
  - `twitter_search`: Search for tweets matching a query
  - `twitter_sort_by_engagement`: Sort tweets by engagement metrics
  - `twitter_extract_search_term`: Extract search terms from content

#### Twitter Search Enhancement (Masa API)
- **URL**: `/api/masa/enhance`
- **Method**: POST
- **Description**: Search Twitter and enhance results with Masa API
- **Parameters**:
  - `query` (string): Search query (default: "test query")
  - `max_results` (number): Maximum number of results (default: 5)
  - `enhance_top_x` (number): Number of top results to enhance (default: same as max_results)
  - `custom_instruction` (string): Custom instructions for enhancement

#### Twitter Search Enhancement (Playwright)
- **URL**: `/api/playright/enhance`
- **Method**: POST
- **Description**: Search Twitter and enhance results using Playwright
- **Parameters**:
  - Same as `/api/masa/enhance`

#### Search Term Extraction
- **URL**: `/api/masa/searchTerm`
- **Method**: POST
- **Description**: Extract search terms from Twitter content
- **Parameters**:
  - `query` (string): Search query (default: "test query")
  - `max_results` (number): Maximum number of results (default: 5)
  - `enhance_top_x` (number): Number of top results to extract terms from

### Code Executor (Port 8002)

#### Execute Code
- **URL**: `/execute`
- **Method**: POST
- **Description**: Execute Python code in a secure environment
- **Parameters**:
  ```json
  {
    "code": "print('Hello, world!')",
    "timeout": 10,
    "memory_limit": "100m",
    "cpu_limit": 0.5,
    "validate_code": true
  }
  ```
- **Response**: Output of code execution including stdout, stderr, and execution time

#### Generate and Execute
- **URL**: `/generate-and-execute`
- **Method**: POST
- **Description**: Generate and execute Python code based on a natural language query
- **Parameters**:
  ```json
  {
    "query": "Calculate the first 10 prime numbers",
    "timeout": 15,
    "memory_limit": "200m",
    "cpu_limit": 0.5
  }
  ```
- **Response**:
  ```json
  {
    "query": "Calculate the first 10 prime numbers",
    "generated_code": "def is_prime(n):\n...",
    "stdout": "First 10 prime numbers: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]\n",
    "stderr": "",
    "exit_code": 0,
    "execution_time": 0.023,
    "validation_result": "The code is secure and efficient."
  }
  ```

### Playwright MCP

Implements parallel processing for tweet enhancement to improve latency and performance.

#### Health Check
- **URL**: `/health`
- **Method**: GET
- **Description**: Check the health of the Playwright service
- **Response**:
  ```json
  {
    "status": "ok",
    "timestamp": "2025-04-19T22:15:55.354Z",
    "environment": "production",
    "port": "3000"
  }
  ```

#### Enhance Tweets (Playwright)
- **URL**: `/enhance-tweets-playwright`
- **Method**: POST
- **Description**: Process tweets using Playwright for content enhancement with parallel processing
- **Parameters**:
  - `tweets` (array): Array of tweet objects to process
  - `custom_instruction` (string, optional): Custom instructions for enhancement
- **Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "performance": {
      "total_time_ms": 2850,
      "avg_time_per_tweet_ms": 1425,
      "tweets_per_second": "0.70"
    },
    "results": [
      {
        "original_tweet": { /* Tweet object */ },
        "research": {
          "generated_query": "AI product features",
          "source_url": "https://example.com/ai-product",
          "page_content_length": 3500,
          "page_metadata": { /* metadata */ }
        },
        "enhanced_version": "The product is an AI-powered assistant...",
        "metadata": {
          "processed_at": "2025-04-19T22:15:55.354Z"
        }
      }
    ]
  }
  ```

#### Enhance Tweets (Masa)
- **URL**: `/enhance-tweets-masa`
- **Method**: POST
- **Description**: Process tweets using Masa API for content enhancement
- **Parameters**:
  - `tweets` (array): Array of tweet objects to process
  - `custom_instruction` (string, optional): Custom instructions for enhancement
- **Response**:
  ```json
  {
    "success": true,
    "count": 2,
    "results": [
      {
        "original_tweet": { /* Tweet object */ },
        "research": {
          "generated_query": "AI product features",
          "source_url": "https://example.com/ai-product",
          "page_content_length": 3500,
          "page_metadata": { /* metadata */ }
        },
        "enhanced_version": "The product is an AI-powered assistant...",
        "metadata": {
          "processed_at": "2025-04-19T22:15:55.354Z",
          "model": "Llama-4-Maverick"
        }
      }
    ]
  }
  ```

#### Web Automation
- **URL**: `/automate`
- **Method**: POST
- **Description**: Automate interactions with a webpage using Playwright
- **Parameters**:
  - `url` (string): The URL to navigate to
  - `instructions` (string): Instructions for automation ("screenshot" or "extract-text")
- **Response**: 
  - For "screenshot": PNG image
  - For "extract-text": 
    ```json
    {
      "text": "Extracted text content from the page..."
    }
    ```

### Prophet Service API

#### Health Check
- **URL**: `/`
- **Method**: GET
- **Description**: Check if the Prophet service is running
- **Response**:
  ```json
  {
    "message": "Prophet Forecasting Service is running",
    "status": "online"
  }
  ```

#### API Documentation
- **URL**: `/docs`
- **Method**: GET
- **Description**: Interactive Swagger documentation for the Prophet Service API
- **Response**: HTML page with interactive API documentation

#### Store Engagement Data
- **URL**: `/api/v1/store-engagement`
- **Method**: POST
- **Description**: Store engagement data for a topic
- **Parameters**:
  ```json
  {
    "topic": "artificial intelligence",
    "platform": "twitter",
    "timestamp": "2025-04-19T22:15:55.354Z",
    "value": 125.5,
    "metadata": {
      "source": "twitter_api"
    }
  }
  ```

#### Store Platform Engagements
- **URL**: `/api/v1/store-platform-engagements`
- **Method**: POST
- **Description**: Store engagement metrics from multiple platforms
- **Parameters**: Complex object with results from multiple platforms

#### Generate Forecast
- **URL**: `/api/v1/forecast`
- **Method**: POST
- **Description**: Generate a forecast for topic engagement
- **Parameters**:
  ```json
  {
    "topic": "artificial intelligence",
    "platform": "twitter",
    "periods": 7,
    "frequency": "D",
    "include_history": true
  }
  ```
- **Response**: Forecast data with dates, values, and confidence intervals

#### Get Topic History
- **URL**: `/api/v1/topics/{topic}/history`
- **Method**: GET
- **Description**: Get historical data for a topic
- **Query Parameters**:
  - `platform` (string, optional): Filter by platform
- **Response**: Historical engagement data for the topic 