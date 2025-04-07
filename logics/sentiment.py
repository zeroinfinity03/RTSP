from transformers import AutoTokenizer, AutoModelForSequenceClassification
import torch
from typing import List, Dict, Tuple, Union
import numpy as np
from .news import NewsFeeder

class SentimentAnalyzer:
    def __init__(self):
        # Load FinBERT model and tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained("ProsusAI/finbert")
        self.model = AutoModelForSequenceClassification.from_pretrained("ProsusAI/finbert")
        self.news_feeder = NewsFeeder()
        
        # Label mapping for FinBERT outputs
        self.labels = {
            0: "negative",
            1: "neutral",
            2: "positive"
        }
    
    def analyze_text(self, text: str) -> Dict[str, Union[str, float]]:
        """
        Analyze sentiment of a single text using FinBERT
        """
        # Prepare input
        inputs = self.tokenizer(text, return_tensors="pt", padding=True, truncation=True, max_length=512)
        
        # Get prediction
        with torch.no_grad():
            outputs = self.model(**inputs)
            predictions = torch.nn.functional.softmax(outputs.logits, dim=-1)
            
        # Get sentiment label and score
        sentiment_idx = torch.argmax(predictions).item()
        sentiment_score = predictions[0][sentiment_idx].item()
        sentiment_label = self.labels[sentiment_idx]
        
        return {
            "sentiment": sentiment_label,
            "score": sentiment_score,
            "scores": {
                label: predictions[0][idx].item()
                for idx, label in self.labels.items()
            }
        }
    
    def analyze_company_sentiment(self, company_name: str, ticker: str, max_news: int = 20) -> Dict:
        """
        Fetch and analyze sentiment from company news
        Default to 20 articles for comprehensive sentiment analysis
        """
        # Fetch news articles
        news_articles = self.news_feeder.fetch_company_news(company_name, ticker, max_results=max_news)
        
        if not news_articles:
            return {
                "overall_sentiment": "neutral",
                "sentiment_score": 0,
                "articles": []
            }
        
        analyzed_articles = []
        sentiment_scores = []
        
        # Analyze each article
        for article in news_articles:
            # Analyze title and content separately
            title_sentiment = self.analyze_text(article['title'])
            content_sentiment = self.analyze_text(article['content'])
            
            # Combine title and content sentiment (weighted average)
            combined_score = (title_sentiment['score'] * 0.4 + content_sentiment['score'] * 0.6)
            sentiment_scores.append(combined_score)
            
            analyzed_articles.append({
                "title": article['title'],
                "url": article['url'],
                "published_date": article['published_date'],
                "source": article['source'],
                "title_sentiment": title_sentiment,
                "content_sentiment": content_sentiment,
                "combined_sentiment_score": combined_score
            })
        
        # Calculate overall sentiment
        avg_sentiment_score = np.mean(sentiment_scores)
        overall_sentiment = self.get_overall_sentiment(avg_sentiment_score)
        
        return {
            "overall_sentiment": overall_sentiment,
            "sentiment_score": float(avg_sentiment_score),
            "articles": analyzed_articles
        }
    
    def get_overall_sentiment(self, score: float) -> str:
        """
        Convert sentiment score to label
        """
        if score >= 0.6:
            return "positive"
        elif score <= 0.4:
            return "negative"
        return "neutral"

# Example usage
if __name__ == "__main__":
    analyzer = SentimentAnalyzer()
    
    # Test with a single company
    results = analyzer.analyze_company_sentiment("Apple Inc", "AAPL", max_news=5)
    
    print(f"\nOverall Sentiment: {results['overall_sentiment']}")
    print(f"Sentiment Score: {results['sentiment_score']:.2f}")
    
    print("\nAnalyzed Articles:")
    for article in results['articles']:
        print(f"\nTitle: {article['title']}")
        print(f"Title Sentiment: {article['title_sentiment']['sentiment']} (Score: {article['title_sentiment']['score']:.2f})")
        print(f"Content Sentiment: {article['content_sentiment']['sentiment']} (Score: {article['content_sentiment']['score']:.2f})")
        print(f"Combined Score: {article['combined_sentiment_score']:.2f}")
        print(f"URL: {article['url']}")