import { useEffect, useRef, useState } from "react";
import { ArrowRight, ListMusic, Loader2, Music } from "lucide-react";
import RevealLayer from "./RevealLayer";
import { BG_IMAGE_1, BG_IMAGE_2, RANGES } from "../constants";
import { searchTracks } from "../api/innerHorizons";
import type { SearchTrack, UserPlaylist } from "../api/innerHorizons";

/* Playlist/track links and URIs already point at something exact — only
   free-text (a typed song name, possibly misspelled) benefits from
   suggestions, so skip the lookup once the field already looks like one. */
function looksLikeSpotifyLink(value: string) {
  return /^(https?:\/\/open\.spotify\.com\/|spotify:)/i.test(value.trim());
}

type HeroProps = {
  source: string;
  range: string;
  avoid: string;
  onChange: (patch: { source?: string; range?: string; avoid?: string }) => void;
  onSubmit: (event: React.FormEvent) => void;
  loading: boolean;
  canGenerate: boolean;
  spotifyConfigured: boolean;
  playlists: UserPlaylist[];
};

export default function Hero({
  source,
  range,
  avoid,
  onChange,
  onSubmit,
  loading,
  canGenerate,
  spotifyConfigured,
  playlists,
}: HeroProps) {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef<number>(0);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  const [suggestions, setSuggestions] = useState<SearchTrack[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const fieldRef = useRef<HTMLDivElement>(null);
  const suppressLookup = useRef(false);
  const focused = useRef(false);

  /* Debounce the lookup so we're not firing a search request on every
     keystroke, and bail out entirely once the field already holds a link. */
  useEffect(() => {
    if (suppressLookup.current) {
      suppressLookup.current = false;
      return;
    }

    const query = source.trim();

    if (query.length < 2 || looksLikeSpotifyLink(query)) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const { tracks } = await searchTracks(query);
        /* The field may have lost focus while this request was in flight —
           reopening the list at that point would fight whatever the user
           moved on to (e.g. it clobbered the submit button in testing). */
        if (cancelled || !focused.current) return;
        setSuggestions(tracks);
        setShowSuggestions(tracks.length > 0);
        setActiveIndex(-1);
      } catch {
        if (cancelled) return;
        setSuggestions([]);
        setShowSuggestions(false);
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [source]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!fieldRef.current?.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  function pickSuggestion(track: SearchTrack) {
    suppressLookup.current = true;
    onChange({ source: track.url || `${track.title} ${track.artist}` });
    setSuggestions([]);
    setShowSuggestions(false);
    setActiveIndex(-1);
  }

  function onSourceKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((current) => (current + 1) % suggestions.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      pickSuggestion(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setShowSuggestions(false);
    }
  }

  useEffect(() => {
    const onMove = (event: MouseEvent) => {
      mouse.current = { x: event.clientX, y: event.clientY };
    };

    window.addEventListener("mousemove", onMove);

    /* Ease toward the raw pointer so the spotlight trails rather than snaps.
       Once it has effectively caught up we stop pushing state, otherwise the
       lerp keeps producing new sub-pixel values and re-renders forever. */
    const tick = () => {
      const dx = mouse.current.x - smooth.current.x;
      const dy = mouse.current.y - smooth.current.y;

      if (Math.abs(dx) > 0.01 || Math.abs(dy) > 0.01) {
        smooth.current.x += dx * 0.1;
        smooth.current.y += dy * 0.1;
        setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <section
      id="discover"
      className="relative w-full overflow-hidden h-screen bg-black"
      style={{ height: "100dvh" }}
    >
      <div
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
        style={{ backgroundImage: `url('${BG_IMAGE_1}')` }}
      />

      <RevealLayer image={BG_IMAGE_2} cursorX={cursorPos.x} cursorY={cursorPos.y} />

      <div className="absolute top-[14%] left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none">
        <h1 className="text-white leading-[0.95]">
          <span
            className="block font-playfair italic font-normal text-5xl sm:text-7xl md:text-8xl hero-anim hero-reveal"
            style={{ letterSpacing: "-0.05em", animationDelay: "0.25s" }}
          >
            Find the songs
          </span>
          <span
            className="block font-normal text-5xl sm:text-7xl md:text-8xl -mt-1 hero-anim hero-reveal"
            style={{ letterSpacing: "-0.08em", animationDelay: "0.42s" }}
          >
            past your rotation
          </span>
        </h1>
      </div>

      <div
        className="hidden sm:block absolute bottom-14 left-10 md:left-14 max-w-[260px] z-50 hero-anim hero-fade"
        style={{ animationDelay: "0.7s" }}
      >
        <p className="text-sm text-white/80 leading-relaxed">
          Every playlist is a map of what you already love. We read its artists, genres, and era,
          then look just past the edges of it.
        </p>
      </div>

      {/* docs.md: the first screen starts the actual recommendation workflow,
          so the real source input lives here rather than a marketing CTA. */}
      <div
        className="absolute bottom-10 sm:bottom-20 left-5 right-5 sm:left-auto sm:right-10 md:right-14 max-w-full sm:max-w-[380px] flex flex-col items-start gap-4 z-50 hero-anim hero-fade"
        style={{ animationDelay: "0.85s" }}
      >
        <form onSubmit={onSubmit} className="w-full flex flex-col gap-3">
          <label htmlFor="source" className="text-xs font-medium text-white/70 tracking-wide">
            Start from a playlist or song
          </label>

          <div ref={fieldRef} className="relative w-full">
            <input
              id="source"
              name="source"
              type="text"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={showSuggestions}
              aria-controls="source-suggestions"
              aria-autocomplete="list"
              aria-activedescendant={activeIndex >= 0 ? `source-suggestion-${activeIndex}` : undefined}
              value={source}
              onChange={(event) => onChange({ source: event.target.value })}
              onKeyDown={onSourceKeyDown}
              onFocus={() => {
                focused.current = true;
                setShowSuggestions(suggestions.length > 0);
              }}
              onBlur={() => {
                focused.current = false;
                setShowSuggestions(false);
              }}
              placeholder="Playlist link, track link, or song name"
              className="w-full bg-white/10 backdrop-blur-md border border-white/25 rounded-full px-5 py-3 text-sm text-white placeholder:text-white/50 outline-none focus:border-[#e8702a] focus:ring-2 focus:ring-[#e8702a]/40 transition-colors"
            />

            {/* Typing a song name is easy to fumble — a misspelled artist,
                the wrong "feat." order — so surface real matches to click
                instead of hoping search finds it later. */}
            {showSuggestions ? (
              <ul
                id="source-suggestions"
                role="listbox"
                aria-label="Matching tracks"
                className="absolute left-0 right-0 top-[calc(100%+6px)] max-h-64 overflow-y-auto rounded-2xl border border-white/15 bg-black/90 backdrop-blur-xl shadow-lg shadow-black/50 z-10"
              >
                {suggestions.map((track, index) => (
                  <li key={track.id} role="presentation">
                    <button
                      id={`source-suggestion-${index}`}
                      type="button"
                      role="option"
                      aria-selected={index === activeIndex}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => pickSuggestion(track)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                        index === activeIndex ? "bg-white/15" : "hover:bg-white/10"
                      }`}
                    >
                      {track.artwork ? (
                        <img
                          src={track.artwork}
                          alt=""
                          className="w-8 h-8 rounded-md object-cover shrink-0"
                        />
                      ) : (
                        <span className="w-8 h-8 rounded-md bg-white/10 grid place-items-center shrink-0">
                          <Music size={14} aria-hidden="true" className="text-white/50" />
                        </span>
                      )}
                      <span className="min-w-0">
                        <span className="block text-sm text-white truncate">{track.title}</span>
                        <span className="block text-xs text-white/50 truncate">{track.artist}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="avoid" className="text-xs font-medium text-white/60 tracking-wide">
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
              className="w-full bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 text-sm text-white placeholder:text-white/45 outline-none focus:border-[#e8702a] focus:ring-2 focus:ring-[#e8702a]/35 transition-colors"
            />
          </div>

          {/* Once you're signed in, your own playlists are the fastest source
              to start from — one click fills the field above. */}
          {playlists.length > 0 ? (
            <div className="flex flex-col gap-2">
              <span className="text-xs text-white/50">or pick one of yours</span>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    type="button"
                    onClick={() => onChange({ source: playlist.url })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 border border-white/25 text-white/85 text-xs font-medium hover:bg-white/20 hover:text-white transition-colors"
                  >
                    <ListMusic size={12} aria-hidden="true" />
                    {playlist.name}
                    <span className="text-white/40">{playlist.trackTotal}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="How far out">
            {RANGES.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={range === option}
                onClick={() => onChange({ range: option })}
                className={`px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  range === option
                    ? "bg-white text-gray-900 border-white"
                    : "bg-white/10 text-white/80 border-white/25 hover:bg-white/20 hover:text-white"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <button
            type="submit"
            disabled={!canGenerate}
            className="inline-flex items-center gap-2 bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 self-start"
          >
            {loading ? (
              <>
                <Loader2 size={16} aria-hidden="true" className="animate-spin" />
                reading the room…
              </>
            ) : (
              <>
                build horizon playlist
                <ArrowRight size={16} aria-hidden="true" />
              </>
            )}
          </button>

          {!spotifyConfigured ? (
            <p className="text-xs text-white/60 leading-relaxed">
              Add Spotify credentials from <code className="text-white/80">.env.example</code> to
              run live recommendations.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
