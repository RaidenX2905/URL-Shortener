# URL Shortener 🚀

A modern, light, and premium URL shortener built with **React**, **Vite**, and **Express**. 

### 🌐 Live Demo
**[https://url-shortener-coral-psi.vercel.app/](https://url-shortener-coral-psi.vercel.app/)**

---

## ✨ Features
- **Instant Shortening**: Paste long URLs and get short, shareable links.
- **Permanent Storage**: Powered by Vercel Redis (KV).
- **Click Analytics**: Tracks how many times your links are used.
- **Premium UI**: Clean, responsive, and modern aesthetics.
- **Serverless Backend**: Fast, scalable, and cost-effective.

## 🛠️ Tech Stack
- **Frontend**: React + Vite + Vanilla CSS
- **Backend**: Express (Serverless Functions)
- **Database**: Vercel Redis (Universal Client)
- **Deployment**: Vercel

## 🚀 Setup & Deployment

### 1. Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### 2. Vercel Deployment (One-Click)
1. **Connect Repository**: Import this project to Vercel.
2. **Setup Storage**: Go to **Storage** tab → **Create** → **Redis**. 
3. **Environment Variables**:
   - `REDIS_URL`: Automatically added by Vercel Redis.
   - `VITE_APP_LINK_BASE_URL`: Set this to your production URL (e.g., `https://your-site.vercel.app`).
4. **Deploy**: Vercel will automatically build and serve the project.

---

## 📂 Project Structure
- `src/`: React frontend logic and styles.
- `api/`: Serverless functions for link management and redirection.
- `index.html`: Frontend entry point.
- `package.json`: Project dependencies and scripts.
