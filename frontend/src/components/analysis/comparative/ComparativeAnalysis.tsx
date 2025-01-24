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
import type { Column, ComparativeStatistics } from '../../../types/analysis';

interface ComparativeAnalysisProps {
  datasetId: string;
  columns: Column[];
}

const ComparativeAnalysis = ({ datasetId, columns }: ComparativeAnalysisProps) => {
  const [targetColumn, setTargetColumn] = useState<string>('');
  const [groupColumn, setGroupColumn] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { mutate: runAnalysis, data: analysisResult } = useMutation({
    mutationFn: () =>
      analysisService.create({
        datasetId,
        type: 'comparative',
        config: {
          targetColumns: [targetColumn],
          groupColumn,
        },
      }),
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleTargetColumnChange = (event: any) => {
    setTargetColumn(event.target.value as string);
  };

  const handleGroupColumnChange = (event: any) => {
    setGroupColumn(event.target.value as string);
  };

  const handleAnalyze = () => {
    if (!targetColumn || !groupColumn) {
      setError('Please select both target and group columns');
      return;
    }
    setError(null);
    runAnalysis();
  };

  const gridColumns: GridColDef[] = [
    { field: 'group', headerName: 'Group', flex: 1 },
    { field: 'count', headerName: 'Count', flex: 1 },
    { field: 'mean', headerName: 'Mean', flex: 1 },
    { field: 'median', headerName: 'Median', flex: 1 },
    { field: 'std', headerName: 'Std Dev', flex: 1 },
    { field: 'min', headerName: 'Min', flex: 1 },
    { field: 'max', headerName: 'Max', flex: 1 },
  ];

  const gridRows = analysisResult
    ? (analysisResult.data as ComparativeStatistics[]).map((stat, index) => ({
        id: index,
        group: stat.groupName,
        count: stat.statistics.count,
        mean: stat.statistics.mean?.toFixed(4),
        median: stat.statistics.median?.toFixed(4),
        std: stat.statistics.std?.toFixed(4),
        min: stat.statistics.min?.toFixed(4),
        max: stat.statistics.max?.toFixed(4),
      }))
    : [];

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Comparative Analysis
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Target Column</InputLabel>
              <Select
                value={targetColumn}
                onChange={handleTargetColumnChange}
                label="Target Column"
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
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Group Column</InputLabel>
              <Select
                value={groupColumn}
                onChange={handleGroupColumnChange}
                label="Group Column"
              >
                {columns
                  .filter((col) => col.type === 'categorical')
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
              disabled={!targetColumn || !groupColumn}
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
              Group Statistics
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

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            {(analysisResult.data as ComparativeStatistics[])[0]?.testResults && (
              <Box>
                <Typography variant="body1">
                  Test Type:{' '}
                  {(analysisResult.data as ComparativeStatistics[])[0].testResults?.testType}
                </Typography>
                <Typography variant="body1">
                  Statistic:{' '}
                  {(analysisResult.data as ComparativeStatistics[])[0].testResults?.statistic.toFixed(
                    4
                  )}
                </Typography>
                <Typography variant="body1">
                  P-Value:{' '}
                  {(analysisResult.data as ComparativeStatistics[])[0].testResults?.pValue.toFixed(4)}
                </Typography>
                <Typography
                  variant="body1"
                  color={
                    (analysisResult.data as ComparativeStatistics[])[0].testResults?.significant
                      ? 'error'
                      : 'text.primary'
                  }
                >
                  Result:{' '}
                  {(analysisResult.data as ComparativeStatistics[])[0].testResults?.significant
                    ? 'Significant difference found between groups'
                    : 'No significant difference found between groups'}
                </Typography>
              </Box>
            )}
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Box Plot
            </Typography>
            <Plot
              data={[
                {
                  type: 'box',
                  x: [], // TODO: Add group data
                  y: [], // TODO: Add target column data
                  boxpoints: 'outliers',
                },
              ]}
              layout={{
                title: `Distribution of ${targetColumn} by ${groupColumn}`,
                xaxis: { title: groupColumn },
                yaxis: { title: targetColumn },
                showlegend: false,
              }}
              style={{ width: '100%', height: '400px' }}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ComparativeAnalysis; 