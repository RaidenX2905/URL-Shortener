import { createClient } from "redis";

let client = null;

async function getClient() {
  if (client) return client;
  
  client = createClient({
    url: process.env.REDIS_URL || process.env.KV_URL
  });
  
  client.on("error", (err) => console.error("Redis Client Error", err));
  await client.connect();
  return client;
}

export default async function handler(request, response) {
  // CORS
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (request.method === 'OPTIONS') return response.status(200).end();

  try {
    const redis = await getClient();

    if (request.method === "GET") {
      const keys = await redis.keys("link:*");
      const links = await Promise.all(keys.slice(0, 10).map(async (key) => {
        const val = await redis.get(key);
        return val ? JSON.parse(val) : null;
      }));
      return response.status(200).json({ links: links.filter(Boolean) });
    }

    if (request.method === "POST") {
      const { originalUrl } = request.body;
      if (!originalUrl) return response.status(400).json({ error: "No URL" });

      const shortCode = Math.random().toString(36).substring(2, 8);
      const link = {
        id: crypto.randomUUID(),
        original_url: originalUrl,
        short_code: shortCode,
        clicks: 0,
        created_at: new Date().toISOString()
      };

      await redis.set(`link:${shortCode}`, JSON.stringify(link));
      return response.status(201).json({ link });
    }
  } catch (error) {
    console.error(error);
    return response.status(500).json({ error: error.message });
  }
}
