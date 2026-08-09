# Inner Horizons project brief

## Working name

Inner Horizons

## Product idea

Inner Horizons is a Spotify-powered music discovery app. A user gives the app a Spotify playlist or song, chooses one of three discovery distances, and the app recommends songs and artists that match the same lane while introducing them to new sounds.

The core promise:

Tell us what you already love, and we will find songs just outside your usual rotation.

## Target experience

The app should feel like a recommendation maker based on the user's real listening choices, especially playlists. It should be quick, direct, and useful: give the app a playlist or song, answer a few lightweight questions if needed, then receive individual song recommendations assembled into a suggested playlist.

The recommendations should include short explanations. Each explanation should tell the user why the song fits their taste and what makes it a small horizon-broadening step.

## Primary user flow

1. User lands on Inner Horizons.
2. User chooses how to start:
   - paste or share a Spotify playlist link
   - paste or search for a Spotify song
   - optionally answer a quick taste quiz
3. App analyzes the selected playlist or song.
4. App returns recommended songs from new or less familiar artists.
5. App explains each pick.
6. App lets the user save the results as a Spotify playlist when they sign in.

## Authentication decision

Use Spotify auth when the user wants account-specific actions:

- read private/user-owned playlists
- import the user's Spotify library or profile data
- create and save a playlist to the user's Spotify account

Do not require full user login for lightweight discovery when it can work without it:

- searching for a song
- analyzing a public playlist link when allowed by Spotify API access
- previewing recommendations before saving

The app will still need app-level Spotify credentials through environment variables:

- `SPOTIFY_CLIENT_ID`
- `SPOTIFY_CLIENT_SECRET`
- `SPOTIFY_REDIRECT_URI`

## Spotify API notes

Build around currently supported Spotify Web API surfaces:

- Search for tracks, artists, albums, and playlists.
- Get track and artist metadata.
- Get playlist metadata/items when allowed.
- Use OAuth for current-user playlist access.
- Create a playlist for the current user.
- Add recommended track URIs to that playlist.

Avoid depending on older recommendation/audio endpoints for the MVP. Spotify announced in November 2024 that new Web API use cases no longer have access to several endpoints and features, including recommendations, audio features, audio analysis, and related artists. Existing apps with extended access may be unaffected, but new development should assume those endpoints are unavailable.

Useful references:

- https://developer.spotify.com/documentation/web-api
- https://developer.spotify.com/documentation/web-api/reference/search
- https://developer.spotify.com/documentation/web-api/reference/get-playlist
- https://developer.spotify.com/documentation/web-api/reference/get-playlists-items
- https://developer.spotify.com/documentation/web-api/reference/create-playlist
- https://developer.spotify.com/documentation/web-api/reference/add-items-to-playlist
- https://developer.spotify.com/blog/2024-11-27-changes-to-the-web-api

## Recommendation strategy for MVP

Because Spotify's direct recommendations/audio-features endpoints should not be assumed available, the MVP should use a transparent heuristic layer:

- Extract artists, genres, track names, album metadata, popularity, release dates, and playlist composition from the input.
- Identify the user's strongest taste anchors.
- Search Spotify for nearby artists/tracks using metadata and query patterns.
- Prefer tracks by artists not already present in the source playlist.
- Keep the vibe close: similar genre labels, era, artist relationships inferred from metadata, and playlist context.
- Broaden gently: introduce new artists or songs that are adjacent rather than random.
- Rank candidates by fit, novelty, and explainability.
- Filter duplicates and tracks already in the source playlist.

Later versions can improve this with additional data sources, embeddings, LLM-assisted explanations, user feedback, and saved preference history.

## Quick taste inputs

Keep onboarding direct. Do not add mood or quiz-style inputs before results:

- What song or playlist should we start from?
- Choose one of three discovery distances: `same vibe`, `slightly new`, or `deep cut`.
- Any genres, artists, or languages to avoid?

Use the source and distance as the main signal. The app should feel like playlist/song in, results out.

## Result requirements

Each recommended track should show:

- track name
- artist name
- album artwork when available
- Spotify link or URI
- short reason it was selected
- what makes it new relative to the input

The generated playlist should have:

- a name based on the input, such as "Inner Horizons: after [playlist name]"
- a short description explaining the source and discovery direction
- enough tracks to feel useful, likely 15-30 for the MVP

## Visual direction

The app should feel polished, music-centered, and discovery-focused. Avoid making it a generic landing page. The first screen should start the actual recommendation workflow.

Possible tone:

- calm but modern
- exploratory
- intimate rather than loud
- clear enough for a class/demo setting

## First build milestone

Create a minimal usable MVP:

1. Spotify configuration and auth plan.
2. Input screen for playlist link or song search.
3. Quick preference controls.
4. Recommendation results page with explanations.
5. Save-to-Spotify playlist flow when authenticated.

Current implementation notes:

- The app uses an Express server in `server/` and a React/Vite client in `src/`.
- The server owns Spotify credentials, OAuth token exchange, session cookies, recommendation generation, and playlist creation.
- The frontend is split into `src/App.jsx`, `src/api/innerHorizons.js`, `src/components/`, and `src/styles.css`.
- Use `.env.example` as the required Spotify credential template.
- Local dev runs through `npm run dev`, which serves both API routes and the Vite app at `http://127.0.0.1:5173`.

## Repo workflow rules

Use these rules for agents working on this repo:

- One logical change per commit.
- Touch 1-3 files per commit.
- Commit messages are lowercase, present-tense, no emoji.
- Do not use conventional-commit prefixes as ceremony.
- Natural prefixes like `wip:`, `revert:`, `fix:`, or `tune:` are fine.
- Push every 2-4 commits, not only at the end.
- Update `daily/YYYY-MM-DD.md` as decisions happen.
- Commit daily log updates separately.
- Reverts are real. If a tweak is tried and then rejected, commit the revert instead of squashing it away.
