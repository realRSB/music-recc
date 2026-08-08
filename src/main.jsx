import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight,
  Check,
  ExternalLink,
  ListMusic,
  Music2,
  Play,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

const recommendations = [
  {
    title: "Sweet Disposition",
    artist: "The Temper Trap",
    horizon: "anthemic indie shimmer",
    reason:
      "A wide-open chorus and glowing guitar line keep the emotional lift of your source while moving toward brighter indie rock.",
    colors: ["#f2c46d", "#397f83"],
  },
  {
    title: "Can I Call You Tonight?",
    artist: "Dayglow",
    horizon: "sunny bedroom pop",
    reason:
      "It keeps the easy melodic warmth of familiar pop, then nudges the playlist into looser, guitar-led color.",
    colors: ["#ef7f65", "#6fb1c9"],
  },
  {
    title: "Borderline",
    artist: "Tame Impala",
    horizon: "psychedelic groove",
    reason:
      "The bass pulse and polished vocal mood stay close to pop instincts while opening the door to hazier production.",
    colors: ["#8a6bd8", "#f0b35f"],
  },
  {
    title: "Garden Song",
    artist: "Phoebe Bridgers",
    horizon: "quiet lyrical drift",
    reason:
      "A softer pick for when the source leans intimate, with detailed writing and a calm late-night atmosphere.",
    colors: ["#98aeb3", "#3f5f71"],
  },
];

