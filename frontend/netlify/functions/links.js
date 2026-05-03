export default async (request) => {
  try {
    if (request.method === "POST") {
      const { originalUrl } = await request.json();

      if (!originalUrl || !isValidUrl(originalUrl)) {
        return json({ error: "Enter valid URL" }, 400);
      }

      const result = await supabaseRequest("/rest/v1/rpc/create_short_link", {
        method: "POST",
        body: JSON.stringify({
          input_url: originalUrl
        })
      });

      if (!result.ok || !Array.isArray(result.data) || !result.data[0]) {
        return json({ error: "Could not create short link" }, 500);
      }

      return json({ link: result.data[0] }, 201);
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (error) {
    console.error(error);
    return json({ error: "Server error" }, 500);
  }
};

function isValidUrl(value) {
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch {
    return false;
  }
}

async function supabaseRequest(path, options = {}) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body
  });

  const text = await response.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  return {
    ok: response.ok,
    status: response.status,
    data
  };
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

const SUPABASE_URL = "https://ssfvmyylxsbuhtxxapeg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZnZteXlseHNidWh0eHhhcGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTE1MjUsImV4cCI6MjA5MzM4NzUyNX0.Dqa4qcvESZMWETSE6imlh4S4Y9xpB1QRp1BKxHYEwdg";
