import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { DataGrid, GridColDef } from '@mui/x-data-grid';
import { useAnalysis, useAnalysisStatus } from '../hooks/useAnalysis';
import { datasetService } from '../api/services';
import { AnalysisType } from '../types/analysis';
import LoadingWrapper from '../components/common/LoadingWrapper';

interface DescriptiveStatistics {
  count: number;
  mean: number;
  std: number;
  min: number;
  max: number;
  median: number;
  '0.25': number;
  '0.75': number;
}

interface AnalysisResult {
  descriptive_statistics: {
    [key: string]: DescriptiveStatistics;
  };
}

const Analysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [analysisType, setAnalysisType] = React.useState<AnalysisType | ''>('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [results, setResults] = React.useState<AnalysisResult | null>(null);
  const [datasetId, setDatasetId] = React.useState<string | null>(null);
  const [analysisId, setAnalysisId] = React.useState<number | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const { runAnalysis } = useAnalysis(datasetId);
  const { data: analysisStatus } = useAnalysisStatus(analysisId || 0);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'text/csv') {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a CSV file');
        setSelectedFile(null);
      }
    }
  };

  const handleAnalysisTypeChange = (event: SelectChangeEvent<string>) => {
    setAnalysisType(event.target.value as AnalysisType);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const transformResultsToRows = (results: AnalysisResult) => {
    return Object.entries(results.descriptive_statistics).map(([column, stats], index) => ({
      id: index,
      column,
      count: stats.count,
      mean: stats.mean.toFixed(1),
      std: stats.std.toFixed(1),
      min: stats.min.toFixed(1),
      max: stats.max.toFixed(1),
      median: stats.median.toFixed(1),
      quartile25: stats['0.25'].toFixed(1),
      quartile75: stats['0.75'].toFixed(1),
    }));
  };

  const columns: GridColDef[] = [
    { field: 'column', headerName: 'Column', flex: 1 },
    { field: 'count', headerName: 'Count', flex: 1 },
    { field: 'mean', headerName: 'Mean', flex: 1 },
    { field: 'std', headerName: 'Std Dev', flex: 1 },
    { field: 'min', headerName: 'Min', flex: 1 },
    { field: 'max', headerName: 'Max', flex: 1 },
    { field: 'median', headerName: 'Median', flex: 1 },
    { field: 'quartile25', headerName: '25th Percentile', flex: 1 },
    { field: 'quartile75', headerName: '75th Percentile', flex: 1 },
  ];

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile || !analysisType) {
      setError('Please select both a file and analysis type');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload the file and start analysis in sequence
      const dataset = await datasetService.uploadDataset(selectedFile);
      setDatasetId(dataset.id.toString());

      // Immediately start analysis after upload
      const analysisResponse = await runAnalysis(analysisType, {
        targetColumns: [],
        options: {}
      });

      if (analysisResponse) {
        setAnalysisId(analysisResponse.id);
        setResults(analysisResponse.results);
        // Clear the form after successful submission
        setSelectedFile(null);
        setAnalysisType('');
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }

    } catch (err: any) {
      console.error('Analysis error:', err);
      setError(err.response?.data?.detail || 'Failed to process your request');
    } finally {
      setLoading(false);
    }
  };

  // Show analysis status and results
  React.useEffect(() => {
    if (analysisStatus) {
      if (analysisStatus.status === 'failed') {
        setError(analysisStatus.error || 'Analysis failed');
      } else if (analysisStatus.status === 'completed' && analysisStatus.results) {
        setResults(analysisStatus.results);
      }
    }
  }, [analysisStatus]);

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Analysis
        </Typography>

        <LoadingWrapper isLoading={loading} error={error}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3}>
                <Box p={3}>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                      <Grid item xs={12}>
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleFileChange}
                          style={{ display: 'none' }}
                          ref={fileInputRef}
                        />
                        <Button
                          variant="outlined"
                          startIcon={<CloudUploadIcon />}
                          onClick={handleUploadClick}
                          fullWidth
                          disabled={loading}
                        >
                          {selectedFile ? selectedFile.name : 'Upload CSV File'}
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <FormControl fullWidth>
                          <InputLabel id="analysis-type-label">Analysis Type</InputLabel>
                          <Select
                            labelId="analysis-type-label"
                            value={analysisType}
                            onChange={handleAnalysisTypeChange}
                            label="Analysis Type"
                            disabled={loading}
                          >
                            <MenuItem value="basic">Basic Statistical Analysis</MenuItem>
                            <MenuItem value="comparative">Comparative Analysis</MenuItem>
                            <MenuItem value="correlation">Correlation Analysis</MenuItem>
                            <MenuItem value="chi_square">Chi-Square Analysis</MenuItem>
                            <MenuItem value="regression">Regression Analysis</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          color="primary"
                          fullWidth
                          disabled={!selectedFile || !analysisType || loading}
                        >
                          {loading ? 'Processing...' : 'Start Analysis'}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </Box>
              </Paper>
            </Grid>

            {results && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3, mt: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Analysis Results
                  </Typography>
                  <Box sx={{ 
                    width: '100%',
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: '#f5f5f5',  // Light gray background
                      fontSize: '1rem',
                    },
                    '& .MuiDataGrid-cell': {
                      fontSize: '0.95rem',
                    }
                  }}>
                    <DataGrid
                      rows={transformResultsToRows(results)}
                      columns={columns}
                      pageSize={10}
                      rowsPerPageOptions={[5, 10, 20]}
                      disableSelectionOnClick
                      autoHeight
                      headerHeight={56}
                      sx={{
                        '& .MuiDataGrid-columnHeader': {
                          padding: '0 16px',
                          whiteSpace: 'normal',
                          lineHeight: '1.2',
                          color: 'black',  // Black text for headers
                        },
                        '& .MuiDataGrid-row': {
                          backgroundColor: 'white',
                        },
                      }}
                    />
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </LoadingWrapper>
      </Box>
    </Container>
  );
};

export default Analysis;