# Finance Tracker

A personal finance tracking web app with a **React + Vite** frontend and a **Flask** backend.

## Project Structure

```
Finance-Trackers-101-main/
├── backend/              # Flask API + chart generation
│   ├── app.py            # Main server
│   ├── barplot.py        # Bar chart script (standalone)
│   ├── heatmap.py        # Heatmap script (standalone)
│   ├── linechart.py      # Line chart script (standalone)
│   ├── piechart.py       # Pie chart script (standalone)
│   └── database.sqlite   # Auto-created SQLite DB
├── src/                  # React frontend
│   ├── App.tsx
│   ├── Graphs.tsx
│   ├── SignIn.tsx
│   ├── SignUp.tsx
│   ├── ThemeContext.tsx
│   ├── api.ts
│   ├── hooks/useAuth.ts
│   ├── components/ProtectedRoute.tsx
│   └── pages/BudgetPage.tsx
├── requirements.txt
└── package.json
```

## Running Locally

### 1. Backend (Flask)

```bash
cd backend
pip install -r ../requirements.txt
python app.py
```

The API runs at `http://localhost:5000`.

### 2. Frontend (React)

In a separate terminal:

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

## AI Insights (Optional)

Set your OpenRouter API key as an environment variable before starting the backend:

```bash
# Windows
set OPENROUTER_API_KEY=sk-...

# macOS / Linux
export OPENROUTER_API_KEY=sk-...
```

If not set, the AI Insights button will return a friendly message instead of crashing.

## Features

- ✅ Add / delete transactions (description, amount, category, date)
- ✅ Auto-generated interactive charts (bar, line, pie, heatmap) after each transaction
- ✅ AI-powered spending insights (date-range filtered)
- ✅ Dark mode toggle (persisted in localStorage)
- ✅ Sign Up / Sign In (email + password, stored in SQLite)