/**
 * Masa API Client for Twitter Search
 * This module provides functions to interact with the Masa Data API for Twitter search.
 * Based on documentation at https://developers.masa.ai/docs/index-API/masa-api-search
 */

const axios = require('axios');

class MasaApiClient {
  constructor(apiKey) {
    if (!apiKey) {
      throw new Error('API key is required');
    }
    
    this.apiKey = apiKey;
    this.baseUrl = 'https://data.dev.masalabs.ai/api';
    this.headers = {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Submit a Twitter search job
   * @param {string} query - The search query (supports Twitter search operators)
   * @param {number} maxResults - Maximum number of results to return (default: 100, max: 100)
   * @returns {Promise<{uuid: string, error: string}>} - Job UUID and any errors
   */
  async submitTwitterSearch(query, maxResults = 100) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/search/live/twitter`,
        {
          query,
          max_results: maxResults
        },
        { headers: this.headers }
      );
      
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Check the status of a search job
   * @param {string} jobUuid - The UUID of the job to check
   * @returns {Promise<{status: string, error: string}>} - Job status and any errors
   */
  async checkJobStatus(jobUuid) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/search/live/twitter/status/${jobUuid}`,
        { headers: this.headers }
      );
      
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Retrieve the results of a completed search job
   * @param {string} jobUuid - The UUID of the job to retrieve results for
   * @returns {Promise<Array<{ID: string, Content: string, Metadata: any, Score: number}>>} - Array of tweet results
   */
  async getSearchResults(jobUuid) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/search/live/twitter/result/${jobUuid}`,
        { headers: this.headers }
      );
      
      return response.data;
    } catch (error) {
      throw this._handleError(error);
    }
  }

  /**
   * Perform a complete Twitter search operation (submit, wait, retrieve)
   * @param {string} query - The search query
   * @param {number} maxResults - Maximum number of results
   * @param {number} pollingInterval - Milliseconds to wait between status checks (default: 2000)
   * @param {number} timeout - Maximum milliseconds to wait before timing out (default: 60000)
   * @returns {Promise<Array>} - Array of tweet results
   */
  async performTwitterSearch(query, maxResults = 100, pollingInterval = 2000, timeout = 60000) {
    // Submit the search job
    const { uuid } = await this.submitTwitterSearch(query, maxResults);
    
    // Poll for completion
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeout) {
      const { status, error } = await this.checkJobStatus(uuid);
      
      if (error) {
        throw new Error(`Job failed: ${error}`);
      }
      
      if (status === 'done') {
        // Job completed successfully, return results
        return await this.getSearchResults(uuid);
      }
      
      if (status === 'error') {
        throw new Error('Job failed with error');
      }
      
      // Wait before checking again
      await new Promise(resolve => setTimeout(resolve, pollingInterval));
    }
    
    throw new Error('Job timed out');
  }

  /**
   * Handle API errors
   * @private
   * @param {Error} error - The error object from axios
   * @returns {Error} - Formatted error
   */
  _handleError(error) {
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      return new Error(`API Error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // The request was made but no response was received
      return new Error('No response received from API');
    } else {
      // Something happened in setting up the request
      return new Error(`Request Error: ${error.message}`);
    }
  }
}

module.exports = MasaApiClient; 