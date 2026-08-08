# music-recc
horizons polaris

testing that pushes work before we actually start building lol

## Inner Horizons

Inner Horizons recommends new songs from a Spotify playlist or track while keeping the same general vibe. The client talks to a local Express server so Spotify secrets stay out of the browser.

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and fill in Spotify credentials:

   ```bash
   cp .env.example .env
   ```

3. In the Spotify developer dashboard, add this redirect URI:

   ```text
   http://127.0.0.1:5173/auth/callback
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open `http://127.0.0.1:5173`.

## What works now

- Paste a Spotify playlist URL, track URL, or song name.
- Generate recommendations through the backend using Spotify catalog/search data.
- Connect Spotify with OAuth.
- Save generated recommendations into a private Spotify playlist after connecting.

Without `.env` credentials, the UI loads but live recommendation generation is disabled.

## Useful commands

```bash
npm run build
npm test -- --reporter=list
```
