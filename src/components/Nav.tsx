import { useEffect, useState } from "react";
import { LogOut, Menu } from "lucide-react";
import type { SpotifyUser } from "../api/innerHorizons";

/* Only sections that actually exist on the page — no dead buttons. */
const links = [
  { label: "Discover", href: "#discover" },
  { label: "Results", href: "#results" },
  { label: "How it works", href: "#how" },
  { label: "Method", href: "#method" },
  { label: "About", href: "#about" },
];

type NavProps = {
  authenticated: boolean;
  user: SpotifyUser | null;
  onLogout: () => void;
};

export default function Nav({ authenticated, user, onLogout }: NavProps) {
  /* Transparent over the hero, opaque once content starts passing beneath it
     — otherwise track rows collide with the wordmark on the way past. */
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("#discover");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Scroll spy. The top margin offsets the fixed nav so a section counts as
     current once it clears the bar, not when it touches the viewport edge. */
  useEffect(() => {
    const sections = links
      .map(({ href }) => document.querySelector(href))
      .filter((el): el is Element => el !== null);

    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible) setActive(`#${visible.target.id}`);
      },
      { rootMargin: "-80px 0px -55% 0px", threshold: [0.1, 0.5] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5 transition-colors duration-300 ${
        scrolled ? "bg-black/85 backdrop-blur-md border-b border-white/10" : "border-b border-transparent"
      }`}
    >
      <a href="/" className="flex items-center gap-2" aria-label="Inner Horizons, home">
        <svg width="26" height="26" viewBox="0 0 256 256" fill="#ffffff" aria-hidden="true">
          <path d="M 256 256 L 128 256 L 0 128 L 128 128 Z M 256 128 L 128 128 L 0 0 L 128 0 Z" />
        </svg>
        <span className="text-white text-2xl font-playfair italic">Inner Horizons</span>
      </a>

      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-2 py-2 items-center gap-1">
        {links.map(({ label, href }) => (
          <a
            key={href}
            href={href}
            aria-current={active === href ? "true" : undefined}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              active === href
                ? "text-white bg-white/20"
                : "text-white/80 hover:bg-white/20 hover:text-white"
            }`}
          >
            {label}
          </a>
        ))}
      </div>

      {authenticated ? (
        <button
          onClick={onLogout}
          className="hidden md:flex items-center gap-2 bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100"
        >
          <LogOut size={15} aria-hidden="true" />
          {user?.displayName || "disconnect"}
        </button>
      ) : (
        <a
          href="/auth/spotify"
          className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100"
        >
          connect Spotify
        </a>
      )}

      <button className="md:hidden text-white p-2" aria-label="Open menu">
        <Menu size={24} aria-hidden="true" />
      </button>
    </nav>
  );
}
