## Inner Horizons
# Description
Inner Horizons is a music discovery app that helps you discover new songs that are outside your usual rotation. Users start with a specific album, song, or track they have in mind, and the app does a thorough analysis of the song. It identifies the genre and artist patterns of the song, then it builds a set of new recommendations with short explanations for why each pick fits.

## Features
- Integrates directly with Spotify, so user can add playlist, track, or song name
- Let users choose which path they want their recommended songs to be tailored towards such as same vibe, slightly new, or deep cut
- The recommendation algorithm filters the possible songs, to match user preferences

## Production app
[App demo]https://music-recc.vercel.app/

Currently if you sign up it may not work, as we have to approve the user from our Spotify dev platform. However, send us your email if you want to test it out!

## Local setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env` from `.env.example` and fill in Spotify credentials:

   ```bash
   cp .env.example .env
   ```

   Also set a session secret so Spotify login cookies can be encrypted:

   ```bash
   openssl rand -hex 32
   ```

   Put the generated value in `SESSION_SECRET`. Local development falls back to a temporary secret if this is missing, but production requires it.

3. In the Spotify developer dashboard, add this redirect URI:

   ```text
   http://127.0.0.1:5173/auth/callback
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open `http://127.0.0.1:5173`.

## Screenshots and demo link
Try the live demo: [App demo]https://music-recc.vercel.app/

Landing Page
<img width="1470" height="842" alt="Screenshot 2026-08-09 at 9 41 21 AM" src="https://github.com/user-attachments/assets/d26ea166-19ef-4736-8e0e-86fb49106fcc" />

Results Page
<img width="1469" height="835" alt="image" src="https://github.com/user-attachments/assets/92192dd3-207a-477b-9304-ecc73b6e397b" />

## Tech stack
The frontend is built with React, Vite, and Typescript with Tailwind styling. The backend is Node.js with Express. For the music and auth/session we used the Spotify Web API and OAuth. We deployed the app on Vercel. 

## Learning outcomes
This project was so cool for us because all of us learning music, so it was nice learning how to connect a real app that works to the Spotify Web API, and using Spotify OAuth for verification. We also really improved our dev and deployment skills. The key thing we learned was learning how to build a recommendation system with strong ML use.

## Challenges
The Spotify setup was a bit hard at first as we had to learn how to do redirect URI and dashboard config so that it connects with our app. We also had to make sure the filtering system works, and ensure there were no duplicate results as it was in our early stages. 

## AI usage
AI was used for minor debugging and helped us brainstorm. The app was majorly built

