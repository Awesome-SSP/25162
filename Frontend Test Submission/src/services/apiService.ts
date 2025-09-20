import { logger } from './logger';

const API_BASE_URL = 'http://localhost:3001';

export interface CreateUrlRequest {
  url: string;
  validity?: number;
  shortcode?: string;
}

export interface ShortenedUrlResponse {
  shortLink: string;
  expiry: string;
}

export interface ClickData {
  timestamp: string;
  source: string;
  location: string;
}

export interface UrlStatistics {
  shortLink: string;
  longUrl: string;
  shortcode: string;
  createdAt: string;
  expiry: string;
  totalClicks: number;
  isExpired: boolean;
  clicks?: ClickData[];
}

class ApiService {
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    
    logger.debug('api', `Making ${options.method || 'GET'} request to ${url}`);

    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      if (!response.ok) {
        const errorData = await response.text();
        const errorMessage = `HTTP ${response.status}: ${errorData}`;
        logger.error('api', `API request failed: ${errorMessage}`);
        throw new Error(errorMessage);
      }

      const data = await response.json();
      logger.info('api', `API request successful: ${options.method || 'GET'} ${endpoint}`);
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error('api', `Network error: ${errorMessage}`);
      throw error;
    }
  }

  async createShortUrl(request: CreateUrlRequest): Promise<ShortenedUrlResponse> {
    logger.info('api', `Creating short URL for: ${request.url}`);
    
    return this.makeRequest<ShortenedUrlResponse>('/shorturls', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getAllShortUrls(): Promise<UrlStatistics[]> {
    logger.info('api', 'Fetching all short URLs');
    
    return this.makeRequest<UrlStatistics[]>('/shorturls');
  }

  async getUrlStatistics(shortcode: string): Promise<UrlStatistics> {
    logger.info('api', `Fetching detailed statistics for URL: ${shortcode}`);
    
    // Use individual endpoint that returns detailed click data
    return this.makeRequest<UrlStatistics>(`/shorturls/${shortcode}`);
  }

  // Validation helpers
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  static validateValidityPeriod(period: string): { isValid: boolean; value?: number } {
    if (!period || period.trim() === '') {
      return { isValid: true }; // Optional field
    }

    const numValue = parseInt(period, 10);
    if (isNaN(numValue) || numValue <= 0) {
      return { isValid: false };
    }

    return { isValid: true, value: numValue };
  }

  static validateCustomCode(code: string): boolean {
    if (!code || code.trim() === '') {
      return true; // Optional field
    }

    // Basic validation: alphanumeric, 3-50 characters
    const codeRegex = /^[a-zA-Z0-9]{3,50}$/;
    return codeRegex.test(code.trim());
  }
}

export const apiService = new ApiService();