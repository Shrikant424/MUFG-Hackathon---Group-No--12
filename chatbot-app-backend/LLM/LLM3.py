from openai import OpenAI
import requests
import os
from pandas import read_csv
from dotenv import load_dotenv
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '.env'))
load_dotenv(dotenv_path=env_path)

prompt = """
You are a stock symbol extraction specialist. Your ONLY job is to identify valid stock ticker symbols from user messages.

CRITICAL RULES:
1. Extract ONLY valid NYSE/NASDAQ stock ticker symbols (2-5 uppercase letters like AAPL, GOOGL, TSLA)
2. Convert company names to their correct stock symbols (e.g., "Apple" -> "AAPL", "Tesla" -> "TSLA")
3. If multiple symbols are mentioned, return the FIRST valid one
4. If NO valid stock symbols are found, return exactly "NONE"
5. Return ONLY the stock symbol, nothing else - no explanations, no punctuation
6. Do NOT return country names, currencies, or non-company terms
7. Do NOT return symbols like NIL, NULL, EMPTY, NO, YES

Valid stock symbols are:
- 2-5 letters only (A-Z)
- Real publicly traded companies
- No special characters or numbers

Common company mappings:
- Apple -> AAPL
- Google/Alphabet -> GOOGL  
- Microsoft -> MSFT
- Tesla -> TSLA
- Amazon -> AMZN
- Meta/Facebook -> META
- NVIDIA -> NVDA
- Netflix -> NFLX

Examples:
User: "What's Apple's stock price?"
You: AAPL

User: "I want to invest in Tesla"
You: TSLA

User: "How is my retirement plan?"
You: NONE

User: "Show me GOOGLE analysis"
You: GOOGL

User: "What about NIL investment?"
You: NONE
"""

def callLLM3(userMessage: str = None, llm2_response: str = None, userData: dict = None, conversation_history: list = None):
    """
    Extract stock symbols from either user message or LLM2 response and trigger model predictions
    
    Args:
        userMessage: Original user message (optional)
        llm2_response: Response from LLM2 to analyze for stock symbols
        userData: User profile data
        conversation_history: Previous conversation context
    
    Returns:
        dict: Contains stock symbol and prediction data if found
    """
    client = OpenAI(
        base_url="https://openrouter.ai/api/v1",
        api_key="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"
    )

    text_to_analyze = llm2_response if llm2_response else userMessage
    
    if not text_to_analyze:
        return {"stock_symbol": "", "prediction_data": None, "error": "No text provided for analysis"}

    if userData:
        user_profile_str = "\n".join([f"{k}: {v}" for k, v in userData.items()])
        user_profile_section = f"\n\nUser Profile:\n{user_profile_str}\n"
    else:
        user_profile_section = "\n\nUser Profile: (not provided)\n"

    messages = [
        {"role": "system", "content": prompt + user_profile_section}
    ]

    if conversation_history:
        recent_history = conversation_history[-1:]
        messages.extend(recent_history)

    messages.append({"role": "user", "content": text_to_analyze})

    try:
        response = client.chat.completions.create(
            model="deepseek/deepseek-r1-0528-qwen3-8b",
            messages=messages
        )

        assistant_reply = response.choices[0].message.content.strip()

        if assistant_reply.upper() == "NONE":
            return {"stock_symbol": "", "prediction_data": None}
        
        stock_symbol = assistant_reply.upper().replace("$", "").strip()
        
        if not stock_symbol.isalpha() or len(stock_symbol) < 2 or len(stock_symbol) > 5:
            print(f"Invalid stock symbol extracted: '{assistant_reply}' -> '{stock_symbol}'")
            return {"stock_symbol": "", "prediction_data": None}
        
        invalid_symbols = ["NONE", "NIL", "NULL", "EMPTY", "NO", "YES", "THE", "AND", "OR"]
        if stock_symbol in invalid_symbols:
            print(f"Filtered out invalid symbol: {stock_symbol}")
            return {"stock_symbol": "", "prediction_data": None}

        if conversation_history is not None:
            conversation_history.append({"role": "user", "content": text_to_analyze})
            conversation_history.append({"role": "assistant", "content": assistant_reply})

        stock_symbol = assistant_reply.upper()
        prediction_data = None
        
        try:
            prediction_response = requests.post(
                "http://localhost:8000/predict-stock",
                json={"symbol": stock_symbol, "years": 2},
                headers={"Content-Type": "application/json"},
                timeout=30  
            )
            
            if prediction_response.status_code == 200:
                prediction_data = prediction_response.json()
            else:
                print(f"Prediction API error: {prediction_response.status_code}")
                
        except Exception as e:
            print(f"Error calling prediction API: {e}")

        return {
            "stock_symbol": stock_symbol,
            "prediction_data": prediction_data,
            "source": "llm2_response" if llm2_response else "user_message"
        }

    except Exception as e:
        print(f"Error in callLLM3: {e}")
        return {"stock_symbol": "", "prediction_data": None, "error": str(e)}
