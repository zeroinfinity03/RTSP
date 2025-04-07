import os
from dotenv import load_dotenv
from typing import List, Dict
import time
from datetime import datetime, timedelta
import requests
import json

# Load environment variables
load_dotenv()
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY")
TAVILY_API_URL = "https://api.tavily.com/search"

class NewsFeeder:
    def __init__(self):
        if not TAVILY_API_KEY:
            raise ValueError("TAVILY_API_KEY not found in environment variables")
        self.api_key = TAVILY_API_KEY
        self.headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
    def fetch_company_news(self, company_name: str, ticker: str, max_results: int = 20) -> List[Dict]:
        """
        Fetch news articles for a given company using both company name and ticker symbol
        """
        try:
            print(f"\nFetching news for {company_name} ({ticker})")
            print(f"Requesting {max_results} articles")
            
            # Create a query that includes both company name and ticker
            query = f"{company_name} ({ticker}) stock market news sentiment analysis financial"
            
            # Prepare the request payload
            payload = {
                "query": query,
                "search_depth": "advanced",
                "max_results": max_results,
                "time_range": "month",
                "topic": "news"
            }
            
            # Make the API request
            response = requests.post(
                TAVILY_API_URL,
                headers=self.headers,
                json=payload
            )
            
            # Check if request was successful
            response.raise_for_status()
            data = response.json()
            
            # Process and format the results
            processed_news = []
            for article in data.get('results', []):
                processed_article = {
                    'title': article.get('title', ''),
                    'url': article.get('url', ''),
                    'content': article.get('content', ''),
                    'published_date': article.get('published_date', ''),
                    'source': article.get('source', ''),
                    'score': article.get('score', 0)
                }
                processed_news.append(processed_article)
            
            print(f"Successfully fetched {len(processed_news)} articles")
            return processed_news
            
        except Exception as e:
            print(f"Error fetching news: {str(e)}")
            print(f"Error type: {type(e).__name__}")
            return []

# Example usage
if __name__ == "__main__":
    news_feeder = NewsFeeder()
    news = news_feeder.fetch_company_news("Apple Inc", "AAPL", max_results=20)
    print(f"\nTotal articles fetched: {len(news)}")
    for i, article in enumerate(news, 1):
        print(f"\nArticle {i}:")
        print(f"Title: {article['title']}")
        print(f"Source: {article['source']}")
        print(f"Date: {article['published_date']}")
        print(f"URL: {article['url']}")
        print("Content:", article['content'][:200], "...")