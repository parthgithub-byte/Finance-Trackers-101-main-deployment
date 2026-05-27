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
def prepare_pie_chart_data(df, period, value):
    """Aggregate amounts by category for the selected period (week or month)."""
    df["date"] = pd.to_datetime(df["date"])
    
    if period == "Month":
        df = df[df["date"].dt.month == value]
    elif period == "Week":
        df = df[df["date"].dt.isocalendar().week == value]
    
    category_totals = df.groupby("category")["amount"].sum()
    return category_totals

# --- Pie Chart Visualization ---
def create_pie_chart(df):
    """Create and plot a cartoon-style pie chart with selectable timeframes."""
    colors = {
        "Housing": "#4285F4",  # Blue
        "Food": "#34A853",  # Green
        "Transportation": "#FBBC05",  # Yellow
        "Entertainment": "#A142F4",  # Purple
        "Healthcare": "#EA4335",  # Red
        "Shopping": "#F06292",  # Pink
        "Others": "#808080"  # Gray
    }
    
    months = {i: datetime(2000, i, 1).strftime("%B") for i in range(1, 13)}
    weeks = [f"Week {i}" for i in range(1, 53)]
    
    data = []
    for period, values in [("Month", months.keys()), ("Week", range(1, 53))]:
        for value in values:
            filtered_data = prepare_pie_chart_data(df, period, value)
            trace = go.Pie(
                labels=filtered_data.index,
                values=filtered_data.values,
                name=f"{period} {value}",
                marker=dict(
                    colors=[colors.get(cat, "#A9A9A9") for cat in filtered_data.index],
                    line=dict(color='black', width=3)
                ),
                textinfo="label+percent",
                hoverinfo="label+value+percent",
                visible=False
            )
            data.append(trace)
    
    data[0]["visible"] = True  # Set the first pie chart as visible by default
    
    buttons = []
    idx = 0
    for period, values in [("Month", months.keys()), ("Week", range(1, 53))]:
        for value in values:
            buttons.append({
                "label": f"{period} {value if period == 'Week' else months[value]}",
                "method": "update",
                "args": [
                    {"visible": [i == idx for i in range(len(data))]},
                    {"title": f"Spending Breakdown - {period} {value if period == 'Week' else months[value]}"}
                ]
            })
            idx += 1
    
    layout = go.Layout(
    title="Spending Breakdown by Category",
    font=dict(
        family="Comic Sans MS, sans-serif",
        size=16,
        color="white"
    ),
    paper_bgcolor="black",       # Background of entire plot
    plot_bgcolor="black",        # Background of plotting area (for other charts)
    legend=dict(
        font=dict(color="white")
    ),
    updatemenus=[
        {
            "buttons": buttons,
            "direction": "down",
            "showactive": True,
            "bgcolor": "gray",          # Dropdown menu background
            "font": {"color": "white"}  # Dropdown menu font
        }
    ]
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
    
    # Create the pie chart
    fig = create_pie_chart(df)
    
    # Plot the chart
    pyo.plot(fig, filename="piechart.html", auto_open=False)