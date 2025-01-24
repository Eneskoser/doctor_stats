import React from 'react';
import BaseChart from './BaseChart';
import { Data } from 'plotly.js-dist-min';

interface ScatterPlotProps {
  data: {
    x: number[];
    y: number[];
    regressionLine?: {
      x: number[];
      y: number[];
    };
  };
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

const ScatterPlot: React.FC<ScatterPlotProps> = ({
  data,
  title,
  xLabel,
  yLabel
}) => {
  const plotData: Data[] = [
    {
      type: 'scatter',
      mode: 'markers',
      x: data.x,
      y: data.y,
      name: 'Data Points',
      marker: {
        color: 'blue',
        size: 8,
        opacity: 0.6
      }
    }
  ];

  if (data.regressionLine) {
    plotData.push({
      type: 'scatter',
      mode: 'lines',
      x: data.regressionLine.x,
      y: data.regressionLine.y,
      name: 'Regression Line',
      line: {
        color: 'red',
        width: 2
      }
    });
  }

  const layout = {
    title: title,
    xaxis: { title: xLabel },
    yaxis: { title: yLabel },
    showlegend: true
  };

  return <BaseChart data={plotData} layout={layout} />;
};

export default ScatterPlot; 