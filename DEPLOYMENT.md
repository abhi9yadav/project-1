# Deployment Guide

This app deploys as a **single service**: the Express backend serves the built
React frontend, so there's one URL and no CORS or API-URL configuration needed.

Recommended host: **Render** (free tier) + your existing **MongoDB Atlas** database.

---

## 1. Prepare MongoDB Atlas

1. In Atlas, go to **Network Access** and add IP `0.0.0.0/0` (allow from anywhere).
   Render's servers don't have a fixed IP, so this is required for the free tier.
2. Copy your connection string (you already have it in `backend/.env`).

## 2. Deploy on Render

### Option A — Blueprint (uses `render.yaml`, easiest)

1. Push your code to GitHub (already done).
2. Go to <https://dashboard.render.com> → **New** → **Blueprint**.
3. Connect the `project-1` repo and select the branch. Render reads `render.yaml`.
4. When prompted, fill in the secret env vars (they are **not** stored in the repo):
   - `MONGODB_URI` — your Atlas connection string
   - `JWT_SECRET` — any long random string
   - `NODE_ENV` — already set to `production` by the blueprint
5. Click **Apply**. Render builds the frontend and starts the backend.

### Option B — Manual Web Service

1. **New** → **Web Service** → connect the repo.
2. Settings:
   - **Runtime:** Node
   - **Build Command:**
     ```
     npm install --prefix backend && npm install --prefix frontend && npm run build --prefix frontend
     ```
   - **Start Command:**
     ```
     npm start --prefix backend
     ```
3. Add environment variables: `MONGODB_URI`, `JWT_SECRET`, `NODE_ENV=production`.
4. Create the service.

## 3. After it's live

- Visit the Render URL — the landing page should load and the API lives under `/api`.
- Register an account, then make yourself admin. From your machine (or Render's
  Shell tab) run:
  ```
  node backend/makeAdmin.js your-email@example.com
  ```
  (Locally this needs `MONGODB_URI` in `backend/.env`; on Render use the Shell tab.)
- Log in and add questions from the Admin Panel.

---

## Notes

- **Secrets:** `.env` is gitignored. Never commit real credentials. Set them in
  the Render dashboard instead. Consider rotating the Atlas password since the
  original was committed earlier in this repo's history.
- **Separate hosting (optional):** To host the frontend separately (e.g. Vercel)
  and the backend elsewhere, build the frontend with `VITE_API_URL=https://your-backend-url`
  set, and the axios client will call that backend instead of same-origin `/api`.
- **Free tier sleep:** Render free services spin down when idle and take a few
  seconds to wake on the next request. That's normal.
