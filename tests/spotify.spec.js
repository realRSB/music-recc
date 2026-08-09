import { expect, test } from "@playwright/test";
import { getSeveralArtists, searchTracks } from "../server/spotify.js";

test.describe("spotify api client", () => {
  let originalFetch;

  test.beforeEach(() => {
    originalFetch = global.fetch;
  });

  test.afterEach(() => {
    global.fetch = originalFetch;
  });

  test("loads artists in one batch request", async () => {
    const calls = [];

    global.fetch = async (url, options) => {
      calls.push({ url: new URL(url), options });

      return new Response(
        JSON.stringify({
          artists: [
            { id: "artist-1", name: "first artist" },
            { id: "artist-2", name: "second artist" },
          ],
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    };

    const artists = await getSeveralArtists(["artist-1", "artist-1", "artist-2"], "test-token");

    expect(artists.map((artist) => artist.id)).toEqual(["artist-1", "artist-2"]);
    expect(calls).toHaveLength(1);
    expect(calls[0].url.pathname).toBe("/v1/artists");
    expect(calls[0].url.searchParams.get("ids")).toBe("artist-1,artist-2");
    expect(calls[0].options.headers.Authorization).toBe("Bearer test-token");
  });

  test("returns a clear retry message for long Spotify rate limits", async () => {
    global.fetch = async () =>
      new Response(JSON.stringify({ error: { message: "API rate limit exceeded" } }), {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": "7",
        },
      });

    let error;

    try {
      await searchTracks("indie pop", "test-token", 1);
    } catch (caught) {
      error = caught;
    }

    expect(error.status).toBe(429);
    expect(error.retryAfter).toBe(7);
    expect(error.message).toBe("Spotify is rate limiting requests. Try again in 7 seconds.");
  });
});
