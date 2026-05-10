import "dotenv/config";
import cors from "cors";
import express from "express";
import { sql } from "@vercel/postgres";

const app = express();

app.use(cors());
app.use(express.json());

// Auto-initialize table
async function initDB() {
  try {
    const dbUrl = process.env.POSTGRES_URL || process.env.STORAGE_URL;
    if (!dbUrl) {
      console.warn("Database URL missing. Database not initialized.");
      return;
    }
    await sql`
      CREATE TABLE IF NOT EXISTS links (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        original_url TEXT NOT NULL,
        short_code TEXT UNIQUE NOT NULL,
        clicks INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    `;
    console.log("Database initialized");
  } catch (error) {
    console.error("Database init failed:", error);
  }
}
initDB();

app.get(["/api/health", "/health"], (_request, response) => {
  response.json({ ok: true });
});

app.get(["/api/links", "/links"], async (_request, response) => {
  try {
    const dbUrl = process.env.POSTGRES_URL || process.env.STORAGE_URL;
    if (!dbUrl) return response.json({ links: [], error: "No DB connected in Vercel" });
    
    const { rows } = await sql`SELECT * FROM links ORDER BY created_at DESC LIMIT 10`;
    return response.json({ links: rows });
  } catch (error) {
    console.error(error);
    return response.json({ links: [], error: error.message });
  }
});

app.post(["/api/links", "/links"], async (request, response) => {
  try {
    const { originalUrl } = request.body;
    if (!originalUrl || !isValidUrl(originalUrl)) return response.status(400).json({ error: "Invalid URL" });
    
    const dbUrl = process.env.POSTGRES_URL || process.env.STORAGE_URL;
    if (!dbUrl) return response.json({ error: "No DB connected", link: { original_url: originalUrl, short_code: "demo" } });

    const shortCode = await createUniqueShortCode();
    const { rows } = await sql`INSERT INTO links (original_url, short_code) VALUES (${originalUrl}, ${shortCode}) RETURNING *`;
    return response.status(201).json({ link: rows[0] });
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error.message });
  }
});

app.get(["/r/:shortCode", "/:shortCode"], async (request, response) => {
  const { shortCode } = request.params;
  if (!shortCode || shortCode === "api" || shortCode === "assets") return response.status(404).end();

  try {
    const dbUrl = process.env.POSTGRES_URL || process.env.STORAGE_URL;
    if (!dbUrl) return response.status(500).json({ error: "No DB" });

    const { rows } = await sql`SELECT * FROM links WHERE short_code = ${shortCode}`;

    if (rows.length === 0) {
      return response.status(404).json({ error: "Link not found" });
    }

    const link = rows[0];
    await sql`UPDATE links SET clicks = clicks + 1 WHERE id = ${link.id}`;

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
  const dbUrl = process.env.POSTGRES_URL || process.env.STORAGE_URL;
  if (!dbUrl) return createShortCode();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shortCode = createShortCode();
    const { rows } = await sql`SELECT id FROM links WHERE short_code = ${shortCode}`;
    if (rows.length === 0) {
      return shortCode;
    }
  }
  throw new Error("Could not create unique short code");
}
