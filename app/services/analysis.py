from typing import Dict, List, Any, Optional
import pandas as pd
import numpy as np
from scipy import stats
import logging
from sqlalchemy.orm import Session

# Models
from app.models.analysis import Analysis, AnalysisStatus  # Only import from models
from app.models.dataset import Dataset

# Schemas for return types
from app.schemas.analysis import (
    BasicStatistics,
    ComparativeStatistics,
    CorrelationAnalysis,
    ChiSquareAnalysis,
    RegressionAnalysis,
)

logger = logging.getLogger(__name__)


class AnalysisService:
    async def load_dataset(self, file_path: str) -> pd.DataFrame:
        """Load dataset from file path."""
        try:
            if file_path.endswith(".csv"):
                return pd.read_csv(file_path)
            elif file_path.endswith((".xls", ".xlsx")):
                return pd.read_excel(file_path)
            else:
                raise ValueError("Unsupported file format")
        except Exception as e:
            raise ValueError(f"Error loading dataset: {str(e)}")

    async def run_analysis(
        self, df: pd.DataFrame, analysis_type: str, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Run analysis based on type and configuration."""
        analysis_methods = {
            "basic": self._basic_statistics,
            "comparative": self._comparative_analysis,
            "correlation": self._correlation_analysis,
            "chi_square": self._chi_square_analysis,
            "regression": self._regression_analysis,
        }

        if analysis_type not in analysis_methods:
            raise ValueError(f"Unsupported analysis type: {analysis_type}")

        return await analysis_methods[analysis_type](df, config)

    async def run_analysis_task(self, analysis_id: int, db: Session):
        """Background task to handle the complete analysis workflow."""
        try:
            # Get analysis from database
            analysis = db.query(Analysis).filter(Analysis.id == analysis_id).first()
            if not analysis:
                logger.error(f"Analysis {analysis_id} not found")
                return

            # Update status to processing
            analysis.status = AnalysisStatus.PROCESSING  # Using model's AnalysisStatus
            db.commit()
            logger.info(f"Starting analysis {analysis_id}")

            # Get dataset
            dataset = (
                db.query(Dataset).filter(Dataset.id == analysis.dataset_id).first()
            )
            if not dataset:
                raise ValueError(f"Dataset {analysis.dataset_id} not found")

            # Load dataset
            df = await self.load_dataset(dataset.file_path)
            logger.info(f"Dataset loaded: {dataset.file_path}")

            # Run the actual analysis using run_analysis method
            results = await self.run_analysis(
                df, analysis.type.value, analysis.parameters
            )

            # Update analysis with results
            analysis.results = results
            analysis.status = AnalysisStatus.COMPLETED  # Using model's AnalysisStatus
            db.commit()
            logger.info(f"Analysis {analysis_id} completed successfully")

        except Exception as e:
            logger.error(f"Error in analysis {analysis_id}: {str(e)}", exc_info=True)
            analysis.status = AnalysisStatus.FAILED  # Using model's AnalysisStatus
            analysis.error_message = str(e)
            db.commit()
            raise e

    async def _basic_statistics(
        self, df: pd.DataFrame, config: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Calculate basic statistics for numeric columns."""
        stats = {}
        for column in df.select_dtypes(include=[np.number]).columns:
            column_stats = df[column].describe()
            stats[column] = {
                "count": int(column_stats["count"]),
                "mean": float(column_stats["mean"]),
                "std": float(column_stats["std"]),
                "min": float(column_stats["min"]),
                "max": float(column_stats["max"]),
                "median": float(df[column].median()),
                "0.25": float(column_stats["25%"]),
                "0.75": float(column_stats["75%"]),
            }
        return {"descriptive_statistics": stats}

    async def _comparative_analysis(
        self, df: pd.DataFrame, config: Dict[str, Any]
    ) -> ComparativeStatistics:
        """Perform comparative analysis between groups."""
        target_column = config["target_column"]
        group_column = config["group_column"]

        # Group statistics
        groups = (
            df.groupby(group_column)[target_column]
            .agg(["count", "mean", "std", "min", "max", "median"])
            .round(4)
        )

        # Statistical tests
        unique_groups = df[group_column].unique()
        group_data = [
            df[df[group_column] == g][target_column].dropna() for g in unique_groups
        ]

        if len(unique_groups) == 2:
            # T-test for two groups
            stat, pvalue = stats.ttest_ind(*group_data)
            test_name = "Independent t-test"
        else:
            # ANOVA for more than two groups
            stat, pvalue = stats.f_oneway(*group_data)
            test_name = "One-way ANOVA"

            # Post-hoc Tukey test
            if len(unique_groups) > 2:
                tukey = stats.tukey_hsd(*group_data)
                pairwise_tests = {
                    f"{g1} vs {g2}": {
                        "statistic": stat,
                        "pvalue": pvalue,
                        "significant": pvalue < 0.05,
                    }
                    for (g1, g2), stat, pvalue in zip(
                        [
                            (g1, g2)
                            for i, g1 in enumerate(unique_groups)
                            for g2 in unique_groups[i + 1 :]
                        ],
                        tukey.statistic,
                        tukey.pvalue,
                    )
                }

        return {
            "group_statistics": groups.to_dict(),
            "statistical_test": {
                "name": test_name,
                "statistic": float(stat),
                "p_value": float(pvalue),
                "significant": float(pvalue) < 0.05,
            },
            "pairwise_tests": pairwise_tests if len(unique_groups) > 2 else None,
        }

    async def _correlation_analysis(
        self, df: pd.DataFrame, config: Dict[str, Any]
    ) -> CorrelationAnalysis:
        """Perform correlation analysis."""
        columns = config.get("columns", [])
        if not columns:
            columns = df.select_dtypes(include=[np.number]).columns.tolist()

        # Calculate correlation matrix
        corr_matrix = df[columns].corr().round(4)

        # Calculate p-values
        p_values = pd.DataFrame(
            np.zeros_like(corr_matrix), columns=columns, index=columns
        )
        for i in range(len(columns)):
            for j in range(i + 1, len(columns)):
                stat, p = stats.pearsonr(
                    df[columns[i]].dropna(), df[columns[j]].dropna()
                )
                p_values.iloc[i, j] = p_values.iloc[j, i] = p

        # Identify significant correlations
        significant_correlations = []
        for i in range(len(columns)):
            for j in range(i + 1, len(columns)):
                if p_values.iloc[i, j] < 0.05:
                    significant_correlations.append(
                        {
                            "variable1": columns[i],
                            "variable2": columns[j],
                            "correlation": float(corr_matrix.iloc[i, j]),
                            "p_value": float(p_values.iloc[i, j]),
                        }
                    )

        return {
            "correlation_matrix": corr_matrix.to_dict(),
            "p_values": p_values.to_dict(),
            "significant_correlations": significant_correlations,
        }

    async def _chi_square_analysis(
        self, df: pd.DataFrame, config: Dict[str, Any]
    ) -> ChiSquareAnalysis:
        """Perform chi-square analysis for categorical variables."""
        variable1 = config["variable1"]
        variable2 = config["variable2"]

        # Create contingency table
        contingency_table = pd.crosstab(df[variable1], df[variable2])

        # Perform chi-square test
        chi2, p_value, dof, expected = stats.chi2_contingency(contingency_table)

        # Calculate Cramer's V
        n = len(df)
        min_dim = min(contingency_table.shape) - 1
        cramer_v = np.sqrt(chi2 / (n * min_dim))

        return {
            "contingency_table": contingency_table.to_dict(),
            "chi_square_statistic": float(chi2),
            "p_value": float(p_value),
            "degrees_of_freedom": int(dof),
            "cramers_v": float(cramer_v),
            "significant": float(p_value) < 0.05,
        }

    async def _regression_analysis(
        self, df: pd.DataFrame, config: Dict[str, Any]
    ) -> RegressionAnalysis:
        """Perform simple linear regression analysis."""
        dependent_var = config["dependent_variable"]
        independent_var = config["independent_variable"]

        # Prepare data
        X = df[independent_var].values.reshape(-1, 1)
        y = df[dependent_var].values

        # Add constant for intercept
        X = np.column_stack([np.ones(len(X)), X])

        # Calculate regression coefficients
        beta_hat = np.linalg.inv(X.T @ X) @ X.T @ y

        # Calculate predicted values
        y_pred = X @ beta_hat

        # Calculate residuals
        residuals = y - y_pred

        # Calculate R-squared
        ss_total = np.sum((y - np.mean(y)) ** 2)
        ss_residual = np.sum(residuals**2)
        r_squared = 1 - (ss_residual / ss_total)

        # Calculate standard errors
        n = len(X)
        mse = ss_residual / (n - 2)
        var_beta_hat = mse * np.linalg.inv(X.T @ X)
        se_beta = np.sqrt(np.diag(var_beta_hat))

        # Calculate t-statistics and p-values
        t_stats = beta_hat / se_beta
        p_values = 2 * (1 - stats.t.cdf(np.abs(t_stats), df=n - 2))

        return {
            "coefficients": {
                "intercept": float(beta_hat[0]),
                "slope": float(beta_hat[1]),
            },
            "standard_errors": {
                "intercept": float(se_beta[0]),
                "slope": float(se_beta[1]),
            },
            "t_statistics": {
                "intercept": float(t_stats[0]),
                "slope": float(t_stats[1]),
            },
            "p_values": {"intercept": float(p_values[0]), "slope": float(p_values[1])},
            "r_squared": float(r_squared),
            "adjusted_r_squared": float(1 - (1 - r_squared) * (n - 1) / (n - 2)),
            "sample_size": int(n),
            "residuals_summary": {
                "mean": float(np.mean(residuals)),
                "std": float(np.std(residuals)),
                "skewness": float(stats.skew(residuals)),
                "kurtosis": float(stats.kurtosis(residuals)),
            },
        }
