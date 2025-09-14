import React from "react";
import Modal from "react-modal";
import Plot from "react-plotly.js";

Modal.setAppElement("#root");

const ChartModal = ({ isOpen, onClose, chartData }) => {
  if (!chartData) return null;
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Stock Prediction Chart"
      style={{ content: { maxWidth: 900, margin: "auto" } }}
    >
      <button onClick={onClose} style={{ float: "right" }}>Close</button>
      <h2>Stock Prediction Charts</h2>
      {Object.entries(chartData).map(([symbol, result]) =>
        result.plotly_json ? (
          <div key={symbol} style={{ marginBottom: 40 }}>
            <h3>{symbol}</h3>
            <Plot data={JSON.parse(result.plotly_json).data}
                  layout={JSON.parse(result.plotly_json).layout} />
            <div style={{ marginTop: 10 }}>
              <strong>Current Price:</strong> ${result.current_price.toFixed(2)}<br/>
              <strong>Predicted Final Price:</strong> ${result.final_predicted_price.toFixed(2)}<br/>
              <strong>Total Return:</strong> {result.total_return.toFixed(1)}%<br/>
              <strong>Annualized Return:</strong> {result.annualized_return.toFixed(1)}%
            </div>
          </div>
        ) : (
          <div key={symbol} style={{ color: "red" }}>Error: {result.error}</div>
        )
      )}
    </Modal>
  );
};

export default ChartModal;
