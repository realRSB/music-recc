import { Check, X } from "lucide-react";

/* docs.md is explicit that the MVP must not lean on Spotify's deprecated
   recommendation endpoints. Saying so plainly is a feature, not a caveat. */
const uses = [
  "Artists, genres, and album metadata from your source",
  "Release era and playlist composition",
  "Spotify search across adjacent artists and tracks",
  "Ranking by fit, novelty, and how explainable a pick is",
];

const avoids = [
  "The deprecated /recommendations endpoint",
  "Audio features and audio analysis",
  "Related-artists lookups",
];

export default function Method() {
  return (
    <section
      id="method"
      className="relative z-10 bg-black px-5 sm:px-10 md:px-14 py-20 sm:py-28 scroll-mt-24 border-t border-white/10"
    >
      <div className="mx-auto max-w-5xl grid gap-10 md:grid-cols-2">
        <div>
          <h2
            className="text-white font-playfair italic text-3xl sm:text-5xl"
            style={{ letterSpacing: "-0.03em" }}
          >
            The method
          </h2>
          <p className="mt-5 text-white/60 text-sm sm:text-base leading-relaxed">
            In November 2024 Spotify closed several Web API endpoints to new applications —
            including the recommendations engine and audio analysis. Rather than pretend
            otherwise, Inner Horizons is built entirely on metadata and search.
          </p>
          <p className="mt-4 text-white/60 text-sm sm:text-base leading-relaxed">
            That constraint is why every pick carries a reason. When the matching is transparent,
            you can judge it yourself instead of trusting a black box.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-1 lg:grid-cols-2 content-start">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-white text-sm font-semibold">What it uses</h3>
            <ul className="mt-3 space-y-2.5">
              {uses.map((item) => (
                <li key={item} className="flex gap-2.5 text-white/60 text-sm leading-relaxed">
                  <Check size={14} className="mt-1 shrink-0 text-[#e8702a]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <h3 className="text-white text-sm font-semibold">What it doesn&rsquo;t</h3>
            <ul className="mt-3 space-y-2.5">
              {avoids.map((item) => (
                <li key={item} className="flex gap-2.5 text-white/50 text-sm leading-relaxed">
                  <X size={14} className="mt-1 shrink-0 text-white/30" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