const styles = `
  :root {
    color: #1c1f24;
    background: #f7f4ee;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-synthesis: none;
    text-rendering: optimizeLegibility;
  }

  * {
    box-sizing: border-box;
  }

  body {
    margin: 0;
    min-width: 320px;
  }

  button,
  input,
  select {
    font: inherit;
  }

  .app {
    min-height: 100vh;
    background:
      linear-gradient(145deg, rgba(68, 117, 115, 0.14), transparent 42%),
      linear-gradient(315deg, rgba(217, 112, 80, 0.16), transparent 44%),
      #f7f4ee;
  }

  .shell {
    width: min(1180px, calc(100vw - 32px));
    margin: 0 auto;
    padding: 22px 0 34px;
  }

  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 10px 0 22px;
  }

  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1rem;
    font-weight: 800;
  }

  .brand-mark,
  .icon-button {
    display: inline-grid;
    place-items: center;
    border: 1px solid rgba(28, 31, 36, 0.16);
    background: rgba(255, 255, 255, 0.58);
    color: #1c1f24;
  }

  .brand-mark {
    width: 34px;
    height: 34px;
    border-radius: 50%;
  }

  .nav-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .icon-button {
    width: 38px;
    height: 38px;
    border-radius: 8px;
    cursor: pointer;
  }

  .spotify-button,
  .primary-button,
  .secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    min-height: 42px;
    border: 0;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 800;
    transition: transform 160ms ease, box-shadow 160ms ease, background 160ms ease;
  }

  .spotify-button {
    padding: 0 14px;
    background: #163f35;
    color: #f9fbf8;
  }

  .layout {
    display: grid;
    grid-template-columns: minmax(0, 0.95fr) minmax(360px, 1.05fr);
    gap: 24px;
    align-items: stretch;
  }

  .panel,
  .recommendation {
    border: 1px solid rgba(28, 31, 36, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.74);
    box-shadow: 0 20px 60px rgba(35, 35, 35, 0.08);
  }

  .builder {
    padding: clamp(20px, 4vw, 34px);
  }

  .kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin: 0 0 14px;
    color: #51635f;
    font-size: 0.88rem;
    font-weight: 800;
  }

  h1 {
    max-width: 680px;
    margin: 0;
    color: #171a1f;
    font-size: clamp(2.4rem, 8vw, 5.6rem);
    line-height: 0.94;
    letter-spacing: 0;
  }

  .lede {
    max-width: 560px;
    margin: 20px 0 24px;
    color: #4e555c;
    font-size: clamp(1rem, 2vw, 1.14rem);
    line-height: 1.6;
  }

  .input-stack {
    display: grid;
    gap: 14px;
  }

  .field {
    display: grid;
    gap: 8px;
  }

  .field label,
  .control-label {
    color: #383e44;
    font-size: 0.86rem;
    font-weight: 800;
  }

  .entry {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 0 14px;
    border: 1px solid rgba(28, 31, 36, 0.16);
    border-radius: 8px;
    background: #fffaf2;
  }

  .entry input {
    width: 100%;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: #1c1f24;
  }

  .controls {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  select {
    width: 100%;
    min-height: 44px;
    border: 1px solid rgba(28, 31, 36, 0.16);
    border-radius: 8px;
    background: #fffaf2;
    color: #1c1f24;
    padding: 0 12px;
  }

  .primary-button {
    width: 100%;
    margin-top: 4px;
    background: #d8543f;
    color: #fffdf8;
    box-shadow: 0 14px 26px rgba(216, 84, 63, 0.22);
  }

  .primary-button:hover,
  .spotify-button:hover,
  .secondary-button:hover,
  .icon-button:hover {
    transform: translateY(-1px);
  }

  .visual {
    display: grid;
    gap: 16px;
    align-content: start;
    padding: 16px;
    overflow: hidden;
  }

  .playlist-strip {
    display: grid;
    grid-template-columns: repeat(4, minmax(78px, 1fr));
    gap: 10px;
  }

  .cover {
    position: relative;
    aspect-ratio: 1;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid rgba(28, 31, 36, 0.1);
    background: linear-gradient(135deg, var(--a), var(--b));
  }

  .cover::before,
  .cover::after {
    content: "";
    position: absolute;
    inset: 18%;
    border-radius: 50%;
    border: 12px solid rgba(255, 255, 255, 0.3);
  }

  .cover::after {
    inset: 42%;
    border-width: 6px;
    background: rgba(28, 31, 36, 0.12);
  }

  .results-head {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: 14px;
    padding-top: 4px;
  }

  .results-head h2 {
    margin: 0;
    font-size: clamp(1.4rem, 3vw, 2rem);
    letter-spacing: 0;
  }

  .results-head p {
    margin: 6px 0 0;
    color: #586066;
  }

  .secondary-button {
    flex: 0 0 auto;
    padding: 0 14px;
    background: #1f6670;
    color: #f7fffd;
  }

  .recommendations {
    display: grid;
    gap: 10px;
  }

  .recommendation {
    display: grid;
    grid-template-columns: 70px 1fr auto;
    gap: 14px;
    align-items: center;
    padding: 12px;
  }

  .track-art {
    display: grid;
    place-items: center;
    width: 70px;
    height: 70px;
    border-radius: 8px;
    color: rgba(255, 255, 255, 0.9);
    background: linear-gradient(135deg, var(--a), var(--b));
  }

  .track-copy {
    min-width: 0;
  }

  .track-copy h3 {
    margin: 0;
    font-size: 1rem;
    letter-spacing: 0;
  }

  .track-copy p {
    margin: 4px 0 0;
    color: #5a6268;
    font-size: 0.9rem;
    line-height: 1.45;
  }

  .tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 8px;
    color: #245c50;
    font-size: 0.78rem;
    font-weight: 800;
  }

  .play-button {
    display: grid;
    place-items: center;
    width: 38px;
    height: 38px;
    border: 1px solid rgba(28, 31, 36, 0.14);
    border-radius: 8px;
    background: #fffaf2;
    color: #1c1f24;
  }

  @media (max-width: 860px) {
    .layout {
      grid-template-columns: 1fr;
    }

    .visual {
      padding: 14px;
    }
  }

  @media (max-width: 560px) {
    .shell {
      width: min(100% - 22px, 1180px);
      padding-top: 14px;
    }

    .topbar,
    .results-head {
      align-items: stretch;
      flex-direction: column;
    }

    .nav-actions {
      justify-content: space-between;
    }

    .controls,
    .playlist-strip {
      grid-template-columns: 1fr;
    }

    .recommendation {
      grid-template-columns: 58px 1fr;
    }

    .track-art {
      width: 58px;
      height: 58px;
    }

    .play-button {
      grid-column: 2;
      justify-self: start;
    }
  }
`;

