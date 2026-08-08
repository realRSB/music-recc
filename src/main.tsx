import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
/* Explicit extensions throughout: Vite resolves .jsx before .tsx, so a bare
   "./App" would pick up the old JS UI still sitting in this tree. */
import { App } from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
