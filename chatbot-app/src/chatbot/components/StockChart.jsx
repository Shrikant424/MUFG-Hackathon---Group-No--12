import React from 'react';
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
import './StockChart.css';

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

const StockChart = (props) => {
  const { stockSymbol, predictionData, years } = props.payload;

  if (!predictionData) {
    return (
      <div className="stock-chart-error">
        <p>No prediction data available</p>
      </div>
    );
  }

  // Format data for Chart.js
  const chartData = {
    labels: [...predictionData.historical_dates, ...predictionData.future_dates],
    datasets: [
      {
        label: 'Historical Prices',
        data: predictionData.historical_prices.map((price, index) => ({
          x: predictionData.historical_dates[index],
          y: price
        })),
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 2,
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
      {
        label: `Predicted Prices (${years} Years)`,
        data: predictionData.future_predictions.map((price, index) => ({
          x: predictionData.future_dates[index],
          y: price
        })),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        tension: 0.1,
        pointRadius: 0,
        pointHoverRadius: 3,
      },
      {
        label: 'Uncertainty Band',
        data: predictionData.uncertainty_upper.map((price, index) => ({
          x: predictionData.future_dates[index],
          y: price
        })),
        borderColor: 'rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        fill: '+1',
        pointRadius: 0,
      },
      {
        label: 'Uncertainty Lower',
        data: predictionData.uncertainty_lower.map((price, index) => ({
          x: predictionData.future_dates[index],
          y: price
        })),
        borderColor: 'rgba(239, 68, 68, 0.2)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 1,
        fill: false,
        pointRadius: 0,
      }
    ]
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
            return legendItem.text !== 'Uncertainty Lower';
          },
          boxWidth: 12,
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: `${stockSymbol} Stock Price Prediction`,
        font: {
          size: 16,
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
          text: 'Date',
          font: {
            size: 12
          }
        },
        ticks: {
          maxTicksLimit: 8,
          font: {
            size: 10
          }
        }
      },
      y: {
        title: {
          display: true,
          text: 'Price ($)',
          font: {
            size: 12
          }
        },
        ticks: {
          callback: function(value) {
            return '$' + value.toFixed(0);
          },
          font: {
            size: 10
          }
        }
      }
    }
  };

  const stats = predictionData.stats;

  return (
    <div className="stock-chart-widget">
      <div className="chart-container">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="prediction-summary">
        <h4>📊 Prediction Summary</h4>
        <div className="stats-row">
          <div className="stat-item">
            <span className="label">Current:</span>
            <span className="value">${stats.current_price?.toFixed(2)}</span>
          </div>
          <div className="stat-item">
            <span className="label">Predicted ({years}y):</span>
            <span className="value">${stats.final_price?.toFixed(2)}</span>
          </div>
        </div>
        
        <div className="stats-row">
          <div className="stat-item">
            <span className="label">Total Return:</span>
            <span className={`value ${stats.total_return >= 0 ? 'positive' : 'negative'}`}>
              {stats.total_return?.toFixed(1)}%
            </span>
          </div>
          <div className="stat-item">
            <span className="label">Annual Return:</span>
            <span className={`value ${stats.annualized_return >= 0 ? 'positive' : 'negative'}`}>
              {stats.annualized_return?.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="stats-row">
          <div className="stat-item">
            <span className="label">Volatility:</span>
            <span className="value">{stats.volatility?.toFixed(1)}%</span>
          </div>
          <div className="stat-item">
            <span className="label">Max Drawdown:</span>
            <span className="value negative">{stats.max_drawdown?.toFixed(1)}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockChart;
