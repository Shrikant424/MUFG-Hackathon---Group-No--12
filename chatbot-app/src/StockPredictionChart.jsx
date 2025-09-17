import React, { useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import './StockPredictionChart.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StockPredictionChart = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [chartData, setChartData] = useState(null);
  const [predictionStats, setPredictionStats] = useState(null);
  const [stockSymbol, setStockSymbol] = useState('AAPL');
  const [predictionYears, setPredictionYears] = useState(2);

  const fetchPredictions = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8000/predict-stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: stockSymbol,
          years: predictionYears
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch predictions');
      }

      const data = await response.json();
      
      const formattedData = {
        labels: [...data.historical_dates, ...data.future_dates],
        datasets: [
          {
            label: 'Historical Prices',
            data: data.historical_prices.map((price, index) => ({
              x: data.historical_dates[index],
              y: price
            })),
            borderColor: 'rgb(54, 162, 235)',
            backgroundColor: 'rgba(54, 162, 235, 0.1)',
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: `Predicted Prices (${predictionYears} Years)`,
            data: data.future_predictions.map((price, index) => ({
              x: data.future_dates[index],
              y: price
            })),
            borderColor: 'rgb(255, 99, 132)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 2,
            borderDash: [5, 5],
            tension: 0.1,
            pointRadius: 0,
            pointHoverRadius: 4,
          },
          {
            label: 'Uncertainty Band',
            data: data.uncertainty_upper.map((price, index) => ({
              x: data.future_dates[index],
              y: price
            })),
            borderColor: 'rgba(255, 99, 132, 0.3)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 1,
            fill: '+1',
            pointRadius: 0,
          },
          {
            label: 'Uncertainty Band Lower',
            data: data.uncertainty_lower.map((price, index) => ({
              x: data.future_dates[index],
              y: price
            })),
            borderColor: 'rgba(255, 99, 132, 0.3)',
            backgroundColor: 'rgba(255, 99, 132, 0.1)',
            borderWidth: 1,
            fill: false,
            pointRadius: 0,
          }
        ]
      };

      setChartData(formattedData);
      setPredictionStats(data.stats);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      alert('Failed to fetch predictions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          filter: (legendItem) => {
            return legendItem.text !== 'Uncertainty Band Lower';
          }
        }
      },
      title: {
        display: true,
        text: `${stockSymbol} Stock Price Prediction`,
        font: {
          size: 18,
          weight: 'bold'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.dataset.label}: $${context.parsed.y.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      x: {
        type: 'category',
        title: {
          display: true,
          text: 'Date'
        },
        ticks: {
          maxTicksLimit: 10
        }
      },
      y: {
        title: {
          display: true,
          text: 'Price ($)'
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          }
        }
      }
    }
  };

  return (
    <div className="stock-prediction-container">
      <div className="prediction-controls">
        <h2>Stock Price Prediction</h2>
        
        <div className="input-group">
          <label htmlFor="stockSymbol">Stock Symbol:</label>
          <input
            type="text"
            id="stockSymbol"
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
            placeholder="e.g., AAPL, GOOGL, MSFT"
            disabled={isLoading}
          />
        </div>

        <div className="input-group">
          <label htmlFor="predictionYears">Prediction Years:</label>
          <select
            id="predictionYears"
            value={predictionYears}
            onChange={(e) => setPredictionYears(parseInt(e.target.value))}
            disabled={isLoading}
          >
            <option value={1}>1 Year</option>
            <option value={2}>2 Years</option>
            <option value={5}>5 Years</option>
            <option value={10}>10 Years</option>
          </select>
        </div>

        <button 
          className="predict-button"
          onClick={fetchPredictions}
          disabled={isLoading}
        >
          {isLoading ? 'Generating Predictions...' : 'Generate Prediction'}
        </button>
      </div>

      {chartData && (
        <div className="chart-container">
          <div className="chart-wrapper">
            <Line data={chartData} options={chartOptions} />
          </div>
          
          {predictionStats && (
            <div className="prediction-stats">
              <h3>Prediction Summary</h3>
              <div className="stats-grid">
                <div className="stat-item">
                  <span className="stat-label">Current Price:</span>
                  <span className="stat-value">${predictionStats.current_price?.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Predicted Final Price:</span>
                  <span className="stat-value">${predictionStats.final_price?.toFixed(2)}</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Total Return:</span>
                  <span className={`stat-value ${predictionStats.total_return >= 0 ? 'positive' : 'negative'}`}>
                    {predictionStats.total_return?.toFixed(1)}%
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Annualized Return:</span>
                  <span className={`stat-value ${predictionStats.annualized_return >= 0 ? 'positive' : 'negative'}`}>
                    {predictionStats.annualized_return?.toFixed(1)}%
                  </span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Predicted Volatility:</span>
                  <span className="stat-value">{predictionStats.volatility?.toFixed(1)}%</span>
                </div>
                <div className="stat-item">
                  <span className="stat-label">Max Drawdown:</span>
                  <span className="stat-value negative">{predictionStats.max_drawdown?.toFixed(1)}%</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Generating predictions... This may take a few moments.</p>
        </div>
      )}
    </div>
  );
};

export default StockPredictionChart;
