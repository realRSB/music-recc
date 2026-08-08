import { useState } from "react";
import { Compass, ExternalLink, Music2 } from "lucide-react";
import type { Track } from "../api/innerHorizons";

/* Album art is missing often enough that a deterministic gradient beats a
   broken-image icon. Same track always gets the same pair. */
const palettes = [
  ["#f2c46d", "#397f83"],
  ["#ef7f65", "#6fb1c9"],
  ["#8a6bd8", "#f0b35f"],
  ["#98aeb3", "#3f5f71"],
  ["#e2725b", "#4a5a8a"],
  ["#d99a5b", "#2f6b60"],
];

function artFor(id = "") {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  return palettes[hash % palettes.length];
}

export default function TrackRow({ track }: { track: Track }) {
  const [artFailed, setArtFailed] = useState(false);
  const [a, b] = artFor(track.id);
  const showArt = Boolean(track.artwork) && !artFailed;

  return (
    <li className="recommendation group flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-colors">
      <div
        className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden grid place-items-center text-white/90"
        style={{ background: `linear-gradient(140deg, ${a}, ${b})` }}
      >
        {showArt ? (
          <img
            src={track.artwork}
            alt=""
            loading="lazy"
            onError={() => setArtFailed(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <Music2 size={20} aria-hidden="true" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="text-white text-[0.95rem] font-semibold leading-snug">{track.title}</h3>
        <p className="text-white/60 text-sm">
          {track.artist}
          {track.album ? <span className="text-white/30"> · {track.album}</span> : null}
        </p>

        {track.reason ? (
          <p className="mt-2.5 text-white/70 text-sm leading-relaxed">{track.reason}</p>
        ) : null}

        {track.horizon ? (
          <span className="mt-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#e8702a]/15 text-[#f0a273] text-xs font-medium">
            <Compass size={11} aria-hidden="true" />
            {track.horizon}
          </span>
        ) : null}
      </div>

      <a
        href={track.url}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${track.title} by ${track.artist} on Spotify`}
        className="shrink-0 grid place-items-center w-10 h-10 rounded-full border border-white/15 text-white/70 hover:text-white hover:bg-white/10 hover:border-white/30 transition-colors"
      >
        <ExternalLink size={15} aria-hidden="true" />
      </a>
    </li>
  );
}
