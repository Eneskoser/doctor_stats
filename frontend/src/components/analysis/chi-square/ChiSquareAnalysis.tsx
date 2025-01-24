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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Plot from 'react-plotly.js';
import { useMutation } from '@tanstack/react-query';
import { analysisService } from '../../../api/services';
import type { Column, ChiSquareResult } from '../../../types/analysis';

interface ChiSquareAnalysisProps {
  datasetId: string;
  columns: Column[];
}

const ChiSquareAnalysis = ({ datasetId, columns }: ChiSquareAnalysisProps) => {
  const [variable1, setVariable1] = useState<string>('');
  const [variable2, setVariable2] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const { mutate: runAnalysis, data: analysisResult } = useMutation({
    mutationFn: () =>
      analysisService.create({
        datasetId,
        type: 'chi-square',
        config: {
          targetColumns: [variable1, variable2],
        },
      }),
    onError: (error: Error) => {
      setError(error.message);
    },
  });

  const handleVariable1Change = (event: any) => {
    setVariable1(event.target.value as string);
  };

  const handleVariable2Change = (event: any) => {
    setVariable2(event.target.value as string);
  };

  const handleAnalyze = () => {
    if (!variable1 || !variable2) {
      setError('Please select both variables for chi-square analysis');
      return;
    }
    if (variable1 === variable2) {
      setError('Please select different variables');
      return;
    }
    setError(null);
    runAnalysis();
  };

  const renderContingencyTable = () => {
    if (!analysisResult) return null;
    const result = analysisResult.data as ChiSquareResult;

    return (
      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {result.colLabels.map((label) => (
                <TableCell key={label} align="right">
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {result.contingencyTable.map((row, rowIndex) => (
              <TableRow key={result.rowLabels[rowIndex]}>
                <TableCell component="th" scope="row">
                  {result.rowLabels[rowIndex]}
                </TableCell>
                {row.map((cell, colIndex) => (
                  <TableCell key={colIndex} align="right">
                    {cell}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Chi-Square Analysis
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Variable 1</InputLabel>
              <Select
                value={variable1}
                onChange={handleVariable1Change}
                label="Variable 1"
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
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Variable 2</InputLabel>
              <Select
                value={variable2}
                onChange={handleVariable2Change}
                label="Variable 2"
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
              disabled={!variable1 || !variable2 || variable1 === variable2}
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
              Contingency Table
            </Typography>
            {renderContingencyTable()}
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test Results
            </Typography>
            <Box>
              <Typography variant="body1">
                Chi-Square Statistic:{' '}
                {(analysisResult.data as ChiSquareResult).chiSquare.toFixed(4)}
              </Typography>
              <Typography variant="body1">
                Degrees of Freedom:{' '}
                {(analysisResult.data as ChiSquareResult).degreesOfFreedom}
              </Typography>
              <Typography variant="body1">
                P-Value: {(analysisResult.data as ChiSquareResult).pValue.toFixed(4)}
              </Typography>
              <Typography
                variant="body1"
                color={
                  (analysisResult.data as ChiSquareResult).significant
                    ? 'error'
                    : 'text.primary'
                }
              >
                Result:{' '}
                {(analysisResult.data as ChiSquareResult).significant
                  ? 'Significant association found between variables'
                  : 'No significant association found between variables'}
              </Typography>
            </Box>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Heatmap Visualization
            </Typography>
            <Plot
              data={[
                {
                  type: 'heatmap',
                  z: (analysisResult.data as ChiSquareResult).contingencyTable,
                  x: (analysisResult.data as ChiSquareResult).colLabels,
                  y: (analysisResult.data as ChiSquareResult).rowLabels,
                  colorscale: 'YlOrRd',
                },
              ]}
              layout={{
                title: `Contingency Table Heatmap: ${variable1} vs ${variable2}`,
                width: undefined,
                height: 500,
                xaxis: { side: 'bottom' },
                yaxis: { autorange: 'reversed' },
              }}
              style={{ width: '100%' }}
            />
          </Paper>
        </>
      )}
    </Box>
  );
};

export default ChiSquareAnalysis; 