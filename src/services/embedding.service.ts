import { Service } from 'typedi';
import { pipeline } from '@huggingface/transformers';

@Service()
export class EmbeddingService {
  private featureExtractor: any;

  constructor() {
    this.initFeatureExtractor();
  }

  private async initFeatureExtractor() {
    this.featureExtractor = await pipeline('feature-extraction', 'sentence-transformers/all-MiniLM-L6-v2');
  }

  public async generateEmbedding(text: string): Promise<number[]> {
    const embedding = await this.featureExtractor(text.trim());
    return embedding.tolist()[0][0];
  }
}
