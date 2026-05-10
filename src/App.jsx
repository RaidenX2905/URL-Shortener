import { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "";
const APP_LINK_BASE_URL =
  import.meta.env.VITE_APP_LINK_BASE_URL ||
  (typeof window !== "undefined" ? window.location.origin : "");

export default function App() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [createdLink, setCreatedLink] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(getLinksEndpoint(), {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ originalUrl: url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not shorten URL");
      }

      setCreatedLink(data.link);
      setUrl("");
    } catch (submitError) {
      if (submitError instanceof TypeError) {
        setError("API unavailable. Run frontend and backend together.");
      } else {
        setError(submitError.message);
      }
    } finally {
      setLoading(false);
    }
  }

  async function copyLink(shortCode) {
    const value = `${APP_LINK_BASE_URL}/r/${shortCode}`;
    await navigator.clipboard.writeText(value);
  }

  return (
    <div className="page-shell">
      <main className="page">
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Fast URL Shortening</p>
            <h1>Shorten links without the mess.</h1>
            <p className="hero-text">
              Turn long URLs into clean, compact links you can share anywhere
              in seconds.
            </p>

            <div className="feature-strip">
              <span>Clean short URLs</span>
              <span>Instant copy</span>
              <span>Fast redirect</span>
            </div>
          </div>

          <div className="hero-card">
            <div className="card-copy">
              <p className="card-eyebrow">Create Link</p>
              <h2>Paste URL. Get shareable link.</h2>
            </div>

            <form onSubmit={handleSubmit} className="shortener-form">
              <label htmlFor="url-input">Paste long URL</label>
              <input
                id="url-input"
                type="url"
                placeholder="https://example.com/blog/how-i-built-this"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Shortening..." : "Create short link"}
              </button>
            </form>

            {error ? <p className="error-text">{error}</p> : null}

            {createdLink ? (
              <div className="result-card">
                <p className="result-label">Your short link</p>
                <strong>{`${APP_LINK_BASE_URL}/r/${createdLink.short_code}`}</strong>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => copyLink(createdLink.short_code)}
                >
                  Copy
                </button>
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}

function getLinksEndpoint() {
  return API_BASE_URL ? `${API_BASE_URL}/api/links` : "/api/links";
}
