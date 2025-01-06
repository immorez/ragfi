import { Service } from 'typedi';
import axios, { AxiosInstance } from 'axios';
import { HttpException } from '@exceptions/httpException';
import { ALPHA_VANTAGE_API_KEY, ALPHA_VANTAGE_BASE_URL } from '@/config';

@Service()
export class AlphaVantageService {
  private readonly apiClient: AxiosInstance;
  private readonly apiKey: string;

  constructor() {
    this.apiKey = ALPHA_VANTAGE_API_KEY;
    if (!this.apiKey) {
      throw new HttpException(500, 'Alpha Vantage API key is missing in environment variables');
    }

    this.apiClient = axios.create({
      baseURL: ALPHA_VANTAGE_BASE_URL,
    });
  }

  /**
   * Generic method to fetch data from Alpha Vantage API
   * @param func API function to call (e.g., NEWS_SENTIMENT, TIME_SERIES_DAILY)
   * @param params Additional query parameters for the API
   * @returns Parsed API response
   */
  public async fetchFromAlphaVantage<T>(func: string, params: Record<string, unknown>): Promise<T> {
    try {
      const response = await this.apiClient.get('', {
        params: {
          function: func,
          apikey: this.apiKey,
          ...params,
        },
      });

      if (response.data) {
        return response.data as T;
      } else {
        throw new HttpException(500, 'Unexpected response format from Alpha Vantage API');
      }
    } catch (error) {
      throw new HttpException(error.response?.status || 500, `Failed to fetch data from Alpha Vantage API: ${error.message}`);
    }
  }
}
