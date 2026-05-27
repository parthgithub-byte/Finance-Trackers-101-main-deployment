# Finance Tracker

A personal finance tracking web app with a **React + Vite** frontend and a **Flask** backend.

**🌟 Live Demo:** [https://finance-trackers-101-main-deploymen.vercel.app/](https://finance-trackers-101-main-deploymen.vercel.app/)

## Project Structure

```
Finance-Trackers-101-main/
├── backend/              # Flask API + chart generation
│   ├── app.py            # Main server (includes chart gen)
│   └── database.sqlite   # Auto-created SQLite DB
├── src/                  # React frontend
│   ├── App.jsx
│   ├── Graphs.jsx
│   ├── SignIn.jsx
│   ├── SignUp.jsx
│   ├── ThemeContext.jsx
│   ├── api.js
│   ├── hooks/useAuth.js
│   ├── components/ProtectedRoute.jsx
│   └── pages/BudgetPage.jsx
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

Create a `.env` file in the root of the project to enable Langchain/Gemini AI Insights:

```bash
GEMINI_API_KEY=your_google_ai_studio_key_here
GEMINI_MODEL=gemini-3.5-flash
```

If not set, the AI Insights panel will return a friendly message instead of crashing.

## Features

- ✅ Add / delete transactions (description, amount, category, date)
- ✅ Auto-generated interactive charts (bar, line, pie, heatmap) after each transaction
- ✅ AI-powered spending insights (date-range filtered)
- ✅ Dark mode toggle (persisted in localStorage)
- ✅ Sign Up / Sign In (email + password, stored in SQLite)