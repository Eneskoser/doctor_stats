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
import type { Column, BasicStatistics } from '../../../types/analysis';

interface BasicAnalysisProps {
  datasetId: string;
  columns: Column[];
}

const BasicAnalysis = ({ datasetId, columns }: BasicAnalysisProps) => {
  const [selectedColumns, setSelectedColumns] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  const { mutate: runAnalysis, data: analysisResult } = useMutation({
    mutationFn: () =>
      analysisService.create({
        datasetId,
        type: 'basic',
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
    if (selectedColumns.length === 0) {
      setError('Please select at least one column for analysis');
      return;
    }
    setError(null);
    runAnalysis();
  };

  const gridColumns: GridColDef[] = [
    { field: 'metric', headerName: 'Metric', flex: 1 },
    ...selectedColumns.map((col) => ({
      field: col,
      headerName: col,
      flex: 1,
      valueFormatter: (params) => {
        const value = params.value;
        return typeof value === 'number' ? value.toFixed(4) : value;
      },
    })),
  ];

  const gridRows = analysisResult
    ? [
        { id: 1, metric: 'Count', ...mapStatistic('count') },
        { id: 2, metric: 'Mean', ...mapStatistic('mean') },
        { id: 3, metric: 'Median', ...mapStatistic('median') },
        { id: 4, metric: 'Std Dev', ...mapStatistic('std') },
        { id: 5, metric: 'Min', ...mapStatistic('min') },
        { id: 6, metric: 'Max', ...mapStatistic('max') },
        { id: 7, metric: 'Q1', ...mapStatistic('q1') },
        { id: 8, metric: 'Q3', ...mapStatistic('q3') },
        { id: 9, metric: 'Missing', ...mapStatistic('missing') },
        { id: 10, metric: 'Unique Count', ...mapStatistic('uniqueCount') },
      ]
    : [];

  function mapStatistic(stat: keyof BasicStatistics) {
    if (!analysisResult) return {};
    const result: Record<string, any> = {};
    const stats = analysisResult.data as BasicStatistics;
    selectedColumns.forEach((col) => {
      result[col] = stats[stat];
    });
    return result;
  }

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Basic Statistical Analysis
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
              disabled={selectedColumns.length === 0}
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
              Results
            </Typography>
            <Box sx={{ height: 400 }}>
              <DataGrid
                rows={gridRows}
                columns={gridColumns}
                disableRowSelectionOnClick
                hideFooter
              />
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Distribution Plots
            </Typography>
            <Grid container spacing={2}>
              {selectedColumns.map((col) => (
                <Grid item xs={12} md={6} key={col}>
                  <Plot
                    data={[
                      {
                        type: 'histogram',
                        x: [], // TODO: Add actual data
                        name: col,
                      },
                    ]}
                    layout={{
                      title: `Distribution of ${col}`,
                      xaxis: { title: col },
                      yaxis: { title: 'Frequency' },
                      showlegend: false,
                    }}
                    style={{ width: '100%', height: '300px' }}
                  />
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}
    </Box>
  );
};

export default BasicAnalysis; 