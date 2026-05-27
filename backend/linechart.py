import sqlite3
import pandas as pd
import plotly.graph_objs as go
import plotly.offline as pyo
from datetime import datetime

# --- Database Connection ---
def connect_to_db(db_file):
    """Connect to SQLite database."""
    return sqlite3.connect(db_file)

# --- Fetch Data from Database ---
def fetch_data_from_db(conn):
    """Fetch transaction data for all dates."""
    query = "SELECT amount, category, date FROM 'transaction'"
    return pd.read_sql_query(query, conn)

# --- Data Preparation ---
def prepare_line_chart_data(df):
    """Convert date column and aggregate spending by date and category."""
    df["date"] = pd.to_datetime(df["date"])
    df_pivot = df.pivot_table(index="date", columns="category", values="amount", aggfunc="sum").fillna(0)
    return df_pivot

# --- Line Chart Visualization ---
def create_chart(df_pivot):
    """Create and plot a cartoon-style line chart with a dark theme."""
    
    colors = {
        "Housing": "#4285F4",       # Blue
        "Food": "#34A853",          # Green
        "Transportation": "#FBBC05",# Yellow
        "Entertainment": "#A142F4", # Purple
        "Healthcare": "#EA4335",    # Red
        "Shopping": "#F06292",      # Pink
        "Groceries": "#00ccff",     # Cyan
        "Others": "#808080"         # Gray
    }
    
    data = [
        go.Scatter(
            x=df_pivot.index,
            y=df_pivot[category],
            mode="lines+markers",
            name=category,
            line=dict(color=colors.get(category, "#A9A9A9"), width=3),
            marker=dict(size=6, line=dict(color='black', width=1)),
            hovertemplate=f"Category: {category}<br>Date: %{{x}}<br>Amount: %{{y}}<extra></extra>"
        )
        for category in df_pivot.columns
    ]

    layout = go.Layout(
        title="Spending Trends Over Time",
        font=dict(
            family="Comic Sans MS, sans-serif",
            size=14,
            color="white"
        ),
        xaxis=dict(
            title="Date",
            tickangle=45,
            showgrid=True,
            gridcolor="gray",
            color="white"
        ),
        yaxis=dict(
            title="Amount Spent",
            showgrid=True,
            gridcolor="gray",
            zeroline=True,
            color="white"
        ),
        plot_bgcolor="black",
        paper_bgcolor="black",
        legend=dict(
            title="Categories",
            orientation="h",
            x=0.5,
            xanchor="center",
            y=-0.25,
            font=dict(color="white")
        )
    )

    fig = go.Figure(data=data, layout=layout)
    return fig


# --- Main Execution ---
if __name__ == "__main__":
    # Connect to the database
    db_connection = connect_to_db("database.sqlite")
    
    # Fetch data from the database
    df = fetch_data_from_db(db_connection)
    
    # Close the database connection
    db_connection.close()
    
    # Prepare the data for the line chart
    df_pivot = prepare_line_chart_data(df)
    
    # Create the line chart
    fig = create_chart(df_pivot)
    
    # Plot the chart
    pyo.plot(fig, filename="linechart.html", auto_open=False)
