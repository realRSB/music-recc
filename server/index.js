import "dotenv/config";

import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { clearSession, getSession } from "./session.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 5173);
const app = express();

app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (request, response) => {
  response.json({
    ok: true,
    spotifyConfigured: Boolean(process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET),
    authenticated: Boolean(getSession(request)),
  });
});

app.post("/auth/logout", (request, response) => {
  clearSession(request, response);
  response.json({ ok: true });
});

if (isProduction) {
  app.use(express.static(path.join(root, "dist")));
  app.get("*", (request, response) => {
    response.sendFile(path.join(root, "dist", "index.html"));
  });
} else {
  const { createServer } = await import("vite");
  const vite = await createServer({
    root,
    appType: "spa",
    server: { middlewareMode: true },
  });

  app.use(vite.middlewares);
}

app.listen(port, "127.0.0.1", () => {
  console.log(`inner horizons listening at http://127.0.0.1:${port}`);
});
