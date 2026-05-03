# 🚀 ClipLnk – The Ultimate URL Shortening Platform

## 📌 Quick Summary
**ClipLnk** is a high‑performance, production‑grade URL shortener. It combines a sleek **React + Vite** front‑end with a **Netlify Functions** server‑less back‑end, powered by **Node.js**, **Express**, and **Supabase** for data storage. The stack is engineered for speed, scalability, and a buttery‑smooth developer experience.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-🚀-brightgreen)](https://cliplnk.netlify.app)  [![Repository](https://img.shields.io/badge/Repo-💻-blue)](https://github.com/RaidenX2905/URL-Shortener)  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## ✨ What Makes ClipLnk *Crazy Awesome*
- **Instant 5‑character short‑links** generated with a cryptographically‑secure Base62 algorithm.
- **Zero‑latency redirects** handled server‑side via Netlify Functions.
- **Real‑time click analytics** – every visit is tracked and displayed.
- **Clipboard‑ready** – one‑click copy of short links.
- **Robust URL validation** to prevent malformed entries.
- **Full CI/CD** on Netlify – automated builds, previews, and production deploys.
- **Modular monorepo** structure with separate `frontend` and `backend` workspaces.

---

## 🛠️ Tech Stack (All‑In‑One Table)
| Layer | Technology | Version |
|-------|------------|---------|
| **Frontend** | React | ^19.1.0 |
|  | Vite | ^7.1.3 |
|  | @vitejs/plugin-react | ^5.0.2 |
| **Backend** | Node.js | >=18 |
|  | Express | ^5.1.0 |
|  | Netlify Functions | ^4.2.4 |
|  | Supabase JS SDK | ^2.56.0 |
| **Storage** | Netlify Blobs | ^10.1.0 |
| **Hosting / CI** | Netlify | — |
| **Package Management** | npm (workspaces) | — |
| **Dev Tools** | concurrently | ^9.2.1 |
|  | eslint (optional) | — |
|  | prettier (optional) | — |

---

## 📂 Project Structure
```text
.
├─ frontend/                # React app (Vite) source
│   ├─ src/                # UI components, pages, hooks
│   └─ netlify/functions/   # Serverless functions for Netlify (frontend‑side)
├─ backend/                 # Express API (legacy & still used for auth)
│   └─ src/                # API routes, DB clients, middleware
├─ netlify/                 # Netlify configuration & global functions
│   └─ functions/          # Additional Netlify Functions (if any)
├─ netlify.toml             # Netlify site config
├─ package.json             # Workspace definition & root scripts
└─ README.md               # You are reading this! 🎉
```

---

## 📦 Dependency Overview
**Frontend (`frontend/package.json`):**
```json
{
  "dependencies": {
    "@netlify/blobs": "^10.1.0",
    "@netlify/functions": "^4.2.4",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^5.0.2",
    "vite": "^7.1.3"
  }
}
```

**Backend (`backend/package.json`):**
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.56.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.1",
    "express": "^5.1.0"
  }
}
```

---

## 🏃‍♂️ Local Development
```bash
# Install all workspace deps
npm install

# Run both front‑end and back‑end concurrently
npm run dev   # uses concurrently under the hood
```
> The front‑end runs at **http://localhost:5173** and the API at **http://localhost:4000**.

---

## 📦 Production Deployment (Netlify)
```bash
# 1️⃣ Build the React app
npm run build --workspace frontend

# 2️⃣ Gather artifacts for Netlify
Copy-Item -Path frontend\dist\* -Destination dist -Recurse -Force
Copy-Item -Path frontend\netlify\functions\* -Destination netlify\functions -Recurse -Force

# 3️⃣ Deploy with Netlify CLI (replace SITE_ID with your own)
npx netlify-cli deploy \
  --prod \
  --site a730d106-36bf-478c-8996-567e73a50d2e \
  --dir dist \
  --functions netlify/functions \
  --no-build \
  --filter frontend
```

---

## 📊 API Endpoints
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/links` | Create a new short link (expects JSON `{ "url": "https://…" }`). |
| `GET`  | `/r/:code`   | Redirect to the original URL for the given short code. |

---

## 🛡️ Security Highlights
- **No public list endpoint** – enumeration of stored links is prevented.
- **Server‑side redirects** protect against client‑side tampering.
- **Cache‑Control: no‑store** on redirect responses.
- **Randomly generated codes** (Base62) avoid predictability.

---

## 📈 Current Status
- Actively maintained and receiving updates.
- Live site: **https://cliplnk.netlify.app**
- Open for contributions – see the repository for the roadmap.

---

## 👤 Author
**Jeevan S Hegde** – [GitHub Profile](https://github.com/RaidenX2905)

---

*Designed with premium aesthetics in mind – vibrant badges, clear sections, and a comprehensive tech‑stack showcase.*
