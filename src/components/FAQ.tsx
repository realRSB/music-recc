import { ChevronDown } from "lucide-react";

/* Answers are grounded in what the app actually does — the scopes requested
   in server/spotify.js (playlist read/write + basic profile, nothing else)
   and the public-search fallback in server/recommender.js — not generic
   reassurance copy. */
const questions = [
  {
    q: "Do I need Spotify Premium?",
    a: "No. Browsing recommendations and saving a playlist both work on a free account. Playing full tracks back in Spotify follows whatever plan you already have, the same as clicking any other Spotify link.",
  },
  {
    q: "Do I have to connect my Spotify account?",
    a: "Only if you want to pull from your own playlists or save a result. Public playlist links, track links, and plain song names all work without signing in.",
  },
  {
    q: "What can Inner Horizons see or do on my account?",
    a: "Just your playlists (to read and, if you ask us to save a result, to write) and your basic public profile. We never request your listening history, top artists, or playback control.",
  },
  {
    q: "Why does every recommendation come with a reason?",
    a: "Spotify closed off its recommendation and audio-analysis endpoints to new apps in late 2024, so this runs on metadata and search instead of a black-box model. Showing the reasoning is what that approach is actually good for — see the method below.",
  },
  {
    q: "Is this an official Spotify product?",
    a: "No. Inner Horizons is an independent project built on Spotify's public Web API — not affiliated with or endorsed by Spotify.",
  },
];

export default function FAQ() {
  return (
    <section
      id="faq"
      className="relative z-10 bg-black px-5 sm:px-10 md:px-14 py-20 sm:py-28 scroll-mt-24 border-t border-white/10"
    >
      <div className="mx-auto max-w-3xl">
        <h2
          className="text-white font-playfair italic text-3xl sm:text-5xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          Questions worth answering upfront
        </h2>

        <div className="mt-10 space-y-3">
          {questions.map(({ q, a }) => (
            <details
              key={q}
              className="group rounded-2xl border border-white/10 bg-white/[0.03] open:bg-white/[0.06] transition-colors"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-white text-sm sm:text-base font-medium marker:content-none">
                <span>{q}</span>
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className="shrink-0 text-white/50 transition-transform duration-200 group-open:rotate-180"
                />
              </summary>
              <div className="px-5 pb-4 text-white/60 text-sm leading-relaxed">{a}</div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
