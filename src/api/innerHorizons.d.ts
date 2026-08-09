/* Type surface for the existing innerHorizons.js client. Kept as a separate
   declaration file so the JS module stays untouched. Shapes mirror what
   server/index.js and server/recommender.js actually return. */

export interface SpotifyConfig {
  spotifyConfigured: boolean;
  authenticated: boolean;
}

export interface SpotifyUser {
  id: string;
  displayName: string | null;
  url?: string;
  image?: string;
}

export interface MeResponse {
  authenticated: boolean;
  user: SpotifyUser | null;
  /* Set when the server dropped an expired or rejected session (401/403)
     rather than failing the request outright. */
  error?: string;
}

export interface Track {
  id: string;
  uri: string;
  title: string;
  artist: string;
  album?: string;
  artwork?: string;
  url: string;
  popularity?: number;
  horizon: string;
  reason: string;
  score?: number;
}

export interface TasteFacet {
  name: string;
  count: number;
}

export interface RecommendationResult {
  source: { type?: string; id?: string; name: string; url?: string; image?: string };
  taste: { topGenres: TasteFacet[]; topArtists: TasteFacet[] };
  playlist: { name: string; description: string };
  recommendations: Track[];
}

export interface RecommendationRequest {
  source: string;
  range: string;
  avoid: string;
}

export interface SavedPlaylist {
  id: string;
  name: string;
  url: string;
}

export interface UserPlaylist {
  id: string;
  name: string;
  url: string;
  trackTotal: number;
  image?: string;
}

export function getConfig(): Promise<SpotifyConfig>;
export function getMe(): Promise<MeResponse>;
export function getRecommendations(payload: RecommendationRequest): Promise<RecommendationResult>;
export function getPlaylists(): Promise<{ playlists: UserPlaylist[] }>;
export function savePlaylist(payload: {
  name: string;
  description: string;
  trackUris: string[];
}): Promise<SavedPlaylist>;
export function logoutSpotify(): Promise<{ ok: boolean }>;
