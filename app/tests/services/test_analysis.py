import pytest
import pandas as pd
import numpy as np
from app.services.analysis import (
    perform_basic_analysis,
    perform_correlation_analysis,
    perform_chi_square_analysis,
)


@pytest.fixture
def sample_numeric_data():
    return pd.DataFrame(
        {
            "age": [25, 30, 35, 40, 45],
            "weight": [70, 75, 80, 85, 90],
            "height": [170, 175, 180, 185, 190],
        }
    )


@pytest.fixture
def sample_categorical_data():
    return pd.DataFrame(
        {"gender": ["M", "F", "M", "F", "M"], "condition": ["A", "B", "A", "B", "A"]}
    )


def test_basic_analysis():
    df = pd.DataFrame({"age": [25, 30, 35, 40, 45], "weight": [70, 75, 80, 85, 90]})

    result = perform_basic_analysis(df)

    assert "age" in result
    assert "weight" in result
    assert result["age"]["mean"] == 35
    assert result["age"]["median"] == 35
    assert result["weight"]["mean"] == 80
    assert result["weight"]["median"] == 80


def test_correlation_analysis():
    df = pd.DataFrame({"x": [1, 2, 3, 4, 5], "y": [2, 4, 6, 8, 10]})

    result = perform_correlation_analysis(df)

    assert isinstance(result, dict)
    assert "correlation_matrix" in result
    assert result["correlation_matrix"].shape == (2, 2)
    assert np.isclose(result["correlation_matrix"].iloc[0, 1], 1.0)


def test_chi_square_analysis():
    df = pd.DataFrame(
        {"gender": ["M", "F", "M", "F", "M"], "condition": ["A", "B", "A", "B", "A"]}
    )

    result = perform_chi_square_analysis(df, "gender", "condition")

    assert isinstance(result, dict)
    assert "chi_square_statistic" in result
    assert "p_value" in result
    assert "contingency_table" in result


def test_basic_analysis_with_missing_values():
    df = pd.DataFrame({"age": [25, None, 35, 40, 45], "weight": [70, 75, None, 85, 90]})

    result = perform_basic_analysis(df)

    assert result["age"]["missing_count"] == 1
    assert result["weight"]["missing_count"] == 1


def test_correlation_analysis_with_invalid_data():
    df = pd.DataFrame({"numeric": [1, 2, 3], "categorical": ["A", "B", "C"]})

    with pytest.raises(ValueError):
        perform_correlation_analysis(df)


def test_chi_square_analysis_with_insufficient_data():
    df = pd.DataFrame({"gender": ["M"], "condition": ["A"]})

    with pytest.raises(ValueError):
        perform_chi_square_analysis(df, "gender", "condition")
