import { expect, test } from "@playwright/test";

test("home screen renders recommendation workflow", async ({ page }) => {
  const browserErrors = [];

  page.on("console", (message) => {
    if (message.type() === "error") {
      browserErrors.push(message.text());
    }
  });

  page.on("pageerror", (error) => {
    browserErrors.push(error.message);
  });

  await page.goto("http://127.0.0.1:5173/", { waitUntil: "networkidle" });

  await expect(page.locator("h1")).toContainText("Find the songs");
  await expect(page.locator("#source")).toBeVisible();
  await expect(page.getByRole("button", { name: /connect Spotify/i })).toBeVisible();
  await expect(page.getByRole("button", { name: /build horizon playlist/i })).toBeVisible();
  await expect(page.locator(".recommendation")).toHaveCount(4);

  const overlayCount = await page
    .locator(".vite-error-overlay, #webpack-dev-server-client-overlay, [data-nextjs-dialog]")
    .count();

  expect(overlayCount).toBe(0);
  expect(browserErrors).toEqual([]);
});
