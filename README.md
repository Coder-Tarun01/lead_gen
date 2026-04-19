# 🚀 Lead Generation + CRM Tool (MVP)

A production-ready Lead Generation and CRM system built with FastAPI, React, and Supabase.

## 🛠 Features
- **Smart Lead Generation**: Fetches businesses from Google Maps (SerpAPI).
- **Automated Scoring**: Prioritizes businesses without websites (+5 points).
- **Mobile-First CRM**: Update status, add notes, and schedule follow-ups from your phone.
- **One-Tap Outreach**: Call or WhatsApp leads directly from the app.

---

## 🏗 Setup Instructions

### 1. Database Setup (Supabase)
Run the following SQL in your Supabase SQL Editor:

```sql
create table leads (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  phone text,
  address text,
  website text,
  score int default 0,
  status text default 'New',
  notes text,
  rating float,
  last_contacted timestamp with time zone,
  next_followup timestamp with time zone,
  created_at timestamp with time zone default now()
);

-- Index for duplicate prevention
create index idx_leads_phone on leads(phone);
create index idx_leads_name_address on leads(name, address);
```

### 2. Backend Setup (FastAPI)
1. Go to `backend` folder.
2. Create a `.env` file based on `.env.example`:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_supabase_anon_key
   SERPAPI_KEY=your_serpapi_key
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Run locally:
   ```bash
   uvicorn main:app --reload --port 10000
   ```

### 3. Frontend Setup (React TS)
1. Go to `frontend` folder.
2. Update `src/api.ts` with your backend URL (if deployed).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run locally:
   ```bash
   npm run dev
   ```

---

## ☁️ Deployment

### Backend (Render or Railway)
- **Repo**: Connect your GitHub.
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
- **Port**: 10000
- **Env Vars**: Add `SUPABASE_URL`, `SUPABASE_KEY`, `SERPAPI_KEY`.

### Frontend (Vercel)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Framework Preset**: Vite

---

## 🎨 Scoring Logic
- **No Website**: +5
- **Website Exists**: 0
*(Current logic only shows leads with score ≥ 5)*
