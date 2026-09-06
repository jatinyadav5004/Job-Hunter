# 🚀 Vercel Deployment Guide for JobHunter AI

This application is fully pre-configured for **1-Click Full-Stack Deployment** on Vercel (React Frontend + Express Serverless API).

---

## 📋 Prerequisites
1. **GitHub / GitLab / Bitbucket account**
2. **MongoDB Atlas Database** (free M0 cluster)
3. **Vercel Account** ([vercel.com](https://vercel.com))

---

## ⚡ Step 1: Push Code to GitHub

Open terminal in `f:\HunterWeb` and commit the latest code:
```bash
git add .
git commit -m "Configure full-stack Vercel deployment"
git push origin main
```

---

## 🌐 Step 2: Import Project on Vercel

1. Log in to [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** → **"Project"**.
3. Select your `HunterWeb` (or `JobHunterAI`) GitHub repository and click **"Import"**.

---

## ⚙️ Step 3: Configure Build & Root Directory

* **Framework Preset**: `Vite` (or `Other`)
* **Root Directory**: `./` (leave default root)
* **Build Command**: `npm run build` (auto-detected)
* **Output Directory**: `client/dist` (auto-configured via `vercel.json`)

---

## 🔑 Step 4: Add Environment Variables in Vercel

In the **"Environment Variables"** section on Vercel, add the following key-value pairs:

| Variable Name | Example Value | Description |
|---|---|---|
| `MONGODB_URI` | `mongodb+srv://user:pass@cluster.mongodb.net/jobHunterDB?retryWrites=true&w=majority` | Your MongoDB Atlas connection string |
| `JWT_SECRET` | `super_secure_production_secret_key_123` | Secret key for JWT session tokens |
| `JWT_EXPIRES_IN` | `30d` | Token expiry duration |
| `AI_PROVIDER` | `openai` | AI Engine (`openai` or `gemini`) |
| `OPENAI_API_KEY` | `sk-proj-83Cz...` | Your OpenAI API key |
| `GEMINI_API_KEY` | `your_gemini_api_key` | Optional Gemini API key |
| `RAPIDAPI_KEY` | `0bfad1fad3mshbd0c54df16e123cp130abdjsn4812f7f66c9a` | RapidAPI JSearch key for live job crawling |
| `ADMIN_EMAILS` | `your_email@gmail.com` | Comma-separated admin emails automatically granted PRO privileges |
| `VITE_AUTO_LOGOUT_HOURS` | `24` | Inactivity auto-logout duration in hours (default: 24) |
| `NODE_ENV` | `production` | Production environment flag |

---

## 🛡️ Step 5: Configure MongoDB Atlas Network Access

1. Go to [MongoDB Atlas](https://cloud.mongodb.com).
2. Navigate to **Security** → **Network Access**.
3. Click **"Add IP Address"** → Select **"Allow Access from Anywhere"** (`0.0.0.0/0`).
4. Click **Confirm**. (Required because Vercel serverless functions use dynamic IP addresses).

---

## 🚀 Step 6: Click "Deploy"

* Vercel will install dependencies, build the Vite frontend, and mount the Express serverless API at `/api/*`.
* Your app will be live at `https://your-project.vercel.app`!
