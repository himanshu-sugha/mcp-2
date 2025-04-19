# API Endpoints Reference

This document provides a detailed reference for all API endpoints available in the MCP system.

## Base URLs

- **MCP-2 Server**: `http://34.31.55.189:8080`
- **Playwright MCP**: `https://playwright-mcp-620401541065.us-central1.run.app`
- **Prophet Service**: `http://34.45.252.228:8000`
- **Code Executor**: `http://34.66.53.176:8002`

## MCP-2 Server (Port 3002)

### Health Check

**Endpoint:** `GET /health`

**Description:** Checks if the server is running correctly and returns configuration information.

**Example Response:**
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

### MCP Endpoint

**Endpoint:** `POST /mcp`

**Description:** Model Context Protocol endpoint for tool-based interactions with the system.

**Example Request:**
```json
{
  "tool": "twitter_search",
  "parameters": {
    "query": "artificial intelligence",
    "max_results": 5
  }
}
```

**Example Response:**
```json
[
  {
    "ID": "1234567890",
    "Content": "Artificial intelligence is transforming how we work and live.",
    "URL": "https://twitter.com/user/status/1234567890",
    "Author": {
      "Username": "user123",
      "DisplayName": "AI Enthusiast",
      "ProfileImage": "https://example.com/profile.jpg"
    },
    "Metadata": {
      "CreatedAt": "2025-04-19T20:00:00Z",
      "public_metrics": {
        "RetweetCount": 45,
        "LikeCount": 123,
        "QuoteCount": 8,
        "ReplyCount": 12,
        "BookmarkCount": 5
      }
    }
  },
  // Additional tweet objects...
]
```

### Twitter Search Enhancement (Masa API)

**Endpoint:** `POST /api/masa/enhance`

**Description:** Search Twitter and enhance results with Masa API.

**Example Request:**
```json
{
  "query": "generative AI",
  "max_results": 10,
  "enhance_top_x": 5,
  "custom_instruction": "Focus on business implications"
}
```

**Example Response:**
```json
{
  "results": [
    {
      "original_tweet": {
        "ID": "1234567890",
        "Content": "Generative AI is changing how companies approach product design.",
        "URL": "https://twitter.com/user/status/1234567890",
        "Author": {
          "Username": "businesstech",
          "DisplayName": "Business Tech",
          "ProfileImage": "https://example.com/profile.jpg"
        },
        "Metadata": {
          "CreatedAt": "2025-04-19T20:00:00Z",
          "public_metrics": {
            "RetweetCount": 45,
            "LikeCount": 123,
            "QuoteCount": 8,
            "ReplyCount": 12,
            "BookmarkCount": 5
          }
        }
      },
      "enhanced_content": "This tweet discusses how generative AI is transforming product design processes in businesses. Companies are leveraging AI to create more innovative designs, reduce time-to-market, and optimize manufacturing processes.",
      "topics": ["generative AI", "product design", "business transformation"],
      "sentiment": "positive",
      "metadata": {
        "processed_at": "2025-04-19T22:15:55.354Z",
        "enhancement_type": "masa_api"
      }
    },
    // Additional enhanced tweets...
  ]
}
```

### Twitter Search Enhancement (Playwright)

**Endpoint:** `POST /api/playright/enhance`

**Description:** Search Twitter and enhance results using Playwright for content scraping.

**Parameters:** Same as `/api/masa/enhance`

### Search Term Extraction

**Endpoint:** `POST /api/masa/searchTerm`

**Description:** Extract search terms from Twitter content.

**Example Request:**
```json
{
  "query": "climate change",
  "max_results": 5,
  "enhance_top_x": 3
}
```

**Example Response:**
```json
{
  "results": [
    {
      "original_tweet": {
        "ID": "1234567890",
        "Content": "The latest IPCC report highlights the urgent need for climate action to mitigate global warming effects.",
        "URL": "https://twitter.com/user/status/1234567890",
        "Author": {
          "Username": "climate_news",
          "DisplayName": "Climate News",
          "ProfileImage": "https://example.com/profile.jpg"
        },
        "Metadata": {
          "CreatedAt": "2025-04-19T20:00:00Z",
          "public_metrics": {
            "RetweetCount": 45,
            "LikeCount": 123,
            "QuoteCount": 8,
            "ReplyCount": 12,
            "BookmarkCount": 5
          }
        }
      },
      "search_term": "IPCC report climate action",
      "metadata": {
        "processed_at": "2025-04-19T22:15:55.354Z",
        "enhancement_type": "search_term_extraction"
      }
    },
    // Additional tweets with search terms...
  ]
}
```

## Code Executor (Port 8002)

### Execute Code

**Endpoint:** `POST /execute`

**Description:** Execute Python code in a secure environment.

**Example Request:**
```json
{
  "code": "def fibonacci(n):\n    a, b = 0, 1\n    sequence = []\n    for _ in range(n):\n        sequence.append(a)\n        a, b = b, a + b\n    return sequence\n\nprint(fibonacci(10))",
  "timeout": 10,
  "memory_limit": "100m",
  "cpu_limit": 0.5,
  "validate_code": true
}
```

