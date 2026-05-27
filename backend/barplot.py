import sqlite3
import pandas as pd
import plotly.graph_objs as go
import plotly.offline as pyo
from datetime import datetime

# --- Database Connection ---
def connect_to_db(db_file):
    return sqlite3.connect(db_file)

# --- Fetch Data from Database ---
def fetch_data_from_db(conn):
    query = """
    SELECT amount, category, date FROM "transaction"
    """
    return pd.read_sql_query(query, conn)

# --- Data Preparation ---
def prepare_data_for_plot(df):
    df["date"] = pd.to_datetime(df["date"])
    df_pivot = df.pivot_table(index="date", columns="category", values="amount", aggfunc="sum").fillna(0)
    return df_pivot

# --- Plotly Visualization ---
def create_bar_chart(df_pivot):
    cyberpunk_colors = {
        "Housing": "#0ff0fc",        # Neon Cyan
        "Food": "#ff00cc",           # Hot Pink
        "Transportation": "#a8f7fc",# Electric Blue
        "Entertainment": "#f5b700", # Neon Yellow
        "Healthcare": "#be0aff",     # Vivid Purple
        "Shopping": "#fe53bb",       # Pink Magenta
        "Groceries": "#a0ccfb",       # Pink Magenta
        "Others": "#39ff14",         # Bright Green
    }

    data = []
    for category in df_pivot.columns:
        data.append(
            go.Bar(
                x=df_pivot.index,
                y=df_pivot[category],
                name=category,
                marker=dict(
                    color=cyberpunk_colors.get(category, "#FFFFFF"),
                    line=dict(width=1.5, color="rgba(255,255,255,0.3)")
                ),
                opacity=0.85,
                hovertemplate=(
                    f"<b>{category}</b><br>"
                    "Date: %{x}<br>"
                    "Amount: ₹%{y}<extra></extra>"
                )
            )
        )

    layout = go.Layout(
        title=dict(
            text="Spending Dashboard",
            font=dict(
                family="Orbitron, sans-serif",
                size=26,
                color="#00ffff"
            ),
            x=0.5,
            xanchor="center"
        ),
        barmode="stack",
        xaxis=dict(
            tickangle=45,
            showgrid=False,
            zeroline=False,
            title=dict(
                text="Date",
                font=dict(size=18, color="#ff00cc")
            ),
            tickfont=dict(size=12, color="#FFFFFF"),
            linecolor="#555"
        ),
        yaxis=dict(
            showgrid=True,
            gridcolor="rgba(255,255,255,0.1)",
            zerolinecolor="#ff00cc",
            title=dict(
                text="Amount Spent",
                font=dict(size=18, color="#ff00cc")
            ),
            tickfont=dict(size=12, color="#FFFFFF")
        ),
        plot_bgcolor="rgba(0,0,0,0.85)",
        paper_bgcolor="rgba(0,0,0,1)",
        font=dict(
            family="Orbitron, sans-serif",
            size=14,
            color="#FFFFFF"
        ),
        legend=dict(
            title=dict(text="Categories", font=dict(color="#39ff14")),
            orientation="h",
            x=0.5,
            xanchor="center",
            y=-0.3,
            font=dict(color="#FFFFFF")
        ),
        margin=dict(l=60, r=30, t=80, b=90),
        transition=dict(duration=500, easing="cubic-in-out")
    )

    fig = go.Figure(data=data, layout=layout)
    return fig

# --- Main Execution ---
if __name__ == "__main__":
    conn = connect_to_db("database.sqlite")
    df = fetch_data_from_db(conn)
    conn.close()
    df_pivot = prepare_data_for_plot(df)
    fig = create_bar_chart(df_pivot)
    pyo.plot(fig, filename="barplot.html", auto_open=False)
