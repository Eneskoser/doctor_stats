import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from scipy import stats
import plotly.express as px
import plotly.graph_objects as go

# Set display options
pd.set_option("display.max_columns", None)
pd.set_option("display.max_rows", 100)

# Load the Excel file
df = pd.read_excel("data/tez veri 23Agustos 2024.xlsx", sheet_name="veri")

# Display basic information
print("Dataset Shape:", df.shape)
print("\nColumns:", df.columns.tolist())
print("\nData Types:\n", df.dtypes)
print("\nFirst few rows:")
print(df.head())

# Descriptive statistics for numeric columns
numeric_stats = df.describe()
print("\nDescriptive Statistics:\n")
print(numeric_stats)

# Calculate correlations for numeric columns
numeric_cols = df.select_dtypes(include=[np.number]).columns
corr_matrix = df[numeric_cols].corr()

# Create correlation heatmap
plt.figure(figsize=(12, 8))
sns.heatmap(corr_matrix, annot=True, cmap="coolwarm", center=0)
plt.title("Correlation Matrix Heatmap")
plt.show()


# Function to perform group analysis
def analyze_groups(df, group_col, value_col):
    group_stats = df.groupby(group_col)[value_col].agg(["mean", "std", "count"])
    print(f"\nGroup Analysis for {value_col} by {group_col}:\n")
    print(group_stats)

    # Perform t-test if there are exactly 2 groups
    groups = df[group_col].unique()
    if len(groups) == 2:
        group1 = df[df[group_col] == groups[0]][value_col]
        group2 = df[df[group_col] == groups[1]][value_col]
        t_stat, p_val = stats.ttest_ind(group1, group2)
        print(f"\nt-test results:")
        print(f"t-statistic: {t_stat:.4f}")
        print(f"p-value: {p_val:.4f}")


def create_box_plot(df, value_col, group_col=None):
    fig = px.box(df, y=value_col, x=group_col, title=f"Distribution of {value_col}")
    fig.show()


def create_histogram(df, column):
    fig = px.histogram(df, x=column, title=f"Distribution of {column}")
    fig.show()


# Run initial analysis
print("\nColumn names in the dataset:")
for col in df.columns:
    print(f"- {col}")

# Identify numeric columns for analysis
numeric_columns = df.select_dtypes(include=[np.number]).columns
print("\nNumeric columns available for analysis:")
for col in numeric_columns:
    print(f"- {col}")

# Create histograms for numeric columns
for col in numeric_columns:
    create_histogram(df, col)

# Create box plots for numeric columns
for col in numeric_columns:
    create_box_plot(df, col)
