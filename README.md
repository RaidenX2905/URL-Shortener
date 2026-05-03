# ClipLnk – Professional URL Shortening Service

## Overview

**ClipLnk** is a lightweight, production‑ready URL shortener built with a modern React frontend (Vite) and a serverless backend powered by Netlify Functions. It offers a seamless experience for creating concise, 5‑character short links that redirect instantly while tracking click statistics.

[🚀 Live Demo](https://cliplnk.netlify.app) | [📂 Repository](https://github.com/RaidenX2905/URL-Shortener)

---

### Key Features

- **Instant Short‑Link Generation** – Produce compact, 5‑character codes using a secure Base62 algorithm.
- **Server‑Side Redirects** – Fast, reliable redirects via the `/r/<code>` endpoint.
- **Clipboard Integration** – One‑click copy of generated short URLs.
- **Click‑Count Analytics** – Track usage statistics for each short link.
- **Robust Validation** – Ensure URLs are well‑formed before shortening.
- **Seamless Deployment** – Fully compatible with Netlify's CI/CD workflow.

---

## Technology Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React, Vite |
| Backend    | Netlify Functions |
| Storage    | Netlify Blobs |
| Hosting    | Netlify |

---

## Project Structure

```text
.
├─ frontend/                # React application source
│   ├─ netlify/functions/   # Serverless functions (deployment)
│   └─ src/                # UI components and pages
├─ netlify/functions/       # Additional Netlify functions (if any)
├─ backend/                 # Legacy Express version (not used in production)
├─ netlify.toml             # Netlify configuration file
└─ package.json            # Workspace and dependency definitions
```

---

## Getting Started (Local Development)

1. **Install Dependencies**
   ```bash
   npm install
   ```
2. **Run Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173` (frontend) and `http://localhost:4000` (backend API).

---

## Production API Endpoints

- **Create Short Link** – `POST /api/links`
- **Redirect** – `GET /r/:code`

---

## Deploying to Netlify (Manual)

```bash
# Build the frontend
npm run build --workspace frontend

# Prepare the deployment directory
Copy-Item -Path frontend\dist\* -Destination dist -Recurse -Force
Copy-Item -Path frontend\netlify\functions\* -Destination netlify\functions -Recurse -Force

# Deploy using Netlify CLI
npx netlify-cli deploy \
  --prod \
  --site a730d106-36bf-478c-8996-567e73a50d2e \
  --dir dist \
  --functions netlify/functions \
  --no-build \
  --filter frontend
```

---

## Security Considerations

- No public endpoint exposes the full list of stored links.
- All redirects are processed server‑side, mitigating client‑side manipulation.
- Responses include `Cache-Control: no-store` to prevent caching of redirect data.
- Short codes are generated randomly, eliminating predictability.

---

## Current Status

- The repository is actively maintained.
- Deployed site: **cliplnk** (`https://cliplnk.netlify.app`).

---

## Author

**Jeevan S Hegde** – [GitHub Profile](https://github.com/RaidenX2905)

