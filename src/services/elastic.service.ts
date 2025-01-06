import { Service } from 'typedi';
import { Client } from '@elastic/elasticsearch';
import { HttpException } from '@exceptions/httpException';

@Service()
export class ElasticService {
  private elasticClient: Client;

  constructor() {
    this.elasticClient = new Client({ node: process.env.ELASTICSEARCH_URL });
  }

  /**
   * Index a document into Elasticsearch
   */
  public async indexDocument(index: string, id: string, document: Record<string, any>): Promise<void> {
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
   */
  public async searchDocuments(index: string, query: Record<string, any>): Promise<any[]> {
    try {
      const response = await this.elasticClient.search({
        index,
        query,
      });
      return response.hits.hits.map((hit: any) => hit._source);
    } catch (error) {
      throw new HttpException(500, `Failed to search documents: ${error.message}`);
    }
  }

  /**
   * Get a document by ID from Elasticsearch
   */
  public async getDocumentById(index: string, id: string): Promise<Record<string, any>> {
    try {
      const response = await this.elasticClient.get({
        index,
        id,
      });
      return response._source;
    } catch (error) {
      throw new HttpException(404, `Document not found: ${error.message}`);
    }
  }

  /**
   * Delete a document from Elasticsearch by ID
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
