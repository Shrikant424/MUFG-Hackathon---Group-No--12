from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Dict, Any
from openai import OpenAI
import json
from model import SuperannuationPredictor
import logging

import requests  # or the DeepSeek client
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
import mysql.connector
from fastapi import Depends
from fastapi import FastAPI, Query
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv(dotenv_path=env_path)
API_KEY = os.getenv("Quotes_API")


# --- DB CONNECTION ---
def get_db():
    conn = mysql.connector.connect(
        host=os.getenv("db_host"),
        user=os.getenv("db_user"),
        password=os.getenv("db_pass"),
        database=os.getenv("db_name")
    )
    return conn
def init_db():
    conn = mysql.connector.connect(
        host=os.getenv("db_host"),
        user=os.getenv("db_user"),
        password=os.getenv("db_pass"),
    )
    cursor = conn.cursor()

    # Create database if not exists
    cursor.execute("CREATE DATABASE IF NOT EXISTS UserData")
    cursor.execute("USE UserData")

    # Create users table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Create profiles table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        name VARCHAR(100),
        age INT,
        gender VARCHAR(20),
        occupation VARCHAR(100),
        annualIncome DECIMAL(15,2),
        retirementAgeGoal INT,
        riskTolerance VARCHAR(20),
        investmentKnowledge VARCHAR(50),
        financialGoals TEXT,
        email VARCHAR(100),
        phone VARCHAR(20),
        country VARCHAR(100),
        employmentStatus VARCHAR(50),
        currentSavings DECIMAL(15,2),
        maritalStatus VARCHAR(50),
        numberOfDependents INT,
        educationLevel VARCHAR(100),
        healthStatus VARCHAR(50),
        homeOwnershipStatus VARCHAR(50),
        monthlyExpenses DECIMAL(15,2),
        investmentExperience VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT fk_user FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
    )
    """)

    # Create chat_history table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        context JSON,
        CONSTRAINT fk_users FOREIGN KEY (username) REFERENCES users(username) ON DELETE CASCADE
    )
    """)

    conn.commit()
    cursor.close()
    conn.close()

from contextlib import asynccontextmanager
from fastapi import FastAPI

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    print("Database initialized.")

    yield  

    print("App shutting down...")

# --- Models ---
class UserSignup(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class ChatHistory(BaseModel):
    context: list  

class UserProfile(BaseModel):
    name: str = ""
    age: int
    gender: str
    country: str = ""
    employmentStatus: str = ""
    occupation: str = ""
    annualIncome: float
    currentSavings: float = 0
    monthlyExpenses: float = 0
    retirementAgeGoal: int = 65
    riskTolerance: str = "Medium"
    maritalStatus: str = "Single"
    numberOfDependents: int = 0
    educationLevel: str = "Bachelor's"
    healthStatus: str = "Good"
    homeOwnershipStatus: str = "Own"
    financialGoals: str = "Retirement"
    investmentExperience: str = "Intermediate"
    investmentKnowledge: str = ""
    email: str = ""
    phone: str = ""



app = FastAPI(lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],  
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"],
)

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

@app.post("/chat")
def chat(request: ChatMessage):
    msg = request.message.lower().strip()
    if msg in ["profile", "show my data", "show my profile","profile","my profile","show profile","show me my profile","who am i","whoami"]:
        if request.userData:
            profile_str = "\n".join([f"{k}: {v}" for k, v in request.userData.items()])
            return {"reply": f"Your profile:\n{profile_str}"}
        else:
            return {"reply": "No user profile data found."}
    username = request.userData.get("username") if request.userData else None
    
    llm1_response = callLLM1(request.message, request.userData, username)
    
    from LLM.LLM3 import callLLM3
    llm3_result = callLLM3(userMessage=request.message, userData=request.userData)
    
    return {
        "reply": llm1_response,
        "stock_analysis": llm3_result if llm3_result and llm3_result.get("stock_symbol") else None
    }


@app.post("/explain")
def explain(request: ChatMessage):
    response = callLLM2(request.message, request.userData)
    return {"reply": response}

@app.post("/llm3")
def llm3_endpoint(request: ChatMessage):
    from LLM.LLM3 import callLLM3
    result = callLLM3(userMessage=request.message, userData=request.userData)
    return result

