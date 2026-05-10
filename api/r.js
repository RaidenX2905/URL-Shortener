import { kv } from "@vercel/kv";

export default async function handler(request, response) {
  const { shortCode } = request.query;

  if (!shortCode) {
    return response.status(400).send("No code");
  }

  try {
    const link = await kv.get(`link:${shortCode}`);

    if (!link) {
      return response.status(404).send("Link not found");
    }

    link.clicks = (link.clicks || 0) + 1;
    await kv.set(`link:${shortCode}`, link);

    return response.redirect(link.original_url);
  } catch (error) {
    return response.status(500).send("Server error");
  }
}
