import "dotenv/config";

import crypto from "node:crypto";
import express from "express";
import { buildRecommendations } from "./recommender.js";
import { clearSession, getSession, setSessionCookie } from "./session.js";
import {
  addTracksToPlaylist,
  createPlaylist,
  exchangeCodeForTokens,
  getAppAccessToken,
  getCurrentUser,
  getCurrentUserPlaylists,
  getSpotifyAuthUrl,
  getUserAccessToken,
  isSpotifyConfigured,
  searchTracks,
} from "./spotify.js";

const isProduction = process.env.NODE_ENV === "production";
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

    const accessToken = await resolveAccessToken(request, response, session);
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
    if (error.status === 401 || error.status === 403) {
      clearSession(request, response);
      response.json({
        authenticated: false,
        user: null,
        error: error.message,
      });
      return;
    }

    sendError(response, error);
  }
});

app.get("/api/search", async (request, response) => {
  try {
    const query = String(request.query.q || "").trim();

    if (!query) {
      response.json({ tracks: [] });
      return;
    }

    if (!isSpotifyConfigured()) {
      response.json({ tracks: [] });
      return;
    }

    const session = getSession(request);
    const accessToken = session
      ? await resolveAccessToken(request, response, session)
      : await getAppAccessToken();
    const tracks = await searchTracks(query, accessToken, 6);

    response.json({
      tracks: tracks.map((track) => ({
        id: track.id,
        title: track.name,
        artist: track.artists?.[0]?.name || "unknown artist",
        album: track.album?.name,
        artwork: track.album?.images?.[track.album.images.length - 1]?.url,
        url: track.external_urls?.spotify,
      })),
    });
  } catch (error) {
    sendError(response, error);
  }
});

app.post("/api/recommendations", async (request, response) => {
  try {
    const { source, range = "same vibe", avoid = "" } = request.body || {};

    if (!source?.trim()) {
      response.status(400).json({ error: "playlist link or song is required" });
      return;
    }

    const session = getSession(request);
    const userAccessToken = session ? await resolveAccessToken(request, response, session) : null;
    const result = await buildRecommendations({ source, range, avoid }, userAccessToken);

    response.json(result);
  } catch (error) {
    sendError(response, error);
  }
});

app.get("/api/playlists", async (request, response) => {
  try {
    const session = getSession(request);

    if (!session) {
      response.status(401).json({ error: "connect Spotify before loading playlists" });
      return;
    }

    const accessToken = await resolveAccessToken(request, response, session);
    const playlists = await getCurrentUserPlaylists(accessToken);

    response.json({ playlists });
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

    const accessToken = await resolveAccessToken(request, response, session);
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

    response.redirect(getSpotifyAuthUrl(state, getCallbackUrl(request)));
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

    const tokens = await exchangeCodeForTokens(request.query.code, getCallbackUrl(request));

    response.clearCookie("inner_horizons_oauth_state", { path: "/" });
    setSessionCookie(response, tokens);
    response.redirect("/");
  } catch (error) {
    response.redirect(`/?error=${encodeURIComponent(error.message)}`);
  }
});

export default app;

async function resolveAccessToken(request, response, session) {
  const { accessToken, refreshedTokens } = await getUserAccessToken(session);

  if (refreshedTokens) {
    setSessionCookie(response, { ...session, ...refreshedTokens });
  }

  return accessToken;
}

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

function getCallbackUrl(request) {
  const protocol = request.get("x-forwarded-proto") || request.protocol;
  const host = request.get("x-forwarded-host") || request.get("host");

  return `${protocol}://${host}/auth/callback`;
}
