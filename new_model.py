from tensorflow.keras.models import load_model
import pandas as pd
import numpy as np
import yfinance as yf
from sklearn.preprocessing import MinMaxScaler
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import pytz

loaded_model = load_model('Share_Prediction.h5')
loaded_model.summary()

# Function to prepare data for prediction
def prepare_data(stock_data, lookback_period=60):
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(stock_data['Close'].values.reshape(-1, 1))
    
    X_test = []
    for i in range(lookback_period, len(scaled_data)):
        X_test.append(scaled_data[i-lookback_period:i, 0])
    
    X_test = np.array(X_test)
    X_test = np.reshape(X_test, (X_test.shape[0], X_test.shape[1], 1))
    
    return X_test, scaler

# Function to get stock data
def get_stock_data(symbol, start_date, end_date):
    try:
        ticker = yf.Ticker(symbol)
        data = ticker.history(start=start_date, end=end_date)
        return data
    except Exception as e:
        print(f"Error fetching data: {e}")
        return None

# Function to make predictions
def predict_stock_price(model, X_test, scaler):
    predictions = model.predict(X_test)
    predictions = scaler.inverse_transform(predictions)
    return predictions

# Function to add realistic volatility and noise
def add_realistic_volatility(predictions, stock_data, volatility_factor=1.0):
    """
    Add realistic volatility to predictions based on historical data
    """
    # Calculate historical volatility
    historical_returns = np.diff(np.log(stock_data['Close'].values))
    historical_volatility = np.std(historical_returns)
    
    # Generate random walks with realistic volatility
    np.random.seed(42)  # For reproducible results
    random_returns = np.random.normal(0, historical_volatility * volatility_factor, len(predictions))
    
    # Apply cumulative random walk to predictions
    realistic_predictions = predictions.copy()
    for i in range(1, len(predictions)):
        # Add some random noise while maintaining the trend
        noise = random_returns[i] * realistic_predictions[i-1]
        realistic_predictions[i] = realistic_predictions[i] + noise
        
        # Ensure prices don't go negative
        realistic_predictions[i] = max(realistic_predictions[i], realistic_predictions[i-1] * 0.5)
    
    return realistic_predictions

# Function to simulate market cycles
def add_market_cycles(predictions, years=10, cycle_strength=0.15):
    """
    Add market cycles to make predictions more realistic
    """
    trading_days_per_year = 252
    total_days = len(predictions)
    
    # Create market cycle (bear/bull markets every 3-7 years)
    cycle_length = np.random.randint(3*252, 7*252)  # 3-7 year cycles
    cycle_phase = np.linspace(0, 2 * np.pi * (total_days / cycle_length), total_days)
    
    # Add economic cycles
    economic_cycle = np.sin(cycle_phase) * cycle_strength
    
    # Add shorter-term volatility cycles
    short_cycle = np.sin(cycle_phase * 4) * (cycle_strength * 0.3)
    
    cyclic_predictions = predictions.copy()
    for i in range(len(predictions)):
        cycle_effect = 1 + economic_cycle[i] + short_cycle[i]
        cyclic_predictions[i] = predictions[i] * cycle_effect
    
    return cyclic_predictions

# Enhanced function to predict future prices for next X years
def predict_future_years_realistic(model, stock_data, scaler, years=10, lookback_period=60):
    """
    Predict stock prices for the next X years with realistic volatility
    """
    # Get the last sequence of data
    last_sequence = stock_data['Close'].values[-lookback_period:]
    last_sequence_scaled = scaler.transform(last_sequence.reshape(-1, 1))
    
    # Calculate total days to predict
    trading_days_per_year = 252
    total_days = years * trading_days_per_year
    
    # Generate future dates
    last_date = stock_data.index[-1]
    future_dates = pd.bdate_range(start=last_date + timedelta(days=1), periods=total_days)
    
    predictions = []
    current_sequence = last_sequence_scaled.flatten()
    
    print(f"Predicting {total_days} trading days ({years} years) into the future...")
    
    # Calculate historical volatility for realistic noise
    historical_returns = np.diff(np.log(stock_data['Close'].values[-252:]))  # Last year's data
    daily_volatility = np.std(historical_returns)
    
    for i in range(total_days):
        # Reshape for model input
        input_sequence = current_sequence[-lookback_period:].reshape(1, lookback_period, 1)
        
        # Make prediction
        next_pred_scaled = model.predict(input_sequence, verbose=0)
        next_pred = scaler.inverse_transform(next_pred_scaled)[0][0]
        
        # Add realistic daily volatility
        if i > 0:
            # Generate random daily return based on historical volatility
            random_return = np.random.normal(0, daily_volatility)
            volatility_adjustment = next_pred * random_return
            next_pred = next_pred + volatility_adjustment
            
            # Ensure price doesn't go negative or change too drastically
            prev_price = predictions[-1] if predictions else stock_data['Close'].iloc[-1]
            max_change = prev_price * 0.2  # Maximum 20% daily change
            next_pred = np.clip(next_pred, prev_price - max_change, prev_price + max_change)
            next_pred = max(next_pred, prev_price * 0.5)  # Don't let it fall below 50% of previous
        
        predictions.append(next_pred)
        
        # Update sequence with the new prediction (re-scale it)
        next_pred_scaled = scaler.transform([[next_pred]])[0][0]
        current_sequence = np.append(current_sequence, next_pred_scaled)
        
        # Progress indicator
        if (i + 1) % 252 == 0:
            print(f"Completed year {(i + 1) // 252} prediction...")
    
    predictions = np.array(predictions)
    
    # Add market cycles for long-term realism
    predictions = add_market_cycles(predictions, years)
    
    return future_dates, predictions

