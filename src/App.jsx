import { useState, useCallback, useRef } from "react";
import { generateImage } from "./api/huggingface";

/* ── Prompt suggestion chips ──────────────────────────────────── */
const SUGGESTIONS = [
  "A majestic dragon soaring over a neon-lit cyberpunk city",
  "Serene Japanese temple in cherry blossom season, oil painting",
  "Astronaut exploring alien planet with twin suns, ultra detailed",
  "Underwater kingdom with bioluminescent sea creatures",
  "Golden hour portrait of a wolf in enchanted forest",
  "Futuristic space station interior, cinematic lighting",
];

/* ── Tiny utility: format seconds ────────────────────────────── */
function formatSeconds(ms) {
  return (ms / 1000).toFixed(1) + "s";
}

export default function App() {
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [genTime, setGenTime] = useState(null);
  const [totalGenerations, setTotalGenerations] = useState(0);

  const textareaRef = useRef(null);
  const resultRef = useRef(null);

  /* ── Handle generation ──────────────────────────────────────── */
  const handleGenerate = useCallback(async () => {
    const trimmed = prompt.trim();
    if (!trimmed) {
      textareaRef.current?.focus();
      return;
    }

    setLoading(true);
    setError(null);

    const t0 = Date.now();

    try {
      const url = await generateImage(trimmed);
      const elapsed = Date.now() - t0;

      // Revoke previous blob URL to free memory
      if (imageUrl && imageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(imageUrl);
      }

      setImageUrl(url);
      setGenTime(elapsed);
      setTotalGenerations((n) => n + 1);

      // Add to gallery (max 8 items)
      setGallery((prev) => [
        { url, prompt: trimmed, id: Date.now() },
        ...prev.slice(0, 7),
      ]);

      // Smooth scroll to result
      setTimeout(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [prompt, imageUrl]);

  /* ── Key handler: Ctrl/Cmd + Enter to generate ─────────────── */
  const handleKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      handleGenerate();
    }
  };

  /* ── Download helper ────────────────────────────────────────── */
  const handleDownload = () => {
    if (!imageUrl) return;
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = `dreamforge-${Date.now()}.png`;
    a.click();
  };

  /* ── Apply a suggestion chip ────────────────────────────────── */
  const applySuggestion = (text) => {
    setPrompt(text);
    textareaRef.current?.focus();
  };

  /* ── Gallery item click ─────────────────────────────────────── */
  const loadFromGallery = (item) => {
    setImageUrl(item.url);
    setPrompt(item.prompt);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="app-container">
      {/* Animated background orbs */}
      <div className="bg-orbs" aria-hidden="true">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      {/* ── Header ───────────────────────────────────────────── */}
      <header className="header">
        <a href="/" className="header-logo" aria-label="Imagine home">
          <div className="logo-icon" aria-hidden="true">✦</div>
          <span className="logo-text">Imagine</span>
        </a>
        <span className="header-badge">Stable Diffusion XL</span>
      </header>

      {/* ── Main ─────────────────────────────────────────────── */}
      <main className="main-content">

        {/* Hero */}
        <section className="hero" aria-labelledby="hero-heading">
          <div className="hero-eyebrow">
            <span className="hero-eyebrow-dot" aria-hidden="true" />
            AI-Powered Image Generator
          </div>
          <h1 id="hero-heading" className="hero-title">
            Turn Words Into{" "}
            <span className="hero-title-gradient">Stunning Art</span>
          </h1>
          <p className="hero-subtitle">
            Describe any scene, style, or concept and watch Imagine
            transform it into breathtaking AI‑generated imagery in seconds.
          </p>
        </section>

        {/* Stats Bar */}
        <div className="stats-bar" role="region" aria-label="Platform stats">
          <div className="stat-item">
            <span className="stat-value">{totalGenerations}</span>
            <span className="stat-desc">Images Created</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">SDXL</span>
            <span className="stat-desc">AI Model</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{genTime ? formatSeconds(genTime) : "—"}</span>
            <span className="stat-desc">Last Gen Time</span>
          </div>
        </div>

        {/* Input Card */}
        <section className="input-card" aria-label="Image generation form">
          <label htmlFor="prompt-input" className="input-label">
            <span className="label-icon" aria-hidden="true">✍️</span>
            Describe Your Vision
          </label>

          <textarea
            id="prompt-input"
            ref={textareaRef}
            className="prompt-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="A majestic phoenix rising from golden flames, surrounded by swirling embers, cinematic lighting, ultra-detailed 8K..."
            rows={4}
            aria-describedby="prompt-hint"
            disabled={loading}
          />
          <span id="prompt-hint" className="sr-only">
            Press Ctrl+Enter or Cmd+Enter to generate
          </span>

          {/* Suggestion Chips */}
          <div className="suggestions" role="group" aria-label="Prompt suggestions">
            <p className="suggestions-label">✨ Try a suggestion:</p>
            {SUGGESTIONS.map((s, i) => (
              <button
                key={i}
                className="chip"
                onClick={() => applySuggestion(s)}
                disabled={loading}
                aria-label={`Use suggestion: ${s}`}
              >
                {s.length > 45 ? s.slice(0, 45) + "…" : s}
              </button>
            ))}
          </div>

          {/* Generate Button */}
          <button
            id="generate-btn"
            className="btn-generate"
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            aria-busy={loading}
          >
            {loading ? (
              <>
                <span className="btn-icon" aria-hidden="true">⏳</span>
                Generating…
              </>
            ) : (
              <>
                <span className="btn-icon" aria-hidden="true">✦</span>
                Generate Image
                <span style={{ fontSize: "0.8rem", opacity: 0.7, marginLeft: "auto", fontWeight: 400 }}>
                  ⌘↵
                </span>
              </>
            )}
          </button>
        </section>

        {/* Error Alert */}
        {error && (
          <div className="error-alert" role="alert" aria-live="assertive">
            <span className="error-icon" aria-hidden="true">⚠️</span>
            <div className="error-content">
              <p className="error-title">Generation Failed</p>
              <p className="error-message">{error}</p>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="loading-container" role="status" aria-live="polite" aria-label="Generating image">
            <div className="loading-orb" aria-hidden="true">
              <div className="loading-orb-inner" />
              <div className="loading-orb-ring" />
              <div className="loading-orb-ring loading-orb-ring-2" />
            </div>
            <div className="loading-text">
              <p className="loading-title">Crafting your masterpiece…</p>
              <p className="loading-subtitle">Stable Diffusion XL is at work — this usually takes 20–60 seconds</p>
            </div>
            <div className="loading-progress" aria-hidden="true">
              <div className="loading-progress-bar" />
            </div>
          </div>
        )}

        {/* Result Image */}
        {imageUrl && !loading && (
          <section
            ref={resultRef}
            className="result-container"
            aria-label="Generated image"
          >
            <div className="result-header">
              <h2 className="result-title">
                <span aria-hidden="true">🖼️</span> Your Creation
              </h2>
              <div className="result-stats">
                {genTime && (
                  <span className="stat-badge">⚡ {formatSeconds(genTime)}</span>
                )}
                <span className="stat-badge">SDXL 1.0</span>
              </div>
            </div>

            <div className="result-image-wrap">
              <img
                src={imageUrl}
                alt={`AI generated image: ${prompt}`}
                className="result-image"
                loading="lazy"
              />
              <div className="result-image-overlay" aria-hidden="true">
                <span style={{ fontSize: "0.8rem", color: "rgba(255,255,255,0.7)", fontStyle: "italic" }}>
                  &ldquo;{prompt.length > 80 ? prompt.slice(0, 80) + "…" : prompt}&rdquo;
                </span>
              </div>
            </div>

            <div className="result-actions">
              <button
                id="download-btn"
                className="btn-action btn-download"
                onClick={handleDownload}
                aria-label="Download generated image"
              >
                ⬇️ Download PNG
              </button>
              <button
                id="regenerate-btn"
                className="btn-action btn-regenerate"
                onClick={handleGenerate}
                disabled={loading}
                aria-label="Regenerate image with same prompt"
              >
                🔄 Regenerate
              </button>
            </div>
          </section>
        )}

        {/* Empty State (no image yet, not loading) */}
        {!imageUrl && !loading && !error && (
          <div className="empty-state" aria-label="No image generated yet">
            <div className="empty-icon" aria-hidden="true">🎨</div>
            <h2 className="empty-title">Your canvas awaits</h2>
            <p className="empty-subtitle">
              Enter a descriptive prompt above and click Generate Image to create your first AI artwork.
            </p>
          </div>
        )}

        {/* Gallery */}
        {gallery.length > 0 && (
          <section className="gallery-section" aria-labelledby="gallery-heading">
            <div className="gallery-header">
              <h2 id="gallery-heading" className="gallery-title">Recent Creations</h2>
              <span className="gallery-count">{gallery.length}</span>
            </div>
            <div className="gallery-grid" role="list">
              {gallery.map((item) => (
                <div
                  key={item.id}
                  className="gallery-item"
                  onClick={() => loadFromGallery(item)}
                  role="listitem button"
                  tabIndex={0}
                  aria-label={`Previous image: ${item.prompt}`}
                  onKeyDown={(e) => e.key === "Enter" && loadFromGallery(item)}
                >
                  <img src={item.url} alt={`Gallery: ${item.prompt}`} loading="lazy" />
                  <div className="gallery-item-prompt" aria-hidden="true">
                    <p>{item.prompt}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="footer">
        <p>
          Built with ❤️ using{" "}
          <a href="https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0" target="_blank" rel="noopener noreferrer">
            Stable Diffusion XL
          </a>{" "}
          &amp;{" "}
          <a href="https://react.dev" target="_blank" rel="noopener noreferrer">React</a>
          {" "}— Imagine {new Date().getFullYear()}
        </p>
      </footer>

      {/* Screen-reader utility */}
      <style>{`.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;}`}</style>
    </div>
  );
}
