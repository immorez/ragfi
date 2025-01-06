import { Service } from 'typedi';
import { Client } from '@elastic/elasticsearch';
import { HttpException } from '@exceptions/httpException';
import { SearchHit } from '@elastic/elasticsearch/lib/api/types';

@Service()
export class ElasticService {
  private elasticClient: Client;

  constructor() {
    this.elasticClient = new Client({ node: process.env.ELASTICSEARCH_URL });
  }

  /**
   * Index a document into Elasticsearch
   * @param index Index name
   * @param id Document ID
   * @param document Document to index
   */
  public async indexDocument<T>(index: string, id: string, document: T): Promise<void> {
    try {
      await this.elasticClient.index({
        index,
        id,
        document,
      });
    } catch (error) {
      throw new HttpException(500, `Failed to index document: ${error.message}`);
    }
  }

  /**
   * Search documents in Elasticsearch
   * @param index Index name
   * @param query Search query
   * @returns Array of documents matching the query
   */
  public async searchDocuments<T>(index: string, query: Record<string, unknown>): Promise<T[]> {
    try {
      const response = await this.elasticClient.search({
        index,
        query,
      });
      return response.hits.hits.map((hit: SearchHit<T>) => hit._source as T);
    } catch (error) {
      throw new HttpException(500, `Failed to search documents: ${error.message}`);
    }
  }

  /**
   * Get a document by ID from Elasticsearch
   * @param index Index name
   * @param id Document ID
   * @returns Document data
   */
  public async getDocumentById<T>(index: string, id: string): Promise<T> {
    try {
      const response = await this.elasticClient.get({
        index,
        id,
      });
      return response._source as T;
    } catch (error) {
      throw new HttpException(404, `Document not found: ${error.message}`);
    }
  }

  /**
   * Delete a document from Elasticsearch by ID
   * @param index Index name
   * @param id Document ID
   */
  public async deleteDocument(index: string, id: string): Promise<void> {
    try {
      await this.elasticClient.delete({
        index,
        id,
      });
    } catch (error) {
      throw new HttpException(500, `Failed to delete document: ${error.message}`);
    }
  }

  /**
   * Check if a document exists in Elasticsearch
   * @param index Index name
   * @param id Document ID
   * @returns True if the document exists, false otherwise
   */
  public async documentExists(index: string, id: string): Promise<boolean> {
    try {
      return await this.elasticClient.exists({
        index,
        id,
      });
    } catch (error) {
      throw new HttpException(500, `Failed to check document existence: ${error.message}`);
    }
  }
}
