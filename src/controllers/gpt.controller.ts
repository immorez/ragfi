import { GPTService } from '@/services/gpt.service';
import { NextFunction, Request, Response } from 'express';
import Container, { Service } from 'typedi';

@Service()
export class GPTController {
  private gptService = Container.get(GPTService);

  public streamChatGPTAnswer = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { prompt, model, maxTokens, temperature, topP } = req.query;

      if (!prompt) {
        res.status(400).json({ error: 'Prompt is required.' });
        return;
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      await this.gptService.generateChatGPTAnswer({
        prompt: prompt as string,
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
