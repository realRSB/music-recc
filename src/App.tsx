import { useEffect, useState } from "react";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Results from "./components/Results";
import HowItWorks from "./components/HowItWorks";
import Method from "./components/Method";
import FAQ from "./components/FAQ";
import About from "./components/About";
import AuthNotice from "./components/AuthNotice";
import {
  getConfig,
  getMe,
  getPlaylists,
  getRecommendations,
  logoutSpotify,
  savePlaylist as saveSpotifyPlaylist,
} from "./api/innerHorizons";
import type {
  RecommendationResult,
  SavedPlaylist,
  SpotifyConfig,
  SpotifyUser,
  UserPlaylist,
} from "./api/innerHorizons";

/* The server's messages are accurate but terse. Map the ones a person can
   actually act on to something that says what to do next; pass anything
   else through unchanged rather than swallowing it. */
function friendlyAuthError(raw: string) {
  const message = raw.trim();

  if (/credentials are missing/i.test(message)) {
    return "Spotify isn't configured on this server. Copy .env.example to .env, add SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET, then restart it.";
  }

  if (/spotify_login_failed/i.test(message)) {
    return "Spotify sign-in didn't complete. That usually means the redirect URI in your Spotify app doesn't match SPOTIFY_REDIRECT_URI — check it's exactly http://127.0.0.1:5173/auth/callback.";
  }

  if (/invalid.*redirect/i.test(message)) {
    return "Spotify rejected the redirect URI. Register http://127.0.0.1:5173/auth/callback in your Spotify app settings.";
  }

  if (/token|expired|revoked/i.test(message)) {
    return "Your Spotify session expired. Connect again to keep going.";
  }

  return message;
}

export function App() {
  const [config, setConfig] = useState<SpotifyConfig>({
    spotifyConfigured: false,
    authenticated: false,
  });
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [playlists, setPlaylists] = useState<UserPlaylist[]>([]);
  const [form, setForm] = useState({
    source: "",
    range: "same vibe",
    avoid: "",
  });
  const [result, setResult] = useState<RecommendationResult | null>(null);
  const [savedPlaylist, setSavedPlaylist] = useState<SavedPlaylist | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "saving">("idle");
  const [error, setError] = useState("");
  const [authNotice, setAuthNotice] = useState("");

  useEffect(() => {
    loadSession();
  }, []);

  /* The OAuth routes report failure by redirecting to /?error=... — read it
     once, then strip it so a refresh doesn't resurrect a stale message. */
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authError = params.get("error");
    if (!authError) return;

    setAuthNotice(friendlyAuthError(authError));
    params.delete("error");
    const query = params.toString();
    window.history.replaceState(
      {},
      "",
      `${window.location.pathname}${query ? `?${query}` : ""}`,
    );
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

      /* The server clears expired sessions and reports it here rather than
         erroring, so without this a silent logout looks like a broken button. */
      if (meResponse.error) {
        setAuthNotice(friendlyAuthError(meResponse.error));
      }

      /* Only signed-in users have playlists to offer, and a failure here
         shouldn't block the rest of the page from working. */
      if (configResponse.authenticated) {
        try {
          const { playlists: mine } = await getPlaylists();
          setPlaylists(mine ?? []);
        } catch {
          setPlaylists([]);
        }
      }
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
      setPlaylists([]);
    } catch (logoutError) {
      setError((logoutError as Error).message);
    }
  }

  const update = (patch: Partial<typeof form>) =>
    setForm((current) => ({ ...current, ...patch }));

  return (
    <div className="min-h-screen bg-black tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <Nav authenticated={config.authenticated} user={user} onLogout={logout} />

      {authNotice ? (
        <AuthNotice message={authNotice} onDismiss={() => setAuthNotice("")} />
      ) : null}

      <Hero
        source={form.source}
        range={form.range}
        avoid={form.avoid}
        onChange={update}
        onSubmit={generateRecommendations}
        loading={loading}
        canGenerate={canGenerate}
        spotifyConfigured={config.spotifyConfigured}
        playlists={playlists}
      />

      <Results
        result={result}
        loading={loading}
        saving={saving}
        canSave={canSave}
        onSave={savePlaylist}
        error={error}
        savedPlaylist={savedPlaylist}
      />

      <HowItWorks />
      <Method />
      <FAQ />
      <About authenticated={config.authenticated} />

      <footer className="relative z-10 bg-black border-t border-white/10 px-5 sm:px-10 md:px-14 py-8">
        <div className="mx-auto max-w-3xl flex flex-wrap justify-between gap-3 text-xs text-white/40">
          <span>Inner Horizons — built for the horizons polaris hackathon</span>
          <span>Picks come from playlist metadata and search, not audio analysis.</span>
        </div>
      </footer>
    </div>
  );
}
