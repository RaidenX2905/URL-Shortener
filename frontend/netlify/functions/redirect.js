export default async (request) => {
  try {
    const url = new URL(request.url);
    const shortCode =
      url.searchParams.get("shortCode") || getShortCodeFromPath(url.pathname);

    if (!shortCode) {
      return new Response("Link not found", { status: 404 });
    }

    const lookup = await supabaseRequest("/rest/v1/rpc/resolve_short_link", {
      method: "POST",
      body: JSON.stringify({
        input_code: shortCode
      })
    });

    if (!lookup.ok || !Array.isArray(lookup.data) || !lookup.data[0]) {
      return new Response("Link not found", { status: 404 });
    }

    return new Response(null, {
      status: 302,
      headers: {
        Location: lookup.data[0].original_url,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};

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

const SUPABASE_URL = "https://ssfvmyylxsbuhtxxapeg.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZnZteXlseHNidWh0eHhhcGVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4MTE1MjUsImV4cCI6MjA5MzM4NzUyNX0.Dqa4qcvESZMWETSE6imlh4S4Y9xpB1QRp1BKxHYEwdg";

function getShortCodeFromPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || null;
}
