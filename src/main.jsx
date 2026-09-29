import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";

const rootEl = document.getElementById("root");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// index.html ships #root with inline style="visibility: hidden" so the raw,
// crawler-only fallback content (real copy for GPTBot/ClaudeBot/PerplexityBot,
// which never run this file) never flashes on screen for a real visitor.
// This is the one line that turns the real, interactive site back on the
// instant React has mounted.
rootEl.style.visibility = "";
