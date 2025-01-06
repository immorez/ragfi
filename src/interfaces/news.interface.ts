export interface Topic {
  topic: string;
  relevance_score: number;
}

export interface TickerSentiment {
  ticker: string;
  relevance_score: number;
  ticker_sentiment_score: number;
  ticker_sentiment_label: string;
}

export interface NewsArticle {
  title: string;
  url: string;
  time_published: string;
  authors: string[];
  summary: string;
  source: string;
  topics: Topic[];
  overall_sentiment_score: number;
  overall_sentiment_label: string;
  ticker_sentiment: TickerSentiment[];
}
