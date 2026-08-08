/* Example picks shown before the first real search runs, so the results panel
   has something to say on load instead of sitting empty. These are clearly
   labelled as examples in the UI — never presented as live Spotify results. */

export const exampleTracks = [
  {
    id: "example-sweet-disposition",
    title: "Sweet Disposition",
    artist: "The Temper Trap",
    album: "Conditions",
    horizon: "new artist",
    reason:
      "Keeps the wide-open emotional lift of your source, but trades polish for a guitar line that keeps climbing.",
    url: "https://open.spotify.com/track/0Y0QoDStAXWSJHnhJDGuUx",
  },
  {
    id: "example-can-i-call-you-tonight",
    title: "Can I Call You Tonight?",
    artist: "Dayglow",
    album: "Fuzzybrain",
    horizon: "new artist",
    reason:
      "Same easy melodic warmth you already reach for, loosened up with bedroom-recorded guitar and a lot more air.",
    url: "https://open.spotify.com/track/4h9ZjbNGhnSSgcVIB0Yiwc",
  },
  {
    id: "example-borderline",
    title: "Borderline",
    artist: "Tame Impala",
    album: "The Slow Rush",
    horizon: "nearby track",
    reason:
      "The bassline and vocal mood sit close to your pop instincts, then the production drifts somewhere hazier.",
    url: "https://open.spotify.com/track/2X485T9Z5Ly0xyaghN73ed",
  },
  {
    id: "example-garden-song",
    title: "Garden Song",
    artist: "Phoebe Bridgers",
    album: "Punisher",
    horizon: "new artist",
    reason:
      "For the late end of the playlist — detailed writing, almost no percussion, and a lot of room to sit inside.",
    url: "https://open.spotify.com/track/1wVFrGZ0BhVAKKurQeuvVU",
  },
];

/* These values are the wire format the server expects — see
   server/index.js POST /api/recommendations. Labels are for humans only. */
export const ranges = [
  { value: "same vibe", label: "Same vibe", blurb: "Nearly the same room as your source" },
  { value: "slightly new", label: "Slightly new", blurb: "Familiar shape, unfamiliar names" },
  { value: "deep cut", label: "Deep cut", blurb: "Shared roots, different weather" },
];

export const moods = ["open road", "late night", "bright morning", "quiet focus"];

/* Album art is missing often enough that a deterministic gradient beats a
   broken-image icon. Same track always gets the same two colours. */
const palettes = [
  ["#f2c46d", "#397f83"],
  ["#ef7f65", "#6fb1c9"],
  ["#8a6bd8", "#f0b35f"],
  ["#98aeb3", "#3f5f71"],
  ["#e2725b", "#4a5a8a"],
  ["#d99a5b", "#2f6b60"],
];

export function artFor(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return palettes[hash % palettes.length];
}
