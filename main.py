from fastapi import FastAPI, Request
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
from logics.symbols import get_sp500_symbols, get_stock_history, get_stock_info
from logics.predictor import predict_stock_prices
from logics.sentiment import SentimentAnalyzer

app = FastAPI()

# Initialize sentiment analyzer
sentiment_analyzer = SentimentAnalyzer()

# Mount static files and templates
app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

@app.get("/")
async def read_root(request: Request):
    symbols = get_sp500_symbols()
    print(f"Number of symbols fetched: {len(symbols)}")
    print(f"First few symbols: {symbols[:5]}")
    return templates.TemplateResponse(
        "index.html", 
        {"request": request, "symbols": symbols}
    )

@app.get("/api/stock/{symbol}")
async def get_stock_data(symbol: str, period: str = "1mo"):
    data = get_stock_history(symbol, period)
    print(f"Historical data for {symbol} ({period}): {data}")  # Debugging log
    return JSONResponse(data)

@app.get("/api/stock/{symbol}/details")
async def get_stock_details(symbol: str):
    details = get_stock_info(symbol)
    print(f"Stock details for {symbol}: {details}")  # Debugging log
    return JSONResponse(details)

@app.get("/api/stock/{symbol}/predict")
async def get_stock_prediction(symbol: str, period: str = "1w"):
    try:
        print(f"\n=== Starting prediction request for {symbol} ({period}) ===")
        # Get company info to get the full name
        company_info = get_stock_info(symbol)
        company_name = company_info.get('name', '')
        
        prediction_data = predict_stock_prices(symbol, company_name, period)
        print(f"Prediction successful. Response data: {prediction_data}")
        return JSONResponse(prediction_data)
    except Exception as e:
        print(f"ERROR in prediction endpoint: {str(e)}")
        return JSONResponse(
            {"error": f"Prediction failed: {str(e)}"},
            status_code=500
        )

@app.get("/api/search")
async def search_symbols(query: str):
    symbols = get_sp500_symbols()
    filtered_symbols = [s for s in symbols if query.upper() in s.upper()]
    return JSONResponse(filtered_symbols)

@app.get("/api/stock/{symbol}/sentiment")
async def get_stock_sentiment(symbol: str):
    try:
        # Get company info to get the full name
        company_info = get_stock_info(symbol)
        company_name = company_info.get('name', '')
        
        # Analyze sentiment
        sentiment_data = sentiment_analyzer.analyze_company_sentiment(company_name, symbol)
        return JSONResponse(sentiment_data)
    except Exception as e:
        print(f"ERROR in sentiment endpoint: {str(e)}")
        return JSONResponse(
            {"error": f"Sentiment analysis failed: {str(e)}"},
            status_code=500
        )
