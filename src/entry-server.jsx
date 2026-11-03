// Build-time only: renders a page of the real site to HTML so the first paint
// is the actual design instead of a blank screen while the JS downloads.
import React from "react";
import { renderToString } from "react-dom/server";
import App from "./App.jsx";

export function render(path) {
  return renderToString(<App initialPath={path} />);
}
