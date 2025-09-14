import spacy
import requests
import re

def extract_stock_names(text: str):
    return re.findall(r'\b[A-Z]{1,5}\b', text)

import requests

def get_symbol_from_name(name: str):
    API_KEY = "d2utt4hr01qq994h9i9gd2utt4hr01qq994h9ia0"
 
    url = f"https://finnhub.io/api/v1/search?q={name}&token={API_KEY}"
    resp = requests.get(url).json()
    if resp["result"]:
        print(resp["result"][0]["symbol"])  # e.g., AAPL