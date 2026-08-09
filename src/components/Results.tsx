import { Check, CircleAlert, ExternalLink, Loader2 } from "lucide-react";
import TrackRow from "./TrackRow";
import type { RecommendationResult, SavedPlaylist } from "../api/innerHorizons";

type ResultsProps = {
  result: RecommendationResult | null;
  loading: boolean;
  saving: boolean;
  canSave: boolean;
  onSave: () => void;
  error: string;
  savedPlaylist: SavedPlaylist | null;
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
}: ResultsProps) {
  const tasteBits = result
    ? [
        result.taste?.topGenres?.[0]?.name ? `${result.taste.topGenres[0].name} lane` : null,
        result.taste?.topArtists?.[0]?.name ? `${result.taste.topArtists[0].name} anchor` : null,
      ].filter(Boolean)
    : [];
  const title = loading
    ? "Building your horizon playlist"
    : result
      ? result.playlist.name
      : "Your horizon playlist";

  return (
    /* Top padding and scroll-margin both clear the fixed nav, which floats
       over this section once you scroll past the hero. */
    <section
      id="results"
      aria-busy={loading}
      className="relative z-10 bg-black px-5 sm:px-10 md:px-14 pt-28 pb-16 sm:pt-36 sm:pb-24 scroll-mt-24"
    >
      <div className="mx-auto max-w-3xl">
        <header className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h2
              className="text-white font-playfair italic text-3xl sm:text-4xl"
              style={{ letterSpacing: "-0.03em" }}
            >
              {title}
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

        <p className="sr-only" role="status" aria-live="polite">
          {loading
            ? "Building your playlist"
            : `${result?.recommendations.length ?? 0} recommendations ready`}
        </p>

        {loading ? (
          <div className="mt-8 flex items-start gap-4 rounded-2xl border border-[#e8702a]/35 bg-[#e8702a]/10 px-4 py-4 text-white shadow-lg shadow-[#e8702a]/10">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#e8702a]/20 text-[#ffb27f]">
              <Loader2 size={18} aria-hidden="true" className="animate-spin" />
            </span>
            <div>
              <p className="text-sm font-semibold">working on it</p>
              <p className="mt-1 text-sm leading-relaxed text-white/65">
                Reading your source, checking genre clues, and lining up tracks that keep the vibe
                while moving past the obvious picks.
              </p>
            </div>
          </div>
        ) : null}

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
