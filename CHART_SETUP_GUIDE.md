# MUFG Stock Prediction Chart Setup Guide

This guide will help you set up the stock prediction chart functionality in your MUFG application.

## Prerequisites

Make sure you have the following installed:
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- npm or yarn

## Installation Steps

### 1. Install Frontend Dependencies

Navigate to the chatbot-app directory and install the new Chart.js dependencies:

```bash
cd chatbot-app
npm install chart.js react-chartjs-2
```

Or if you prefer to install all dependencies:

```bash
npm install
```

### 2. Install Backend Dependencies

Navigate to the chatbot-app-backend directory and install the required Python packages:

```bash
cd ../chatbot-app-backend
pip install -r requirements.txt
```

### 3. Verify Model File

Make sure the `Share_Prediction.h5` model file is present in the root directory (`MUFG/Share_Prediction.h5`).

### 4. Start the Backend Server

From the chatbot-app-backend directory:

```bash
python main.py
```

The backend will start on `http://localhost:8000`

### 5. Start the Frontend Development Server

From the chatbot-app directory:

```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## How to Use

1. **Fill out the user form** - Complete the initial user data form
2. **Navigate to Stock Predictions** - Click the "Stock Predictions" button in the navigation
3. **Enter stock symbol** - Type a stock symbol (e.g., AAPL, GOOGL, MSFT)
4. **Select prediction timeframe** - Choose 1, 2, 5, or 10 years
5. **Generate predictions** - Click "Generate Prediction" button
6. **View results** - See the interactive chart with historical data, predictions, and statistics

## Features

- **Interactive Charts**: Historical prices with future predictions
- **Uncertainty Bands**: Visual representation of prediction confidence
- **Comprehensive Statistics**: Returns, volatility, and risk metrics
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Data**: Fetches current stock data from Yahoo Finance

## Troubleshooting

### Common Issues:

1. **Model not loading**: Ensure `Share_Prediction.h5` is in the correct location
2. **CORS errors**: Make sure the backend is running on port 8000
3. **Chart not displaying**: Verify Chart.js dependencies are installed
4. **Stock data errors**: Check internet connection and stock symbol validity

### Dependencies Issues:

If you encounter dependency conflicts, try:

```bash
# Frontend
cd chatbot-app
rm -rf node_modules package-lock.json
npm install

# Backend
cd ../chatbot-app-backend
pip install --upgrade -r requirements.txt
```

## API Endpoints

- `POST /predict-stock`: Generate stock predictions
- `POST /chat`: Chatbot functionality
- `POST /explain`: Explanation functionality

## Chart Features

- **Historical Data**: Last 2 years of actual stock prices
- **Future Predictions**: ML-generated price forecasts
- **Uncertainty Visualization**: Confidence bands around predictions
- **Performance Metrics**: Returns, volatility, drawdown analysis
- **Interactive Tooltips**: Hover for detailed price information

Enjoy using the MUFG Stock Prediction Chart! 📈
