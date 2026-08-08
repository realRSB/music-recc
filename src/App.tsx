import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Results from "./components/Results";
import {
  getConfig,
  getMe,
  getRecommendations,
  logoutSpotify,
  savePlaylist as saveSpotifyPlaylist,
} from "./api/innerHorizons";
import type {
  RecommendationResult,
  SavedPlaylist,
  SpotifyConfig,
  SpotifyUser,
} from "./api/innerHorizons";

export function App() {
  const [config, setConfig] = useState<SpotifyConfig>({
    spotifyConfigured: false,
    authenticated: false,
  });
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [form, setForm] = useState({
    source: "",
    range: "same vibe",
    mood: "open road",
    avoid: "",
  });
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [savedPlaylist, setSavedPlaylist] = useState<SavedPlaylist | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "saving">("idle");
  const [error, setError] = useState("");

  useEffect(() => {
    loadSession();
  }, []);

  const loading = status === "loading";
  const saving = status === "saving";
  const canGenerate = config.spotifyConfigured && form.source.trim() !== "" && !loading;
  const canSave = Boolean(config.authenticated && result?.recommendations?.length && !saving);

  async function loadSession() {
    try {
      const [configResponse, meResponse] = await Promise.all([getConfig(), getMe()]);
      setConfig(configResponse);
      setUser(meResponse.user);
    } catch (loadError) {
      setError((loadError as Error).message);
    }
  }

  async function generateRecommendations(event: React.FormEvent) {
    event.preventDefault();
    if (!canGenerate) return;

    setStatus("loading");
    setError("");
    setSavedPlaylist(null);

    try {
      setResult(await getRecommendations(form));
    } catch (recommendationError) {
      setError((recommendationError as Error).message);
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
      setError((saveError as Error).message);
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
      setError((logoutError as Error).message);
    }
  }

  const update = (patch: Partial<typeof form>) =>
    setForm((current) => ({ ...current, ...patch }));

  return (
    <div className="min-h-screen bg-black tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Nav authenticated={config.authenticated} user={user} onLogout={logout} />

      <Hero
        source={form.source}
        range={form.range}
        onChange={update}
        onSubmit={generateRecommendations}
        loading={loading}
        canGenerate={canGenerate}
        spotifyConfigured={config.spotifyConfigured}
      />

      <Results
        result={result}
        loading={loading}
        saving={saving}
        canSave={canSave}
        onSave={savePlaylist}
        error={error}
        savedPlaylist={savedPlaylist}
        mood={form.mood}
        avoid={form.avoid}
        onChange={update}
      />

      <footer className="relative z-10 bg-black border-t border-white/10 px-5 sm:px-10 md:px-14 py-8">
        <div className="mx-auto max-w-3xl flex flex-wrap justify-between gap-3 text-xs text-white/40">
          <span>Inner Horizons — built for the horizons polaris hackathon</span>
          <span>Picks come from playlist metadata and search, not audio analysis.</span>
        </div>
      </footer>
    </div>
  );
}
