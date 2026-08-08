import { useEffect, useState } from "react";
import { LogOut, Plus, Search } from "lucide-react";

export default function TopBar({ authenticated, user, onLogout }) {
  const [stuck, setStuck] = useState(false);

  useEffect(() => {
    const onScroll = () => setStuck(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="topbar" data-stuck={stuck}>
      <div className="shell topbar-inner">
        <a className="brand" href="/" aria-label="Inner Horizons, home">
          <span className="brand-mark" aria-hidden="true" />
          <span>Inner Horizons</span>
        </a>

        <div className="nav-actions">
          <button type="button" className="btn btn-ghost btn-icon" aria-label="Search">
            <Search size={17} aria-hidden="true" />
          </button>

          {authenticated ? (
            <button type="button" className="btn btn-solid" onClick={onLogout}>
              <LogOut size={16} aria-hidden="true" />
              {user?.displayName || "disconnect"}
            </button>
          ) : (
            /* Starts the OAuth redirect. Kept as a button rather than a bare
               link so it reads as an action and matches the smoke test. */
            <button
              type="button"
              className="btn btn-solid"
              onClick={() => {
                window.location.href = "/auth/spotify";
              }}
            >
              <Plus size={16} aria-hidden="true" />
              connect Spotify
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
