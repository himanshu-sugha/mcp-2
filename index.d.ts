/**
 * Model Context Protocol (MCP) client for interacting with the Masa Data API
 */

export interface MasaConfig {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export interface SearchOptions {
  count?: number;
  includeRetweets?: boolean;
  resultType?: 'mixed' | 'recent' | 'popular';
  lang?: string;
  since?: string;
  until?: string;
}

export interface Tweet {
  id: string;
  text: string;
  created_at: string;
  user: {
    id: string;
    name: string;
    screen_name: string;
    profile_image_url: string;
  };
  public_metrics?: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
  };
}

export interface SearchResponse {
  results: Tweet[];
  next_token?: string;
  rateLimited?: boolean;
  resetTime?: number | string;
  error?: string;
}

/**
 * Masa API Client for MCP operations
 */
export class MasaApiClient {
  constructor(config?: MasaConfig);
  
  /**
   * Search Twitter for a given query
   */
  search(query: string, options?: SearchOptions): Promise<SearchResponse>;
  
  /**
   * Get user information
   */
  getUser(username: string): Promise<any>;
}

export default MasaApiClient; 