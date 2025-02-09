import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  CheckCircleOutline,
  Email,
  Phone,
} from '@mui/icons-material';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        sx={{ 
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          textAlign: 'center'
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" component="h1" gutterBottom>
            Doctor Stats
          </Typography>
          <Typography variant="h5" gutterBottom>
            Transforming Medical Data into Actionable Insights
          </Typography>
          <Box sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              onClick={() => navigate('/register')}
              sx={{ mr: 2 }}
            >
              Register
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              size="large"
              onClick={() => navigate('/login')}
            >
              Login
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Image Section */}
      <Container maxWidth="lg" sx={{ my: 8 }}>
        <Box
          component="img"
          src="/analysis-dashboard.png" // Add your image to public folder
          alt="Analysis Dashboard"
          sx={{
            width: '100%',
            maxHeight: '400px',
            objectFit: 'cover',
            borderRadius: 2,
          }}
        />
      </Container>

      {/* How to Use Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom align="center">
            How to Use
          </Typography>
          <Grid container spacing={4} sx={{ mt: 2 }}>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  1. Upload Your Data
                </Typography>
                <Typography>
                  Simply upload your medical data in CSV or Excel format. Our platform supports various data types and structures.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  2. Choose Analysis
                </Typography>
                <Typography>
                  Select from various analysis types including basic statistics, comparative analysis, and regression analysis.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  3. Get Insights
                </Typography>
                <Typography>
                  View results through interactive visualizations and comprehensive reports that you can easily share.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" component="h2" gutterBottom align="center">
            Contact Us
          </Typography>
          <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
            <List>
              <ListItem>
                <ListItemIcon>
                  <Email color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Email"
                  secondary="support@doctorstats.com"
                />
              </ListItem>
              <ListItem>
                <ListItemIcon>
                  <Phone color="primary" />
                </ListItemIcon>
                <ListItemText 
                  primary="Phone"
                  secondary="+1 (555) 123-4567"
                />
              </ListItem>
            </List>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing; 