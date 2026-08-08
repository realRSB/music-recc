import "dotenv/config";

import crypto from "node:crypto";
import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildRecommendations } from "./recommender.js";
import { clearSession, createSession, getSession, setSessionCookie } from "./session.js";
import {
  addTracksToPlaylist,
  createPlaylist,
  exchangeCodeForTokens,
  getCurrentUser,
  getSpotifyAuthUrl,
  getUserAccessToken,
  isSpotifyConfigured,
} from "./spotify.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 5173);
const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (request, response) => {
  response.json({
    ok: true,
    spotifyConfigured: isSpotifyConfigured(),
    authenticated: Boolean(getSession(request)),
  });
});

app.get("/api/config", (request, response) => {
  response.json({
    spotifyConfigured: isSpotifyConfigured(),
    authenticated: Boolean(getSession(request)),
  });
});

app.get("/api/me", async (request, response) => {
  try {
    const session = getSession(request);

    if (!session) {
      response.json({ authenticated: false, user: null });
      return;
    }

    const accessToken = await getUserAccessToken(session);
    const user = await getCurrentUser(accessToken);

    response.json({
      authenticated: true,
      user: {
        id: user.id,
        displayName: user.display_name,
        url: user.external_urls?.spotify,
        image: user.images?.[0]?.url,
      },
    });
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/recommendations", async (request, response) => {
  try {
    const { source, range = "same vibe", mood = "open road", avoid = "" } = request.body || {};

    if (!source?.trim()) {
      response.status(400).json({ error: "playlist link or song is required" });
      return;
    }

    const session = getSession(request);
    const userAccessToken = session ? await getUserAccessToken(session) : null;
    const result = await buildRecommendations({ source, range, mood, avoid }, userAccessToken);

    response.json(result);
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/playlists", async (request, response) => {
  try {
    const session = getSession(request);

    if (!session) {
      response.status(401).json({ error: "connect Spotify before saving a playlist" });
      return;
    }

    const { name, description, trackUris } = request.body || {};

    if (!name?.trim() || !Array.isArray(trackUris) || trackUris.length === 0) {
      response.status(400).json({ error: "playlist name and track URIs are required" });
      return;
    }

    const accessToken = await getUserAccessToken(session);
    const playlist = await createPlaylist(accessToken, { name, description });

    await addTracksToPlaylist(accessToken, playlist.id, trackUris);

    response.status(201).json({
      id: playlist.id,
      name: playlist.name,
      url: playlist.external_urls?.spotify,
    });
  } catch (error) {
    sendError(response, error);
  }
});

app.get("/auth/spotify", (request, response) => {
  try {
    const state = crypto.randomBytes(16).toString("hex");

    response.cookie("inner_horizons_oauth_state", state, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      maxAge: 1000 * 60 * 10,
      path: "/",
    });

    response.redirect(getSpotifyAuthUrl(state));
  } catch (error) {
    response.redirect(`/?error=${encodeURIComponent(error.message)}`);
  }
});

app.post("/auth/logout", (request, response) => {
  clearSession(request, response);
  response.json({ ok: true });
});

app.get("/auth/callback", async (request, response) => {
  try {
    const expectedState = parseCookies(request.headers.cookie).inner_horizons_oauth_state;

    if (!request.query.code || request.query.state !== expectedState) {
      response.redirect("/?error=spotify_login_failed");
      return;
    }

    const tokens = await exchangeCodeForTokens(request.query.code);
    const sessionId = createSession(tokens);

    response.clearCookie("inner_horizons_oauth_state", { path: "/" });
    setSessionCookie(response, sessionId);
    response.redirect("/");
  } catch (error) {
    response.redirect(`/?error=${encodeURIComponent(error.message)}`);
  }
});

if (isProduction) {
  app.use(express.static(path.join(root, "dist")));
  app.use((request, response, next) => {
    if (request.method !== "GET") {
      next();
      return;
    }

    response.sendFile(path.join(root, "dist", "index.html"));
  });
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    root,
    appType: "spa",
    server: { middlewareMode: true },
  });

  app.use(vite.middlewares);
}

app.listen(port, "127.0.0.1", () => {
  console.log(`inner horizons listening at http://127.0.0.1:${port}`);
});

function sendError(response, error) {
  response.status(error.status || 500).json({
    error: error.message || "server error",
  });
}

function parseCookies(cookieHeader = "") {
  return cookieHeader.split(";").reduce((cookies, cookie) => {
    const [name, ...valueParts] = cookie.trim().split("=");

    if (name) {
      cookies[name] = decodeURIComponent(valueParts.join("="));
    }

    return cookies;
  }, {});
}
