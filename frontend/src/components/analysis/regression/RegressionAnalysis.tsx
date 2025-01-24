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
import { useMutation } from '@tanstack/react-query';
import { analysisService } from '../../../api/services';
import type { Column, RegressionResult } from '../../../types/analysis';

interface RegressionAnalysisProps {
  datasetId: string;
  columns: Column[];
}

const RegressionAnalysis = ({ datasetId, columns }: RegressionAnalysisProps) => {
  const [dependentVar, setDependentVar] = useState<string>('');
  const [independentVar, setIndependentVar] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { mutate: runAnalysis, data: analysisResult } = useMutation({
    mutationFn: () =>
      analysisService.create({
        datasetId,
        type: 'regression',
        config: {
          targetColumns: [dependentVar, independentVar],
        },
      }),
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleDependentVarChange = (event: any) => {
    setDependentVar(event.target.value as string);
  };

  const handleIndependentVarChange = (event: any) => {
    setIndependentVar(event.target.value as string);
  };

  const handleAnalyze = () => {
    if (!dependentVar || !independentVar) {
      setError('Please select both dependent and independent variables');
      return;
    }
    if (dependentVar === independentVar) {
      setError('Please select different variables');
      return;
    }
    setError(null);
    runAnalysis();
  };

  const gridColumns: GridColDef[] = [
    { field: 'metric', headerName: 'Metric', flex: 1 },
    { field: 'value', headerName: 'Value', flex: 1 },
  ];

  const gridRows = analysisResult
    ? [
        {
          id: 1,
          metric: 'Coefficient',
          value: (analysisResult.data as RegressionResult).coefficient.toFixed(4),
        },
        {
          id: 2,
          metric: 'Intercept',
          value: (analysisResult.data as RegressionResult).intercept.toFixed(4),
        },
        {
          id: 3,
          metric: 'R-squared',
          value: (analysisResult.data as RegressionResult).rSquared.toFixed(4),
        },
        {
          id: 4,
          metric: 'P-value',
          value: (analysisResult.data as RegressionResult).pValue.toFixed(4),
        },
        {
          id: 5,
          metric: 'Standard Error',
          value: (analysisResult.data as RegressionResult).standardError.toFixed(4),
        },
      ]
    : [];

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Linear Regression Analysis
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Dependent Variable (Y)</InputLabel>
              <Select
                value={dependentVar}
                onChange={handleDependentVarChange}
                label="Dependent Variable (Y)"
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
              <InputLabel>Independent Variable (X)</InputLabel>
              <Select
                value={independentVar}
                onChange={handleIndependentVarChange}
                label="Independent Variable (X)"
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
              disabled={!dependentVar || !independentVar || dependentVar === independentVar}
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
              Regression Results
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
              Regression Line Plot
            </Typography>
            <Plot
              data={[
                {
                  type: 'scatter',
                  mode: 'markers',
                  x: [], // TODO: Add actual X data
                  y: [], // TODO: Add actual Y data
                  name: 'Data Points',
                  marker: { color: 'blue' },
                },
                {
                  type: 'scatter',
                  mode: 'lines',
                  x: [], // TODO: Add X values for regression line
                  y: (analysisResult.data as RegressionResult).predictions,
                  name: 'Regression Line',
                  line: { color: 'red' },
                },
              ]}
              layout={{
                title: `Linear Regression: ${dependentVar} vs ${independentVar}`,
                xaxis: { title: independentVar },
                yaxis: { title: dependentVar },
                showlegend: true,
              }}
              style={{ width: '100%', height: '400px' }}
            />
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Residuals Plot
            </Typography>
            <Plot
              data={[
                {
                  type: 'scatter',
                  mode: 'markers',
                  x: [], // TODO: Add predicted values
                  y: (analysisResult.data as RegressionResult).residuals,
                  marker: { color: 'blue' },
                },
                {
                  type: 'scatter',
                  mode: 'lines',
                  x: [], // TODO: Add range for zero line
                  y: [0, 0],
                  line: { color: 'red', dash: 'dash' },
                },
              ]}
              layout={{
                title: 'Residuals vs Fitted Values',
                xaxis: { title: 'Fitted Values' },
                yaxis: { title: 'Residuals' },
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

export default RegressionAnalysis; 