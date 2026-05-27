import sqlite3
import pandas as pd
import plotly.graph_objs as go
import plotly.offline as pyo

# --- Database Connection ---
def connect_to_db(db_file):
    return sqlite3.connect(db_file)

# --- Fetch Data from Database ---
def fetch_data_from_db(conn):
    query = "SELECT amount, category, date FROM 'transaction'"
    df = pd.read_sql_query(query, conn)

    print("\n--- RAW DATA FROM DATABASE ---")
    print(df.head())  # Print first few rows
    print(df.dtypes)  # Print data types

    return df

# --- Data Preparation ---
def prepare_data_for_plot(df):
    print("\n--- BEFORE CONVERSION ---")
    print(df.dtypes)  # Check data types

    df["date"] = pd.to_datetime(df["date"], errors="coerce")  # Convert date
    df.set_index("date", inplace=True)  # Ensure 'date' is the index

    print("\n--- AFTER CONVERSION ---")
    print(df.dtypes)  # Confirm 'date' is datetime64
    print(df.head())  # Print first few rows

    df_pivot = df.pivot_table(index=df.index, columns="category", values="amount", aggfunc="sum").fillna(0)

    print("\n--- AFTER PIVOT ---")
    print(df_pivot.index)  # Check index type

    return df_pivot

# --- Plotly Visualization ---
def create_heatmap(df_pivot):
    print("\n--- INDEX TYPE BEFORE PLOTTING ---")
    print(type(df_pivot.index))  # Should be DatetimeIndex

    if not isinstance(df_pivot.index, pd.DatetimeIndex):
        print("⚠️ WARNING: df_pivot.index is not DatetimeIndex! Fixing now...")
        df_pivot.index = pd.to_datetime(df_pivot.index, errors="coerce")  # Force conversion

    print("\n--- FINAL INDEX TYPE ---")
    print(type(df_pivot.index))  # Confirm it's DatetimeIndex

    heatmap = go.Heatmap(
        z=df_pivot.values,
        x=df_pivot.columns,
        y=df_pivot.index.strftime('%b %d'),  # Format date
        colorscale="Viridis",
        colorbar=dict(
            title="Amount Spent",
            tickcolor="white",
            titlefont=dict(color="white"),
            tickfont=dict(color="white")
        ),
        hovertemplate=(
            "<b>Category:</b> %{x}<br>"
            "<b>Date:</b> %{y}<br>"
            "<b>Amount:</b> %{z}<extra></extra>"
        )
    )

    layout = go.Layout(
        title="Spending Heatmap Over Time",
        font=dict(
            family="Comic Sans MS, sans-serif",
            size=14,
            color="white"
        ),
        xaxis=dict(
            title="Categories",
            tickangle=-45,
            color="white",
            showgrid=True,
            gridcolor="gray"
        ),
        yaxis=dict(
            title="Date",
            color="white",
            showgrid=True,
            gridcolor="gray"
        ),
        plot_bgcolor="black",       # Chart area background
        paper_bgcolor="black",      # Whole page background
    )

    fig = go.Figure(data=[heatmap], layout=layout)
    return fig

# --- Main Execution ---
if __name__ == "__main__":
    db_connection = connect_to_db("database.sqlite")
    df = fetch_data_from_db(db_connection)
    db_connection.close()

    df_pivot = prepare_data_for_plot(df)
    fig = create_heatmap(df_pivot)

    pyo.plot(fig, filename="heatmap.html", auto_open=False)
