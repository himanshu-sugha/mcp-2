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
    
    // Add logging utility functions to the class
    this.logInfo = (message) => {
      if (process.env.DEBUG === 'true') {
        console.log(`[INFO] ${message}`);
      }
    };
    
    this.logError = (message, error = null) => {
      console.error(`[ERROR] ${message}`, error || '');
    };
  }

  /**
   * Submit a Twitter search job
   * @param {string} query - The search query (supports Twitter search operators)
   * @param {number} max_results - Maximum number of results to return (default: 100, max: 100)
   * @returns {Promise<{uuid: string, error: string}>} - Job UUID and any errors
   */
  async submitTwitterSearch(query, max_results = 100) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/search/live/twitter`,
        {
          query,
          max_results: max_results
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
   * @param {number} max_results - Maximum number of results
   * @param {number} pollingInterval - Milliseconds to wait between status checks (default: 2000)
   * @param {number} timeout - Maximum milliseconds to wait before timing out (default: 120000)
   * @returns {Promise<Array>} - Array of tweet results
   */
  async performTwitterSearch(query, max_results = 10, pollingInterval = 2000, timeout = 120000) {
    this.logInfo(`Submitting Twitter search job for query: "${query}" with max_results: ${max_results}`);
  
    try {
      // Submit the search job
      const { uuid, error: submitError } = await this.submitTwitterSearch(query, max_results);
      
      if (submitError) {
        this.logError(`Failed to submit search job: ${submitError}`);
        throw new Error(`Submit failed: ${submitError}`);
      }
      
      if (!uuid) {
        this.logError('No UUID received from job submission');
        throw new Error('Invalid job submission response');
      }
      
      this.logInfo(`Search job submitted. UUID: ${uuid}`);
  
      const startTime = Date.now();
      let elapsed = 0;
      let attempts = 0;
  
      // Poll for completion with exponential backoff
      while ((elapsed = Date.now() - startTime) < timeout) {
        attempts++;
        const currentWait = Math.min(pollingInterval * Math.pow(1.5, attempts - 1), 10000); // Max 10s between polls
        this.logInfo(`Polling job status... Attempt: ${attempts}, Elapsed time: ${elapsed}ms, Wait: ${currentWait}ms`);
  
        const { status, error } = await this.checkJobStatus(uuid);
  
        if (error) {
          this.logError(`Job status returned an error: ${error}`);
          throw new Error(`Job failed: ${error}`);
        }
  
        this.logInfo(`Job status: ${status}`);
  
        if (status === 'done') {
          this.logInfo(`Job completed. Fetching search results for UUID: ${uuid}`);
          const results = await this.getSearchResults(uuid);
          this.logInfo(`Retrieved ${results.length} results.`);
          return results;
        }
  
        if (status === 'error') {
          this.logError('Job returned status "error"');
          throw new Error('Job failed with error');
        }
  
        // Wait before polling again with exponential backoff
        await new Promise(resolve => setTimeout(resolve, currentWait));
      }
  
      this.logError('Job polling timed out.');
      throw new Error('Job timed out');
    } catch (error) {
      this.logError('Exception in performTwitterSearch:', error.message);
      throw error;
    }
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