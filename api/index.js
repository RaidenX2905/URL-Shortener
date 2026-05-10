import "dotenv/config";
import cors from "cors";
import express from "express";
import { kv } from "@vercel/kv";

const app = express();

app.use(cors());
app.use(express.json());

app.get(["/api/health", "/health"], (_request, response) => {
  response.json({ ok: true });
});

app.get(["/api/links", "/links"], async (_request, response) => {
  try {
    const keys = await kv.keys("link:*");
    const links = await Promise.all(keys.slice(0, 10).map(key => kv.get(key)));
    return response.json({ links: links.filter(Boolean) });
  } catch (error) {
    console.error(error);
    return response.json({ links: [], error: error.message });
  }
});

app.post(["/api/links", "/links"], async (request, response) => {
  try {
    const { originalUrl } = request.body;
    if (!originalUrl || !isValidUrl(originalUrl)) return response.status(400).json({ error: "Invalid URL" });

    const shortCode = await createUniqueShortCode();
    const link = {
      id: crypto.randomUUID(),
      original_url: originalUrl,
      short_code: shortCode,
      clicks: 0,
      created_at: new Date().toISOString()
    };

    await kv.set(`link:${shortCode}`, link);
    return response.status(201).json({ link });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error.message });
  }
});

app.get(["/r/:shortCode", "/:shortCode"], async (request, response) => {
  const { shortCode } = request.params;
  if (!shortCode || shortCode === "api" || shortCode === "assets") return response.status(404).end();

  try {
    const link = await kv.get(`link:${shortCode}`);

    if (!link) {
      return response.status(404).json({ error: "Link not found" });
    }

    link.clicks = (link.clicks || 0) + 1;
    await kv.set(`link:${shortCode}`, link);

    return response.redirect(link.original_url);
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: "Server error" });
  }
});

export default app;

function createShortCode(length = 6) {
  const alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  return Array.from({ length }, () => {
    const index = Math.floor(Math.random() * alphabet.length);
    return alphabet[index];
  }).join("");
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

async function createUniqueShortCode() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shortCode = createShortCode();
    const exists = await kv.exists(`link:${shortCode}`);
    if (!exists) {
      return shortCode;
    }
  }
  throw new Error("Could not create unique short code");
}
