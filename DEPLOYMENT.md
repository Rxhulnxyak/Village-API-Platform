# 🚀 Deployment Guide - VillageAPI (Split Strategy)

For maximum performance and stability, we use a split deployment strategy:
- **Backend (API)**: Hosted on **Railway** (Persistent Node.js server, no cold starts).
- **Frontend (Admin/B2B/Demo)**: Hosted on **Vercel** (Global CDN for ultra-fast load times).

---

## 🚂 Step 1: Deploy Backend to Railway
Railway will host your persistent API server.

1.  **Connect Repo**: Import `Village-API-Platform` in Railway.
2.  **Settings**:
    -   **Root Directory**: `api`
    -   **Build Command**: `npm install && npm run build`
    -   **Start Command**: `node dist/server.js`
3.  **Environment Variables**: Add your `.env` variables to the Railway "Variables" tab.
4.  **Public URL**: Railway will give you a URL like `https://api-production.up.railway.app`. **Copy this URL.**

---

## 🏗️ Step 2: Deploy Frontends to Vercel
Vercel will host your three frontend applications.

### For each folder (`demo`, `frontend-admin`, `frontend-b2b`):
1.  **Create New Project** in Vercel.
2.  **Root Directory**: Set to the specific folder (e.g., `demo`).
3.  **Framework Preset**: Vite.
4.  **Environment Variables**: 
    -   Add `VITE_API_URL` = **[Your Railway Backend URL]** (e.g., `https://api-production.up.railway.app`)
5.  **Deploy**.

---

## 🛠️ Global Infrastructure

| Service | Provider | Purpose |
| :--- | :--- | :--- |
| **API Backend** | [Railway](https://railway.app) | Persistent compute, real-time logging. |
| **Frontend Apps** | [Vercel](https://vercel.com) | Global CDN, automatic previews. |
| **Database** | [NeonDB](https://neon.tech/) | Serverless PostgreSQL (MDDS dataset). |
| **Cache/Limit** | [Upstash](https://upstash.com/) | Serverless Redis (Rate limiting). |

---

Built with ❤️ by Rxhulnxyak

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
