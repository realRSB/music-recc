import { Check, CircleAlert, ExternalLink, Loader2 } from "lucide-react";
import TrackRow from "./TrackRow";
import { MOODS } from "../constants";
import type { RecommendationResult, SavedPlaylist } from "../api/innerHorizons";

type ResultsProps = {
  result: RecommendationResult | null;
  loading: boolean;
  saving: boolean;
  canSave: boolean;
  onSave: () => void;
  error: string;
  savedPlaylist: SavedPlaylist | null;
  mood: string;
  avoid: string;
  onChange: (patch: { mood?: string; avoid?: string }) => void;
};

function SkeletonRow() {
  return (
    <li className="flex items-start gap-4 p-4 rounded-2xl border border-white/10 bg-white/[0.03]">
      <div className="w-16 h-16 shrink-0 rounded-xl bg-white/10 animate-pulse" />
      <div className="flex-1 space-y-2.5 pt-1">
        <div className="h-3 w-2/5 rounded bg-white/10 animate-pulse" />
        <div className="h-3 w-1/4 rounded bg-white/10 animate-pulse" />
        <div className="h-3 w-4/5 rounded bg-white/10 animate-pulse" />
      </div>
    </li>
  );
}

export default function Results({
  result,
  loading,
  saving,
  canSave,
  onSave,
  error,
  savedPlaylist,
  mood,
  avoid,
  onChange,
}: ResultsProps) {
  const tasteBits = result
    ? [
        result.taste?.topGenres?.[0]?.name ? `${result.taste.topGenres[0].name} lane` : null,
        result.taste?.topArtists?.[0]?.name ? `${result.taste.topArtists[0].name} anchor` : null,
      ].filter(Boolean)
    : [];

  return (
    /* Top padding and scroll-margin both clear the fixed nav, which floats
       over this section once you scroll past the hero. */
    <section
      id="results"
      className="relative z-10 bg-black px-5 sm:px-10 md:px-14 pt-28 pb-16 sm:pt-36 sm:pb-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2
              className="text-white font-playfair italic text-3xl sm:text-4xl"
              style={{ letterSpacing: "-0.03em" }}
            >
              {result ? result.playlist.name : "Your horizon playlist"}
            </h2>

            <div className="mt-3 flex flex-wrap gap-2">
              {result ? (
                <span className="px-2.5 py-1 rounded-full bg-white/10 text-white text-xs font-medium">
                  {result.recommendations.length} tracks
                </span>
              ) : null}
              {tasteBits.map((bit) => (
                <span
                  key={bit}
                  className="px-2.5 py-1 rounded-full bg-white/[0.06] text-white/70 text-xs font-medium"
                >
                  {bit}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={onSave}
            disabled={!canSave}
            className="inline-flex items-center gap-2 border border-white/20 text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-white/10 hover:border-white/35 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            title={canSave ? undefined : "Connect Spotify and build a playlist first"}
          >
            {saving ? (
              <Loader2 size={15} aria-hidden="true" className="animate-spin" />
            ) : (
              <Check size={15} aria-hidden="true" />
            )}
            save to Spotify
          </button>
        </header>

        {/* Refinements live down here so the hero stays a single clear action. */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <div>
            <span id="mood-label" className="block text-xs font-medium text-white/60 mb-2">
              Mood
            </span>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-labelledby="mood-label">
              {MOODS.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={mood === option}
                  onClick={() => onChange({ mood: option })}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    mood === option
                      ? "bg-[#e8702a]/20 text-[#f0a273] border-[#e8702a]/50"
                      : "bg-white/[0.04] text-white/70 border-white/15 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="avoid" className="block text-xs font-medium text-white/60 mb-2">
              Anything to avoid?
            </label>
            <input
              id="avoid"
              name="avoid"
              type="text"
              autoComplete="off"
              value={avoid}
              onChange={(event) => onChange({ avoid: event.target.value })}
              placeholder="Artists, genres, or words"
              className="w-full bg-white/[0.04] border border-white/15 rounded-full px-4 py-2 text-sm text-white placeholder:text-white/40 outline-none focus:border-[#e8702a] focus:ring-2 focus:ring-[#e8702a]/30 transition-colors"
            />
          </div>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {loading
            ? "Building your playlist"
            : `${result?.recommendations.length ?? 0} recommendations ready`}
        </p>

        {error ? (
          <p
            role="alert"
            className="mt-8 flex items-start gap-3 px-4 py-3 rounded-2xl border border-red-500/35 bg-red-500/10 text-red-200 text-sm"
          >
            <CircleAlert size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            {error}
          </p>
        ) : null}

        {savedPlaylist ? (
          <a
            href={savedPlaylist.url}
            target="_blank"
            rel="noreferrer"
            className="mt-8 flex items-start gap-3 px-4 py-3 rounded-2xl border border-emerald-400/35 bg-emerald-400/10 text-emerald-200 text-sm hover:bg-emerald-400/20 transition-colors"
          >
            <ExternalLink size={16} aria-hidden="true" className="mt-0.5 shrink-0" />
            Saved to Spotify: {savedPlaylist.name}
          </a>
        ) : null}

        <ul className="mt-8 space-y-3">
          {loading ? (
            Array.from({ length: 4 }, (_, i) => <SkeletonRow key={i} />)
          ) : result ? (
            result.recommendations.map((track) => <TrackRow key={track.id} track={track} />)
          ) : (
            <li className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-14 text-center">
              <p className="mx-auto max-w-sm text-white/60 text-sm leading-relaxed">
                Paste a playlist or a song above and we&rsquo;ll search Spotify for tracks sitting
                just outside it — each one with a short note on why it fits and what makes it new.
              </p>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
