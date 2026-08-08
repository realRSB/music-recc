import { useEffect, useMemo, useState } from "react";
import { Sparkles } from "lucide-react";
import HorizonField from "./components/HorizonField.jsx";
import TopBar from "./components/TopBar.jsx";
import Composer from "./components/Composer.jsx";
import Results from "./components/Results.jsx";
import { exampleTracks } from "./data/tracks.js";
import {
  getConfig,
  getMe,
  getRecommendations,
  logoutSpotify,
  savePlaylist as saveSpotifyPlaylist,
} from "./api/innerHorizons.js";

export function App() {
  const [config, setConfig] = useState({ spotifyConfigured: false, authenticated: false });
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    source: "",
    range: "same vibe",
    mood: "open road",
    avoid: "",
  });
  const [result, setResult] = useState(null);
  const [savedPlaylist, setSavedPlaylist] = useState(null);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSession();
  }, []);

  const loading = status === "loading";
  const saving = status === "saving";
  const canGenerate = config.spotifyConfigured && form.source.trim() !== "" && !loading;
  const canSave = Boolean(config.authenticated && result?.recommendations?.length && !saving);

  const tracks = result?.recommendations ?? exampleTracks;
  const isExample = !result;

  const headline = result?.playlist?.name || "Inner Horizons: ready for your source";

  const taste = useMemo(() => {
    if (!result) return `${form.range} · ${form.mood}`;
    const genre = result.taste?.topGenres?.[0]?.name;
    const artist = result.taste?.topArtists?.[0]?.name;
    return [genre ? `${genre} lane` : null, artist ? `${artist} anchor` : null]
      .filter(Boolean)
      .join(" · ");
  }, [result, form.range, form.mood]);

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
    if (!canGenerate) return;

    setStatus("loading");
    setError("");
    setSavedPlaylist(null);

    try {
      setResult(await getRecommendations(form));
    } catch (recommendationError) {
      setError(recommendationError.message);
      setResult(null);
    } finally {
      setStatus("idle");
    }
  }

  async function savePlaylist() {
    if (!result) return;

    setStatus("saving");
    setError("");

    try {
      setSavedPlaylist(
        await saveSpotifyPlaylist({
          name: result.playlist.name,
          description: result.playlist.description,
          trackUris: result.recommendations.map((track) => track.uri),
        }),
      );
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setStatus("idle");
    }
  }

  async function logout() {
    try {
      await logoutSpotify();
      setConfig((current) => ({ ...current, authenticated: false }));
      setUser(null);
      setSavedPlaylist(null);
    } catch (logoutError) {
      setError(logoutError.message);
    }
  }

  return (
    <>
      <HorizonField />
      <div className="app">
        <TopBar authenticated={config.authenticated} user={user} onLogout={logout} />

        <main className="shell">
          <div className="intro">
            <p className="kicker">
              <Sparkles size={15} aria-hidden="true" />
              same vibe, unfamiliar names
            </p>
            <h1>
              Find the songs hiding <span className="h1-accent">just past</span> your usual
              rotation.
            </h1>
            <p className="lede">
              Start from a playlist or a single track, choose how far you want to wander, and get
              a set of picks that each explain why they belong.
            </p>
          </div>

          <div className="workspace">
            <Composer
              source={form.source}
              range={form.range}
              mood={form.mood}
              avoid={form.avoid}
              onChange={(patch) => setForm((current) => ({ ...current, ...patch }))}
              onSubmit={generateRecommendations}
              loading={loading}
              canGenerate={canGenerate}
              spotifyConfigured={config.spotifyConfigured}
            />

            <Results
              tracks={tracks}
              isExample={isExample}
              loading={loading}
              saving={saving}
              canSave={canSave}
              onSave={savePlaylist}
              error={error}
              savedPlaylist={savedPlaylist}
              headline={headline}
              taste={taste}
            />
          </div>
        </main>

        <footer className="footer">
          <div className="shell footer-inner">
            <span>Inner Horizons — built for the horizons polaris hackathon</span>
            <span>Picks come from playlist metadata and search, not audio analysis.</span>
          </div>
        </footer>
      </div>
    </>
  );
}
