import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import app from "./app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const isProduction = process.env.NODE_ENV === "production";
const port = Number(process.env.PORT || 5173);

if (isProduction) {
  app.use(express.static(path.join(root, "dist")));
  app.use((request, response, next) => {
    if (request.method !== "GET") {
      next();
      return;
    }

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
