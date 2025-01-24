from typing import Dict, List, Optional, Any
from pydantic import BaseModel, Field
from enum import Enum


class AnalysisType(str, Enum):
    BASIC = "basic"
    COMPARATIVE = "comparative"
    CORRELATION = "correlation"
    CHI_SQUARE = "chi_square"
    REGRESSION = "regression"


class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class BasicAnalysisConfig(BaseModel):
    columns: Optional[List[str]] = Field(
        None,
        description="List of columns to analyze. If not provided, all numeric columns will be analyzed.",
    )


class ComparativeAnalysisConfig(BaseModel):
    target_column: str = Field(..., description="The column to analyze")
    group_column: str = Field(..., description="The column to group by")


class CorrelationAnalysisConfig(BaseModel):
    columns: Optional[List[str]] = Field(
        None,
        description="List of columns to analyze correlations between. If not provided, all numeric columns will be analyzed.",
    )


class ChiSquareAnalysisConfig(BaseModel):
    variable1: str = Field(..., description="First categorical variable")
    variable2: str = Field(..., description="Second categorical variable")


class RegressionAnalysisConfig(BaseModel):
    dependent_variable: str = Field(..., description="The dependent variable (y)")
    independent_variable: str = Field(..., description="The independent variable (x)")


class AnalysisConfig(BaseModel):
    basic: Optional[BasicAnalysisConfig]
    comparative: Optional[ComparativeAnalysisConfig]
    correlation: Optional[CorrelationAnalysisConfig]
    chi_square: Optional[ChiSquareAnalysisConfig]
    regression: Optional[RegressionAnalysisConfig]


class AnalysisCreate(BaseModel):
    dataset_id: str = Field(..., description="ID of the dataset to analyze")
    analysis_type: AnalysisType = Field(..., description="Type of analysis to perform")
    config: Dict[str, Any] = Field(..., description="Analysis configuration")


class AnalysisResponse(BaseModel):
    id: str
    dataset_id: str
    user_id: str
    name: str
    type: AnalysisType
    config: Dict[str, Any]
    status: AnalysisStatus
    error: Optional[str] = None
    results: Optional[Dict[str, Any]] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


class BasicStatistics(BaseModel):
    descriptive_statistics: Dict[str, Dict[str, float]]
    missing_data: Dict[str, Dict[str, float]]
    column_types: Dict[str, str]


class GroupStatistics(BaseModel):
    count: int
    mean: float
    std: float
    min: float
    max: float
    median: float


class StatisticalTest(BaseModel):
    name: str
    statistic: float
    p_value: float
    significant: bool


class PairwiseTest(BaseModel):
    statistic: float
    pvalue: float
    significant: bool


class ComparativeStatistics(BaseModel):
    group_statistics: Dict[str, Dict[str, float]]
    statistical_test: StatisticalTest
    pairwise_tests: Optional[Dict[str, PairwiseTest]] = None


class SignificantCorrelation(BaseModel):
    variable1: str
    variable2: str
    correlation: float
    p_value: float


class CorrelationAnalysis(BaseModel):
    correlation_matrix: Dict[str, Dict[str, float]]
    p_values: Dict[str, Dict[str, float]]
    significant_correlations: List[SignificantCorrelation]


class ChiSquareAnalysis(BaseModel):
    contingency_table: Dict[str, Dict[str, int]]
    chi_square_statistic: float
    p_value: float
    degrees_of_freedom: int
    cramers_v: float
    significant: bool


class RegressionCoefficients(BaseModel):
    intercept: float
    slope: float


class ResidualsSummary(BaseModel):
    mean: float
    std: float
    skewness: float
    kurtosis: float


class RegressionAnalysis(BaseModel):
    coefficients: RegressionCoefficients
    standard_errors: RegressionCoefficients
    t_statistics: RegressionCoefficients
    p_values: RegressionCoefficients
    r_squared: float
    adjusted_r_squared: float
    sample_size: int
    residuals_summary: ResidualsSummary


class AnalysisResult(BaseModel):
    basic: Optional[BasicStatistics] = None
    comparative: Optional[ComparativeStatistics] = None
    correlation: Optional[CorrelationAnalysis] = None
    chi_square: Optional[ChiSquareAnalysis] = None
    regression: Optional[RegressionAnalysis] = None
