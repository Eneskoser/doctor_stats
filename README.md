# Doctor Stats

A comprehensive medical data analysis platform that helps healthcare professionals analyze and visualize patient data.

## Features

### Data Analysis
- **Basic Statistical Analysis**: Calculate descriptive statistics for numeric variables
  - Mean, median, standard deviation
  - Quartiles and range
  - Missing value analysis
  - Unique value counts

- **Comparative Analysis**: Compare variables across different groups
  - Group-wise statistics
  - T-tests for comparing means
  - Box plots for distribution comparison

- **Correlation Analysis**: Analyze relationships between variables
  - Correlation matrix
  - Significance testing
  - Correlation heatmaps

- **Chi-Square Analysis**: Test relationships between categorical variables
  - Contingency tables
  - Chi-square test of independence
  - Visual representation of relationships

- **Regression Analysis**: Perform simple linear regression
  - Coefficient estimation
  - R-squared calculation
  - Residual analysis
  - Regression line visualization

### Visualization
- Interactive plots using Plotly.js
- Customizable charts and graphs
- Export capabilities for reports

## Tech Stack

### Frontend
- React.js with TypeScript
- Material-UI for components
- Plotly.js for visualizations
- Redux Toolkit for state management
- React Query for API integration

### Backend
- FastAPI (Python)
- Pandas for data manipulation
- SciPy for statistical analysis
- NumPy for numerical computations

## Setup Instructions

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

## API Documentation

### Dataset Endpoints

#### `POST /datasets`
Upload a new dataset (CSV or Excel file)
- Request: Multipart form data with file
- Response: Dataset ID and metadata

#### `GET /datasets/{dataset_id}/info`
Get information about a dataset
- Response: Column names, types, and basic statistics

### Analysis Endpoints

#### `POST /analyses`
Create a new analysis
- Request: Analysis type and configuration
- Response: Analysis results

Analysis types:
- `basic`: Basic statistical analysis
- `comparative`: Group comparison analysis
- `correlation`: Correlation analysis
- `chi-square`: Chi-square test
- `regression`: Simple linear regression

## Security Features

- Input validation and sanitization
- CORS configuration
- File type validation
- Error handling and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details. 