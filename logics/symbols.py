import polars as pl
import requests
import pandas as pd
from lxml import html
from cachetools import TTLCache
from typing import Dict, List
import yfinance as yf

# Cache for storing stock data (TTL = 1 hour)
symbols_cache = TTLCache(maxsize=100, ttl=3600)
stock_cache = TTLCache(maxsize=500, ttl=3600)

def get_sp500_symbols() -> List[str]:
    """Fetch S&P 500 symbols from Wikipedia"""
    if 'sp500_symbols' in symbols_cache:
        print("Returning cached symbols")
        return symbols_cache['sp500_symbols']
    
    try:
        print("Fetching S&P 500 symbols from Wikipedia")
        tables = pd.read_html('https://en.wikipedia.org/wiki/List_of_S%26P_500_companies')
        df = tables[0]
        symbols = df['Symbol'].tolist()
        print(f"Found {len(symbols)} symbols")
        symbols_cache['sp500_symbols'] = symbols
        return symbols
    except Exception as e:
        print(f"Error fetching symbols: {e}")
        # Return some default symbols if fetch fails
        default_symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META']
        return default_symbols

def get_stock_info(symbol: str) -> Dict:
    """Get stock information using yfinance with verified fields"""
    cache_key = f"stock_info_{symbol}"
    if cache_key in stock_cache:
        return stock_cache[cache_key]
    
    try:
        stock = yf.Ticker(symbol)
        info = stock.info
        result = {
            'symbol': symbol,
            'name': info.get('shortName', info.get('longName', '')),
            'sector': info.get('sector', 'N/A'),
            'industry': info.get('industry', 'N/A'),
            'current_price': info.get('regularMarketPrice', 
                           info.get('currentPrice', 0)),
            'market_cap': info.get('marketCap', 0),
            'pe_ratio': info.get('trailingPE', 
                      info.get('forwardPE', 0)),
            'fifty_two_week_high': info.get('fiftyTwoWeekHigh', 0),
            'fifty_two_week_low': info.get('fiftyTwoWeekLow', 0),
            'volume': info.get('volume', 0),
            'avg_volume': info.get('averageVolume', 0)
        }
        print(f"Fetched stock info for {symbol}: {result}")  # Debugging log
        stock_cache[cache_key] = result
        return result
    except Exception as e:
        print(f"Error fetching data for {symbol}: {str(e)}")
        return {
            'symbol': symbol,
            'error': f"Failed to fetch data: {str(e)}",
            'name': 'N/A',
            'sector': 'N/A',
            'industry': 'N/A',
            'current_price': 0,
            'market_cap': 0,
            'pe_ratio': 0,
            'fifty_two_week_high': 0,
            'fifty_two_week_low': 0,
            'volume': 0,
            'avg_volume': 0
        }

def get_stock_history(symbol: str, period: str = "1mo") -> Dict[str, List]:
    """Get historical stock data for the specified period."""
    try:
        stock = yf.Ticker(symbol)
        history = stock.history(period=period)
        
        dates = [row.name.strftime('%Y-%m-%d') for _, row in history.iterrows()]
        prices = history['Close'].tolist()
        
        # Return both OHLC for candlestick and simple price data for comparison
        return {
            "ohlc": [[row.name.timestamp() * 1000, row['Open'], row['High'], row['Low'], row['Close']]
                    for _, row in history.iterrows()],
            "volume": [[row.name.timestamp() * 1000, row['Volume']]
                      for _, row in history.iterrows()],
            "dates": dates,
            "prices": prices
        }
    except Exception as e:
        print(f"Error fetching historical data for {symbol}: {str(e)}")
        return {"ohlc": [], "volume": [], "dates": [], "prices": []}
