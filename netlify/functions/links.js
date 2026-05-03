import { getStore } from "@netlify/blobs";

export default async (request) => {
  try {
    if (request.method !== "POST") {
      return json({ error: "Method not allowed" }, 405);
    }

    const { originalUrl } = await request.json();

    if (!originalUrl || !isValidUrl(originalUrl)) {
      return json({ error: "Enter valid URL" }, 400);
    }

    const link = await createShortLink(originalUrl);
    return json({ link }, 201);
  } catch (error) {
    console.error(error);
    return json({ error: "Server error" }, 500);
  }
};

async function createShortLink(originalUrl) {
  const store = getStore({ name: "links", consistency: "strong" });

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const shortCode = createShortCode();
    const existing = await store.get(shortCode, {
      type: "json",
      consistency: "strong"
    });

    if (existing === null) {
      const link = {
        id: crypto.randomUUID(),
        original_url: originalUrl,
        short_code: shortCode,
        clicks: 0,
        created_at: new Date().toISOString()
      };

      await store.setJSON(shortCode, link);
      return link;
    }
  }

  throw new Error("Could not create short link");
}

function createShortCode(length = 5) {
  const alphabet =
    "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));

  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}
