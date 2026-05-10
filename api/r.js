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
  const { shortCode } = request.query;
  if (!shortCode) return response.status(400).send("No code");

  try {
    const redis = await getClient();
    const data = await redis.get(`link:${shortCode}`);

    if (!data) {
      return response.status(404).send("Link not found");
    }

    const link = JSON.parse(data);
    link.clicks = (link.clicks || 0) + 1;
    await redis.set(`link:${shortCode}`, JSON.stringify(link));

    return response.redirect(link.original_url);
  } catch (error) {
    console.error(error);
    return response.status(500).send("Server error");
  }
}
