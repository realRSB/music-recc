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

const GENRE_LANES = [
  {
    name: "pop",
    match: /\b(pop|weeknd|taylor swift|dua lipa|ariana|sabrina carpenter|olivia rodrigo|billie eilish)\b/i,
    same: ["dance pop", "synth pop", "electropop"],
    adjacent: ["indie pop", "alt pop", "bedroom pop"],
    deep: ["new wave", "nu disco", "alternative r&b"],
  },
  {
    name: "r&b",
    match: /\b(r&b|rnb|sza|frank ocean|brent faiyaz|summer walker|usher|partynextdoor)\b/i,
    same: ["contemporary r&b", "alternative r&b", "neo soul"],
    adjacent: ["soul", "quiet storm", "uk r&b"],
    deep: ["trip hop", "jazz rap", "future soul"],
  },
  {
    name: "hip hop",
    match: /\b(hip hop|rap|drake|kendrick|travis scott|future|metro boomin|j cole|tyler)\b/i,
    same: ["rap", "trap", "melodic rap"],
    adjacent: ["alternative hip hop", "jazz rap", "southern hip hop"],
    deep: ["abstract hip hop", "uk drill", "boom bap"],
  },
  {
    name: "indie",
    match: /\b(indie|phoebe bridgers|tame impala|clairo|mac demarco|boygenius|mitski)\b/i,
    same: ["indie pop", "indie rock", "bedroom pop"],
    adjacent: ["dream pop", "shoegaze", "jangle pop"],
    deep: ["slowcore", "post punk", "art pop"],
  },
  {
    name: "rock",
    match: /\b(rock|nirvana|radiohead|arctic monkeys|strokes|foo fighters|paramore)\b/i,
    same: ["alternative rock", "modern rock", "garage rock"],
    adjacent: ["post punk", "shoegaze", "emo"],
    deep: ["krautrock", "noise pop", "math rock"],
  },
  {
    name: "electronic",
    match: /\b(electronic|edm|house|techno|fred again|skrillex|calvin harris|daft punk)\b/i,
    same: ["house", "electropop", "dance"],
    adjacent: ["garage", "deep house", "future bass"],
    deep: ["ambient techno", "idm", "breakbeat"],
  },
  {
    name: "country",
    match: /\b(country|zach bryan|morgan wallen|kacey musgraves|luke combs|noah kahan)\b/i,
    same: ["country", "americana", "folk pop"],
    adjacent: ["alt country", "indie folk", "roots rock"],
    deep: ["bluegrass", "cosmic country", "singer songwriter"],
  },
  {
    name: "latin",
    match: /\b(latin|bad bunny|karol g|peso pluma|rauw alejandro|shakira|reggaeton)\b/i,
    same: ["reggaeton", "latin pop", "urbano latino"],
    adjacent: ["dembow", "latin trap", "bachata"],
    deep: ["cumbia", "bolero", "corridos"],
  },
];