# Enhanced plotting function
def plot_historical_and_future_realistic(stock_data, future_dates, future_predictions, symbol, years=10):
    """
    Plot historical data along with realistic future predictions
    """
    plt.figure(figsize=(20, 12))
    
    # Plot historical data (last 2 years for context)
    historical_cutoff = datetime.now() - timedelta(days=730)
    if stock_data.index.tz is not None:
        historical_cutoff = historical_cutoff.replace(tzinfo=stock_data.index.tz)
    
    historical_mask = stock_data.index >= historical_cutoff
    historical_dates = stock_data.index[historical_mask]
    historical_prices = stock_data['Close'].values[historical_mask]
    
    plt.plot(historical_dates, historical_prices, label='Historical Prices (Last 2 Years)', 
             color='blue', linewidth=2, alpha=0.8)
    
    # Plot future predictions with some transparency to show uncertainty
    plt.plot(future_dates, future_predictions, label=f'Predicted Prices (Next {years} Years)', 
             color='red', linewidth=2, alpha=0.7)
    
    # Add confidence bands (simulate uncertainty)
    prediction_std = np.std(np.diff(future_predictions)) * np.sqrt(np.arange(len(future_predictions)))
    upper_band = future_predictions + prediction_std
    lower_band = future_predictions - prediction_std
    
    plt.fill_between(future_dates, lower_band, upper_band, 
                     color='red', alpha=0.2, label='Prediction Uncertainty Band')
    
    # Add vertical line to separate historical and predicted data
    plt.axvline(x=stock_data.index[-1], color='green', linestyle='-', alpha=0.7, 
                linewidth=3, label='Present Day')
    
    plt.title(f'{symbol} Stock Price: Historical + Realistic Future Predictions ({years} Years)', 
              fontsize=16, fontweight='bold')
    plt.xlabel('Date', fontsize=12)
    plt.ylabel('Price ($)', fontsize=12)
    plt.legend(fontsize=12)
    plt.grid(True, alpha=0.3)
    plt.xticks(rotation=45)
    
    # Add summary statistics
    current_price = stock_data['Close'].iloc[-1]
    final_predicted_price = future_predictions[-1]
    total_return = ((final_predicted_price - current_price) / current_price) * 100
    annualized_return = (((final_predicted_price / current_price) ** (1/years)) - 1) * 100
    
    # Calculate realistic volatility metrics
    pred_volatility = np.std(np.diff(future_predictions) / future_predictions[:-1]) * np.sqrt(252) * 100
    
    stats_text = f'Prediction Summary ({years} Years):\n'
    stats_text += f'Current Price: ${current_price:.2f}\n'
    stats_text += f'Predicted Final Price: ${final_predicted_price:.2f}\n'
    stats_text += f'Total Return: {total_return:.1f}%\n'
    stats_text += f'Annualized Return: {annualized_return:.1f}%\n'
    stats_text += f'Predicted Annual Volatility: {pred_volatility:.1f}%'
    
    plt.text(0.02, 0.98, stats_text, transform=plt.gca().transAxes, 
             verticalalignment='top', fontsize=11,
             bbox=dict(boxstyle='round', facecolor='lightyellow', alpha=0.9))
    
    plt.tight_layout()
    plt.show()
    
    return current_price, final_predicted_price, total_return, annualized_return

# Function to analyze yearly predictions
def analyze_yearly_predictions(future_dates, future_predictions, current_price, years=10):
    """
    Analyze predictions year by year
    """
    yearly_analysis = {}
    trading_days_per_year = 252
    
    for year in range(1, years + 1):
        end_idx = year * trading_days_per_year - 1
        if end_idx < len(future_predictions):
            year_end_price = future_predictions[end_idx]
            year_end_date = future_dates[end_idx]
            
            # Calculate returns
            if year == 1:
                year_return = ((year_end_price - current_price) / current_price) * 100
            else:
                prev_year_price = future_predictions[(year-1) * trading_days_per_year - 1]
                year_return = ((year_end_price - prev_year_price) / prev_year_price) * 100
            
            cumulative_return = ((year_end_price - current_price) / current_price) * 100
            
            yearly_analysis[year] = {
                'date': year_end_date,
                'price': year_end_price,
                'year_return': year_return,
                'cumulative_return': cumulative_return,
                'price_change': year_end_price - current_price
            }
    
    return yearly_analysis

