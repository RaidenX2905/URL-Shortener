import { getStore } from "@netlify/blobs";

export default async (request) => {
  try {
    const url = new URL(request.url);
    const shortCode =
      url.searchParams.get("shortCode") || getShortCodeFromPath(url.pathname);

    if (!shortCode) {
      return new Response("Link not found", { status: 404 });
    }

    const store = getStore({ name: "links", consistency: "strong" });
    const link = await store.get(shortCode, {
      type: "json",
      consistency: "strong"
    });

    if (!link?.original_url) {
      return new Response("Link not found", { status: 404 });
    }

    await store.setJSON(shortCode, {
      ...link,
      clicks: typeof link.clicks === "number" ? link.clicks + 1 : 1
    });

    return new Response(null, {
      status: 302,
      headers: {
        Location: link.original_url,
        "Cache-Control": "no-store"
      }
    });
  } catch (error) {
    console.error(error);
    return new Response("Server error", { status: 500 });
  }
};

function getShortCodeFromPath(pathname) {
  const parts = pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] || null;
}
