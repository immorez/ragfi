import { ChatGPTRequest, ChatGPTResponse } from '@/interfaces/gpt.interface';
import { Service } from 'typedi';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '@/config';
import { logger } from '@/utils/logger';

@Service()
export class GPTService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({ apiKey: OPENAI_API_KEY });
  }

  /**
   * Generate an answer using ChatGPT.
   */
  public async generateChatGPTAnswer({
    prompt,
    model = 'gpt-3.5-turbo',
    maxTokens = 150,
    temperature = 0.7,
    topP = 1,
    onError,
    onStreamEnd,
    onWriteChunk,
  }: ChatGPTRequest): Promise<void> {
    try {
      const stream = await this.openai.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
        temperature,
        top_p: topP,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        if (content) {
          onWriteChunk(`data: ${JSON.stringify(content)}\n\n`);
        }
      }

      onStreamEnd();
    } catch (error) {
      logger.error(`Error generating answer: ${(error as Error).message}`);
      onError();
      throw new Error('Failed to generate answer. Please try again later.');
    }
  }
}