if __name__ == "__main__":
    # Configuration
    STOCK_SYMBOL = "AAPL"
    PREDICTION_YEARS = 2
    current_date = datetime.now()
    START_DATE = (current_date - timedelta(days=3*365 + 120)).strftime("%Y-%m-%d")
    END_DATE = current_date.strftime("%Y-%m-%d")
    LOOKBACK_PERIOD = 60
    
    print(f"Fetching historical data for {STOCK_SYMBOL} from {START_DATE} to {END_DATE}...")
    stock_data = get_stock_data(STOCK_SYMBOL, START_DATE, END_DATE)
    
    if stock_data is not None:
        print(f"Data shape: {stock_data.shape}")
        print(f"Date range: {stock_data.index[0]} to {stock_data.index[-1]}")
        print(f"Current price: ${stock_data['Close'].iloc[-1]:.2f}")
        
        # Calculate historical volatility
        historical_returns = np.diff(np.log(stock_data['Close'].values[-252:]))
        historical_volatility = np.std(historical_returns) * np.sqrt(252) * 100
        print(f"Historical Annual Volatility: {historical_volatility:.1f}%")
        
        # Prepare data and scaler
        X_test, scaler = prepare_data(stock_data, LOOKBACK_PERIOD)
        
        # Predict future prices with realistic volatility
        print(f"\nPredicting realistic stock prices for the next {PREDICTION_YEARS} years...")
        future_dates, future_predictions = predict_future_years_realistic(
            loaded_model, stock_data, scaler, PREDICTION_YEARS, LOOKBACK_PERIOD
        )
        
        # Plot results
        print("\nGenerating realistic prediction chart...")
        current_price, final_price, total_return, annualized_return = plot_historical_and_future_realistic(
            stock_data, future_dates, future_predictions, STOCK_SYMBOL, PREDICTION_YEARS
        )
        
        # Yearly analysis
        print(f"\n" + "="*80)
        print(f"REALISTIC YEARLY PREDICTION ANALYSIS FOR {STOCK_SYMBOL}")
        print("="*80)
        
        yearly_analysis = analyze_yearly_predictions(
            future_dates, future_predictions, current_price, PREDICTION_YEARS
        )
        
        print(f"{'Year':<6} {'Date':<12} {'Price':<10} {'Year Return':<12} {'Cumulative Return':<18} {'Price Change':<12}")
        print("-" * 80)
        
        for year, data in yearly_analysis.items():
            print(f"{year:<6} {data['date'].strftime('%Y-%m-%d'):<12} "
                  f"${data['price']:<9.2f} {data['year_return']:<11.1f}% "
                  f"{data['cumulative_return']:<17.1f}% ${data['price_change']:<11.2f}")
        
        # Enhanced summary statistics
        print(f"\n" + "="*60)
        print("REALISTIC PREDICTION SUMMARY")
        print("="*60)
        print(f"Stock Symbol: {STOCK_SYMBOL}")
        print(f"Prediction Period: {PREDICTION_YEARS} years")
        print(f"Current Price: ${current_price:.2f}")
        print(f"Predicted Price in {PREDICTION_YEARS} years: ${final_price:.2f}")
        print(f"Total Expected Return: {total_return:.1f}%")
        print(f"Annualized Return: {annualized_return:.1f}%")
        
        # Enhanced risk assessment
        price_volatility = np.std(future_predictions)
        max_price = np.max(future_predictions)
        min_price = np.min(future_predictions)
        
        # Calculate realistic risk metrics
        daily_returns = np.diff(future_predictions) / future_predictions[:-1]
        max_drawdown = np.min(np.minimum.accumulate(future_predictions / np.maximum.accumulate(future_predictions)) - 1) * 100
        
        print(f"\nEnhanced Risk Assessment:")
        print(f"Predicted Price Volatility (Std Dev): ${price_volatility:.2f}")
        print(f"Predicted Price Range: ${min_price:.2f} - ${max_price:.2f}")
        print(f"Maximum Potential Gain: {((max_price - current_price) / current_price) * 100:.1f}%")
        print(f"Maximum Potential Loss: {((min_price - current_price) / current_price) * 100:.1f}%")
        print(f"Maximum Drawdown: {max_drawdown:.1f}%")
        print(f"Predicted Sharpe Ratio: {(annualized_return / (np.std(daily_returns) * np.sqrt(252) * 100)):.2f}")
        
        # Save predictions to CSV
        prediction_df = pd.DataFrame({
            'Date': future_dates,
            'Predicted_Price': future_predictions
        })
        
        csv_filename = f"{STOCK_SYMBOL}_{PREDICTION_YEARS}year_realistic_predictions.csv"
        prediction_df.to_csv(csv_filename, index=False)
        print(f"\nRealistic predictions saved to: {csv_filename}")
        
    else:
        print("Failed to fetch stock data.")
