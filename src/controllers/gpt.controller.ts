import { EmbeddingService } from '@/services/embedding.service';
import { GPTService } from '@/services/gpt.service';
import { NewsService } from '@/services/news.service';
import { logger } from '@/utils/logger';
import { generateAnalysisPrompt } from '@/utils/prompt-utils';
import { NextFunction, Request, Response } from 'express';
import Container, { Service } from 'typedi';

@Service()
export class GPTController {
  private gptService = Container.get(GPTService);
  private newsService = Container.get(NewsService);
  private embeddingService = Container.get(EmbeddingService);

  public streamChatGPTAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ticker, topic, text, model, maxTokens, temperature, topP, page, size } = req.query;

      const query: Record<string, any> = {
        bool: {
          must: [],
          filter: [],
        },
      };

      if (text) {
        query.bool.must.push({
          multi_match: {
            query: text as string,
            fields: ['summary', 'title'],
          },
        });

        const queryEmbedding = await this.embeddingService.generateEmbedding(text as string);
        if (queryEmbedding) {
          query.bool.must.push({
            script_score: {
              query: { match_all: {} },
              script: {
                source: "cosineSimilarity(params.queryVector, 'embedding') + 1.0",
                params: { queryVector: queryEmbedding },
              },
            },
          });
        }
      }

      if (topic) {
        query.bool.filter.push({
          nested: {
            path: 'topics',
            query: { match: { 'topics.topic': topic as string } },
          },
        });
      }

      if (ticker) {
        query.bool.filter.push({
          nested: {
            path: 'ticker_sentiment',
            query: { match: { 'ticker_sentiment.ticker': ticker as string } },
          },
        });
      }

      const pageNumber = page ? parseInt(page as string, 10) : 1;
      const pageSize = size ? parseInt(size as string, 10) : 10;
      const from = (pageNumber - 1) * pageSize;

      const newsItems = await this.newsService.searchNews(query, from, pageSize);

      if (!newsItems || newsItems.length === 0) {
        res.status(404).json({ error: 'No relevant news found for the provided filters.' });
        return;
      }

      const prompt = generateAnalysisPrompt(newsItems, ticker as string);

      console.log('Generated Prompt: ', prompt);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      let buffer = '';

      await this.gptService.generateChatGPTAnswer({
        prompt,
        model: model as string,
        maxTokens: maxTokens ? parseInt(maxTokens as string, 10) : undefined,
        temperature: temperature ? parseFloat(temperature as string) : undefined,
        topP: topP ? parseFloat(topP as string) : undefined,
        onWriteChunk: (chunk: string) => {
          try {
            const cleanedChunk = chunk.replace(/^data: /, '').trim();
            if (cleanedChunk && cleanedChunk !== '[DONE]') {
              buffer += cleanedChunk.replace(/""/g, '').replace(/\\n/g, '\n');
            }
            res.write(chunk);
          } catch (error) {
            logger.error('Error processing chunk:', error.message);
          }
        },
        onStreamEnd: () => {
          try {
            const readableOutput = buffer.replace(/""/g, '').replace(/\\n/g, '\n').replace(/\s+/g, ' ').trim();

            console.log('\n--- Reconstructed Response ---\n');
            console.log(readableOutput);
            res.write('data: [DONE]\n\n');
            res.end();
          } catch (error) {
            logger.error('Error handling stream end:', error.message);
            res.write('data: {"error":"An error occurred while processing the complete response."}\n\n');
            res.end();
          }
        },
        onError: () => {
          res.write('data: {"error":"An error occurred while streaming the response."}\n\n');
          res.end();
        },
      });
    } catch (error) {
      next(error);
    }
  };
}
