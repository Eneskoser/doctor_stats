import React from 'react';
import BaseChart from './BaseChart';
import { Data } from 'plotly.js-dist-min';

interface BoxPlotProps {
  data: Array<{
    values: number[];
    group?: string;
  }>;
  title?: string;
  xLabel?: string;
  yLabel?: string;
}

const BoxPlot: React.FC<BoxPlotProps> = ({
  data,
  title,
  xLabel,
  yLabel
}) => {
  const plotData: Data[] = data.map((item) => ({
    type: 'box',
    y: item.values,
    name: item.group || '',
    boxpoints: 'outliers'
  }));

  const layout = {
    title: title,
    xaxis: { title: xLabel },
    yaxis: { title: yLabel }
  };

  return <BaseChart data={plotData} layout={layout} />;
};

export default BoxPlot; 