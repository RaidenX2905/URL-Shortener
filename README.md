# ClipLnk

Short, clean link generation with a lightweight React UI and Netlify Functions backend.

[Live Demo](https://cliplnk.netlify.app) · [Repository](https://github.com/RaidenX2905/URL-Shortener)

---

## Overview

ClipLnk is a full-stack URL shortener built to stay simple on the surface and practical under the hood.

- Generate compact 5-character short codes
- Redirect with `/r/<code>` routing
- Copy links instantly from the UI
- Track click counts during redirects
- Deploy on Netlify with serverless functions

Short link format:

```text
https://cliplnk.netlify.app/r/abc12
```

---

## Tech Stack

| Layer | Tech |
| --- | --- |
| Frontend | React, Vite |
| Backend | Netlify Functions |
| Storage | Netlify Blobs |
| Hosting | Netlify |

---

## Features

- Clean landing page UI
- URL validation before create
- Random Base62 short-code generation
- Fast redirect handler
- Copy-to-clipboard support
- Serverless deployment flow

---

## Project Structure

```text
.
├─ frontend/
│  ├─ netlify/functions/
│  └─ src/
├─ netlify/functions/
├─ backend/
├─ netlify.toml
└─ package.json
```

Notes:
- `frontend/` contains the main app source.
- `netlify/functions/` is used for live/manual Netlify deployment.
- `backend/` exists from the earlier local Express version and is not the current production path.

---

## Local Development

Install dependencies:

```bash
npm.cmd install
```

Run local development:

```bash
npm.cmd run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`

---

## Production Routes

- Create short link: `POST /api/links`
- Redirect: `GET /r/:code`

---

## Manual Netlify Deploy

Build frontend:

```bash
npm.cmd run build --workspace frontend
```

Prepare deploy folders:

```bash
Copy-Item -Path frontend\dist\* -Destination dist -Recurse -Force
Copy-Item -Path frontend\netlify\functions\* -Destination netlify\functions -Recurse -Force
```

Deploy:

```bash
npx netlify-cli deploy --prod --site a730d106-36bf-478c-8996-567e73a50d2e --dir dist --functions netlify/functions --no-build --filter frontend
```

---

## Security Notes

- Live create/redirect path does not expose any public list endpoint
- Redirect handling happens server-side
- Responses use `Cache-Control: no-store`
- Short codes are random, not sequential

---

## Current Status

- GitHub repo is active
- Netlify site name is `cliplnk`
- Production URL is [https://cliplnk.netlify.app](https://cliplnk.netlify.app)

---

## Author

Jeevan S Hegde  
[GitHub](https://github.com/RaidenX2905)
