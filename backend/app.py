from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
import os
import sqlite3
import pandas as pd
import plotly.graph_objs as go
import plotly.offline as pyo
from datetime import datetime, timezone
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configure SQLite
BASE_DIR = os.path.abspath(os.path.dirname(__file__))

# Load .env from project root (one level above backend/)
load_dotenv(os.path.join(BASE_DIR, '..', '.env'))

app.config['SQLALCHEMY_DATABASE_URI'] = f"sqlite:///{os.path.join(BASE_DIR, 'database.sqlite')}"
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


# --- Models ---

class Transaction(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    description = db.Column(db.String(255), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    date = db.Column(db.String(50), nullable=False)


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)

    def __repr__(self):
        return f'<User {self.email}>'


class CategoryAllocation(db.Model):
    __tablename__ = 'category_allocations'
    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(255), nullable=False)
    monthly_allocation = db.Column(db.Float, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.now(timezone.utc))


# Create tables
with app.app_context():
    db.create_all()

_charts_initialized = False

@app.before_request
def initialize_charts():
    """Regenerate charts once on first request if data exists."""
    global _charts_initialized
    if not _charts_initialized:
        _charts_initialized = True
        if Transaction.query.count() > 0:
            generate_all_charts()


# --- Auth Routes ---

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'User already exists'}), 400

    new_user = User(email=email, password=password)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User registered successfully'}), 201


@app.route('/signin', methods=['POST'])
def signin():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email, password=password).first()
    if user:
        return jsonify({'message': 'Login successful', 'user_id': user.id}), 200
    return jsonify({'error': 'Invalid credentials'}), 401


# --- Transaction Routes ---

@app.route('/transactions', methods=['GET'])
def get_transactions():
    transactions = Transaction.query.all()
    return jsonify([{
        'id': t.id,
        'description': t.description,
        'amount': t.amount,
        'category': t.category,
        'date': t.date
    } for t in transactions])


@app.route('/transactions', methods=['POST'])
def add_transaction():
    data = request.json
    try:
        new_transaction = Transaction(
            description=data['description'],
            amount=data['amount'],
            category=data['category'],
            date=data['date']
        )
        db.session.add(new_transaction)
        db.session.commit()
        # Regenerate all charts after a new transaction
        generate_all_charts()
        return jsonify({'message': 'Transaction added!', 'id': new_transaction.id}), 201
    except Exception as e:
        print("Error adding transaction:", e)
        return jsonify({'error': str(e)}), 500


@app.route('/transactions/<int:id>', methods=['DELETE', 'OPTIONS'])
def delete_transaction(id):
    if request.method == 'OPTIONS':
        response = jsonify({'message': 'Preflight OK'})
        response.headers.add('Access-Control-Allow-Origin', '*')
        response.headers.add('Access-Control-Allow-Methods', 'DELETE, GET, POST, OPTIONS')
        response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
        return response, 200

    transaction = Transaction.query.get(id)
    if transaction:
        db.session.delete(transaction)
        db.session.commit()
        # Regenerate charts after deletion
        generate_all_charts()
        return jsonify({'message': 'Transaction deleted successfully'})
    return jsonify({'error': 'Transaction not found'}), 404


# --- Budget / Allocation Routes ---

@app.route('/category-allocations', methods=['POST'])
def add_category_allocation():
    try:
        data = request.get_json()
        category = data.get('category')
        monthly_allocation = data.get('monthly_allocation')

        allocation = CategoryAllocation.query.filter_by(category=category).first()
        if allocation:
            allocation.monthly_allocation = monthly_allocation
        else:
            allocation = CategoryAllocation(category=category, monthly_allocation=monthly_allocation)
            db.session.add(allocation)

        db.session.commit()
        return jsonify({'message': 'Category allocation updated successfully'}), 200
    except Exception as e:
        print(f"Error updating allocation: {e}")
        return jsonify({'message': 'Error processing the request'}), 400


@app.route('/category-allocations', methods=['GET'])
def get_category_allocations():
    try:
        allocations = CategoryAllocation.query.all()
        return jsonify([{
            'category': a.category,
            'monthly_allocation': a.monthly_allocation
        } for a in allocations]), 200
    except Exception as e:
        print(f"Error retrieving allocations: {e}")
        return jsonify({'message': 'Error retrieving data'}), 400


# --- Chart Generation (inline, no subprocess) ---

CYBERPUNK_COLORS = {
    "Housing": "#0ff0fc",
    "Food": "#ff00cc",
    "Transportation": "#a8f7fc",
    "Entertainment": "#f5b700",
    "Healthcare": "#be0aff",
    "Shopping": "#fe53bb",
    "Groceries": "#a0ccfb",
    "Others": "#39ff14",
}

