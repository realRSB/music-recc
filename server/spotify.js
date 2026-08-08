import { updateSession } from "./session.js";

const API_BASE = "https://api.spotify.com/v1";
const ACCOUNTS_BASE = "https://accounts.spotify.com";
const USER_SCOPES = [
  "playlist-read-private",
  "playlist-read-collaborative",
  "playlist-modify-private",
  "playlist-modify-public",
  "user-read-private",
];

let appToken = null;

export function isSpotifyConfigured() {
  return Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET);
}

export function getSpotifyAuthUrl(state) {
  requireSpotifyConfig();

  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.SPOTIFY_CLIENT_ID,
    scope: USER_SCOPES.join(" "),
    redirect_uri: getRedirectUri(),
    state,
  });

  return `${ACCOUNTS_BASE}/authorize?${params}`;
}

export async function exchangeCodeForTokens(code) {
  requireSpotifyConfig();

  const response = await fetch(`${ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getClientAuthHeader()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: getRedirectUri(),
    }),
  });

  return normalizeTokenResponse(await parseSpotifyResponse(response));
}

export async function getUserAccessToken(session) {
  if (!session?.accessToken) {
    return null;
  }

  if (!session.expiresAt || session.expiresAt > Date.now() + 30_000) {
    return session.accessToken;
  }

  const refreshed = await refreshUserToken(session.refreshToken);
  updateSession(session.id, refreshed);
  return refreshed.accessToken;
}

export async function getAppAccessToken() {
  requireSpotifyConfig();

  if (appToken?.expiresAt > Date.now() + 30_000) {
    return appToken.accessToken;
  }

  const response = await fetch(`${ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getClientAuthHeader()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }),
  });

  appToken = normalizeTokenResponse(await parseSpotifyResponse(response));
  return appToken.accessToken;
}

export async function getCurrentUser(accessToken) {
  return spotifyRequest("/me", { accessToken });
}

export async function getTrack(trackId, accessToken) {
  return spotifyRequest(`/tracks/${trackId}`, { accessToken });
}

export async function getSeveralArtists(artistIds, accessToken) {
  const ids = [...new Set(artistIds)].filter(Boolean).slice(0, 50);

  if (!ids.length) {
    return [];
  }

  const artists = await Promise.all(
    ids.map((id) => spotifyRequest(`/artists/${id}`, { accessToken }).catch(() => null)),
  );

  return artists.filter(Boolean);
}

export async function getPlaylist(playlistId, accessToken) {
  return spotifyRequest(`/playlists/${playlistId}`, {
    accessToken,
    query: {
      fields:
        "id,name,external_urls,images,owner(display_name),tracks(total)",
    },
  });
}

export async function getPlaylistTracks(playlistId, accessToken) {
  const tracks = [];
  let offset = 0;
  let next = true;

  while (next && tracks.length < 100) {
    const page = await spotifyRequest(`/playlists/${playlistId}/items`, {
      accessToken,
      query: {
        limit: 50,
        offset,
        fields:
          "next,items(track(id,name,uri,popularity,external_urls,album(name,images,release_date),artists(id,name,external_urls)))",
      },
    });

    tracks.push(
      ...(page.items || [])
        .map((item) => item.track)
        .filter((track) => track?.id && track?.uri),
    );

    next = page.next;
    offset += 50;
  }

  return tracks;
}

export async function searchTracks(query, accessToken, limit = 20) {
  const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 10);
  const data = await spotifyRequest("/search", {
    accessToken,
    query: {
      q: query,
      type: "track",
      limit: safeLimit,
    },
  });

  return data.tracks?.items || [];
}

export async function createPlaylist(accessToken, { name, description }) {
  return spotifyRequest("/me/playlists", {
    method: "POST",
    accessToken,
    body: {
      name,
      description,
      public: false,
    },
  });
}

export async function addTracksToPlaylist(accessToken, playlistId, trackUris) {
  return spotifyRequest(`/playlists/${playlistId}/items`, {
    method: "POST",
    accessToken,
    body: {
      uris: trackUris.slice(0, 100),
    },
  });
}

async function refreshUserToken(refreshToken) {
  const response = await fetch(`${ACCOUNTS_BASE}/api/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${getClientAuthHeader()}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  return normalizeTokenResponse(await parseSpotifyResponse(response), refreshToken);
}

async function spotifyRequest(path, { method = "GET", accessToken, query, body } = {}) {
  const url = new URL(`${API_BASE}${path}`);

  Object.entries(query || {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(body ? { "Content-Type": "application/json" } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return parseSpotifyResponse(response);
}

async function parseSpotifyResponse(response) {
  const text = await response.text();
  const data = text ? JSON.parse(text) : {};

  if (!response.ok) {
    const message = data.error?.message || data.error_description || "spotify request failed";
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return data;
}

function normalizeTokenResponse(data, fallbackRefreshToken) {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || fallbackRefreshToken,
    expiresAt: Date.now() + data.expires_in * 1000,
  };
}

function getRedirectUri() {
  return process.env.SPOTIFY_REDIRECT_URI || "http://127.0.0.1:5173/auth/callback";
}

function getClientAuthHeader() {
  return Buffer.from(`${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`).toString(
    "base64",
  );
}

function requireSpotifyConfig() {
  if (!isSpotifyConfigured()) {
    const error = new Error("spotify credentials are missing");
    error.status = 503;
    throw error;
  }
}
