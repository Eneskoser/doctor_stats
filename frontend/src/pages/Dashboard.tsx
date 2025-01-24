import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Card,
  CardContent,
  CardHeader,
} from '@mui/material';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { User } from '../types/auth';

const Dashboard: React.FC = () => {
  const user = useSelector((state: RootState) => state.auth.user) as User | null;

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome{user ? `, ${user.name}` : ''}!
        </Typography>
        
        <Grid container spacing={3}>
          {/* Recent Analyses */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Recent Analyses" />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  No recent analyses found. Start by uploading a dataset in the Analysis section.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Stats */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardHeader title="Quick Stats" />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Your statistics and insights will appear here once you start analyzing data.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Saved Visualizations */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Saved Visualizations" />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Your saved visualizations will appear here. Create new visualizations in the Visualizations section.
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Recent Reports */}
          <Grid item xs={12}>
            <Card>
              <CardHeader title="Recent Reports" />
              <CardContent>
                <Typography variant="body2" color="text.secondary">
                  Your generated reports will appear here. Create new reports in the Reports section.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard; 