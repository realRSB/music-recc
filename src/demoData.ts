import type { RecommendationResult } from "./api/innerHorizons";

export const DEMO_SOURCE = "midnight city playlist";

export const DEMO_RESULT: RecommendationResult = {
  source: {
    type: "playlist",
    id: "demo-playlist",
    name: DEMO_SOURCE,
    url: "https://open.spotify.com/search/midnight%20city%20playlist",
  },
  taste: {
    topGenres: [
      { name: "indie pop", count: 5 },
      { name: "dream pop", count: 3 },
      { name: "synth pop", count: 2 },
    ],
    topArtists: [
      { name: "M83", count: 2 },
      { name: "Tame Impala", count: 2 },
      { name: "The Japanese House", count: 1 },
    ],
    genreSource: "spotify",
    averagePopularity: 58,
  },
  playlist: {
    name: `Inner Horizons: after ${DEMO_SOURCE}`,
    description:
      "Demo same-vibe discoveries based on a dreamy late-night indie pop playlist. Built by Inner Horizons.",
  },
  recommendations: [
    {
      id: "demo-1",
      uri: "spotify:track:demo-1",
      title: "Sweet Disposition",
      artist: "The Temper Trap",
      album: "Conditions",
      artwork: "",
      url: "https://open.spotify.com/search/Sweet%20Disposition%20The%20Temper%20Trap",
      popularity: 67,
      horizon: "indie pop horizon",
      reason:
        "This keeps the widescreen, glowing chorus energy of the source while moving toward a different indie rock lane.",
      score: 96,
      genres: ["indie rock", "indie pop"],
      releaseYear: 2009,
    },
    {
      id: "demo-2",
      uri: "spotify:track:demo-2",
      title: "Space Song",
      artist: "Beach House",
      album: "Depression Cherry",
      artwork: "",
      url: "https://open.spotify.com/search/Space%20Song%20Beach%20House",
      popularity: 71,
      horizon: "dream pop horizon",
      reason:
        "The hazy synth texture matches the playlist mood, but the slower dream pop pacing opens a softer direction.",
      score: 93,
      genres: ["dream pop", "indie"],
      releaseYear: 2015,
    },
    {
      id: "demo-3",
      uri: "spotify:track:demo-3",
      title: "Saw You In A Dream",
      artist: "The Japanese House",
      album: "Good at Falling",
      artwork: "",
      url: "https://open.spotify.com/search/Saw%20You%20In%20A%20Dream%20The%20Japanese%20House",
      popularity: 55,
      horizon: "synth pop horizon",
      reason:
        "This follows the bright electronic polish in the source while adding more intimate vocals and cleaner guitar lines.",
      score: 90,
      genres: ["synth pop", "indie pop"],
      releaseYear: 2019,
    },
    {
      id: "demo-4",
      uri: "spotify:track:demo-4",
      title: "Breathe Deeper",
      artist: "Tame Impala",
      album: "The Slow Rush",
      artwork: "",
      url: "https://open.spotify.com/search/Breathe%20Deeper%20Tame%20Impala",
      popularity: 62,
      horizon: "psychedelic pop horizon",
      reason:
        "The groove stays close to polished synth pop, then bends the playlist toward psychedelic keys and looser drums.",
      score: 87,
      genres: ["psychedelic pop", "indie pop"],
      releaseYear: 2020,
    },
    {
      id: "demo-5",
      uri: "spotify:track:demo-5",
      title: "Can I Call You Tonight?",
      artist: "Dayglow",
      album: "Fuzzybrain",
      artwork: "",
      url: "https://open.spotify.com/search/Can%20I%20Call%20You%20Tonight%20Dayglow",
      popularity: 64,
      horizon: "bedroom pop horizon",
      reason:
        "This keeps the warm melodic pull of the source and makes the horizon feel lighter, younger, and more guitar-led.",
      score: 84,
      genres: ["bedroom pop", "indie pop"],
      releaseYear: 2019,
    },
    {
      id: "demo-6",
      uri: "spotify:track:demo-6",
      title: "Undercover Martyn",
      artist: "Two Door Cinema Club",
      album: "Tourist History",
      artwork: "",
      url: "https://open.spotify.com/search/Undercover%20Martyn%20Two%20Door%20Cinema%20Club",
      popularity: 52,
      horizon: "indie dance horizon",
      reason:
        "The tempo and bright hooks fit the playlist, while the sharper indie dance feel adds more motion.",
      score: 81,
      genres: ["indie dance", "indie rock"],
      releaseYear: 2010,
    },
  ],
};
