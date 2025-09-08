import React from 'react';

const SimpleStockWidget = (props) => {
  const { stockSymbol, years } = props.payload || {};
  
  return (
    <div style={{
      background: '#f3f4f6',
      padding: '16px',
      borderRadius: '8px',
      margin: '8px 0',
      border: '1px solid #e5e7eb'
    }}>
      <h4 style={{ margin: '0 0 8px 0', color: '#1f2937' }}>
        📈 Stock Analysis: {stockSymbol || 'N/A'}
      </h4>
      <p style={{ margin: '0', color: '#6b7280', fontSize: '14px' }}>
        Prediction period: {years || 2} years
      </p>
      <div style={{
        background: '#dbeafe',
        padding: '8px',
        borderRadius: '4px',
        marginTop: '8px',
        fontSize: '12px',
        color: '#1e40af'
      }}>
        Chart will appear here once Chart.js is properly installed
      </div>
    </div>
  );
};

export default SimpleStockWidget;
