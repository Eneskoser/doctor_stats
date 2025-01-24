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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  SelectChangeEvent,
  Divider,
} from '@mui/material';
import {
  Download as DownloadIcon,
  Delete as DeleteIcon,
  Share as ShareIcon,
} from '@mui/icons-material';

interface Report {
  id: string;
  name: string;
  type: string;
  createdAt: string;
  status: 'completed' | 'pending' | 'failed';
}

const Reports: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = React.useState('');
  const [reportType, setReportType] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [reports, setReports] = React.useState<Report[]>([
    {
      id: '1',
      name: 'Basic Analysis Report',
      type: 'basic',
      createdAt: '2024-01-20T10:00:00Z',
      status: 'completed',
    },
    {
      id: '2',
      name: 'Correlation Analysis Report',
      type: 'correlation',
      createdAt: '2024-01-19T15:30:00Z',
      status: 'completed',
    },
  ]);

  const handleDatasetChange = (event: SelectChangeEvent) => {
    setSelectedDataset(event.target.value);
  };

  const handleReportTypeChange = (event: SelectChangeEvent) => {
    setReportType(event.target.value);
  };

  const handleGenerateReport = async () => {
    if (!selectedDataset) {
      setError('Please select a dataset');
      return;
    }
    if (!reportType) {
      setError('Please select a report type');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement report generation logic
      setError(null);
      const newReport: Report = {
        id: Date.now().toString(),
        name: `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Analysis Report`,
        type: reportType,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };
      setReports(prev => [newReport, ...prev]);
    } catch (err) {
      setError('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (reportId: string) => {
    // TODO: Implement download logic
    console.log('Downloading report:', reportId);
  };

  const handleDelete = (reportId: string) => {
    // TODO: Implement delete logic
    setReports(prev => prev.filter(report => report.id !== reportId));
  };

  const handleShare = (reportId: string) => {
    // TODO: Implement share logic
    console.log('Sharing report:', reportId);
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Reports
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
                      <InputLabel>Report Type</InputLabel>
                      <Select
                        value={reportType}
                        label="Report Type"
                        onChange={handleReportTypeChange}
                      >
                        <MenuItem value="basic">Basic Analysis Report</MenuItem>
                        <MenuItem value="correlation">Correlation Analysis Report</MenuItem>
                        <MenuItem value="regression">Regression Analysis Report</MenuItem>
                        <MenuItem value="comprehensive">Comprehensive Report</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGenerateReport}
                      disabled={loading || !selectedDataset || !reportType}
                      fullWidth
                    >
                      {loading ? 'Generating...' : 'Generate Report'}
                    </Button>
                  </Grid>
                </Grid>
              </Box>
            </Paper>

            <Card sx={{ mt: 3 }}>
              <CardHeader title="Report Guide" />
              <CardContent>
                <Typography variant="body2" color="text.secondary" paragraph>
                  1. Select a dataset to analyze
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  2. Choose the type of report to generate
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  3. Click "Generate Report" to create your report
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper elevation={3}>
              <Box p={3}>
                <Typography variant="h6" gutterBottom>
                  Generated Reports
                </Typography>
                <List>
                  {reports.map((report, index) => (
                    <React.Fragment key={report.id}>
                      {index > 0 && <Divider />}
                      <ListItem>
                        <ListItemText
                          primary={report.name}
                          secondary={`Generated on ${new Date(report.createdAt).toLocaleDateString()}`}
                        />
                        <ListItemSecondaryAction>
                          <IconButton
                            edge="end"
                            aria-label="download"
                            onClick={() => handleDownload(report.id)}
                            sx={{ mr: 1 }}
                          >
                            <DownloadIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="share"
                            onClick={() => handleShare(report.id)}
                            sx={{ mr: 1 }}
                          >
                            <ShareIcon />
                          </IconButton>
                          <IconButton
                            edge="end"
                            aria-label="delete"
                            onClick={() => handleDelete(report.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </ListItemSecondaryAction>
                      </ListItem>
                    </React.Fragment>
                  ))}
                  {reports.length === 0 && (
                    <ListItem>
                      <ListItemText
                        primary="No reports generated yet"
                        secondary="Generate a new report to see it here"
                      />
                    </ListItem>
                  )}
                </List>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Reports; 