# 🚀 ClipLnk – The Ultimate URL Shortening Platform

## 📌 Quick Summary
**ClipLnk** is a high‑performance, production‑grade URL shortener. It combines a sleek **React + Vite** front‑end with a **Vercel Serverless** back‑end, powered by **Node.js**, **Express**, and **Supabase**. Simplified, light, and lightning fast.

## 📈 Current Status
- Live site: **(Deploying on Vercel)**

[![Repository](https://img.shields.io/badge/Repo-💻-blue)](https://github.com/RaidenX2905/URL-Shortener)  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ What Makes ClipLnk *Crazy Awesome*
- **Vercel Native** – Deployment-ready with optimized serverless functions.
- **Instant short‑links** – Generated with cryptographically‑secure codes.
- **Supabase Powered** – Rock-solid persistence for your links.
- **Zero-Config Deployment** – Push to GitHub and Vercel handles the rest.
- **Clean Structure** – No redundant folders. Just `frontend` and `api`.

---

## 🛠️ Tech Stack
| Layer | Technology |
|-------|------------|
| **Frontend** | React 19 + Vite 7 |
| **Backend** | Node.js + Express (Vercel Functions) |
| **Database** | Supabase |
| **Hosting** | Vercel |

---

## 📂 Project Structure
```text
.
├─ api/                 # Vercel Serverless Functions (Express)
├─ frontend/            # React app source
│   └─ dist/           # Built frontend (production)
├─ scripts/             # Local development tools
├─ vercel.json          # Vercel routing & config
├─ package.json         # Root scripts & dependencies
└─ README.md            # You are here! 🎉
```

---

## 🏃‍♂️ Local Development
```bash
# Install dependencies
npm install

# Run frontend + API server concurrently
npm run dev
```
- **Frontend**: http://localhost:5173
- **API**: http://localhost:3000 (Proxied via Vite)

---

## 📦 Deployment (Vercel)
1. **Push to GitHub**: Changes are automatically picked up.
2. **Configure Vercel**:
   - **Framework**: Vite
   - **Root Directory**: `./`
   - **Build Command**: `npm run build`
   - **Output Directory**: `frontend/dist`
3. **Env Vars**:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `VITE_APP_LINK_BASE_URL`

---

## 📊 API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/links` | Create short link. |
| `GET`  | `/r/:code`   | Redirect to original URL. |

---
