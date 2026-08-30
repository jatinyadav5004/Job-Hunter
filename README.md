# JobHunter AI — Full-Stack AI Job Hunter & Cold Email Automation Platform

JobHunter AI is a production-grade full-stack platform designed to automate the tech job search and recruiter outreach loop while keeping candidate control at the center:

**Upload Resume → Extract & Structure Profile → Configure Saved Searches → Daily Multi-Source Crawler (node-cron) → Deduplicate & Filter → AI Match Scoring & Deep Gap Analysis → Discover Legitimate Recruiters → Generate Hyper-Personalized Cold Emails → Review & Approve → Dispatch via Gmail/Outlook OAuth → Track in Kanban Pipeline**

---

## 🏗️ Architecture & Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, React Router v6, Axios.
- **Backend**: Node.js & Express (Modular Monolith), RESTful APIs.
- **Database**: MongoDB with Mongoose (Strict User Data Isolation, Deduplication indexes).
- **Scheduling**: Native `node-cron` with a staged cost-saving AI filtering pipeline.
- **AI Integration**: Dual-engine support for Google Gemini & OpenAI with intelligent heuristic fallback parsers.
- **Email Infrastructure**: Gmail OAuth2 (`googleapis`) and Microsoft Outlook (`@microsoft/microsoft-graph-client`), safety rate limiting, and duplicate prevention.

---

## 🚀 Key Features

1. **AI Resume Parser**:
   - Accepts PDF and DOCX files.
   - Extracts structured candidate profiles (Name, contact info, years of experience, skill tags, work experience, education, projects).
   - Allows live interactive editing. Never hallucinates unverified qualifications.

2. **Modular Job Sources & Normalized Ingestion**:
   - `GreenhouseSource`: Fetches public jobs from Greenhouse public job boards.
   - `LeverSource`: Standardizes postings from Lever public boards.
   - `CompliantAggregatorSource`: Standardized endpoints for LinkedIn, Indeed, Naukri, Wellfound, and company career portals.
   - Automatic MD5 fingerprinting (`company|title|location|url`) and source ID deduplication.

3. **Staged Cost-Saving Pipeline**:
   ```text
   Discovered Jobs
          ↓
   Basic Filters (Excluded Companies, Keywords, Locations, Experience)
          ↓
   Deduplication Index Check
          ↓
   AI Match Analysis (Skills, Exp, Title, Location, Salary Breakdown)
          ↓
   High-Quality Opportunity Matches & Recruiter Discovery
   ```

4. **AI Match Score & Gap Analysis**:
   - Calculates overall score (e.g. 94%) and breakdown across 5 dimensions.
   - Generates natural language explanations: "Why this matches" and "Missing requirements/gaps".

5. **Personalized Cold Outreach**:
   - Generates **Normal (3 paragraphs)** and **Short (3-4 punchy sentences)** email versions.
   - Custom prompts and editable message body before dispatch.
   - Daily sending safety limits (default 20 emails/day) to safeguard domain reputation.

6. **Kanban Application Tracker**:
   - 6 Pipeline stages: `Shortlisted` → `Applied` → `Recruiter Contacted` → `Interview` → `Offer` → `Rejected`.
   - Card management, interview round logging, and notes.

7. **Recruiter Directory**:
   - Discovers verified talent acquisition leads with email, LinkedIn, and past outreach logs.

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 18+ installed.
- MongoDB instance running locally (`mongodb://127.0.0.1:27017/jobhunter-ai`) or MongoDB Atlas URI.

### 2. Installation
Install root, server, and client dependencies:
```bash
npm run install:all
```
Or individually:
```bash
cd server && npm install
cd ../client && npm install
```

### 3. Environment Configuration
Create or edit `server/.env`:
```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/jobhunter-ai
JWT_SECRET=your_secure_jwt_secret_key

# AI Provider (Gemini or OpenAI)
GEMINI_API_KEY=your_gemini_api_key
OPENAI_API_KEY=your_openai_api_key
AI_PROVIDER=gemini

# Google OAuth (Optional in dev simulation)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REDIRECT_URI=http://localhost:5000/api/email/oauth2callback/google

# Microsoft OAuth (Optional in dev simulation)
MICROSOFT_CLIENT_ID=
MICROSOFT_CLIENT_SECRET=
MICROSOFT_REDIRECT_URI=http://localhost:5000/api/email/oauth2callback/microsoft

DEFAULT_DAILY_EMAIL_LIMIT=20
```

### 4. Running the Application
From the project root:
```bash
npm run dev
```
- **Backend API**: `http://localhost:5000`
- **Frontend App**: `http://localhost:5173`

---

## 📡 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new candidate account |
| `POST` | `/api/auth/login` | User login & JWT issuance |
| `GET` | `/api/auth/me` | Current user details |
| `POST` | `/api/resumes/upload` | Upload & AI parse PDF/DOCX resume |
| `GET` | `/api/resumes/current` | Get structured candidate profile |
| `PUT` | `/api/resumes/:id` | Update profile fields |
| `GET` | `/api/saved-searches` | Get user's saved search profiles |
| `POST` | `/api/saved-searches` | Create new search & trigger sweep |
| `POST` | `/api/saved-searches/:id/run` | Execute immediate crawler run |
| `GET` | `/api/jobs` | Get AI-matched jobs with filters |
| `GET` | `/api/jobs/dashboard/stats` | Dashboard statistics & daily digest |
| `POST` | `/api/cold-email/generate` | Generate cold email (Normal & Short) |
| `POST` | `/api/cold-email/send` | Dispatch cold email with safety checks |
| `POST` | `/api/cold-email/bulk-generate` | Generate emails for multiple roles |
| `POST` | `/api/cold-email/bulk-send` | Dispatch approved batch outreach |
| `GET` | `/api/applications` | Kanban board application cards |
| `PUT` | `/api/applications/:id/status` | Move card across pipeline stages |
| `GET` | `/api/recruiters` | Verified recruiters directory |
| `POST` | `/api/email/connect/gmail` | Connect Gmail OAuth |
| `POST` | `/api/email/connect/outlook` | Connect Outlook OAuth |

---

## 🔒 Security & Data Isolation
- Strict user data isolation on every Mongoose query via `userId`.
- Passwords hashed using `bcrypt` (10 rounds).
- Token authentication with HTTP-only cookies and Authorization Bearer header support.
- Input validation and sanitized file uploads.
