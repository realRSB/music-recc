import { ArrowRight, Ban, ListMusic, RefreshCw, TriangleAlert, X } from "lucide-react";
import { moods, ranges } from "../data/tracks.js";

export default function Composer({
  source,
  range,
  mood,
  avoid,
  onChange,
  onSubmit,
  loading,
  canGenerate,
  spotifyConfigured,
}) {
  const activeRange = Math.max(
    0,
    ranges.findIndex((option) => option.value === range),
  );

  return (
    <form className="panel composer" onSubmit={onSubmit}>
      {!spotifyConfigured ? (
        <p className="notice">
          <TriangleAlert size={16} aria-hidden="true" />
          <span>
            Add Spotify credentials from <code>.env.example</code> to run live recommendations.
          </span>
        </p>
      ) : null}

      <div className="field">
        <label className="field-label" htmlFor="source">
          <span>Start from</span>
          <span className="field-hint">no login needed</span>
        </label>
        <div className="entry">
          <ListMusic size={18} aria-hidden="true" />
          <input
            id="source"
            name="source"
            type="text"
            autoComplete="off"
            spellCheck="false"
            placeholder="Playlist link, track link, or song name"
            value={source}
            onChange={(event) => onChange({ source: event.target.value })}
          />
          {source ? (
            <button
              type="button"
              className="entry-clear"
              onClick={() => onChange({ source: "" })}
              aria-label="Clear source"
            >
              <X size={13} aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {/* The core dial: how far past the familiar to reach. */}
      <div className="field range-wrap">
        <label className="field-label" htmlFor="range">
          <span>How far out?</span>
          <span className="range-value">{ranges[activeRange].label}</span>
        </label>
        <input
          id="range"
          className="range"
          type="range"
          min="0"
          max={ranges.length - 1}
          step="1"
          value={activeRange}
          onChange={(event) => onChange({ range: ranges[Number(event.target.value)].value })}
          aria-describedby="range-blurb"
        />
        <div className="range-scale" aria-hidden="true">
          <span>Familiar</span>
          <span>Adventurous</span>
        </div>
        <p id="range-blurb" className="field-hint">
          {ranges[activeRange].blurb}
        </p>
      </div>

      <div className="field">
        <div className="field-label" id="mood-label">
          <span>Mood</span>
        </div>
        <div className="chips" role="radiogroup" aria-labelledby="mood-label">
          {moods.map((option) => (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={mood === option}
              className="chip"
              onClick={() => onChange({ mood: option })}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="field">
        <label className="field-label" htmlFor="avoid">
          <span>Anything to avoid?</span>
          <span className="field-hint">optional</span>
        </label>
        <div className="entry">
          <Ban size={17} aria-hidden="true" />
          <input
            id="avoid"
            name="avoid"
            type="text"
            autoComplete="off"
            placeholder="Artists, genres, or words"
            value={avoid}
            onChange={(event) => onChange({ avoid: event.target.value })}
          />
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg" disabled={!canGenerate}>
        {loading ? (
          <>
            <RefreshCw size={17} aria-hidden="true" className="spin" />
            reading the room…
          </>
        ) : (
          <>
            build horizon playlist
            <ArrowRight size={17} aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
