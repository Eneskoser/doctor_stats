import React from 'react';
import { CircularProgress, Alert, Box } from '@mui/material';

interface LoadingWrapperProps {
  isLoading: boolean;
  error?: string | null;
  children: React.ReactNode;
}

const LoadingWrapper: React.FC<LoadingWrapperProps> = ({
  isLoading,
  error,
  children
}) => {
  if (isLoading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box my={2}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return <>{children}</>;
};

export default LoadingWrapper; 