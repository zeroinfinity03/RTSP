# Stock Market Analysis Platform

A comprehensive stock market analysis platform that combines real-time stock data, price predictions using Prophet, and sentiment analysis using FinBERT. The platform offers interactive visualizations and insights for S&P 500 stocks.

## Features

- **Real-time Stock Data**: Fetch and display current stock prices, volumes, and other key metrics
- **Technical Analysis**: Interactive candlestick charts with volume indicators
- **Price Prediction**: Machine learning-based price forecasting using Facebook Prophet
- **Sentiment Analysis**: News sentiment analysis using FinBERT model
- **Interactive UI**: Dynamic charts and real-time updates using Highcharts
- **News Integration**: Latest financial news aggregation using Tavily API

## Tech Stack

- **Backend**: FastAPI, Python 3.13
- **Frontend**: JavaScript, Highcharts
- **ML/AI**: 
  - Facebook Prophet (Price Prediction)
  - FinBERT (Sentiment Analysis)
  - Hugging Face Transformers
- **Data Sources**:
  - yfinance (Stock Data)
  - Tavily API (News)
- **Styling**: TailwindCSS
- **Package Management**: uv (Python package installer)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sp
```

2. Initialize uv and install dependencies:
```bash
uv init
uv add fastapi python-dotenv jinja2 uvicorn plotly prophet cmdstanpy transformers torch requests yfinance cachetools pandas httpx lxml tavily-python numpy
```

3. Environment Setup:
Create a `.env` file in the root directory and add:
```env
TAVILY_API_KEY=your_tavily_api_key_here
```

## Running the Application

1. Start the FastAPI server:
```bash
uv run uvicorn main:app --reload
```

2. Open your browser and navigate to:
```
http://localhost:8000
```

## Features in Detail

### 1. Stock Data Visualization
- Interactive candlestick charts for price visualization
- Volume indicators
- Support for different time periods (1W, 1M, 3M, 6M)

### 2. Price Prediction
- Machine learning-based price forecasting
- Confidence intervals for predictions
- Adjustable prediction periods

### 3. Sentiment Analysis
- Real-time news sentiment analysis using FinBERT model
- Sentiment scoring and interpretation:
  - Scores range from 0 to 1 for each sentiment category
  - Score > 0.6: Strong confidence in the sentiment
  - Example: "negative (0.94)" means 94% confidence in negative sentiment
- Three-category classification:
  - Negative: Scores 0.0-0.4 (higher score = stronger negative)
  - Neutral: Scores 0.4-0.6
  - Positive: Scores 0.6-1.0 (higher score = stronger positive)
- Features:
  - Real-time news fetching using Tavily API (up to 20 articles)
  - Title and content sentiment analysis
  - Combined sentiment scoring (40% title, 60% content weight)
  - Interactive sentiment timeline visualization
  - News article links with sentiment indicators
  - Overall market sentiment calculation
- API Integration:
  - Tavily API for real-time financial news
  - FinBERT model for NLP-based sentiment analysis
  - Cached results for improved performance

## API Endpoints

- `/api/stock/{symbol}` - Get historical stock data
- `/api/stock/{symbol}/details` - Get company details
- `/api/stock/{symbol}/predict` - Get price predictions
- `/api/stock/{symbol}/sentiment` - Get sentiment analysis
- `/api/search` - Search for stock symbols

## Development

### Running Tests
(To be implemented)

### Code Style
- Python: PEP 8
- JavaScript: Standard JS

## Troubleshooting

### Server Management
To kill the server running on port 8000:
```bash
kill $(lsof -t -i:8000)
```

Alternative commands:
1. Find processes: `lsof -i :8000`
2. Kill specific process: `kill -9 <PID>`

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

[Add License Information]

## Acknowledgments

- [Facebook Prophet](https://facebook.github.io/prophet/)
- [FinBERT](https://huggingface.co/ProsusAI/finbert)
- [Tavily API](https://tavily.com/)
- [yfinance](https://github.com/ranaroussi/yfinance)
- [Highcharts](https://www.highcharts.com/)

