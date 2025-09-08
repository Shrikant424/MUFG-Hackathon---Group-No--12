from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any
from openai import OpenAI  # or the DeepSeek client
from LLM.LLM1 import callLLM1
from LLM.LLM2 import callLLM2
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
from tensorflow.keras.models import load_model
from datetime import datetime, timedelta
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  # React dev server (Vite)
    allow_credentials=True,
    allow_methods=["*"],   # allow POST, GET, OPTIONS etc.
    allow_headers=["*"],
)

# Load the ML model once at startup
try:
    model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'Share_Prediction.h5')
    stock_model = load_model(model_path)
    print(f"Stock prediction model loaded successfully from {model_path}")
except Exception as e:
    print(f"Error loading model: {e}")
    stock_model = None

class ChatMessage(BaseModel):
    message: str
    userData: dict = {}

class PredictionRequest(BaseModel):
    symbol: str
    years: int = 2

# class ChatRequest(BaseModel):
#     conversation: List[ChatMessage]
#     query: str
#     max_history: int = 10


# def build_context_messages(conversation: List[Dict[str, Any]], current_query: str, max_history: int = 10):
#     """Convert chat history + new query into OpenAI-style messages."""
#     trimmed_history = conversation[-max_history:]
#     history_text = "\n".join([f"{m['role'].capitalize()}: {m['content']}" for m in trimmed_history])

#     messages = [
#         {
#             "role": "system",
#             "content": f"Here is the previous conversation for context:\n{history_text}\n"
#         },
#         {
#             "role": "user",
#             "content": current_query
#         }
#     ]
#     return messages



@app.post("/chat")
def chat(request: ChatMessage):
    # If user asks for profile or to show data, return userData directly
    msg = request.message.lower().strip()
    if msg in ["profile", "show my data", "show my profile"]:
        if request.userData:
            profile_str = "\n".join([f"{k}: {v}" for k, v in request.userData.items()])
            return {"reply": f"Your profile:\n{profile_str}"}
        else:
            return {"reply": "No user profile data found."}
    # Otherwise, pass userData to LLM1 if needed
    response = callLLM1(request.message, request.userData)
    return {"reply": response}


@app.post("/explain")
def explain(request: ChatMessage):
    response = callLLM2(request.message, request.userData)
    return {"reply": response}

# Stock prediction functions
def get_stock_data(symbol, start_date, end_date):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(start=start_date, end=end_date)
        return data
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error fetching data: {str(e)}")

def prepare_data(stock_data, lookback_period=60):
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(stock_data['Close'].values.reshape(-1, 1))
    return scaler

def predict_future_years_realistic(model, stock_data, scaler, years=2, lookback_period=60):
    last_sequence = stock_data['Close'].values[-lookback_period:]
    last_sequence_scaled = scaler.transform(last_sequence.reshape(-1, 1))
    
    trading_days_per_year = 252
    total_days = years * trading_days_per_year
    
    last_date = stock_data.index[-1]
    future_dates = pd.bdate_range(start=last_date + timedelta(days=1), periods=total_days)
    
    predictions = []
    current_sequence = last_sequence_scaled.flatten()
    
    # Calculate historical volatility
    historical_returns = np.diff(np.log(stock_data['Close'].values[-252:]))
    daily_volatility = np.std(historical_returns)
    
    for i in range(total_days):
        input_sequence = current_sequence[-lookback_period:].reshape(1, lookback_period, 1)
        next_pred_scaled = model.predict(input_sequence, verbose=0)
        next_pred = scaler.inverse_transform(next_pred_scaled)[0][0]
        
        # Add realistic volatility
        if i > 0:
            random_return = np.random.normal(0, daily_volatility)
            volatility_adjustment = next_pred * random_return
            next_pred = next_pred + volatility_adjustment
            
            prev_price = predictions[-1] if predictions else stock_data['Close'].iloc[-1]
            max_change = prev_price * 0.2
            next_pred = np.clip(next_pred, prev_price - max_change, prev_price + max_change)
            next_pred = max(next_pred, prev_price * 0.5)
        
        predictions.append(next_pred)
        next_pred_scaled = scaler.transform([[next_pred]])[0][0]
        current_sequence = np.append(current_sequence, next_pred_scaled)
    
    return future_dates, np.array(predictions)

@app.post("/predict-stock")
async def predict_stock(request: PredictionRequest):
    if stock_model is None:
        raise HTTPException(status_code=500, detail="Stock prediction model not loaded")
    
    try:
        # Fetch historical data
        current_date = datetime.now()
        start_date = (current_date - timedelta(days=3*365 + 120)).strftime("%Y-%m-%d")
        end_date = current_date.strftime("%Y-%m-%d")
        
        stock_data = get_stock_data(request.symbol, start_date, end_date)
        
        if stock_data.empty:
            raise HTTPException(status_code=404, detail="No data found for the given symbol")
        
        # Prepare data
        scaler = prepare_data(stock_data)
        
        # Make predictions
        future_dates, future_predictions = predict_future_years_realistic(
            stock_model, stock_data, scaler, request.years
        )
        
        # Get historical data for chart (last 2 years)
        historical_cutoff = datetime.now() - timedelta(days=730)
        if stock_data.index.tz is not None:
            historical_cutoff = historical_cutoff.replace(tzinfo=stock_data.index.tz)
        
        historical_mask = stock_data.index >= historical_cutoff
        historical_dates = stock_data.index[historical_mask]
        historical_prices = stock_data['Close'].values[historical_mask]
        
        # Calculate uncertainty bands
        prediction_std = np.std(np.diff(future_predictions)) * np.sqrt(np.arange(len(future_predictions)))
        uncertainty_upper = future_predictions + prediction_std
        uncertainty_lower = future_predictions - prediction_std
        
        # Calculate statistics
        current_price = stock_data['Close'].iloc[-1]
        final_price = future_predictions[-1]
        total_return = ((final_price - current_price) / current_price) * 100
        annualized_return = (((final_price / current_price) ** (1/request.years)) - 1) * 100
        
        # Calculate volatility and max drawdown
        daily_returns = np.diff(future_predictions) / future_predictions[:-1]
        predicted_volatility = np.std(daily_returns) * np.sqrt(252) * 100
        
        cumulative_returns = np.cumprod(1 + daily_returns)
        max_drawdown = np.min(np.minimum.accumulate(cumulative_returns / np.maximum.accumulate(cumulative_returns)) - 1) * 100
        
        return {
            "historical_dates": [date.strftime("%Y-%m-%d") for date in historical_dates],
            "historical_prices": historical_prices.tolist(),
            "future_dates": [date.strftime("%Y-%m-%d") for date in future_dates],
            "future_predictions": future_predictions.tolist(),
            "uncertainty_upper": uncertainty_upper.tolist(),
            "uncertainty_lower": uncertainty_lower.tolist(),
            "stats": {
                "current_price": float(current_price),
                "final_price": float(final_price),
                "total_return": float(total_return),
                "annualized_return": float(annualized_return),
                "volatility": float(predicted_volatility),
                "max_drawdown": float(max_drawdown)
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/")
async def root():
    return {"message": "MUFG Financial Assistant API is running"}