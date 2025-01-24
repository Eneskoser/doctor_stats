import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  SelectChangeEvent,
  CircularProgress,
} from '@mui/material';
import { CloudUpload as CloudUploadIcon } from '@mui/icons-material';
import { useAnalysis } from '@/hooks';
import { datasetService } from '@/api/services';
import { AnalysisType } from '@/types/analysis';

const Analysis: React.FC = () => {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [analysisType, setAnalysisType] = React.useState<AnalysisType | ''>('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [datasetId, setDatasetId] = React.useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const { runAnalysis, isCreating } = useAnalysis(datasetId || undefined);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type === 'text/csv' || file.type === 'application/vnd.ms-excel') {
        setSelectedFile(file);
        setError(null);
      } else {
        setError('Please upload a CSV file');
        setSelectedFile(null);
      }
    }
  };

  const handleAnalysisTypeChange = (event: SelectChangeEvent) => {
    setAnalysisType(event.target.value as AnalysisType);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) {
      setError('Please select a file to analyze');
      return;
    }
    if (!analysisType) {
      setError('Please select an analysis type');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // First upload the file to create a dataset
      const dataset = await datasetService.uploadDataset(selectedFile);
      setDatasetId(dataset.id);
      console.log('Dataset uploaded:', dataset);

      // Then start the analysis with proper config
      runAnalysis(analysisType, {
        targetColumns: [], // Will be populated based on dataset columns
        options: {}
      });
      console.log('Analysis started');
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.response?.data?.message || 'Failed to process your request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Analysis
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Paper elevation={3}>
              <Box p={3}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
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
                        disabled={loading || isCreating}
                      >
                        {selectedFile ? selectedFile.name : 'Upload CSV File'}
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>Analysis Type</InputLabel>
                        <Select
                          value={analysisType}
                          label="Analysis Type"
                          onChange={handleAnalysisTypeChange}
                          disabled={loading || isCreating}
                        >
                          <MenuItem value="basic">Descriptive Analysis</MenuItem>
                          <MenuItem value="correlation">Correlation Analysis</MenuItem>
                          <MenuItem value="comparative">Comparative Analysis</MenuItem>
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
                        disabled={loading || isCreating || !selectedFile || !analysisType}
                      >
                        {loading || isCreating ? 'Processing...' : 'Start Analysis'}
                      </Button>
                    </Grid>
                  </Grid>
                </form>
              </Box>
            </Paper>
          </Grid>

          <Grid item xs={12} md={4}>
            <Card>
              <CardHeader title="Analysis Guide" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  1. Upload a CSV file containing your dataset
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  2. Select the type of analysis you want to perform
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  3. Click "Start Analysis" to begin processing your data
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  The results will be displayed below once the analysis is complete.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Analysis; 