import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Check,
  ExternalLink,
  ListMusic,
  Loader2,
  LogOut,
  Music2,
  Plus,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import {
  getConfig,
  getMe,
  getRecommendations,
  logoutSpotify,
  savePlaylist as saveSpotifyPlaylist,
} from "./api/innerHorizons.js";

const ranges = ["same vibe", "slightly new", "deep cut"];
const moods = ["open road", "late night", "bright morning", "quiet focus"];

export function App() {
  const [config, setConfig] = useState({ spotifyConfigured: false, authenticated: false });
  const [user, setUser] = useState(null);
  const [source, setSource] = useState("");
  const [range, setRange] = useState(ranges[0]);
  const [mood, setMood] = useState(moods[0]);
  const [avoid, setAvoid] = useState("");
  const [result, setResult] = useState(null);
  const [savedPlaylist, setSavedPlaylist] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSession();
  }, []);

  const canGenerate = config.spotifyConfigured && source.trim() && status !== "loading";
  const canSave = config.authenticated && result?.recommendations?.length && status !== "saving";
  const headline = useMemo(() => {
    if (result?.source?.name) {
      return `Inner Horizons: after ${result.source.name}`;
    }

    return "Inner Horizons: ready for your source";
  }, [result]);

  async function loadSession() {
    try {
      const [configResponse, meResponse] = await Promise.all([getConfig(), getMe()]);

      setConfig(configResponse);
      setUser(meResponse.user);
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  async function generateRecommendations(event) {
    event.preventDefault();
    setStatus("loading");
    setError("");
    setSavedPlaylist(null);

    try {
      const data = await getRecommendations({ source, range, mood, avoid });

      setResult(data);
    } catch (recommendationError) {
      setError(recommendationError.message);
      setResult(null);
    } finally {
      setStatus("idle");
    }
  }

  async function savePlaylist() {
    if (!result) {
      return;
    }

    setStatus("saving");
    setError("");

    try {
      const playlist = await saveSpotifyPlaylist({
        name: result.playlist.name,
        description: result.playlist.description,
        trackUris: result.recommendations.map((track) => track.uri),
      });

      setSavedPlaylist(playlist);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setStatus("idle");
    }
  }

  async function logout() {
    await logoutSpotify();
    setConfig((current) => ({ ...current, authenticated: false }));
    setUser(null);
    setSavedPlaylist(null);
  }

  return (
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
            <button className="icon-button" title="Search" type="button">
              <Search size={18} />
            </button>
            {config.authenticated ? (
              <button className="spotify-button" type="button" onClick={logout}>
                <LogOut size={18} />
                {user?.displayName || "disconnect"}
              </button>
            ) : (
              <a className="spotify-button" href="/auth/spotify">
                <Plus size={18} />
                connect Spotify
              </a>
            )}
          </div>
        </header>

        <section className="layout">
          <form className="panel builder" onSubmit={generateRecommendations}>
            <p className="kicker">
              <Sparkles size={17} />
              same vibe, new artists
            </p>
            <h1>Find the songs hiding past your usual rotation.</h1>
            <p className="lede">
              Paste a Spotify playlist or song, tune how far you want to roam, and build a real recommendation list from Spotify metadata.
            </p>

            {!config.spotifyConfigured ? (
              <div className="notice">
                Add Spotify credentials from <code>.env.example</code> to run live recommendations.
              </div>
            ) : null}

            <div className="input-stack">
              <div className="field">
                <label htmlFor="source">playlist link or song</label>
                <div className="entry">
                  <ListMusic size={20} />
                  <input
                    id="source"
                    placeholder="spotify playlist url, track url, or song name"
                    value={source}
                    onChange={(event) => setSource(event.target.value)}
                  />
                </div>
              </div>

              <div className="controls">
                <label className="field">
                  <span className="control-label">range</span>
                  <select value={range} onChange={(event) => setRange(event.target.value)}>
                    {ranges.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label className="field">
                  <span className="control-label">mood</span>
                  <select value={mood} onChange={(event) => setMood(event.target.value)}>
                    {moods.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="field">
                <label htmlFor="avoid">avoid</label>
                <div className="entry">
                  <SlidersHorizontal size={20} />
                  <input
                    id="avoid"
                    placeholder="artists, genres, or words to avoid"
                    value={avoid}
                    onChange={(event) => setAvoid(event.target.value)}
                  />
                </div>
              </div>

              <button className="primary-button" type="submit" disabled={!canGenerate}>
                {status === "loading" ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />}
                build horizon playlist
              </button>
            </div>
          </form>

          <section className="panel visual" aria-live="polite">
            <div className="results-head">
              <div>
                <h2>{headline}</h2>
                <p>{result ? `${range} picks for a ${mood} drift.` : "recommendations will appear here after Spotify analysis."}</p>
              </div>
              <button className="secondary-button" type="button" onClick={savePlaylist} disabled={!canSave}>
                {status === "saving" ? <Loader2 className="spin" size={18} /> : <Check size={18} />}
                save
              </button>
            </div>

            {error ? <div className="error">{error}</div> : null}
            {savedPlaylist ? (
              <a className="saved-link" href={savedPlaylist.url} target="_blank" rel="noreferrer">
                opened in Spotify: {savedPlaylist.name}
              </a>
            ) : null}

            {result ? (
              <>
                <div className="taste-summary">
                  <span>{result.taste.topGenres[0]?.name || "metadata"} lane</span>
                  <span>{result.taste.topArtists[0]?.name || "source"} anchor</span>
                  <span>{result.recommendations.length} tracks</span>
                </div>
                <div className="recommendations">
                  {result.recommendations.map((track) => (
                    <article className="recommendation" key={track.id}>
                      <img className="track-art" src={track.artwork} alt="" />
                      <div className="track-copy">
                        <h3>{track.title}</h3>
                        <p>{track.artist}</p>
                        <p>{track.reason}</p>
                        <span className="tag">
                          <SlidersHorizontal size={14} />
                          {track.horizon}
                        </span>
                      </div>
                      <a className="play-button" href={track.url} target="_blank" rel="noreferrer" title={`Open ${track.title} on Spotify`}>
                        <ExternalLink size={17} />
                      </a>
                    </article>
                  ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <Music2 size={40} />
                <p>Give Inner Horizons a playlist or track and it will search Spotify for nearby songs from fresh artists.</p>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}
