# 🚀 Deployment Guide - VillageAPI

This project is optimized for deployment on **Vercel** (Frontend/Serverless API) and **Railway** (Persistent API Server).

---

## 🏗️ Option 1: Full Stack on Vercel (Recommended)
Vercel handles both the static frontend and the serverless backend functions.

### Steps:
1.  **Push to GitHub**: Ensure all changes are pushed to your [Village-API-Platform](https://github.com/Rxhulnxyak/Village-API-Platform.git) repository.
2.  **Connect to Vercel**:
    -   Log in to [Vercel](https://vercel.com).
    -   Click **New Project** and import your repository.
3.  **Configure Project Settings**:
    -   **Root Directory**: Keep as `.` (root).
    -   **Build Command**: `npm run build`
    -   **Install Command**: `npm install`
4.  **Environment Variables**:
    -   Add all variables from your `.env` file (DATABASE_URL, UPSTASH_REDIS_REST_URL, etc.).
5.  **Deploy**: Vercel will detect the `vercel.json` and automatically route requests to `/v1/*` to your API.

---

## 🚂 Option 2: Persistent API on Railway
If you prefer a persistent server (instead of serverless functions) for your backend, Railway is the best choice.

### Steps:
1.  **Log in to [Railway.app](https://railway.app)**.
2.  **Create New Project**: Select "Deploy from GitHub repo".
3.  **Select Repository**: Choose `Village-API-Platform`.
4.  **Configure Service**:
    -   Railway will detect the monorepo. Select the `api` folder as the source for the backend service.
    -   **Build Command**: `npm install && npm run build`
    -   **Start Command**: `npm start` (which runs `node dist/server.js`)
5.  **Environment Variables**:
    -   Go to the **Variables** tab in Railway.
    -   Paste your `.env` contents.
6.  **Public URL**: Railway will provide a URL like `village-api-production.up.railway.app`. Use this URL in your frontend `App.tsx`.

---

## 🛠️ Infrastructure Requirements

| Service | Purpose | Provider |
| :--- | :--- | :--- |
| **PostgreSQL** | Primary Database | [NeonDB](https://neon.tech/) |
| **Redis** | Rate Limiting & Cache | [Upstash](https://upstash.com/) |
| **DNS/CDN** | Frontend Delivery | [Vercel](https://vercel.com) |

---

## ⚠️ Important Post-Deployment Checks
- **CORS**: Ensure your Railway/Vercel backend URL is added to the CORS allow-list in `api/src/app.ts`.
- **Database Migrations**: Run `npx prisma db push` against your production `DATABASE_URL` before the first deploy.
- **SSL**: Both Vercel and Railway provide automatic SSL/HTTPS.

Built with ❤️ by Rxhulnxyak
