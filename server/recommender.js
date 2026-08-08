import {
  getAppAccessToken,
  getPlaylist,
  getPlaylistTracks,
  getSeveralArtists,
  getTrack,
  searchTracks,
} from "./spotify.js";

const RANGE_POPULARITY = {
  "same vibe": [45, 85],
  "slightly new": [30, 75],
  "deep cut": [10, 60],
};

const MOOD_TERMS = {
  "open road": ["bright", "drive", "indie"],
  "late night": ["night", "dream", "slow"],
  "bright morning": ["sun", "fresh", "pop"],
  "quiet focus": ["calm", "ambient", "soft"],
};

export async function buildRecommendations({ source, range, mood, avoid }, userAccessToken) {
  const accessToken = userAccessToken || (await getAppAccessToken());
  const profile = await getSourceProfile(source, accessToken);
  const artistIds = profile.tracks.flatMap((track) => track.artists.map((artist) => artist.id));
  const artists = await getSeveralArtists(artistIds, accessToken);
  const taste = buildTasteProfile(profile.tracks, artists);
  const candidates = await collectCandidates(taste, { range, mood, avoid }, accessToken);
  const recommendations = rankCandidates(candidates, taste, { range }).slice(0, 20);

  return {
    source: profile.source,
    taste,
    playlist: {
      name: `Inner Horizons: after ${profile.source.name}`,
      description: `Same-vibe discoveries based on ${profile.source.name}. Built by Inner Horizons.`,
    },
    recommendations,
  };
}

async function getSourceProfile(source, accessToken) {
  const playlistId = parseSpotifyId(source, "playlist");
  const trackId = parseSpotifyId(source, "track");

  if (playlistId) {
    const [playlist, tracks] = await Promise.all([
      getPlaylist(playlistId, accessToken),
      getPlaylistTracks(playlistId, accessToken),
    ]);

    return {
      source: {
        type: "playlist",
        id: playlist.id,
        name: playlist.name,
        url: playlist.external_urls?.spotify,
        image: playlist.images?.[0]?.url,
      },
      tracks,
    };
  }

  if (trackId) {
    const track = await getTrack(trackId, accessToken);
    return {
      source: {
        type: "track",
        id: track.id,
        name: `${track.name} by ${track.artists?.[0]?.name}`,
        url: track.external_urls?.spotify,
        image: track.album?.images?.[0]?.url,
      },
      tracks: [track],
    };
  }

  const [track] = await searchTracks(source, accessToken, 1);

  if (!track) {
    const error = new Error("no matching Spotify track found");
    error.status = 404;
    throw error;
  }

  return {
    source: {
      type: "search",
      id: track.id,
      name: `${track.name} by ${track.artists?.[0]?.name}`,
      url: track.external_urls?.spotify,
      image: track.album?.images?.[0]?.url,
    },
    tracks: [track],
  };
}

function buildTasteProfile(tracks, artists) {
  const artistById = new Map(artists.map((artist) => [artist.id, artist]));
  const sourceArtistIds = new Set();
  const sourceTrackIds = new Set();
  const artistCounts = new Map();
  const genreCounts = new Map();
  const popularity =
    tracks.reduce((total, track) => total + (track.popularity || 50), 0) / Math.max(tracks.length, 1);

  for (const track of tracks) {
    sourceTrackIds.add(track.id);

    for (const artist of track.artists || []) {
      sourceArtistIds.add(artist.id);
      artistCounts.set(artist.name, (artistCounts.get(artist.name) || 0) + 1);

      for (const genre of artistById.get(artist.id)?.genres || []) {
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
      }
    }
  }

  return {
    sourceArtistIds: [...sourceArtistIds],
    sourceTrackIds: [...sourceTrackIds],
    topArtists: sortCounts(artistCounts).slice(0, 5),
    topGenres: sortCounts(genreCounts).slice(0, 6),
    averagePopularity: Math.round(popularity),
  };
}

async function collectCandidates(taste, preferences, accessToken) {
  const genreQueries = taste.topGenres.map(({ name }) => `genre:"${name}"`);
  const artistQueries = taste.topArtists.map(({ name }) => `"${name}"`);
  const moodTerms = MOOD_TERMS[preferences.mood] || [];
  const queries = [...genreQueries, ...moodTerms, ...artistQueries].slice(0, 12);
  const searches = await Promise.all(
    queries.map((query) => searchTracks(query, accessToken, 12).catch(() => [])),
  );

  return searches.flat();
}

function rankCandidates(candidates, taste, preferences) {
  const seen = new Set();
  const sourceArtists = new Set(taste.sourceArtistIds);
  const sourceTracks = new Set(taste.sourceTrackIds);
  const avoid = normalizeAvoid(preferences.avoid);
  const [minPopularity, maxPopularity] = RANGE_POPULARITY[preferences.range] || RANGE_POPULARITY["same vibe"];

  return candidates
    .filter((track) => {
      if (!track?.id || seen.has(track.id) || sourceTracks.has(track.id)) {
        return false;
      }

      seen.add(track.id);
      const haystack = `${track.name} ${(track.artists || []).map((artist) => artist.name).join(" ")}`.toLowerCase();
      return !avoid.some((term) => haystack.includes(term));
    })
    .map((track) => {
      const newArtist = !(track.artists || []).some((artist) => sourceArtists.has(artist.id));
      const popularity = track.popularity || 50;
      const inRange = popularity >= minPopularity && popularity <= maxPopularity;
      const score =
        (newArtist ? 35 : 0) +
        (inRange ? 25 : 0) +
        Math.max(0, 25 - Math.abs(popularity - taste.averagePopularity) / 2) +
        Math.random();

      return formatRecommendation(track, { newArtist, score, taste });
    })
    .sort((a, b) => b.score - a.score);
}

function formatRecommendation(track, { newArtist, score, taste }) {
  const artistName = track.artists?.[0]?.name || "unknown artist";
  const topGenre = taste.topGenres[0]?.name;
  const topArtist = taste.topArtists[0]?.name;
  const reason = newArtist
    ? `This keeps the ${topGenre || "source"} lane close while moving you toward a fresh artist outside the input.`
    : `This stays near ${topArtist || "your source"} but gives the final playlist a different song angle.`;

  return {
    id: track.id,
    uri: track.uri,
    title: track.name,
    artist: artistName,
    album: track.album?.name,
    artwork: track.album?.images?.[0]?.url,
    url: track.external_urls?.spotify,
    popularity: track.popularity,
    horizon: newArtist ? "new artist" : "nearby track",
    reason,
    score,
  };
}

function parseSpotifyId(value, type) {
  const input = String(value || "").trim();

  if (!input) {
    return null;
  }

  const uriMatch = input.match(new RegExp(`spotify:${type}:([a-zA-Z0-9]+)`));

  if (uriMatch) {
    return uriMatch[1];
  }

  const urlMatch = input.match(new RegExp(`open\\.spotify\\.com/${type}/([a-zA-Z0-9]+)`));
  return urlMatch?.[1] || null;
}

function normalizeAvoid(avoid = "") {
  return avoid
    .toLowerCase()
    .split(",")
    .map((term) => term.trim())
    .filter(Boolean);
}

function sortCounts(counts) {
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
