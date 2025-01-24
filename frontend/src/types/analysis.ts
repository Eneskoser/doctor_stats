export interface Column {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'text';
  uniqueValues: number;
  hasNull: boolean;
}

export interface DatasetInfo {
  columns: Column[];
  rowCount: number;
}

export interface BasicStatistics {
  count: number;
  mean?: number;
  median?: number;
  std?: number;
  min?: number;
  max?: number;
  q1?: number;
  q3?: number;
  mode?: string | number;
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

export type AnalysisType = 'basic' | 'correlation' | 'comparative' | 'chi_square' | 'regression';

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
  dataset_id: string;
  analysis_type: AnalysisType;
  config: AnalysisConfig;
}

export interface AnalysisResult {
  id: string;
  type: AnalysisType;
  data: any;
  created_at: string;
} 