# Stock prediction functions
def get_stock_data(symbol, start_date, end_date):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(start=start_date, end=end_date)
        
        if data.empty:
            raise HTTPException(status_code=404, detail=f"No data found for symbol '{symbol}'. Symbol may be invalid or delisted.")
            
        return data
    except Exception as e:
        if "possibly delisted" in str(e) or "no price data found" in str(e):
            raise HTTPException(status_code=404, detail=f"Symbol '{symbol}' not found or possibly delisted")
        raise HTTPException(status_code=400, detail=f"Error fetching data for '{symbol}': {str(e)}")

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
    
    historical_returns = np.diff(np.log(stock_data['Close'].values[-252:]))
    daily_volatility = np.std(historical_returns)
    
    for i in range(total_days):
        input_sequence = current_sequence[-lookback_period:].reshape(1, lookback_period, 1)
        next_pred_scaled = model.predict(input_sequence, verbose=0)
        next_pred = scaler.inverse_transform(next_pred_scaled)[0][0]
        
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
        return {"error": True, "message": "Stock prediction model not loaded"}

    symbol = request.symbol.upper().strip()
    if not symbol or len(symbol) < 2 or len(symbol) > 5 or not symbol.isalpha():
        return {"error": True, "message": f"Invalid stock symbol: {request.symbol}"}

    try:
        current_date = datetime.now()
        start_date = (current_date - timedelta(days=3*365 + 120)).strftime("%Y-%m-%d")
        end_date = current_date.strftime("%Y-%m-%d")

        stock_data = get_stock_data(symbol, start_date, end_date)

        if stock_data.empty:
            return {"error": True, "message": "No data found for the given symbol"}

        scaler = prepare_data(stock_data)

        future_dates, future_predictions = predict_future_years_realistic(
            stock_model, stock_data, scaler, request.years
        )

        historical_cutoff = datetime.now() - timedelta(days=730)
        if stock_data.index.tz is not None:
            historical_cutoff = historical_cutoff.replace(tzinfo=stock_data.index.tz)

        historical_mask = stock_data.index >= historical_cutoff
        historical_dates = stock_data.index[historical_mask]
        historical_prices = stock_data['Close'].values[historical_mask]

        prediction_std = np.std(np.diff(future_predictions)) * np.sqrt(np.arange(len(future_predictions)))
        uncertainty_upper = future_predictions + prediction_std
        uncertainty_lower = future_predictions - prediction_std

        current_price = stock_data['Close'].iloc[-1]
        final_price = future_predictions[-1]
        total_return = ((final_price - current_price) / current_price) * 100
        annualized_return = (((final_price / current_price) ** (1/request.years)) - 1) * 100

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
            },
            "error": False
        }

    except HTTPException as he:
        return {"error": True, "message": str(he.detail)}
    except Exception as e:
        return {"error": True, "message": f"Prediction failed: {str(e)}"}



# --- Signup ---
@app.post("/signup")
def signup(user: UserSignup):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE username=%s", (user.username,))
    if cursor.fetchone():
        conn.close()
        raise HTTPException(status_code=400, detail="Username already exists")

    cursor.execute("INSERT INTO users (username, password) VALUES (%s, %s)", 
                   (user.username, user.password))
    conn.commit()
    conn.close()
    return {"message": "User created successfully"}


# --- Login ---
@app.post("/login")
def login(user: UserLogin):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT * FROM users WHERE username=%s AND password=%s",
                   (user.username, user.password))
    result = cursor.fetchone()
    conn.close()

    if not result:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    return {"message": "Login successful", "username": user.username}


# --- Get Profile ---
@app.get("/profile/{username}")
def get_profile(username: str):
    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM profiles WHERE username=%s", (username,))
    profile = cursor.fetchone()
    conn.close()
    if not profile:
        return {}
    return profile


