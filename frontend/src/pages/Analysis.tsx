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
import { useAnalysis, useAnalysisStatus } from '../hooks/useAnalysis';
import { datasetService } from '../api/services';
import { AnalysisType } from '../types/analysis';
import LoadingWrapper from '../components/common/LoadingWrapper';
import { analysisService } from '../api/services';

const Analysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [analysisType, setAnalysisType] = React.useState<AnalysisType | ''>('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
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
      } else if (analysisStatus.status === 'completed') {
        // Handle completed analysis
        console.log('Analysis results:', analysisStatus.results);
      }
    }
  }, [analysisStatus]);

  // Render analysis results
  const renderResults = () => {
    if (!analysisStatus) return null;

    switch (analysisStatus.status) {
      case 'pending':
      case 'processing':
        return (
          <Box display="flex" alignItems="center" gap={2}>
            <CircularProgress size={20} />
            <Typography>Analysis in progress...</Typography>
          </Box>
        );
      
      case 'completed':
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Analysis Results</Typography>
            <pre style={{ overflow: 'auto', maxHeight: '400px' }}>
              {JSON.stringify(analysisStatus.results, null, 2)}
            </pre>
          </Box>
        );
      
      case 'failed':
        return (
          <Typography color="error">
            Analysis failed: {analysisStatus.error}
          </Typography>
        );
      
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Analysis
        </Typography>

        <LoadingWrapper isLoading={loading} error={error}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
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

            <Grid item xs={12} md={4}>
              <Paper>
                <Box p={3}>
                  <Typography variant="h6" gutterBottom>
                    Analysis Guide
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    1. Upload a CSV file containing your dataset
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    2. Select the type of analysis you want to perform
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    3. Click "Start Analysis" to begin processing
                  </Typography>
                </Box>
              </Paper>

              {/* Results Section */}
              {analysisStatus && (
                <Paper sx={{ mt: 3 }}>
                  <Box p={3}>
                    {renderResults()}
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </LoadingWrapper>
      </Box>
    </Container>
  );
};

export default Analysis; 