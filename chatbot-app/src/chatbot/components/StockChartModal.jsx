import React from "react";
import Plot from "react-plotly.js";

export default function StockChartModal({ chartJSON, onClose }) {
  if (!chartJSON) return null;

  const fig = JSON.parse(chartJSON);

  return (
    <div className="modal">
      <button onClick={onClose}>Close</button>
      <Plot
        data={fig.data}
        layout={fig.layout}
        style={{ width: "100%", height: "600px" }}
      />
    </div>
  );
}













// import { Line } from "react-chartjs-2";

// export default function StockChartModal({ chartData, onClose }) {
//   if (!chartData) return null;

//   return (
//     <div className="modal">
//       <button onClick={onClose}>Close</button>
//       {Object.keys(chartData).map((ticker) => {
//         const data = chartData[ticker];
//         return (
//           <div key={ticker}>
//             <h3>{ticker}</h3>
//             <Line
//               data={{
//                 labels: [...Array(data.historical.length).keys()],
//                 datasets: [
//                   {
//                     label: "Historical",
//                     data: data.historical,
//                     borderColor: "blue",
//                     fill: false,
//                   },
//                   {
//                     label: "Predicted",
//                     data: [...Array(data.historical.length - data.predicted.length).fill(null), ...data.predicted],
//                     borderColor: "green",
//                     fill: false,
//                   },
//                 ],
//               }}
//             />
//           </div>
//         );
//       })}
//     </div>
//   );
// }
