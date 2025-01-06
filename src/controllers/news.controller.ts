import { Request, Response, NextFunction } from 'express';
import { Service } from 'typedi';
import { NewsService } from '@services/news.service';
import { NewsArticle } from '@interfaces/news.interface';

@Service()
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  /**
   * Ingest news articles into Elasticsearch
   */
  public ingestNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newsData: NewsArticle[] = req.body;

      if (!newsData || !Array.isArray(newsData)) {
        res.status(400).json({ error: 'Invalid news data provided' });
        return;
      }

      await this.newsService.ingestNews(newsData);
      res.status(201).json({ message: 'News articles ingested successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Search news articles
   */
  public searchNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { query, topic, ticker } = req.query;
      const filters: Record<string, any>[] = [];

      if (topic) {
        filters.push({
          nested: {
            path: 'topics',
            query: { match: { 'topics.topic': topic } },
          },
        });
      }

      if (ticker) {
        filters.push({
          nested: {
            path: 'ticker_sentiment',
            query: { match: { 'ticker_sentiment.ticker': ticker } },
          },
        });
      }

      const searchQuery = {
        bool: {
          must: query ? [{ match: { summary: query } }] : [],
          filter: filters,
        },
      };

      const results = await this.newsService.searchNews(searchQuery);
      res.status(200).json({ data: results, message: 'Search results retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get a news article by ID
   */
  public getNewsById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newsId = req.params.id;
      const news = await this.newsService.getNewsById(newsId);

      if (!news) {
        res.status(404).json({ message: 'News article not found' });
        return;
      }

      res.status(200).json({ data: news, message: 'News article retrieved successfully' });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a news article by ID
   */
  public deleteNewsById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const newsId = req.params.id;

      await this.newsService.deleteNewsById(newsId);
      res.status(200).json({ message: 'News article deleted successfully' });
    } catch (error) {
      next(error);
    }
  };
}
