import { Request, Response, NextFunction } from 'express';
import { NewsService } from '@services/news.service';
import { EmbeddingService } from '@/services/embedding.service';
import { NewsArticle } from '@interfaces/news.interface';
import { AlphaVantageService } from '@/services/alphaVantage.service';
import Container from 'typedi';
import { alphaVantageDateDecoder, alphaVantageDateFormatter } from '@/utils/date-utils';

export class NewsController {
  private newsService = Container.get(NewsService);
  private alphaVantageService = Container.get(AlphaVantageService);
  private embeddingService = Container.get(EmbeddingService);

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

  /**
   * Ingest latest news from AlphaVantage
   */
  public fetchAndIngestLatestNews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { tickers, topics, time_from, time_to, limit } = req.query;

      if (!tickers && !topics) {
        res.status(400).json({ error: 'Either tickers or topics must be specified.' });
        return;
      }

      let fromTime: string;
      let toTime: string;

      if (time_from && time_to) {
        fromTime = (time_from as string).replace(/[-:.TZ]/g, '').slice(0, 14);
        toTime = (time_to as string).replace(/[-:.TZ]/g, '').slice(0, 14);
      } else {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        fromTime = alphaVantageDateFormatter(oneDayAgo);
        toTime = alphaVantageDateFormatter(now);
      }

      const response = await this.alphaVantageService.fetchFromAlphaVantage<{ feed: NewsArticle[] }>('NEWS_SENTIMENT', {
        tickers: tickers as string,
        topics: topics as string,
        time_from: fromTime,
        time_to: toTime,
        sort: 'LATEST',
        limit: limit ? parseInt(limit as string, 10) : 50,
      });

      const newsData = response.feed;

      const transformedNews: NewsArticle[] = await Promise.all(
        newsData.map(async item => {
          const text = `${item.title}. ${item.summary}`;
          const embedding = await this.embeddingService.generateEmbedding(text);
          return {
            title: item.title,
            url: item.url,
            summary: item.summary,
            publishedDate: alphaVantageDateDecoder(item.time_published),
            authors: item.authors,
            source: item.source,
            topics: item.topics,
            overall_sentiment_score: item.overall_sentiment_score,
            overall_sentiment_label: item.overall_sentiment_label,
            ticker_sentiment: item.ticker_sentiment,
            time_published: item.time_published,
            embedding,
          };
        }),
      );

      await this.newsService.ingestNews(transformedNews);

      res.status(201).json({ message: 'Latest news ingested successfully' });
    } catch (error) {
      next(error);
    }
  };
}