**Example Response:**
```json
{
  "stdout": "[0, 1, 1, 2, 3, 5, 8, 13, 21, 34]\n",
  "stderr": "",
  "exit_code": 0,
  "execution_time": 0.015,
  "validation_result": "The code is secure and efficient."
}
```

### Generate and Execute

**Endpoint:** `POST /generate-and-execute`

**Description:** Generate and execute Python code based on a natural language query.

**Example Request:**
```json
{
  "query": "Calculate the first 10 prime numbers",
  "timeout": 15,
  "memory_limit": "200m",
  "cpu_limit": 0.5
}
```

**Example Response:**
```json
{
  "query": "Calculate the first 10 prime numbers",
  "generated_code": "def is_prime(n):\n    if n <= 1:\n        return False\n    if n <= 3:\n        return True\n    if n % 2 == 0 or n % 3 == 0:\n        return False\n    i = 5\n    while i * i <= n:\n        if n % i == 0 or n % (i + 2) == 0:\n            return False\n        i += 6\n    return True\n\nprimes = []\nn = 2\nwhile len(primes) < 10:\n    if is_prime(n):\n        primes.append(n)\n    n += 1\n\nprint(f\"First 10 prime numbers: {primes}\")",
  "stdout": "First 10 prime numbers: [2, 3, 5, 7, 11, 13, 17, 19, 23, 29]\n",
  "stderr": "",
  "exit_code": 0,
  "execution_time": 0.023,
  "validation_result": "The code is secure and efficient."
}
```

## Playwright MCP

The Playwright MCP service implements parallel processing for tweet enhancement to improve latency, allowing it to process multiple tweets simultaneously rather than sequentially.

### Health Check

**Endpoint:** `GET /health`

**Description:** Check the health of the Playwright service.

**Example Response:**
```json
{
  "status": "ok",
  "timestamp": "2025-04-19T22:15:55.354Z",
  "environment": "production",
  "port": "3000"
}
```

### Enhance Tweets (Playwright)

**Endpoint:** `POST /enhance-tweets-playwright`

**Description:** Process tweets using Playwright for content enhancement. Uses parallel processing to handle multiple tweets simultaneously for improved performance.

**Example Request:**
```json
{
  "tweets": [
    {
      "ID": "1234567890",
      "Content": "Check out our new AI product at https://example.com/ai-product",
      "Author": {
        "Username": "tech_company",
        "DisplayName": "Tech Company"
      }
    },
    {
      "ID": "9876543210",
      "Content": "The future of computing is here: https://example.com/new-tech",
      "Author": {
        "Username": "tech_analyst",
        "DisplayName": "Tech Analyst"
      }
    }
  ],
  "custom_instruction": "Focus on key features and benefits"
}
```

