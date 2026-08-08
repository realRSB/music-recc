import React from "react";
import { Check, ExternalLink, Loader2, Music2, SlidersHorizontal } from "lucide-react";

export function RecommendationResults({
  canSave,
  error,
  mood,
  onSave,
  range,
  result,
  savedPlaylist,
  status,
}) {
  const headline = result?.source?.name
    ? `Inner Horizons: after ${result.source.name}`
    : "Inner Horizons: ready for your source";

  return (
    <section className="panel visual" aria-live="polite">
      <div className="results-head">
        <div>
          <h2>{headline}</h2>
          <p>{result ? `${range} picks for a ${mood} drift.` : "recommendations will appear here after Spotify analysis."}</p>
        </div>
        <button className="secondary-button" type="button" onClick={onSave} disabled={!canSave}>
          {status === "saving" ? <Loader2 className="spin" size={18} /> : <Check size={18} />}
          save
        </button>
      </div>

      {error ? <div className="error">{error}</div> : null}
      {savedPlaylist ? (
        <a className="saved-link" href={savedPlaylist.url} target="_blank" rel="noreferrer">
          opened in Spotify: {savedPlaylist.name}
        </a>
      ) : null}

      {result ? (
        <>
          <div className="taste-summary">
            <span>{result.taste.topGenres[0]?.name || "metadata"} lane</span>
            <span>{result.taste.topArtists[0]?.name || "source"} anchor</span>
            <span>{result.recommendations.length} tracks</span>
          </div>
          <div className="recommendations">
            {result.recommendations.map((track) => (
              <article className="recommendation" key={track.id}>
                {track.artwork ? (
                  <img className="track-art" src={track.artwork} alt="" />
                ) : (
                  <span className="track-art track-art-fallback">
                    <Music2 size={24} />
                  </span>
                )}
                <div className="track-copy">
                  <h3>{track.title}</h3>
                  <p>{track.artist}</p>
                  <p>{track.reason}</p>
                  <span className="tag">
                    <SlidersHorizontal size={14} />
                    {track.horizon}
                  </span>
                </div>
                <a className="play-button" href={track.url} target="_blank" rel="noreferrer" title={`Open ${track.title} on Spotify`}>
                  <ExternalLink size={17} />
                </a>
              </article>
            ))}
          </div>
        </>
      ) : (
        <div className="empty-state">
          <Music2 size={40} />
          <p>Give Inner Horizons a playlist or track and it will search Spotify for nearby songs from fresh artists.</p>
        </div>
      )}
    </section>
  );
}
