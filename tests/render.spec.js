import { expect, test } from "@playwright/test";

test("home screen renders recommendation workflow", async ({ page }) => {
  const browserErrors = [];
  let recommendationPayload = null;

  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    browserErrors.push(error.message);
  });

  await page.route("**/api/config", (route) => {
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ spotifyConfigured: true, authenticated: false }),
    });
  });

  await page.route("**/api/me", (route) => {
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ authenticated: false, user: null }),
    });
  });

  await page.route("**/api/recommendations", (route) => {
    recommendationPayload = route.request().postDataJSON();
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        source: { name: "test playlist" },
        taste: {
          topGenres: [{ name: "indie pop", count: 2 }],
          topArtists: [{ name: "phoebe bridgers", count: 1 }],
        },
        playlist: {
          name: "Inner Horizons: after test playlist",
          description: "same-vibe discoveries",
        },
        recommendations: [
          {
            id: "track-1",
            uri: "spotify:track:track-1",
            title: "new song",
            artist: "new artist",
            artwork: "",
            url: "https://open.spotify.com/track/track-1",
            horizon: "new artist",
            reason: "This keeps the indie pop lane close while moving you toward a fresh artist.",
          },
        ],
      }),
    });
  });

  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });

  await expect(page.locator("h1")).toContainText("Find the songs");
  await expect(page.locator("#source")).toBeVisible();
  await expect(page.getByRole("link", { name: /connect Spotify/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /build horizon playlist/i })).toBeVisible();

  await page.locator("#source").fill("test playlist");
  await page.locator("#avoid").fill("drake");
  await page.getByRole("button", { name: /build horizon playlist/i }).click();

  expect(recommendationPayload).toEqual({
    source: "test playlist",
    range: "same vibe",
    avoid: "drake",
  });
  await expect(page.locator(".recommendation")).toHaveCount(1);
  await expect(page.getByText("new song")).toBeVisible();
  await expect(page.getByText("indie pop lane", { exact: true })).toBeVisible();

  const overlayCount = await page
    .locator(".vite-error-overlay, #webpack-dev-server-client-overlay, [data-nextjs-dialog]")
    .count();

  expect(overlayCount).toBe(0);
  expect(browserErrors).toEqual([]);
});

test("authenticated users can pick one of their playlists", async ({ page }) => {
  await page.route("**/api/config", (route) => {
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({ spotifyConfigured: true, authenticated: true }),
    });
  });

  await page.route("**/api/me", (route) => {
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        authenticated: true,
        user: { id: "user-1", displayName: "test listener" },
      }),
    });
  });

  await page.route("**/api/playlists", (route) => {
    route.fulfill({
      contentType: "application/json",
      body: JSON.stringify({
        playlists: [
          {
            id: "playlist-1",
            name: "car songs",
            url: "https://open.spotify.com/playlist/playlist-1",
            trackTotal: 42,
          },
        ],
      }),
    });
  });

  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });

  await expect(page.getByRole("button", { name: /car songs/i })).toBeVisible();
  await page.getByRole("button", { name: /car songs/i }).click();
  await expect(page.locator("#source")).toHaveValue("https://open.spotify.com/playlist/playlist-1");
});
