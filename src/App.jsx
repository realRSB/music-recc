import { useEffect, useState } from "react";
import { LogOut, Music2, Plus, Search } from "lucide-react";
import {
  getConfig,
  getMe,
  getRecommendations,
  logoutSpotify,
  savePlaylist as saveSpotifyPlaylist,
} from "./api/innerHorizons.js";
import { DiscoveryForm, moods, ranges } from "./components/DiscoveryForm.jsx";
import { RecommendationResults } from "./components/RecommendationResults.jsx";

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
          <DiscoveryForm
            avoid={avoid}
            canGenerate={canGenerate}
            config={config}
            mood={mood}
            onSubmit={generateRecommendations}
            range={range}
            setAvoid={setAvoid}
            setMood={setMood}
            setRange={setRange}
            setSource={setSource}
            source={source}
            status={status}
          />

          <RecommendationResults
            canSave={canSave}
            error={error}
            mood={mood}
            onSave={savePlaylist}
            range={range}
            result={result}
            savedPlaylist={savedPlaylist}
            status={status}
          />
        </section>
      </div>
    </main>
  );
}