CHART_LAYOUT_BASE = dict(
    plot_bgcolor="rgba(0,0,0,0.85)",
    paper_bgcolor="rgba(0,0,0,1)",
    font=dict(family="Orbitron, sans-serif", size=14, color="#FFFFFF"),
    margin=dict(l=60, r=30, t=80, b=90),
)


def get_df():
    conn = sqlite3.connect(os.path.join(BASE_DIR, 'database.sqlite'))
    df = pd.read_sql_query('SELECT amount, category, date FROM "transaction"', conn)
    conn.close()
    return df


def generate_all_charts():
    """Generate all four chart HTML files into the backend directory."""
    try:
        df = get_df()
        if df.empty:
            return
        df["date"] = pd.to_datetime(df["date"])
        df_pivot = df.pivot_table(index="date", columns="category", values="amount", aggfunc="sum").fillna(0)

        _gen_barplot(df_pivot)
        _gen_linechart(df_pivot)
        _gen_piechart(df)
        _gen_heatmap(df_pivot)
        print("✅ All charts regenerated.")
    except Exception as e:
        print(f"❌ Chart generation error: {e}")


def _gen_barplot(df_pivot):
    data = [
        go.Bar(
            x=df_pivot.index, y=df_pivot[cat], name=cat,
            marker=dict(color=CYBERPUNK_COLORS.get(cat, "#fff"), line=dict(width=1.5, color="rgba(255,255,255,0.3)")),
            opacity=0.85,
            hovertemplate=f"<b>{cat}</b><br>Date: %{{x}}<br>Amount: ₹%{{y}}<extra></extra>"
        )
        for cat in df_pivot.columns
    ]
    layout = go.Layout(
        **CHART_LAYOUT_BASE,
        title=dict(text="Spending Dashboard", font=dict(family="Orbitron, sans-serif", size=26, color="#00ffff"), x=0.5),
        barmode="stack",
        xaxis=dict(tickangle=45, showgrid=False, zeroline=False,
                   title=dict(text="Date", font=dict(size=18, color="#ff00cc")),
                   tickfont=dict(size=12, color="#FFFFFF")),
        yaxis=dict(showgrid=True, gridcolor="rgba(255,255,255,0.1)",
                   title=dict(text="Amount Spent", font=dict(size=18, color="#ff00cc")),
                   tickfont=dict(size=12, color="#FFFFFF")),
        legend=dict(title=dict(text="Categories", font=dict(color="#39ff14")),
                    orientation="h", x=0.5, xanchor="center", y=-0.3, font=dict(color="#FFFFFF")),
    )
    pyo.plot(go.Figure(data=data, layout=layout), filename=os.path.join(BASE_DIR, "barplot.html"), auto_open=False)


def _gen_linechart(df_pivot):
    data = [
        go.Scatter(
            x=df_pivot.index, y=df_pivot[cat], mode="lines+markers", name=cat,
            line=dict(color=CYBERPUNK_COLORS.get(cat, "#fff"), width=2),
            marker=dict(size=6),
            hovertemplate=f"<b>{cat}</b><br>Date: %{{x}}<br>Amount: ₹%{{y}}<extra></extra>"
        )
        for cat in df_pivot.columns
    ]
    layout = go.Layout(
        **CHART_LAYOUT_BASE,
        title=dict(text="Spending Trends Over Time", font=dict(family="Orbitron, sans-serif", size=26, color="#00ffff"), x=0.5),
        xaxis=dict(tickangle=45, showgrid=False, title=dict(text="Date", font=dict(size=18, color="#ff00cc")),
                   tickfont=dict(size=12, color="#FFFFFF")),
        yaxis=dict(showgrid=True, gridcolor="rgba(255,255,255,0.1)",
                   title=dict(text="Amount Spent", font=dict(size=18, color="#ff00cc")),
                   tickfont=dict(size=12, color="#FFFFFF")),
        legend=dict(orientation="h", x=0.5, xanchor="center", y=-0.3, font=dict(color="#FFFFFF")),
    )
    pyo.plot(go.Figure(data=data, layout=layout), filename=os.path.join(BASE_DIR, "linechart.html"), auto_open=False)


