import pandas as pd
from prophet import Prophet
from .symbols import get_stock_history
from datetime import datetime, timedelta
import traceback
from .sentiment import SentimentAnalyzer

# Initialize sentiment analyzer
sentiment_analyzer = SentimentAnalyzer()

# Cache dictionaries
_data_cache = {}  # Format: {symbol: {'data': df, 'timestamp': datetime}}
_prediction_cache = {}  # Format: {symbol_period: {'prediction': data, 'timestamp': datetime}}

# Cache expiry times
DATA_CACHE_EXPIRY = timedelta(hours=6)  # Refresh historical data every 6 hours
PREDICTION_CACHE_EXPIRY = timedelta(hours=24)  # Refresh predictions daily

def _is_cache_valid(timestamp, expiry_delta):
    if not timestamp:
        return False
    return datetime.now() - timestamp < expiry_delta

def prepare_data_for_prophet(symbol: str, company_name: str):
    # Check cache first
    if symbol in _data_cache and _is_cache_valid(_data_cache[symbol]['timestamp'], DATA_CACHE_EXPIRY):
        return _data_cache[symbol]['data']
    
    # If not in cache or expired, fetch new data
    historical_data = get_stock_history(symbol, period="2y")
    
    # Use Pandas for initial data processing
    df = pd.DataFrame(historical_data['ohlc'])
    df.columns = ['ds', 'open', 'high', 'low', 'close']
    df['y'] = df['close']  # Prophet requires 'y' column
    df['ds'] = pd.to_datetime(df['ds'], unit='ms')  # Convert timestamp to datetime
    
    # Get sentiment scores for the company
    sentiment_data = sentiment_analyzer.analyze_company_sentiment(company_name, symbol)
    sentiment_score = sentiment_data['sentiment_score']
    
    # Add sentiment score as a regressor column
    df['sentiment'] = sentiment_score  # Using the overall sentiment score for historical data
    
    # Update cache
    _data_cache[symbol] = {
        'data': df[['ds', 'y', 'sentiment']],
        'timestamp': datetime.now()
    }
    
    return _data_cache[symbol]['data']

def predict_stock_prices(symbol: str, company_name: str, prediction_period: str = "1w"):
    try:
        print(f"Starting prediction for {symbol} with period {prediction_period}")
        
        # Check prediction cache
        cache_key = f"{symbol}_{prediction_period}"
        if cache_key in _prediction_cache and _is_cache_valid(_prediction_cache[cache_key]['timestamp'], PREDICTION_CACHE_EXPIRY):
            return _prediction_cache[cache_key]['prediction']
        
        # Get Prophet-compatible pandas DataFrame with sentiment
        pandas_df = prepare_data_for_prophet(symbol, company_name)
        print(f"Training data loaded: {len(pandas_df)} rows")
        print(f"Sample of training data:\n{pandas_df.head()}")
        
        print(f"Training data shape: {pandas_df.shape}")  # Debug log
        
        # Convert period to number of days
        period_dict = {
            "1w": 7,
            "1mo": 30,
            "3mo": 90,
            "6mo": 180,
        }
        forecast_days = period_dict.get(prediction_period, 7)
        
        # Initialize Prophet model with sentiment regressor
        model = Prophet(
            daily_seasonality=True,
            weekly_seasonality=True,
            yearly_seasonality=True,
            changepoint_prior_scale=0.05
        )
        
        # Add sentiment as a regressor
        model.add_regressor('sentiment')
        
        # Fit the model
        model.fit(pandas_df)
        
        # Create future dates dataframe
        future = model.make_future_dataframe(periods=forecast_days)
        
        # Add sentiment predictions for future dates
        # Using the most recent sentiment score for future predictions
        future['sentiment'] = pandas_df['sentiment'].iloc[-1]
        
        # Make predictions
        forecast = model.predict(future)
        
        # Get only the prediction period data
        prediction_data = forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(forecast_days)
        print(f"Prediction data head: {prediction_data.head()}")  # Debug log
        
        prediction_result = {
            "dates": prediction_data['ds'].dt.strftime('%Y-%m-%d').tolist(),
            "predicted_prices": prediction_data['yhat'].round(2).tolist(),
            "lower_bound": prediction_data['yhat_lower'].round(2).tolist(),
            "upper_bound": prediction_data['yhat_upper'].round(2).tolist()
        }
        
        print(f"Generated prediction result: {prediction_result}")
        
        # Update prediction cache
        _prediction_cache[cache_key] = {
            'prediction': prediction_result,
            'timestamp': datetime.now()
        }
        
        return prediction_result
    except Exception as e:
        print(f"ERROR in prediction: {str(e)}")
        print(f"ERROR traceback: {traceback.format_exc()}")
        raise