import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  Alert,
} from '@mui/material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import Plot from 'react-plotly.js';
import { useQuery, useMutation } from '@tanstack/react-query';
import { analysisService } from '../../../api/services';
import type { Column, CorrelationResult } from '../../../types/analysis';

interface CorrelationAnalysisProps {
  datasetId: string;
  columns: Column[];
}

const CorrelationAnalysis = ({ datasetId, columns }: CorrelationAnalysisProps) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutate: runAnalysis, data: analysisResult } = useMutation({
    mutationFn: () =>
      analysisService.create({
        datasetId,
        type: 'correlation',
        config: {
          targetColumns: selectedColumns,
        },
      }),
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleColumnChange = (event: any) => {
    setSelectedColumns(event.target.value as string[]);
  };

  const handleAnalyze = () => {
    if (selectedColumns.length < 2) {
      setError('Please select at least two columns for correlation analysis');
      return;
    }
    setError(null);
    runAnalysis();
  };

  const gridColumns: GridColDef[] = [
    { field: 'variable1', headerName: 'Variable 1', flex: 1 },
    { field: 'variable2', headerName: 'Variable 2', flex: 1 },
    {
      field: 'correlation',
      headerName: 'Correlation',
      flex: 1,
      valueFormatter: (params) => params.value.toFixed(4),
    },
    {
      field: 'pValue',
      headerName: 'P-Value',
      flex: 1,
      valueFormatter: (params) => params.value.toFixed(4),
    },
    {
      field: 'significant',
      headerName: 'Significant',
      flex: 1,
      valueFormatter: (params) => (params.value ? 'Yes' : 'No'),
    },
  ];

  const gridRows = analysisResult
    ? (analysisResult.data as CorrelationResult[]).map((result, index) => ({
        id: index,
        ...result,
      }))
    : [];

  const createHeatmapData = () => {
    if (!analysisResult) return null;

    const results = analysisResult.data as CorrelationResult[];
    const uniqueColumns = Array.from(
      new Set(results.flatMap((r) => [r.variable1, r.variable2]))
    ).sort();

    const correlationMatrix = uniqueColumns.map((col1) =>
      uniqueColumns.map((col2) => {
        if (col1 === col2) return 1;
        const result = results.find(
          (r) =>
            (r.variable1 === col1 && r.variable2 === col2) ||
            (r.variable1 === col2 && r.variable2 === col1)
        );
        return result ? result.correlation : 0;
      })
    );

    return {
      z: correlationMatrix,
      x: uniqueColumns,
      y: uniqueColumns,
    };
  };

  const heatmapData = createHeatmapData();

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Correlation Analysis
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Select Columns</InputLabel>
              <Select
                multiple
                value={selectedColumns}
                onChange={handleColumnChange}
                label="Select Columns"
              >
                {columns
                  .filter((col) => col.type === 'numeric')
                  .map((col) => (
                    <MenuItem key={col.name} value={col.name}>
                      {col.name}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleAnalyze}
              disabled={selectedColumns.length < 2}
            >
              Run Analysis
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {analysisResult && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Correlation Matrix
            </Typography>
            {heatmapData && (
              <Plot
                data={[
                  {
                    type: 'heatmap',
                    ...heatmapData,
                    colorscale: 'RdBu',
                    zmin: -1,
                    zmax: 1,
                  },
                ]}
                layout={{
                  title: 'Correlation Heatmap',
                  width: undefined,
                  height: 500,
                  xaxis: { side: 'bottom' },
                  yaxis: { autorange: 'reversed' },
                }}
                style={{ width: '100%' }}
              />
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Significant Correlations
            </Typography>
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={gridRows}
                columns={gridColumns}
                disableRowSelectionOnClick
              />
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default CorrelationAnalysis; 