function App() {
  const [source, setSource] = useState("");
  const [adventure, setAdventure] = useState("same vibe");
  const [mood, setMood] = useState("open road");

  const playlistName = useMemo(() => {
    if (!source.trim()) {
      return "after your playlist";
    }

    return source.includes("spotify.com")
      ? "after shared playlist"
      : `after ${source.trim()}`;
  }, [source]);

  return (
    <>
      <style>{styles}</style>
      <main className="app">
        <div className="shell">
          <header className="topbar">
            <div className="brand" aria-label="Inner Horizons">
              <span className="brand-mark">
                <Music2 size={18} />
              </span>
              <span>Inner Horizons</span>
            </div>
            <div className="nav-actions">
              <button className="icon-button" title="Search">
                <Search size={18} />
              </button>
              <button className="spotify-button">
                <Plus size={18} />
                connect Spotify
              </button>
            </div>
          </header>

          <section className="layout">
            <div className="panel builder">
              <p className="kicker">
                <Sparkles size={17} />
                same vibe, new artists
              </p>
              <h1>Find the songs hiding past your usual rotation.</h1>
              <p className="lede">
                Start from a playlist or one song, tune how far you want to roam, and build a horizon playlist with reasons for every pick.
              </p>

              <div className="input-stack">
                <div className="field">
                  <label htmlFor="source">playlist link or song</label>
                  <div className="entry">
                    <ListMusic size={20} />
                    <input
                      id="source"
                      placeholder="spotify playlist url, artist, or track"
                      value={source}
                      onChange={(event) => setSource(event.target.value)}
                    />
                  </div>
                </div>

                <div className="controls">
                  <div className="field">
                    <span className="control-label">range</span>
                    <select value={adventure} onChange={(event) => setAdventure(event.target.value)}>
                      <option>same vibe</option>
                      <option>slightly new</option>
                      <option>deep cut</option>
                    </select>
                  </div>
                  <div className="field">
                    <span className="control-label">mood</span>
                    <select value={mood} onChange={(event) => setMood(event.target.value)}>
                      <option>open road</option>
                      <option>late night</option>
                      <option>bright morning</option>
                      <option>quiet focus</option>
                    </select>
                  </div>
                </div>

                <button className="primary-button">
                  build horizon playlist
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>

            <div className="panel visual">
              <div className="playlist-strip" aria-hidden="true">
                {recommendations.map((track) => (
                  <div
                    className="cover"
                    key={track.title}
                    style={{ "--a": track.colors[0], "--b": track.colors[1] }}
                  />
                ))}
              </div>

              <div className="results-head">
                <div>
                  <h2>Inner Horizons: {playlistName}</h2>
                  <p>
                    {adventure} picks for a {mood} drift.
                  </p>
                </div>
                <button className="secondary-button">
                  <Check size={18} />
                  save
                </button>
              </div>

              <div className="recommendations">
                {recommendations.map((track) => (
                  <article className="recommendation" key={track.title}>
                    <div
                      className="track-art"
                      style={{ "--a": track.colors[0], "--b": track.colors[1] }}
                    >
                      <Music2 size={24} />
                    </div>
                    <div className="track-copy">
                      <h3>{track.title}</h3>
                      <p>{track.artist}</p>
                      <p>{track.reason}</p>
                      <span className="tag">
                        <SlidersHorizontal size={14} />
                        {track.horizon}
                      </span>
                    </div>
                    <button className="play-button" title={`Open ${track.title} on Spotify`}>
                      <ExternalLink size={17} />
                    </button>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </main>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