export async function buildRecommendations({ source, range, avoid }, userAccessToken) {
  const accessToken = userAccessToken || (await getAppAccessToken());
  const profile = await getSourceProfile(source, accessToken);
  const artistIds = profile.tracks.flatMap((track) => track.artists.map((artist) => artist.id));
  const artists = await getSeveralArtists(artistIds, accessToken);
  const taste = buildTasteProfile(profile, artists);
  const candidates = await collectCandidates(taste, { range, avoid }, accessToken);
  const candidateArtistIds =
    taste.genreSource === "spotify"
      ? candidates.flatMap(({ track }) => (track.artists || []).map((artist) => artist.id))
      : [];
  const candidateArtists = candidateArtistIds.length
    ? await getSeveralArtists(candidateArtistIds, accessToken)
    : [];
  const candidateArtistById = new Map(candidateArtists.map((artist) => [artist.id, artist]));
  const recommendations = rankCandidates(candidates, taste, { range, avoid }, candidateArtistById).slice(0, 20);

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

function buildTasteProfile(profile, artists) {
  const tracks = profile.tracks;
  const artistById = new Map(artists.map((artist) => [artist.id, artist]));
  const sourceArtistIds = new Set();
  const sourceTrackIds = new Set();
  const artistCounts = new Map();
  const genreCounts = new Map();
  const sourceTrackNames = [];
  const popularity =
    tracks.reduce((total, track) => total + (track.popularity || 50), 0) / Math.max(tracks.length, 1);

  for (const track of tracks) {
    sourceTrackIds.add(track.id);
    sourceTrackNames.push(track.name);

    for (const artist of track.artists || []) {
      sourceArtistIds.add(artist.id);
      artistCounts.set(artist.name, (artistCounts.get(artist.name) || 0) + 1);

      for (const genre of artistById.get(artist.id)?.genres || []) {
        genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
      }
    }
  }

  const topArtists = sortCounts(artistCounts).slice(0, 5);
  const spotifyGenres = sortCounts(genreCounts).slice(0, 6);
  const inferredGenres = spotifyGenres.length
    ? []
    : inferGenreFacets([profile.source.name, ...sourceTrackNames, ...topArtists.map(({ name }) => name)]);

  return {
    sourceArtistIds: [...sourceArtistIds],
    sourceTrackIds: [...sourceTrackIds],
    sourceTrackNames,
    topArtists,
    topGenres: spotifyGenres.length ? spotifyGenres : inferredGenres,
    genreSource: spotifyGenres.length ? "spotify" : "inferred",
    averagePopularity: Math.round(popularity),
  };
}

async function collectCandidates(taste, preferences, accessToken) {
  const queries = buildSearchQueries(taste, preferences.range);
  const searches = await Promise.all(
    queries.map(({ query, lane }) =>
      searchTracks(query, accessToken, 10)
        .then((tracks) => tracks.map((track) => ({ track, query, lane })))
        .catch(() => []),
    ),
  );

  return searches.flat();
}

function rankCandidates(candidates, taste, preferences, candidateArtistById) {
  const seen = new Set();
  const sourceArtists = new Set(taste.sourceArtistIds);
  const sourceTracks = new Set(taste.sourceTrackIds);
  const avoid = normalizeAvoid(preferences.avoid);
  const [minPopularity, maxPopularity] = RANGE_POPULARITY[preferences.range] || RANGE_POPULARITY["same vibe"];
  const sourceGenreNames = new Set(taste.topGenres.map(({ name }) => name.toLowerCase()));

  return candidates
    .filter(({ track }) => {
      if (!track?.id || seen.has(track.id) || sourceTracks.has(track.id) || isLowQualityCandidate(track)) {
        return false;
      }

      seen.add(track.id);
      const haystack = `${track.name} ${(track.artists || []).map((artist) => artist.name).join(" ")}`.toLowerCase();
      const sourceArtistMatch = (track.artists || []).some((artist) => sourceArtists.has(artist.id));

      return !sourceArtistMatch && !avoid.some((term) => haystack.includes(term));
    })
    .map(({ track, query, lane }) => {
      const candidateGenres = getTrackGenres(track, candidateArtistById);
      const genreOverlap = candidateGenres.filter((genre) => sourceGenreNames.has(genre.toLowerCase())).length;
      const popularity = track.popularity || 50;
      const inRange = popularity >= minPopularity && popularity <= maxPopularity;
      const score =
        35 +
        (inRange ? 25 : 0) +
        Math.max(0, 25 - Math.abs(popularity - taste.averagePopularity) / 2) +
        genreOverlap * 18 +
        getLaneBonus(lane, preferences.range);

      return formatRecommendation(track, { score, taste, candidateGenres, query, lane });
    })
    .sort((a, b) => b.score - a.score);
}

function formatRecommendation(track, { score, taste, candidateGenres, query, lane }) {
  const artistName = track.artists?.[0]?.name || "unknown artist";
  const topGenre = taste.topGenres[0]?.name;
  const genrePhrase = candidateGenres[0] || lane || topGenre || query;
  const reason = topGenre
    ? `This starts from your ${topGenre} lane and moves toward ${genrePhrase} with a new artist outside the source.`
    : `This follows the source artists and track language toward ${genrePhrase}, then filters out artists already in the input.`;

  return {
    id: track.id,
    uri: track.uri,
    title: track.name,
    artist: artistName,
    album: track.album?.name,
    artwork: track.album?.images?.[0]?.url,
    url: track.external_urls?.spotify,
    popularity: track.popularity,
    horizon: lane ? `${lane} horizon` : "new artist",
    reason,
    score,
  };
}

function buildSearchQueries(taste, range) {
  const lanes = getDiscoveryLanes(taste, range);
  const artistNames = taste.topArtists.map(({ name }) => name).slice(0, 3);
  const trackNames = taste.sourceTrackNames.slice(0, 3);
  const queries = [];

  for (const lane of lanes) {
    queries.push({ query: lane, lane });
  }

  for (const artistName of artistNames) {
    for (const lane of lanes.slice(0, 2)) {
      queries.push({ query: `${artistName} ${lane}`, lane });
    }
  }

  for (const trackName of trackNames) {
    for (const lane of lanes.slice(0, 2)) {
      queries.push({ query: `${trackName} ${lane}`, lane });
    }
  }

  return uniqueBy(queries, ({ query }) => query.toLowerCase()).slice(0, 8);
}

function getDiscoveryLanes(taste, range) {
  const spotifyGenres = taste.genreSource === "spotify" ? taste.topGenres.map(({ name }) => name) : [];
  const inferredLanes = inferSearchLanes([
    ...taste.topGenres.map(({ name }) => name),
    ...taste.topArtists.map(({ name }) => name),
    ...taste.sourceTrackNames,
  ], range);

  const laneTerms = spotifyGenres.length ? expandGenres(spotifyGenres, range) : inferredLanes;
  return uniqueBy(laneTerms.filter(isUsefulSearchLane), (lane) => lane.toLowerCase()).slice(0, 8);
}

function expandGenres(genres, range) {
  const expanded = [];

  for (const genre of genres) {
    const matchingLane = GENRE_LANES.find((lane) => lane.match.test(genre));
    expanded.push(genre);

    if (matchingLane) {
      expanded.push(...matchingLane.same);

      if (range !== "same vibe") {
        expanded.push(...matchingLane.adjacent);
      }

      if (range === "deep cut") {
        expanded.push(...matchingLane.deep);
      }
    }
  }

  return expanded;
}

function inferGenreFacets(values) {
  return inferLanesFromText(values)
    .slice(0, 4)
    .map((name, index) => ({ name, count: Math.max(1, 4 - index) }));
}

function inferLanesFromText(values) {
  const text = values.filter(Boolean).join(" ").toLowerCase();
  const matches = GENRE_LANES.filter((lane) => lane.match.test(text));
  const lanes = matches.length ? matches : [GENRE_LANES[0], GENRE_LANES[3]];

  return uniqueBy(
    lanes.flatMap((lane) => [lane.name, ...lane.same, ...lane.adjacent, ...lane.deep]),
    (name) => name.toLowerCase(),
  );
}

function inferSearchLanes(values, range) {
  const text = values.filter(Boolean).join(" ").toLowerCase();
  const matches = GENRE_LANES.filter((lane) => lane.match.test(text));
  const lanes = matches.length ? matches : [GENRE_LANES[0], GENRE_LANES[3]];

  return uniqueBy(
    lanes.flatMap((lane) => {
      if (range === "deep cut") {
        return [...lane.deep, ...lane.adjacent];
      }

      if (range === "slightly new") {
        return [...lane.adjacent, ...lane.same];
      }

      return lane.same;
    }),
    (name) => name.toLowerCase(),
  );
}

function getTrackGenres(track, artistById) {
  return uniqueBy(
    (track.artists || []).flatMap((artist) => artistById.get(artist.id)?.genres || []),
    (genre) => genre.toLowerCase(),
  );
}

function getLaneBonus(lane, range) {
  if (!lane) {
    return 0;
  }

  const laneText = lane.toLowerCase();

  if (range === "same vibe" && /pop|rock|rap|r&b|country|latin|indie|house/.test(laneText)) {
    return 18;
  }

  if (range === "slightly new" && /alt|indie|neo|dream|garage|folk|soul|new wave/.test(laneText)) {
    return 20;
  }

  if (range === "deep cut" && /post|abstract|idm|slowcore|trip hop|bluegrass|breakbeat|bolero/.test(laneText)) {
    return 22;
  }

  return 10;
}

function isUsefulSearchLane(lane) {
  return !["pop", "rock", "rap", "dance", "country", "latin", "indie", "electronic"].includes(
    lane.toLowerCase(),
  );
}

function isLowQualityCandidate(track) {
  const title = (track.name || "").toLowerCase();
  const artist = (track.artists?.[0]?.name || "").toLowerCase();
  const album = (track.album?.name || "").toLowerCase();
  const combined = `${title} ${artist} ${album}`;
  const blockedTerms = [
    "type beat",
    "karaoke",
    "instrumental",
    "sped up",
    "slowed",
    "continuous mix",
    "music mood catalog",
    "workout music",
    "sleep music",
  ];
  const genericGenreTitle = GENRE_LANES.some((lane) =>
    [lane.name, ...lane.same, ...lane.adjacent, ...lane.deep].some(
      (term) => title === term || title === `${term} music`,
    ),
  );

  return blockedTerms.some((term) => combined.includes(term)) || genericGenreTitle;
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

function uniqueBy(items, keyForItem) {
  const seen = new Set();
  const unique = [];

  for (const item of items) {
    const key = keyForItem(item);

    if (!seen.has(key)) {
      seen.add(key);
      unique.push(item);
    }
  }

  return unique;
}
