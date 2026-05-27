# Deployment Guide: Vercel + Render

This guide outlines the step-by-step process to deploy your **Personal Finance Tracker** application. The backend (Flask) will be deployed on **Render**, and the frontend (React + Vite) will be deployed on **Vercel**.

---

## 🛠️ Step 0: Git Initialization & GitHub Push

Before deploying to either Vercel or Render, you need to push your local codebase to a GitHub repository.

1. **Initialize Git** in the project root:
   ```powershell
   git init
   git add .
   git commit -m "Initialize project and prepare for deployment"
   ```

2. **Create a new repository** on [GitHub](https://github.com/):
   - Name it `Finance-Tracker` (or any name you prefer).
   - Keep it **Public** or **Private** (both work fine).
   - Leave "Add a README", ".gitignore", and "license" unchecked.

3. **Link and Push** your code:
   ```powershell
   git remote add origin https://github.com/your-username/your-repo-name.git
   git branch -M main
   git push -u origin main
   ```

---

## 🐍 Step 1: Deploying the Backend on Render

Render is a cloud platform that hosts Python/Flask web services for free.

1. **Sign Up/Log In** to [Render](https://render.com/).
2. Click **New +** (top right) and select **Web Service**.
3. **Connect GitHub**:
   - Link your GitHub account and select your `Finance-Tracker` repository.
4. **Configure the Web Service**:
   - **Name**: `finance-tracker-backend` (or similar)
   - **Environment**: `Python3` (default)
   - **Region**: Select the region closest to you
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r ../requirements.txt`
   - **Start Command**: `gunicorn app:app` (Render requires this production WSGI server instead of the dev server)
   - **Instance Type**: Select **Free**
5. **Configure Environment Variables**:
   - Click the **Environment** tab.
   - Add the following keys:
     - `GEMINI_API_KEY`: *Your Google AI Studio Key*
     - `GEMINI_MODEL`: `gemini-2.5-flash` (or your preferred model name)
     - `PYTHON_VERSION`: `3.11.0` (helps avoid build environment mismatches)
6. Click **Create Web Service**.
7. **Wait for Build**: Render will take a few minutes to install dependencies and boot. Once done, it will give you a public URL (e.g., `https://finance-tracker-backend.onrender.com`). **Copy this URL**.

---

## ⚡ Step 2: Deploying the Frontend on Vercel

Vercel is the premier platform for deploying React/Vite applications.

1. **Sign Up/Log In** to [Vercel](https://vercel.com/) (select "Continue with GitHub").
2. Click **Add New...** -> **Project**.
3. Import your `Finance-Tracker` repository.
4. **Configure the Project**:
   - **Framework Preset**: `Vite` (Vercel auto-detects this)
   - **Root Directory**: `./` (leave empty/default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. **Configure Environment Variables**:
   - Expand the **Environment Variables** section.
   - Add:
     - **Key**: `VITE_API_URL`
     - **Value**: *Paste the Render Backend URL you copied in Step 1* (e.g., `https://finance-tracker-backend.onrender.com`)
6. Click **Deploy**.
7. **Done!** Vercel will build your assets and give you a live production URL (e.g., `https://finance-tracker-frontend.vercel.app`) in less than a minute!

---

## 🔒 A Note on SQLite Database Persistence

Because Render's free tier has an **ephemeral disk**, your database (`database.sqlite`) will reset back to its initial empty state every time the backend web service spins down due to inactivity or a redeploy. 

For a portfolio/college project demo, this is normal and perfectly acceptable. If you ever require permanent database storage, you can easily spin up a free PostgreSQL database on Render and update `app.py` to point to the PostgreSQL connection string instead of SQLite.
