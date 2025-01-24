export type AnalysisType = 'basic' | 'comparative' | 'correlation' | 'chi_square' | 'regression';

export interface Column {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime';
  uniqueValues: number;
  hasNull: boolean;
}

export interface DatasetInfo {
  columns: Column[];
  rowCount: number;
}

export interface BasicStatistics {
  count: number;
  mean: number;
  median: number;
  std: number;
  min: number;
  max: number;
  q1: number;
  q3: number;
  missing: number;
  uniqueCount: number;
}

export interface ComparativeStatistics {
  groupName: string;
  statistics: BasicStatistics;
  testResults?: {
    testType: string;
    statistic: number;
    pValue: number;
    significant: boolean;
  };
}

export interface CorrelationResult {
  variable1: string;
  variable2: string;
  correlation: number;
  pValue: number;
  significant: boolean;
}

export interface ChiSquareResult {
  contingencyTable: number[][];
  rowLabels: string[];
  colLabels: string[];
  chiSquare: number;
  pValue: number;
  degreesOfFreedom: number;
  significant: boolean;
}

export interface RegressionResult {
  coefficient: number;
  intercept: number;
  rSquared: number;
  pValue: number;
  standardError: number;
  predictions: number[];
  residuals: number[];
}

export interface AnalysisConfig {
  targetColumns: string[];
  options: Record<string, any>;
}

export interface Analysis {
  id: string;
  type: AnalysisType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  dataset_id: string;
  config: AnalysisConfig;
  results?: any;
  error?: string;
  created_at: string;
  updated_at: string;
}

export interface AnalysisRequest {
  dataset_id: number;
  analysis_type: AnalysisType;
  config: {
    targetColumns: string[];
    options: Record<string, any>;
  };
}

export interface AnalysisResponse {
  id: number;
  type: AnalysisType;
  status: string;
  dataset_id: number;
  config: Record<string, any>;
  results?: Record<string, any>;
  error?: string;
  created_at: string;
  updated_at?: string;
}

export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  data: BasicStatistics | any;
  created_at: string;
  error?: string;
} 