# --- Save/Update Profile ---
@app.post("/profile/{username}")
def save_profile(username: str, profile: UserProfile):
    if not username:
        raise HTTPException(status_code=400, detail="Username is required.")

    conn = get_db()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE username=%s", (username,))
    user_exists = cursor.fetchone()
    if not user_exists:
        cursor.close()
        conn.close()
        raise HTTPException(status_code=400, detail="User does not exist.")

    cursor.execute("SELECT * FROM profiles WHERE username=%s", (username,))
    profile_exists = cursor.fetchone()

    if profile_exists:
        cursor.execute("""
            UPDATE profiles SET name=%s, age=%s, gender=%s, occupation=%s, annualIncome=%s,
            retirementAgeGoal=%s, riskTolerance=%s, investmentKnowledge=%s, financialGoals=%s,
            email=%s, phone=%s, country=%s, employmentStatus=%s, currentSavings=%s,
            maritalStatus=%s, numberOfDependents=%s, educationLevel=%s, healthStatus=%s,
            homeOwnershipStatus=%s, monthlyExpenses=%s, investmentExperience=%s
            WHERE username=%s
        """, (
            profile.name, profile.age, profile.gender, profile.occupation, profile.annualIncome,
            profile.retirementAgeGoal, profile.riskTolerance, profile.investmentKnowledge, profile.financialGoals,
            profile.email, profile.phone, profile.country, profile.employmentStatus, profile.currentSavings,
            profile.maritalStatus, profile.numberOfDependents, profile.educationLevel, profile.healthStatus,
            profile.homeOwnershipStatus, profile.monthlyExpenses, profile.investmentExperience,
            username
        ))
    else:
        # Insert
        cursor.execute("""
            INSERT INTO profiles (username, name, age, gender, occupation, annualIncome,
            retirementAgeGoal, riskTolerance, investmentKnowledge, financialGoals,
            email, phone, country, employmentStatus, currentSavings,
            maritalStatus, numberOfDependents, educationLevel, healthStatus,
            homeOwnershipStatus, monthlyExpenses, investmentExperience)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            username, profile.name, profile.age, profile.gender, profile.occupation, profile.annualIncome,
            profile.retirementAgeGoal, profile.riskTolerance, profile.investmentKnowledge, profile.financialGoals,
            profile.email, profile.phone, profile.country, profile.employmentStatus, profile.currentSavings,
            profile.maritalStatus, profile.numberOfDependents, profile.educationLevel, profile.healthStatus,
            profile.homeOwnershipStatus, profile.monthlyExpenses, profile.investmentExperience
        ))

    conn.commit()
    cursor.close()
    conn.close()

    return {"message": "Profile saved successfully"}

@app.get("/api/chat-history/{username}")
def get_chat_history(username: str):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT context FROM chat_history WHERE username = %s", (username,))
        row = cursor.fetchone()
        cursor.close()
        conn.close()

        if not row:
            return {"context": []}

        return {"context": row["context"] or []}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to fetch chat history")

@app.post("/api/store-history/{username}")
def store_chat_history(username: str, chat_history: ChatHistory):
    try:
        conn = get_db()
        cursor = conn.cursor()

        context_json = json.dumps(chat_history.context)

        cursor.execute("SELECT username FROM chat_history WHERE username = %s", (username,))
        row = cursor.fetchone()

        if row:
            cursor.execute(
                "UPDATE chat_history SET context = %s WHERE username = %s",
                (context_json, username)
            )
        else:
            cursor.execute(
                "INSERT INTO chat_history (username, context) VALUES (%s, %s)",
                (username, context_json)
            )

        conn.commit()
        cursor.close()
        conn.close()
        return {"status": "success", "message": "Chat history saved."}

    except Exception as e:
        print(e)
        raise HTTPException(status_code=500, detail="Failed to store chat history")

@app.get("/")
async def root():
    return {"message": "MUFG Financial Assistant API is running"}

@app.get("/quote")
def get_quote():
    url = "https://api.api-ninjas.com/v1/quotes"
    headers = {"X-Api-Key": API_KEY}
    response = requests.get(url, headers=headers)

    if response.status_code != 200:
        return {"error": "Failed to fetch quote", "status": response.status_code}

    quotes = response.json()  # this is a list
    if quotes:
        return {"quote": quotes[0].get("quote"), "author": quotes[0].get("author")}
    return {"quote": "No quote available", "author": ""}


superannuation_predictor = SuperannuationPredictor()

try:
    if superannuation_predictor.load_models():
        print("Superannuation ML models loaded successfully")
    else:
        print("No pre-trained superannuation models found - using fallback predictions")
except Exception as e:
    print(f"Error loading superannuation models: {e}")

class SuperannuationProfile(BaseModel):
    age: int
    annual_income: float
    current_savings: float = 0
    retirement_age_goal: int = 65
    risk_tolerance: str = "Medium"
    gender: str = "Male"
    country: str = "Australia"
    employment_status: str = "Full-time"
    marital_status: str = "Single"
    dependents: int = 0

class InvestmentAllocation(BaseModel):
    australian_shares: float = 0.4
    international_shares: float = 0.3
    australian_bonds: float = 0.15
    international_bonds: float = 0.1
    property_reits: float = 0.05
    cash: float = 0.0

@app.post("/api/superannuation-predictions")
async def get_superannuation_predictions(
    profile: SuperannuationProfile,
    allocation: InvestmentAllocation = None
):
    try:
        if allocation is None:
            if profile.risk_tolerance.lower() == "high":
                allocation_dict = {
                    "Australian Shares": 0.5,
                    "International Shares": 0.3,
                    "Property/REITs": 0.1,
                    "Australian Bonds": 0.05,
                    "International Bonds": 0.05,
                    "Cash": 0.0
                }
            elif profile.risk_tolerance.lower() == "low":
                allocation_dict = {
                    "Australian Shares": 0.2,
                    "International Shares": 0.1,
                    "Australian Bonds": 0.35,
                    "International Bonds": 0.25,
                    "Property/REITs": 0.05,
                    "Cash": 0.05
                }
            else:  # Medium
                allocation_dict = {
                    "Australian Shares": 0.35,
                    "International Shares": 0.25,
                    "Australian Bonds": 0.2,
                    "International Bonds": 0.1,
                    "Property/REITs": 0.08,
                    "Cash": 0.02
                }
        else:
            allocation_dict = {
                "Australian Shares": allocation.australian_shares,
                "International Shares": allocation.international_shares,
                "Australian Bonds": allocation.australian_bonds,
                "International Bonds": allocation.international_bonds,
                "Property/REITs": allocation.property_reits,
                "Cash": allocation.cash
            }
        
        user_profile = {
            "age": profile.age,
            "annual_income": profile.annual_income,
            "current_savings": profile.current_savings,
            "retirement_age_goal": profile.retirement_age_goal,
            "risk_tolerance": profile.risk_tolerance,
            "gender": profile.gender,
            "country": profile.country,
            "employment_status": profile.employment_status,
            "marital_status": profile.marital_status,
            "dependents": profile.dependents
        }
        
        predictions = superannuation_predictor.predict_future_value(
            user_profile, allocation_dict
        )
        
        portfolio_evaluation = superannuation_predictor.evaluate_portfolio(
            user_profile, allocation_dict
        )
        
        feature_importance = superannuation_predictor.get_feature_importance()
        
        return {
            "success": True,
            "predictions": predictions,
            "portfolio_evaluation": portfolio_evaluation,
            "feature_importance": feature_importance,
            "allocation_used": allocation_dict
        }
        
    except Exception as e:
        logging.error(f"Error generating superannuation predictions: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "Failed to generate predictions. Please try again."
        }

@app.get("/api/profile-with-predictions/{username}")
async def get_profile_with_predictions(username: str):
    try:
        conn = get_db()
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM profiles WHERE username=%s", (username,))
        profile = cursor.fetchone()
        conn.close()
        
        if not profile:
            return {"profile": {}, "predictions": None}
        
        superannuation_profile = SuperannuationProfile(
            age=profile.get('age', 30),
            annual_income=profile.get('annualIncome', 50000),
            current_savings=profile.get('currentSavings', 10000),
            retirement_age_goal=profile.get('retirementAgeGoal', 65),
            risk_tolerance=profile.get('riskTolerance', 'Medium'),
            gender=profile.get('gender', 'Male'),
            country=profile.get('country', 'Australia'),
            employment_status=profile.get('employmentStatus', 'Full-time'),
            marital_status=profile.get('maritalStatus', 'Single'),
            dependents=profile.get('numberOfDependents', 0)
        )
        
        # Get predictions
        prediction_response = await get_superannuation_predictions(superannuation_profile)
        
        return {
            "profile": profile,
            "predictions": prediction_response if prediction_response["success"] else None
        }
        
    except Exception as e:
        logging.error(f"Error getting profile with predictions: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/train-model")
async def train_model(training_data: dict = None):
    """
    Endpoint to train or retrain the ML model
    This is optional and would typically be used by administrators
    """
    try:
        if not training_data:
            return {"error": "No training data provided"}
        
        df = pd.DataFrame(training_data)
        
        training_results = superannuation_predictor.train(df)
        
        return {
            "success": True,
            "training_results": training_results,
            "message": "Model training completed"
        }
        
    except Exception as e:
        logging.error(f"Error training model: {str(e)}")
        return {
            "success": False,
            "error": str(e),
            "message": "Model training failed"
        }