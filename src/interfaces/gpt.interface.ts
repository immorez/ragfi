export interface ChatGPTRequest {
  prompt: string;
  model?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  onWriteChunk: (chunk: string) => void;
  onStreamEnd: () => void;
  onError: () => void;
}

export interface ChatGPTResponse {
  answer: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}
