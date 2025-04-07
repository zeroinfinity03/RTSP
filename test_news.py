from logics.news import NewsFeeder
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_news_fetching():
    # Initialize NewsFeeder
    news_feeder = NewsFeeder()
    
    # Test parameters
    symbol = "AAPL"
    company_name = "Apple Inc"
    
    try:
        # Fetch news articles
        news_articles = news_feeder.fetch_company_news(
            company_name=company_name,
            ticker=symbol,
            max_results=20
        )
        
        # Print results
        if news_articles:
            print(f"\nSuccessfully fetched {len(news_articles)} articles")
            
            for i, article in enumerate(news_articles, 1):
                print(f"\nArticle {i}:")
                print(f"Title: {article['title']}")
                print(f"Source: {article['source']}")
                print(f"Date: {article['published_date']}")
                print(f"URL: {article['url']}")
                print("-" * 50)
                print("Content Preview:", article['content'][:200] + "..." if article['content'] else "No content")
                print("=" * 80)
        else:
            print("No articles were fetched")
            
    except Exception as e:
        print(f"Error during test: {str(e)}")
        print(f"Error type: {type(e).__name__}")

if __name__ == "__main__":
    test_news_fetching()