import React, { useEffect, useRef } from 'react';
import Plotly from 'plotly.js-dist-min';

interface BaseChartProps {
  data: Plotly.Data[];
  layout?: Partial<Plotly.Layout>;
  config?: Partial<Plotly.Config>;
  style?: React.CSSProperties;
}

const BaseChart: React.FC<BaseChartProps> = ({ 
  data, 
  layout = {}, 
  config = { responsive: true },
  style = { width: '100%', height: '400px' }
}) => {
  const chartRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chartRef.current) {
      Plotly.newPlot(
        chartRef.current,
        data,
        { ...layout, margin: { t: 10, r: 10, b: 50, l: 50, ...layout.margin } },
        config
      );

      return () => {
        if (chartRef.current) {
          Plotly.purge(chartRef.current);
        }
      };
    }
  }, [data, layout, config]);

  return <div ref={chartRef} style={style} />;
};

export default BaseChart; 