def _gen_piechart(df):
    totals = df.groupby("category")["amount"].sum()
    fig = go.Figure(go.Pie(
        labels=totals.index,
        values=totals.values,
        marker=dict(colors=[CYBERPUNK_COLORS.get(c, "#fff") for c in totals.index],
                    line=dict(color="#000", width=2)),
        hovertemplate="<b>%{label}</b><br>₹%{value}<br>%{percent}<extra></extra>",
        textfont=dict(size=14, color="#FFFFFF"),
    ))
    fig.update_layout(
        **CHART_LAYOUT_BASE,
        title=dict(text="Category Distribution", font=dict(family="Orbitron, sans-serif", size=26, color="#00ffff"), x=0.5),
        legend=dict(font=dict(color="#FFFFFF")),
    )
    pyo.plot(fig, filename=os.path.join(BASE_DIR, "piechart.html"), auto_open=False)


def _gen_heatmap(df_pivot):
    fig = go.Figure(go.Heatmap(
        z=df_pivot.values.T,
        x=df_pivot.index,
        y=df_pivot.columns,
        colorscale="Plasma",
        hovertemplate="Date: %{x}<br>Category: %{y}<br>Amount: ₹%{z}<extra></extra>",
    ))
    fig.update_layout(
        **CHART_LAYOUT_BASE,
        title=dict(text="Spending Heatmap", font=dict(family="Orbitron, sans-serif", size=26, color="#00ffff"), x=0.5),
        xaxis=dict(tickangle=45, tickfont=dict(size=12, color="#FFFFFF"),
                   title=dict(text="Date", font=dict(size=18, color="#ff00cc"))),
        yaxis=dict(tickfont=dict(size=12, color="#FFFFFF"),
                   title=dict(text="Category", font=dict(size=18, color="#ff00cc"))),
    )
    pyo.plot(fig, filename=os.path.join(BASE_DIR, "heatmap.html"), auto_open=False)


# --- Plot Serve Route ---

@app.route('/plot/<plot_type>')
def serve_plot(plot_type):
    filename_map = {
        "bar": "barplot.html",
        "line": "linechart.html",
        "pie": "piechart.html",
        "heatmap": "heatmap.html",
    }
    filename = filename_map.get(plot_type)
    if filename:
        return send_from_directory(BASE_DIR, filename)
    return "Plot not found", 404


# --- AI Insights Route ---

@app.route('/insights', methods=['POST'])
def fetch_insight():
    try:
        data = request.get_json()
        start_date = data.get('start_date')
        end_date = data.get('end_date')
        insight = generate_insights(start_date, end_date)
        return jsonify({'insight': insight})
    except Exception as e:
        print("Error in fetch_insight:", e)
        return jsonify({'insight': 'Error processing the request.'})


def generate_insights(start_date=None, end_date=None):
    transactions = Transaction.query.all()

    if start_date and end_date:
        transactions = [t for t in transactions if start_date <= t.date <= end_date]

    if not transactions:
        return "No transactions found for the selected period."

    # Build weekly spending summary
    data_by_week = {}
    for t in transactions:
        date_obj = datetime.strptime(t.date, "%Y-%m-%d")
        year_week = date_obj.strftime("%Y-W%U")
        data_by_week.setdefault(year_week, {})
        data_by_week[year_week][t.category] = data_by_week[year_week].get(t.category, 0) + t.amount

    trend_text = ""
    for week, cats in sorted(data_by_week.items()):
        trend_text += f"{week}:\n"
        for cat, amt in cats.items():
            trend_text += f"  - {cat}: ₹{amt:.2f}\n"
        trend_text += "\n"

    # Read config from .env
    api_key = os.environ.get("GEMINI_API_KEY", "")
    model_name = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")

    if not api_key or api_key == "your_api_key_here":
        return "AI insights unavailable: please set GEMINI_API_KEY in your .env file."

    try:
        # LangChain LCEL chain: prompt | llm | output parser
        prompt = ChatPromptTemplate.from_messages([
            (
                "system",
                "You are a concise financial assistant. Analyze the user's weekly spending "
                "and provide 3-5 short, actionable insights and recommendations. "
                "Use bullet points. Keep it under 200 words.",
            ),
            (
                "human",
                "Here is my weekly spending breakdown:\n\n{trend_text}\n\n"
                "Give me a trend analysis with practical recommendations.",
            ),
        ])

        llm = ChatGoogleGenerativeAI(
            model=model_name,
            google_api_key=api_key,
            temperature=0.3,
        )

        chain = prompt | llm | StrOutputParser()
        return chain.invoke({"trend_text": trend_text})

    except Exception as e:
        print("Error generating AI insight:", e)
        return f"Error generating insight: {str(e)}"


if __name__ == '__main__':
    app.run(debug=True, port=5000)
