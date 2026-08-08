export function getConfig() {
  return fetchJson("/api/config");
}

export function getMe() {
  return fetchJson("/api/me");
}

export function getRecommendations(payload) {
  return fetchJson("/api/recommendations", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function savePlaylist(payload) {
  return fetchJson("/api/playlists", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutSpotify() {
  return fetchJson("/auth/logout", { method: "POST" });
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || "request failed");
  }

  return data;
}
