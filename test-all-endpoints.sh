#!/bin/bash

# Color codes for better readability
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SERVER_URL="http://localhost:3002"
PLAYWRIGHT_URL="https://playwright-mcp-620401541065.us-central1.run.app"

# Print banner
echo -e "${BLUE}==========================================${NC}"
echo -e "${GREEN}MCP API Endpoints Test${NC}"
echo -e "${BLUE}==========================================${NC}"

# Function to test an endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local method="$3"
    local data="$4"
    local output_file="${name//\//-}.json"
    
    echo -e "\n${YELLOW}Testing: ${name}${NC}"
    echo -e "${BLUE}URL: ${url}${NC}"
    echo -e "${BLUE}Method: ${method}${NC}"
    
    if [ "$method" == "GET" ]; then
        STATUS=$(curl -s -o "$output_file" -w "%{http_code}" "$url")
    else
        echo -e "${BLUE}Data: ${data}${NC}"
        STATUS=$(curl -s -o "$output_file" -w "%{http_code}" \
            -X "$method" \
            -H "Content-Type: application/json" \
            -d "$data" \
            "$url")
    fi
    
    if [ "$STATUS" == "200" ]; then
        echo -e "${GREEN}Status: $STATUS (Success)${NC}"
        echo -e "${GREEN}Response saved to ${output_file}${NC}"
        
        # Show a preview of the response (first 5 lines)
        echo -e "${BLUE}Response preview:${NC}"
        head -n 5 "$output_file"
        if [ "$(wc -l < "$output_file")" -gt 5 ]; then
            echo -e "${YELLOW}... (response truncated)${NC}"
        fi
    else
        echo -e "${RED}Status: $STATUS (Failed)${NC}"
        echo -e "${RED}Error response saved to ${output_file}${NC}"
        cat "$output_file"
    fi
    
    # Return success or failure
    [ "$STATUS" == "200" ]
}

# Create sample test data
echo -e "${BLUE}Creating sample test data...${NC}"

# Test data for MCP endpoint
cat > mcp-data.json << EOL
{
  "tool": "twitter_search",
  "parameters": {
    "query": "artificial intelligence",
    "max_results": 3
  }
}
EOL

# Test data for enhancement endpoints
cat > enhance-data.json << EOL
{
  "query": "artificial intelligence",
  "max_results": 3,
  "enhance_top_x": 2,
  "custom_instruction": "Provide additional context about AI"
}
EOL

# Test data for Playwright/MASA enhancement
cat > tweets-data.json << EOL
{
  "tweets": [
    {
      "Content": "Machine learning is transforming how we approach natural language processing. Recent advancements are impressive!",
      "Metadata": {
        "timestamp": "2023-10-15T14:30:00Z",
        "public_metrics": {
          "RetweetCount": 10,
          "LikeCount": 50
        }
      }
    }
  ],
  "custom_instruction": "Provide additional context and explain technical terms."
}
EOL

# Array to track results
declare -A RESULTS

# 1. Test health endpoint
test_endpoint "health" "${SERVER_URL}/health" "GET" ""
RESULTS["health"]=$?

# 2. Test MCP endpoint
test_endpoint "mcp" "${SERVER_URL}/mcp" "POST" "$(cat mcp-data.json)"
RESULTS["mcp"]=$?

# 3. Test MASA enhance endpoint
test_endpoint "api-masa-enhance" "${SERVER_URL}/api/masa/enhance" "POST" "$(cat enhance-data.json)"
RESULTS["api-masa-enhance"]=$?

# 4. Test Playwright enhance endpoint
test_endpoint "api-playright-enhance" "${SERVER_URL}/api/playright/enhance" "POST" "$(cat enhance-data.json)"
RESULTS["api-playright-enhance"]=$?

# 5. Test searchTerm endpoint
test_endpoint "api-masa-searchTerm" "${SERVER_URL}/api/masa/searchTerm" "POST" "$(cat enhance-data.json)"
RESULTS["api-masa-searchTerm"]=$?

# 6. Test direct Playwright enhancement
test_endpoint "playwright-enhance" "${PLAYWRIGHT_URL}/enhance-tweets-playwright" "POST" "$(cat tweets-data.json)"
RESULTS["playwright-enhance"]=$?

# 7. Test direct MASA enhancement
test_endpoint "masa-enhance" "${PLAYWRIGHT_URL}/enhance-tweets-masa" "POST" "$(cat tweets-data.json)"
RESULTS["masa-enhance"]=$?

# Summary
echo -e "\n${BLUE}==========================================${NC}"
echo -e "${GREEN}Test Summary:${NC}"

for endpoint in "${!RESULTS[@]}"; do
    if [ "${RESULTS[$endpoint]}" -eq 0 ]; then
        echo -e "${endpoint}: ${GREEN}PASS${NC}"
    else
        echo -e "${endpoint}: ${RED}FAIL${NC}"
    fi
done

echo -e "${BLUE}==========================================${NC}"

# Cleanup
echo -e "${BLUE}Cleaning up...${NC}"
rm mcp-data.json enhance-data.json tweets-data.json

echo -e "${GREEN}Test complete!${NC}"
