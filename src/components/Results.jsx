import { Check, CircleAlert, ExternalLink, RefreshCw } from "lucide-react";
import TrackRow from "./TrackRow.jsx";

function SkeletonRow() {
  return (
    <li className="panel skeleton-row" aria-hidden="true">
      <div className="shimmer skeleton-art" />
      <div className="skeleton-lines">
        <div className="shimmer skeleton-line" style={{ width: "42%" }} />
        <div className="shimmer skeleton-line" style={{ width: "26%" }} />
        <div className="shimmer skeleton-line" style={{ width: "88%" }} />
        <div className="shimmer skeleton-line" style={{ width: "64%" }} />
      </div>
    </li>
  );
}

export default function Results({
  tracks,
  isExample,
  loading,
  saving,
  canSave,
  onSave,
  error,
  savedPlaylist,
  headline,
  tasteBits = [],
}) {
  return (
    <section className="results" aria-labelledby="results-title">
      <div className="panel playlist-head">
        <div>
          <h2 id="results-title">{headline}</h2>
          <div className="playlist-meta">
            {isExample ? (
              <span className="tag tag-example">example picks</span>
            ) : (
              <span className="tag tag-count">{tracks.length} tracks</span>
            )}
            {tasteBits.map((bit) => (
              <span className="tag tag-vibe" key={bit}>
                {bit}
              </span>
            ))}
          </div>
        </div>

        <button
          type="button"
          className="btn btn-solid"
          onClick={onSave}
          disabled={!canSave}
          title={canSave ? undefined : "Connect Spotify and generate a playlist first"}
        >
          {saving ? (
            <RefreshCw size={15} aria-hidden="true" className="spin" />
          ) : (
            <Check size={15} aria-hidden="true" />
          )}
          save to Spotify
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {loading ? "Building your playlist" : `${tracks.length} recommendations ready`}
      </p>

      {error ? (
        <p className="banner banner-error" role="alert">
          <CircleAlert size={16} aria-hidden="true" />
          {error}
        </p>
      ) : null}

      {savedPlaylist ? (
        <a
          className="banner banner-ok"
          href={savedPlaylist.url}
          target="_blank"
          rel="noreferrer"
        >
          <ExternalLink size={16} aria-hidden="true" />
          Saved to Spotify: {savedPlaylist.name}
        </a>
      ) : null}

      {isExample && !loading ? (
        <p className="example-note">
          These are sample picks so you can see the shape of a result. Add a playlist or song
          above to generate real ones from Spotify.
        </p>
      ) : null}

      {loading ? (
        <ul className="recommendations">
          {Array.from({ length: 4 }, (_, i) => (
            <SkeletonRow key={i} />
          ))}
        </ul>
      ) : (
        <ul className="recommendations">
          {tracks.map((track, i) => (
            <TrackRow key={track.id} track={track} index={i} />
          ))}
        </ul>
      )}
    </section>
  );
}
