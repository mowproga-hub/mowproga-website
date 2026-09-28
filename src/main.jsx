import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

// scripts/prerender.mjs bakes real rendered content into #root so crawlers
// and first paint see actual page content instead of an empty shell. This
// still mounts with plain createRoot rather than hydrateRoot: the codebase
// uses inline style={{...}} objects everywhere (hex colors, unitless 0s),
// and browsers always renormalize those when serializing HTML (hex ->
// rgb(), "0" -> "0px", ...), so a byte-for-byte hydration match isn't
// achievable without rewriting styling across the whole app. createRoot
// replaces the prerendered markup with the same client render on mount —
// crawlers still get the real prerendered HTML (they never run this JS),
// and real visitors get a normal, working app with no console errors.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
