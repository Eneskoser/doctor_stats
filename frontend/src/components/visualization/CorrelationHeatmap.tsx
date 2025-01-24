import React from 'react';
import BaseChart from './BaseChart';
import { Data } from 'plotly.js-dist-min';

interface CorrelationHeatmapProps {
  correlationMatrix: number[][];
  labels: string[];
  title?: string;
}

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({
  correlationMatrix,
  labels,
  title
}) => {
  const plotData: Data[] = [{
    type: 'heatmap',
    z: correlationMatrix,
    x: labels,
    y: labels,
    colorscale: 'RdBu',
    zmin: -1,
    zmax: 1,
    customdata: correlationMatrix.map(row => 
      row.map(val => val.toFixed(2))
    ),
    hovertemplate: '%{customdata}<extra></extra>',
    hoverongaps: false,
    showscale: true
  }];

  const layout = {
    title: title,
    width: 800,
    height: 800,
    xaxis: {
      tickangle: -45
    },
    yaxis: {
      tickangle: 0
    }
  };

  return <BaseChart data={plotData} layout={layout} />;
};

export default CorrelationHeatmap; 