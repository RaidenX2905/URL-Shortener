import { kv } from "@vercel/kv";

export default async function handler(request, response) {
  // CORS Headers
  response.setHeader('Access-Control-Allow-Credentials', true);
  response.setHeader('Access-Control-Allow-Origin', '*');
  response.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

  if (request.method === 'OPTIONS') {
    return response.status(200).end();
  }

  if (request.method === "GET") {
    try {
      const keys = await kv.keys("link:*");
      const links = await Promise.all(keys.slice(0, 10).map(key => kv.get(key)));
      return response.status(200).json({ links: links.filter(Boolean) });
    } catch (error) {
      return response.status(500).json({ links: [], error: error.message });
    }
  }

  if (request.method === "POST") {
    try {
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

      await kv.set(`link:${shortCode}`, link);
      return response.status(201).json({ link });
    } catch (error) {
      return response.status(500).json({ error: error.message });
    }
  }
}
