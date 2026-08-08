import { ArrowRight, ListMusic, Loader2, SlidersHorizontal, Sparkles } from "lucide-react";

export const ranges = ["same vibe", "slightly new", "deep cut"];
export const moods = ["open road", "late night", "bright morning", "quiet focus"];

export function DiscoveryForm({
  avoid,
  canGenerate,
  config,
  mood,
  onSubmit,
  range,
  setAvoid,
  setMood,
  setRange,
  setSource,
  source,
  status,
}) {
  return (
    <form className="panel builder" onSubmit={onSubmit}>
      <p className="kicker">
        <Sparkles size={17} />
        same vibe, new artists
      </p>
      <h1>Find the songs hiding past your usual rotation.</h1>
      <p className="lede">
        Paste a Spotify playlist or song, tune how far you want to roam, and build a real recommendation list from Spotify metadata.
      </p>

      {!config.spotifyConfigured ? (
        <div className="notice">
          Add Spotify credentials from <code>.env.example</code> to run live recommendations.
        </div>
      ) : null}

      <div className="input-stack">
        <div className="field">
          <label htmlFor="source">playlist link or song</label>
          <div className="entry">
            <ListMusic size={20} />
            <input
              id="source"
              placeholder="spotify playlist url, track url, or song name"
              value={source}
              onChange={(event) => setSource(event.target.value)}
            />
          </div>
        </div>

        <div className="controls">
          <label className="field">
            <span className="control-label">range</span>
            <select value={range} onChange={(event) => setRange(event.target.value)}>
              {ranges.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span className="control-label">mood</span>
            <select value={mood} onChange={(event) => setMood(event.target.value)}>
              {moods.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="field">
          <label htmlFor="avoid">avoid</label>
          <div className="entry">
            <SlidersHorizontal size={20} />
            <input
              id="avoid"
              placeholder="artists, genres, or words to avoid"
              value={avoid}
              onChange={(event) => setAvoid(event.target.value)}
            />
          </div>
        </div>

        <button className="primary-button" type="submit" disabled={!canGenerate}>
          {status === "loading" ? <Loader2 className="spin" size={18} /> : <ArrowRight size={18} />}
          build horizon playlist
        </button>
      </div>
    </form>
  );
}
