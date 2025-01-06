import { NewsArticle } from '@/interfaces/news.interface';

export const generateAnalysisPrompt = (newsItems: NewsArticle[], ticker = 'MSFT') => {
  const resolvedTicker = ticker || 'Unknown Company';
  const resolvedCompany = resolvedTicker === 'MSFT' ? 'Microsoft' : 'the Company';

  return `
### Analysis Request for ${resolvedTicker} (${resolvedCompany})

Analyze the provided financial news data for actionable insights specific to the ticker **${resolvedTicker}**. Focus on:

1. Summarizing ${resolvedTicker}-related news and their implications on the company's growth, sustainability, and market position.
2. Highlighting how broader industry trends and associated companies affect or are affected by ${resolvedTicker}.
3. Providing specific, actionable investment strategies based on the analysis of the provided data.

---

### News Data:
${newsItems
  .map(
    (item, index) => `
#### News Item ${index + 1}:
- **Title**: "${item.title}"
- **URL**: [${item.url}](${item.url})
- **Summary**: ${item.summary}
- **Published Date**: ${item.time_published}
- **Authors**: ${item.authors.join(', ')}
- **Source**: ${item.source}
- **Topics**: ${item.topics.map(topic => topic.topic).join(', ')}
- **Overall Sentiment**: ${item.overall_sentiment_label} (${item.overall_sentiment_score})
- **Ticker Sentiment**:
${
  item.ticker_sentiment
    .filter(ts => ts.ticker === resolvedTicker)
    .map(
      ts => `
  - **Ticker**: ${ts.ticker}
  - **Relevance Score**: ${ts.relevance_score}
  - **Sentiment Score**: ${ts.ticker_sentiment_score}
  - **Sentiment Label**: ${ts.ticker_sentiment_label}
`,
    )
    .join('') || '  - No specific sentiment data for this ticker.'
}
`,
  )
  .join('\n')}

---

### Instructions:
1. **Extract Relevant Information**:
   - Focus only on news items mentioning **${resolvedTicker} (${resolvedCompany})**, directly or indirectly.
2. **Analyze ${resolvedTicker}'s Position**:
   - Summarize challenges, opportunities, and growth indicators.
   - Assess sentiment scores and interpret market reactions.
3. **Industry and Competitor Insights**:
   - Highlight how industry trends (e.g., AI, technology, finance) and competitor news influence ${resolvedTicker}.
4. **Actionable Investment Strategies**:
   - Provide **short-term** and **long-term** strategies based on the analysis.

---

### Output Format:
#### 1. ${resolvedTicker}-Specific Insights:
- **Summary of News**: [Key points about ${resolvedTicker}]
- **Implications**: [How this affects ${resolvedTicker}'s growth, challenges, or opportunities]

#### 2. Sector-Wide Implications:
- **Key Trends**: [Trends in AI, technology, and finance impacting ${resolvedTicker}]

#### 3. Actionable Investment Strategies:
- **Short-Term Strategies**: [Strategies for immediate action]
- **Long-Term Strategies**: [Strategies for long-term holding or monitoring]
`;
};