**Example Response:**
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
      "original_tweet": {
        "ID": "1234567890",
        "Content": "Check out our new AI product at https://example.com/ai-product",
        "Author": {
          "Username": "tech_company",
          "DisplayName": "Tech Company"
        }
      },
      "research": {
        "generated_query": "AI product features benefits",
        "source_url": "https://example.com/ai-product",
        "page_content_length": 3500,
        "page_metadata": {
          "title": "AI-Powered Assistant | Tech Company",
          "description": "An AI-powered assistant for businesses"
        }
      },
      "enhanced_version": "The product is an AI-powered assistant that helps businesses automate customer service operations. Key features include natural language processing, sentiment analysis, and integration with CRM systems. Benefits include 24/7 customer support, reduced response times, and cost savings of up to 40%.",
      "metadata": {
        "processed_at": "2025-04-19T22:15:55.354Z"
      }
    },
    {
      "original_tweet": {
        "ID": "9876543210",
        "Content": "The future of computing is here: https://example.com/new-tech",
        "Author": {
          "Username": "tech_analyst",
          "DisplayName": "Tech Analyst"
        }
      },
      "research": {
        "generated_query": "future computing technology breakthrough",
        "source_url": "https://example.com/new-tech",
        "page_content_length": 4200,
        "page_metadata": {
          "title": "Quantum Computing Breakthrough | Research News",
          "description": "Revolutionary quantum computing research"
        }
      },
      "enhanced_version": "The article discusses a major breakthrough in quantum computing that achieves quantum advantage for specific problem domains. Key features include a 128-qubit processor, error correction capabilities, and compatibility with existing systems. Benefits include solving previously intractable problems in cryptography, drug discovery, and materials science.",
      "metadata": {
        "processed_at": "2025-04-19T22:15:55.354Z"
      }
    }
  ]
}
```

### Enhance Tweets (Masa)

**Endpoint:** `POST /enhance-tweets-masa`

**Description:** Process tweets using Masa API for content enhancement.

**Example Request:** Same format as `/enhance-tweets-playwright`

**Example Response:**
```json
{
  "success": true,
  "count": 2,
  "results": [
    {
      "original_tweet": {
        "ID": "1234567890",
        "Content": "Check out our new AI product at https://example.com/ai-product",
        "Author": {
          "Username": "tech_company",
          "DisplayName": "Tech Company"
        }
      },
      "research": {
        "generated_query": "AI product features benefits",
        "source_url": "https://example.com/ai-product",
        "page_content_length": 3500,
        "page_metadata": {
          "title": "AI-Powered Assistant | Tech Company",
          "description": "An AI-powered assistant for businesses"
        }
      },
      "enhanced_version": "The product is an AI-powered assistant designed for business customer service automation. It features natural language understanding that can handle multiple languages, sentiment analysis to prioritize urgent customer issues, and seamless CRM integration for personalized responses.",
      "metadata": {
        "processed_at": "2025-04-19T22:15:55.354Z",
        "model": "Llama-4-Maverick"
      }
    }
  ]
}
```

### Web Automation

**Endpoint:** `POST /automate`

**Description:** Automate interactions with a webpage using Playwright.

**Example Request (Screenshot):**
```json
{
  "url": "https://example.com/ai-product",
  "instructions": "screenshot"
}
```

**Response:** PNG image

**Example Request (Text Extraction):**
```json
{
  "url": "https://example.com/ai-product",
  "instructions": "extract-text"
}
```

**Example Response:**
```json
{
  "text": "AI-Powered Assistant\n\nOur AI-powered assistant helps businesses automate customer service operations...\n[Full page text content]"
}
```

## Prophet Service API

### Health Check

**Endpoint:** `GET /`

**Description:** Check if the Prophet service is running.

**Example Response:**
```json
{
  "message": "Prophet Forecasting Service is running",
  "status": "online"
}
```

### API Documentation

**Endpoint:** `GET /docs`

**Description:** Interactive Swagger documentation for the Prophet Service API endpoints.

**Response:** HTML page with interactive API documentation

### Store Engagement Data

**Endpoint:** `POST /api/v1/store-engagement`

**Description:** Store engagement data for a topic.

**Example Request:**
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

**Example Response:**
```json
{
  "status": "success",
  "message": "Data stored successfully"
}
```

### Store Platform Engagements

**Endpoint:** `POST /api/v1/store-platform-engagements`

**Description:** Store engagement metrics from multiple platforms.

**Example Request:**
```json
{
  "topic": "artificial intelligence",
  "timestamp": "2025-04-19T22:15:55.354Z",
  "results": [
    {
      "platform": "twitter",
      "engagement": {
        "likes": 120,
        "shares": 45,
        "comments": 30
      }
    },
    {
      "platform": "reddit",
      "engagement": {
        "likes": 250,
        "shares": 30,
        "comments": 80
      }
    }
  ],
  "stats": {
    "platform_status": {
      "twitter": "success",
      "reddit": "success"
    }
  }
}
```

**Example Response:**
```json
{
  "status": "success",
  "message": "Stored engagement data for 2 platforms",
  "platforms": ["twitter", "reddit"]
}
```

### Generate Forecast

**Endpoint:** `POST /api/v1/forecast`

**Description:** Generate a forecast for topic engagement.

**Example Request:**
```json
{
  "topic": "artificial intelligence",
  "platform": "twitter",
  "periods": 7,
  "frequency": "D",
  "include_history": true
}
```

**Example Response:**
```json
{
  "topic": "artificial intelligence",
  "platform": "twitter",
  "forecast_dates": [
    "2025-04-20",
    "2025-04-21",
    "2025-04-22",
    "2025-04-23",
    "2025-04-24",
    "2025-04-25",
    "2025-04-26"
  ],
  "forecast_values": [
    143.2,
    152.7,
    138.5,
    164.2,
    178.9,
    182.3,
    173.1
  ],
  "lower_bounds": [
    129.9,
    137.4,
    124.7,
    147.8,
    161.0,
    164.1,
    155.8
  ],
  "upper_bounds": [
    156.5,
    168.0,
    152.4,
    180.6,
    196.8,
    200.5,
    190.4
  ],
  "historical_dates": [
    "2025-04-13",
    "2025-04-14",
    "2025-04-15",
    "2025-04-16",
    "2025-04-17",
    "2025-04-18",
    "2025-04-19"
  ],
  "historical_values": [
    110.5,
    125.2,
    117.8,
    130.4,
    142.7,
    135.9,
    145.1
  ]
}
```

### Get Topic History

**Endpoint:** `GET /api/v1/topics/{topic}/history`

**Description:** Get historical data for a topic.

**Query Parameters:**
- `platform` (string, optional): Filter by platform

**Example Response:**
```json
{
  "topic": "artificial intelligence",
  "platform": "twitter",
  "data": [
    {
      "timestamp": "2025-04-13T00:00:00Z",
      "value": 110.5,
      "metadata": {
        "items_count": 42,
        "likes": 753,
        "shares": 201,
        "comments": 124
      }
    },
    {
      "timestamp": "2025-04-14T00:00:00Z",
      "value": 125.2,
      "metadata": {
        "items_count": 38,
        "likes": 862,
        "shares": 245,
        "comments": 138
      }
    }
    // Additional historical data points
  ]
}
``` 