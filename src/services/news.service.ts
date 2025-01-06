import { Service } from 'typedi';
import { ElasticService } from '@services/elastic.service';
import { NewsArticle } from '@interfaces/news.interface';
import { hashUrl } from '@utils/hash';

@Service()
export class NewsService {
  constructor(private readonly elasticService: ElasticService) {}

  /**
   * Ingest news articles into Elasticsearch
   * @param newsData Array of news articles
   */
  public async ingestNews(newsData: NewsArticle[]): Promise<void> {
    for (const news of newsData) {
      const newsId = hashUrl(news.url);

      const exists = await this.elasticService.documentExists('news', newsId);
      if (!exists) {
        await this.elasticService.indexDocument<NewsArticle>('news', newsId, news);
      }
    }
  }

  /**
   * Search news articles
   * @param query Query object for searching news
   * @returns Array of matched news articles
   */
  public async searchNews(query: Record<string, any>): Promise<NewsArticle[]> {
    return this.elasticService.searchDocuments<NewsArticle>('news', query);
  }

  /**
   * Get a news article by ID
   * @param newsId News article ID
   * @returns News article
   */
  public async getNewsById(newsId: string): Promise<NewsArticle> {
    return this.elasticService.getDocumentById<NewsArticle>('news', newsId);
  }

  /**
   * Delete a news article by ID
   * @param newsId News article ID
   */
  public async deleteNewsById(newsId: string): Promise<void> {
    await this.elasticService.deleteDocument('news', newsId);
  }
}
