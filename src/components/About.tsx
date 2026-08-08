import { ArrowUp } from "lucide-react";

type AboutProps = {
  authenticated: boolean;
};

export default function About({ authenticated }: AboutProps) {
  return (
    <section
      id="about"
      className="relative z-10 bg-black px-5 sm:px-10 md:px-14 py-20 sm:py-28 scroll-mt-24 border-t border-white/10"
    >
      <div className="mx-auto max-w-2xl text-center">
        <h2
          className="text-white font-playfair italic text-3xl sm:text-5xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          Tell us what you already love
        </h2>
        <p className="mt-5 text-white/60 text-sm sm:text-base leading-relaxed">
          Inner Horizons exists for the gap between the songs you replay and the ones you&rsquo;d
          replay if you ever heard them. Not a shuffle, not a chart — a short, deliberate step
          past the edge of your own playlist.
        </p>

        <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
          <a
            href="#discover"
            className="inline-flex items-center gap-2 bg-[#e8702a] hover:bg-[#d2611f] text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-[#e8702a]/30"
          >
            <ArrowUp size={16} aria-hidden="true" />
            Start from a playlist
          </a>

          {!authenticated ? (
            <a
              href="/auth/spotify"
              className="inline-flex items-center border border-white/20 text-white text-sm font-medium px-6 py-3 rounded-full hover:bg-white/10 hover:border-white/35 transition-colors"
            >
              Sign in with Spotify to save
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}
