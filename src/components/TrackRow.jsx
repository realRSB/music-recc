import { useState } from "react";
import { Compass, ExternalLink, Music2 } from "lucide-react";
import { artFor } from "../data/tracks.js";

export default function TrackRow({ track, index }) {
  const [artFailed, setArtFailed] = useState(false);
  const [a, b] = artFor(track.id);
  const showArt = track.artwork && !artFailed;

  return (
    <li className="panel recommendation" style={{ "--i": index, "--a": a, "--b": b }}>
      <div className="track-art">
        {showArt ? (
          <img src={track.artwork} alt="" loading="lazy" onError={() => setArtFailed(true)} />
        ) : (
          <Music2 size={20} aria-hidden="true" />
        )}
      </div>

      <div className="track-copy">
        <h3 className="track-title">{track.title}</h3>
        <p className="track-artist">
          {track.artist}
          {track.album ? (
            <>
              <span className="dot" aria-hidden="true">
                ·
              </span>
              {track.album}
            </>
          ) : null}
        </p>

        {track.reason ? <p className="track-reason">{track.reason}</p> : null}

        {track.horizon ? (
          <div className="track-tags">
            <span className="tag tag-new">
              <Compass size={11} aria-hidden="true" />
              {track.horizon}
            </span>
          </div>
        ) : null}
      </div>

      <div className="track-actions">
        <a
          className="btn btn-ghost btn-icon"
          href={track.url}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${track.title} by ${track.artist} on Spotify`}
        >
          <ExternalLink size={15} aria-hidden="true" />
        </a>
      </div>
    </li>
  );
}
