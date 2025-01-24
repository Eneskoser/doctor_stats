import React from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import BoxPlot from '../components/visualization/BoxPlot';
import ScatterPlot from '../components/visualization/ScatterPlot';
import CorrelationHeatmap from '../components/visualization/CorrelationHeatmap';

const Visualizations: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = React.useState('');
  const [chartType, setChartType] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState<any>(null);

  const handleDatasetChange = (event: SelectChangeEvent) => {
    setSelectedDataset(event.target.value);
  };

  const handleChartTypeChange = (event: SelectChangeEvent) => {
    setChartType(event.target.value);
  };

  const handleGenerateChart = async () => {
    if (!selectedDataset) {
      setError('Please select a dataset');
      return;
    }
    if (!chartType) {
      setError('Please select a chart type');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement data fetching logic
      setError(null);
      // Mock data for now
      setData({
        labels: ['A', 'B', 'C', 'D'],
        values: [10, 20, 15, 25],
      });
    } catch (err) {
      setError('Failed to generate chart');
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!data) return null;

    switch (chartType) {
      case 'box':
        return <BoxPlot data={data} title="Box Plot" xLabel="Categories" yLabel="Values" />;
      case 'scatter':
        return <ScatterPlot data={data} title="Scatter Plot" xLabel="X Axis" yLabel="Y Axis" />;
      case 'heatmap':
        return <CorrelationHeatmap correlationMatrix={data} labels={data.labels} title="Correlation Heatmap" />;
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Data Visualizations
        </Typography>

        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={3}>
              <Box p={3}>
                {error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                  </Alert>
                )}
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Dataset</InputLabel>
                      <Select
                        value={selectedDataset}
                        label="Dataset"
                        onChange={handleDatasetChange}
                      >
                        <MenuItem value="dataset1">Dataset 1</MenuItem>
                        <MenuItem value="dataset2">Dataset 2</MenuItem>
                        <MenuItem value="dataset3">Dataset 3</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel>Chart Type</InputLabel>
                      <Select
                        value={chartType}
                        label="Chart Type"
                        onChange={handleChartTypeChange}
                      >
                        <MenuItem value="box">Box Plot</MenuItem>
                        <MenuItem value="scatter">Scatter Plot</MenuItem>
                        <MenuItem value="heatmap">Correlation Heatmap</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGenerateChart}
                      disabled={loading || !selectedDataset || !chartType}
                      fullWidth
                    >
                      {loading ? 'Generating...' : 'Generate Chart'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            <Card sx={{ mt: 3 }}>
              <CardHeader title="Visualization Guide" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  1. Select a dataset from your uploaded files
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  2. Choose the type of chart you want to create
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  3. Click "Generate Chart" to visualize your data
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={3}>
              <Box p={3} minHeight={400} display="flex" alignItems="center" justifyContent="center">
                {loading ? (
                  <Typography>Generating chart...</Typography>
                ) : data ? (
                  renderChart()
                ) : (
                  <Typography color="text.secondary">
                    Select a dataset and chart type to generate a visualization
                  </Typography>
                )}
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Visualizations; 