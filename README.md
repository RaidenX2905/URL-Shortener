# ClipLnk

URL shortener built with React, Netlify Functions, and Supabase.

Live site:
- [https://cliplnk.netlify.app](https://cliplnk.netlify.app)

Short link format:
- `https://cliplnk.netlify.app/r/<code>`

## Stack

- Frontend: React + Vite
- Serverless backend: Netlify Functions
- Database: Supabase Postgres
- Hosting: Netlify

## Features

- Create short links from long URLs
- 5-character random Base62 codes
- Redirect through `/r/<code>`
- Click counter on redirect
- Copy-to-clipboard output

## Security Notes

- Raw `links` table is not publicly readable or writable
- Link creation and resolution go through narrow Supabase RPC functions
- No public list/recent-links endpoint
- API responses use `Cache-Control: no-store`

## Project Structure

```text
frontend/
  netlify/functions/
  src/
backend/
```

`backend/` remains for local Express development history. Production flow uses Netlify Functions in `frontend/netlify/functions/`.

## Local Development

Install:

```bash
npm.cmd install
```

Run frontend + local backend:

```bash
npm.cmd run dev
```

Frontend:
- `http://localhost:5173`

Backend:
- `http://localhost:4000`

## Production Routing

- Create link: `POST /api/links`
- Redirect: `GET /r/:code`

## Deploy Config

Netlify config is in [netlify.toml](./netlify.toml).

Functions:
- [frontend/netlify/functions/links.js](./frontend/netlify/functions/links.js)
- [frontend/netlify/functions/redirect.js](./frontend/netlify/functions/redirect.js)

## Notes

- Current live Netlify site was renamed from `cliplink-shortener.netlify.app` to `cliplnk.netlify.app`
- Old domain/path can return 404
