import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import LithosApp from "./LithosApp";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <LithosApp />
  </StrictMode>,
);
