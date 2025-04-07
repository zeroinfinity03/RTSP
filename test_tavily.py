from tavily import TavilyClient
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def test_tavily_connection():
    api_key = os.getenv("TAVILY_API_KEY")
    print(f"Testing Tavily API connection...")
    print(f"API Key found: {'Yes' if api_key else 'No'}")
    
    try:
        client = TavilyClient(api_key=api_key)
        # Try a simple search
        response = client.search(
            query="AAPL stock price",
            search_depth="basic",
            max_results=1
        )
        print("\nAPI Test successful!")
        print("Sample result:", response.get('results', [])[0] if response.get('results') else "No results")
        return True
    except Exception as e:
        print(f"\nError testing API:")
        print(f"Type: {type(e).__name__}")
        print(f"Message: {str(e)}")
        return False

if __name__ == "__main__":
    test_tavily_connection()