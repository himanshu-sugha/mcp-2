/**
 * TypeScript definitions for the Masa API Client MCP
 */

import { AxiosRequestConfig } from 'axios';

/**
 * The configuration options for the Masa API client
 */
export interface MasaApiClientConfig {
  /**
   * The API key for authentication
   */
  apiKey: string;
  
  /**
   * Optional timeout in milliseconds
   */
  timeoutMs?: number;
  
  /**
   * Optional base URL override
   */
  baseUrl?: string;
}

/**
 * Twitter public metrics data structure
 */
export interface TwitterPublicMetrics {
  RetweetCount: number;
  ReplyCount: number;
  LikeCount: number;
  QuoteCount: number;
  BookmarkCount: number;
}

/**
 * Twitter metadata structure
 */
export interface TwitterMetadata {
  AuthorID: string;
  CreatedAt: string;
  ID: string;
  public_metrics: TwitterPublicMetrics;
  [key: string]: any;
}

/**
 * Twitter search result item
 */
export interface TwitterSearchResult {
  ID: string;
  Content: string;
  Metadata: TwitterMetadata;
  URL?: string;
  Score?: number;
}

/**
 * Job submission response
 */
export interface JobSubmissionResponse {
  uuid: string;
  error?: string;
}

/**
 * Job status response
 */
export interface JobStatusResponse {
  status: 'pending' | 'processing' | 'done' | 'error';
  error?: string;
}

/**
 * Search options for performing Twitter searches
 */
export interface TwitterSearchOptions {
  /**
   * Maximum number of results to return
   * @default 10
   */
  max_results?: number;
  
  /**
   * Milliseconds to wait between status checks
   * @default 2000
   */
  pollingInterval?: number;
  
  /**
   * Maximum milliseconds to wait before timing out
   * @default 120000
   */
  timeout?: number;
}

/**
 * Masa API Client for the Model Context Protocol
 */
declare class MasaApiClient {
  /**
   * Create a new Masa API client
   * @param apiKey The API key for authentication
   */
  constructor(apiKey: string);
  
  /**
   * Submit a Twitter search job
   * @param query The search query (supports Twitter search operators)
   * @param max_results Maximum number of results to return (default: 100, max: 100)
   * @returns Job UUID and any errors
   */
  submitTwitterSearch(query: string, max_results?: number): Promise<JobSubmissionResponse>;
  
  /**
   * Check the status of a search job
   * @param jobUuid The UUID of the job to check
   * @returns Job status and any errors
   */
  checkJobStatus(jobUuid: string): Promise<JobStatusResponse>;
  
  /**
   * Retrieve the results of a completed search job
   * @param jobUuid The UUID of the job to retrieve results for
   * @returns Array of tweet results
   */
  getSearchResults(jobUuid: string): Promise<TwitterSearchResult[]>;
  
  /**
   * Perform a complete Twitter search operation (submit, wait, retrieve)
   * @param query The search query
   * @param max_results Maximum number of results
   * @param pollingInterval Milliseconds to wait between status checks (default: 2000)
   * @param timeout Maximum milliseconds to wait before timing out (default: 120000)
   * @returns Array of tweet results
   */
  performTwitterSearch(
    query: string, 
    max_results?: number, 
    pollingInterval?: number, 
    timeout?: number
  ): Promise<TwitterSearchResult[]>;
  
  /**
   * Log informational messages
   * @param message The message to log
   */
  logInfo(message: string): void;
  
  /**
   * Log error messages
   * @param message The error message
   * @param error Optional error object
   */
  logError(message: string, error?: any): void;
}

export = MasaApiClient; 