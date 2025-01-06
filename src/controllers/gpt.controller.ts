import { GPTService } from '@/services/gpt.service';
import { NewsService } from '@/services/news.service';
import { generateAnalysisPrompt } from '@/utils/prompt-utils';
import { NextFunction, Request, Response } from 'express';
import Container, { Service } from 'typedi';

@Service()
export class GPTController {
  private gptService = Container.get(GPTService);
  private newsService = Container.get(NewsService);

  public streamChatGPTAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { ticker, topic, text, model, maxTokens, temperature, topP } = req.query;

      if (!ticker && !topic && !text) {
        res.status(400).json({ error: 'At least one filter (ticker, topic, or text) is required.' });
        return;
      }

      const filters: Record<string, any> = {};
      if (ticker) filters.ticker = ticker as string;
      if (topic) filters.topic = topic as string;
      if (text) filters.text = text as string;

      const newsItems = await this.newsService.searchNews(filters);

      if (!newsItems || newsItems.length === 0) {
        res.status(404).json({ error: 'No relevant news found for the provided filters.' });
        return;
      }

      const prompt = generateAnalysisPrompt(newsItems, ticker as string);

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await this.gptService.generateChatGPTAnswer({
        prompt,
        model: model as string,
        maxTokens: maxTokens ? parseInt(maxTokens as string, 10) : undefined,
        temperature: temperature ? parseFloat(temperature as string) : undefined,
        topP: topP ? parseFloat(topP as string) : undefined,
        onWriteChunk: (chunk: string) => {
          res.write(chunk);
        },
        onStreamEnd: () => {
          res.write('data: [DONE]\n\n');
          res.end();
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
