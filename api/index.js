import "dotenv/config";
import cors from "cors";
import express from "express";
import { createClient } from "@supabase/supabase-js";

const app = express();

app.use(cors());
app.use(express.json());

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey)
    : null;

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    database: Boolean(supabase)
  });
});

app.get("/api/links", async (_request, response) => {
  if (!supabase) {
    return response.json({ links: [] });
  }

  const { data, error } = await supabase
    .from("links")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return response.status(500).json({ error: "Could not load links" });
  }

  return response.json({ links: data });
});

app.post("/api/links", async (request, response) => {
  const { originalUrl } = request.body;

  if (!originalUrl || !isValidUrl(originalUrl)) {
    return response.status(400).json({ error: "Enter valid URL" });
  }

  if (!supabase) {
    return response.status(201).json({
      link: {
        id: crypto.randomUUID(),
        original_url: originalUrl,
        short_code: createShortCode(),
        clicks: 0,
        created_at: new Date().toISOString()
      }
    });
  }

  try {
    const shortCode = await createUniqueShortCode();

    const { data, error } = await supabase
      .from("links")
      .insert({
        original_url: originalUrl,
        short_code: shortCode
      })
      .select()
      .single();

    if (error) {
      return response.status(500).json({ error: "Could not create short link" });
    }

    return response.status(201).json({ link: data });
  } catch {
    return response.status(500).json({ error: "Could not create short link" });
  }
});

app.get("/r/:shortCode", async (request, response) => {
  if (!supabase) {
    return response.status(404).json({
      error: "Link not found. Add Supabase env vars first."
    });
  }

  const { shortCode } = request.params;

  const { data, error } = await supabase
    .from("links")
    .select("*")
    .eq("short_code", shortCode)
    .single();

  if (error || !data) {
    return response.status(404).json({ error: "Link not found" });
  }

  await supabase
    .from("links")
    .update({ clicks: data.clicks + 1 })
    .eq("id", data.id);

  return response.redirect(data.original_url);
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
  if (!supabase) {
    return createShortCode();
  }

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const shortCode = createShortCode();
    const { data } = await supabase
      .from("links")
      .select("id")
      .eq("short_code", shortCode)
      .maybeSingle();

    if (!data) {
      return shortCode;
    }
  }

  throw new Error("Could not create unique short code");
}
