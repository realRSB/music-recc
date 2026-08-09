import { Clock, ListMusic, MessageSquareText, Sparkles, Waypoints } from "lucide-react";

/* Mirrors the primary user flow in docs.md. */
const steps = [
  {
    icon: ListMusic,
    title: "Give it a starting point",
    body: "A Spotify playlist link, a track link, or just a song name. Public sources work without signing in — you only connect Spotify when you want to read your own playlists or save the result.",
  },
  {
    icon: Waypoints,
    title: "We read the taste anchors",
    body: "Artists, genres, era, album context, and how often each shows up. That becomes a picture of the lane you're already in, and where its edges are.",
  },
  {
    icon: Sparkles,
    title: "You get picks that argue for themselves",
    body: "Every track comes with a short note on why it fits and what makes it a step outward. Nothing already in your source, and we favour artists you haven't got yet.",
  },
];

/* Weekly algorithmic mixes and one-song generators solve a narrower problem
   than this one — worth naming plainly rather than assuming the difference
   is obvious. */
const contrasts = [
  {
    icon: Clock,
    body: "Not a weekly drop. Any playlist or song, whenever you want a new one.",
  },
  {
    icon: Waypoints,
    body: "Not limited to your own listening history — start from anyone's public playlist.",
  },
  {
    icon: MessageSquareText,
    body: "Not a black box. Every pick says why it's there, so you can judge it yourself.",
  },
];

export default function HowItWorks() {
  return (
    <section
      id="how"
      className="relative z-10 bg-black px-5 sm:px-10 md:px-14 py-20 sm:py-28 scroll-mt-24 border-t border-white/10"
    >
      <div className="mx-auto max-w-5xl">
        <h2
          className="text-white font-playfair italic text-3xl sm:text-5xl"
          style={{ letterSpacing: "-0.03em" }}
        >
          How it works
        </h2>
        <p className="mt-4 max-w-xl text-white/60 text-sm sm:text-base leading-relaxed">
          Three steps, no long quiz. The point is to get you to a playlist worth listening to
          before you lose interest in the form.
        </p>

        <ol className="mt-12 grid gap-5 sm:grid-cols-3">
          {steps.map(({ icon: Icon, title, body }, i) => (
            <li
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 hover:bg-white/[0.06] hover:border-white/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span
                  className="font-playfair italic text-2xl text-[#e8702a]"
                  aria-hidden="true"
                >
                  0{i + 1}
                </span>
                <Icon size={18} className="text-white/50" aria-hidden="true" />
              </div>
              <h3 className="mt-4 text-white text-base font-semibold leading-snug">{title}</h3>
              <p className="mt-2.5 text-white/60 text-sm leading-relaxed">{body}</p>
            </li>
          ))}
        </ol>

        <ul className="mt-6 grid gap-3 sm:grid-cols-3">
          {contrasts.map(({ icon: Icon, body }) => (
            <li key={body} className="flex items-start gap-2.5 text-white/50 text-xs sm:text-sm leading-relaxed">
              <Icon size={14} className="mt-0.5 shrink-0 text-white/30" aria-hidden="true" />
              {body}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
