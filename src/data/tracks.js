/* Placeholder recommendations for the UI pass.
   Shape mirrors what the Spotify search + heuristic ranking layer will return,
   so swapping in live data is a fetch call, not a refactor.

   Per docs.md every result must carry: track name, artist, artwork, a Spotify
   link, why it fits, and what makes it new relative to the input. `art` stands
   in for album artwork until we have real images from the API. */

export const seedTracks = [
  {
    id: "sweet-disposition",
    title: "Sweet Disposition",
    artist: "The Temper Trap",
    album: "Conditions",
    year: 2009,
    vibe: "anthemic indie shimmer",
    novelty: "new artist for you",
    reason:
      "Keeps the wide-open emotional lift of your source, but trades polish for a guitar line that keeps climbing.",
    url: "https://open.spotify.com/track/0Y0QoDStAXWSJHnhJDGuUx",
    art: ["#f2c46d", "#397f83"],
  },
  {
    id: "can-i-call-you-tonight",
    title: "Can I Call You Tonight?",
    artist: "Dayglow",
    album: "Fuzzybrain",
    year: 2018,
    vibe: "sunny bedroom pop",
    novelty: "adjacent to 3 artists you saved",
    reason:
      "Same easy melodic warmth you already reach for, loosened up with bedroom-recorded guitar and a lot more air.",
    url: "https://open.spotify.com/track/4h9ZjbNGhnSSgcVIB0Yiwc",
    art: ["#ef7f65", "#6fb1c9"],
  },
  {
    id: "borderline",
    title: "Borderline",
    artist: "Tame Impala",
    album: "The Slow Rush",
    year: 2019,
    vibe: "psychedelic groove",
    novelty: "one step past your usual",
    reason:
      "The bassline and vocal mood sit close to your pop instincts, then the production drifts somewhere hazier.",
    url: "https://open.spotify.com/track/2X485T9Z5Ly0xyaghN73ed",
    art: ["#8a6bd8", "#f0b35f"],
  },
  {
    id: "garden-song",
    title: "Garden Song",
    artist: "Phoebe Bridgers",
    album: "Punisher",
    year: 2020,
    vibe: "quiet lyrical drift",
    novelty: "quieter than anything in your source",
    reason:
      "For the late end of the playlist — detailed writing, almost no percussion, and a lot of room to sit inside.",
    url: "https://open.spotify.com/track/1wVFrGZ0BhVAKKurQeuvVU",
    art: ["#98aeb3", "#3f5f71"],
  },
];

export const moods = [
  "open road",
  "late night",
  "bright morning",
  "quiet focus",
  "rainy window",
];

/* The familiarity dial. Index maps 1:1 to the range input's value. */
export const rangeStops = [
  { label: "Close to home", blurb: "Nearly the same room as your source" },
  { label: "One step out", blurb: "Familiar shape, unfamiliar names" },
  { label: "Wandering", blurb: "Shared roots, different weather" },
  { label: "Far horizon", blurb: "Deep cuts you have to meet halfway" },
];
