import { expect, test } from "@playwright/test";
import { __testing } from "../server/recommender.js";

function track({
  id,
  name,
  artist = "new artist",
  artistId = "artist-1",
  isrc,
  popularity = 55,
}) {
  return {
    id,
    uri: `spotify:track:${id}`,
    name,
    popularity,
    external_ids: isrc ? { isrc } : {},
    external_urls: { spotify: `https://open.spotify.com/track/${id}` },
    album: { name: "test album", images: [], release_date: "2026-01-01" },
    artists: [{ id: artistId, name: artist }],
  };
}

test("recommendation ranking keeps the best version of duplicate recordings", () => {
  const sourceTrackKeys = __testing.buildTrackIdentitySet([
    track({ id: "source-1", name: "old favorite", artist: "source artist", artistId: "source" }),
  ]);
  const taste = {
    sourceArtistIds: ["source"],
    topGenres: [{ name: "indie pop", count: 3 }],
    averagePopularity: 55,
  };
  const candidates = [
    { track: track({ id: "low", name: "same song", isrc: "US123", popularity: 30 }), lane: "indie pop" },
    { track: track({ id: "high", name: "Same Song - Remastered", isrc: "US123", popularity: 55 }), lane: "indie pop" },
    { track: track({ id: "source-copy", name: "old favorite", artist: "source artist" }), lane: "indie pop" },
    { track: track({ id: "fresh", name: "fresh song", artist: "second artist", artistId: "artist-2" }), lane: "indie pop" },
  ];

  const ranked = __testing.rankCandidates(
    candidates,
    taste,
    { range: "same vibe", avoid: "" },
    new Map(),
    sourceTrackKeys,
  );

  expect(ranked.map((recommendation) => recommendation.id)).toEqual(["high", "fresh"]);
});

test("recommendation ranking limits repeated songs from one new artist", () => {
  const taste = {
    sourceArtistIds: ["source"],
    topGenres: [{ name: "indie pop", count: 3 }],
    averagePopularity: 55,
  };
  const candidates = [
    { track: track({ id: "a", name: "first", artist: "repeat artist", popularity: 55 }), lane: "indie pop" },
    { track: track({ id: "b", name: "second", artist: "repeat artist", popularity: 54 }), lane: "indie pop" },
    { track: track({ id: "c", name: "third", artist: "repeat artist", popularity: 53 }), lane: "indie pop" },
    { track: track({ id: "d", name: "fourth", artist: "other artist", artistId: "artist-2", popularity: 45 }), lane: "indie pop" },
  ];

  const ranked = __testing.rankCandidates(
    candidates,
    taste,
    { range: "same vibe", avoid: "" },
    new Map(),
    new Set(),
  );

  expect(ranked.map((recommendation) => recommendation.id)).toEqual(["a", "b", "d"]);
});
