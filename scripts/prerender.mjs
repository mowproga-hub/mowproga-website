// Runs after `vite build`. For every page, renders the real React page into
// the HTML (with that page's own title/meta/schema from middleware.js), so
// phones paint the finished design immediately instead of waiting for the
// JavaScript bundle. The JS then takes over the already-visible page.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { rewriteHead } from "../middleware.js";
import { NEIGHBORHOODS } from "../src/siteData.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const { render } = await import(pathToFileURL(path.join(root, "dist-ssr", "entry-server.js")).href);
const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const routes = ["/", "/about", "/fall-cleanup", "/leaf-removal", "/quote", ...NEIGHBORHOODS.map((n) => `/lawn-care/${n.slug}`)];
fs.mkdirSync(path.join(dist, "prerender"), { recursive: true });

// The homepage's crawler copy opens with the text-message opt-in disclosure
// (kept for carrier/Twilio reviewers). The rendered page doesn't show it, so
// carry it over inside <noscript>: invisible to visitors, readable by crawlers.
const smsBlock = (template.match(/<h2>Text Messages<\/h2>\s*<p>[\s\S]*?<\/p>/) || [""])[0];

for (const route of routes) {
  // React HTML-escapes text inside <style> when rendering to a string, which
  // breaks selectors like ".a>b". Un-escape it so the CSS works on first paint.
  const unescape = (t) => t.replace(/&gt;/g, ">").replace(/&lt;/g, "<").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&amp;/g, "&");
  const appHtml = render(route).replace(/<style>([\s\S]*?)<\/style>/g, (_, c) => `<style>${unescape(c)}</style>`);
  // The page's stylesheet is rendered at the end of the page body; copy it
  // into <head> too so the very first paint is already fully styled.
  const css = [...appHtml.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join("\n");
  let html = route === "/" ? template : rewriteHead(template, route);
  html = html.replace(/<div id="root"[^>]*>[\s\S]*?<\/div>\s*(?=<\/body>)/, () => `<div id="root" data-prerendered="1">${appHtml}</div>\n    ${route === "/" && smsBlock ? `<noscript>${smsBlock}</noscript>\n  ` : ""}`);
  if (css) html = html.replace("</head>", () => `<style id="mp-prerender-css">${css}</style>\n  </head>`);
  if (!html.includes('data-prerendered="1"')) throw new Error(`prerender: could not place app HTML for ${route}`);
  const file = route === "/" ? path.join(dist, "index.html") : path.join(dist, "prerender", `${route.slice(1).replace(/\//g, "__")}.html`);
  fs.writeFileSync(file, html);
  console.log("prerendered", route, `${Math.round(html.length / 1024)} KB`);
}
fs.rmSync(path.join(root, "dist-ssr"), { recursive: true, force: true });

// Bake today's Google review count into every built page (visible footer
// text and JSON-LD). If UmmiYard can't be reached, the numbers already in the
// source stay as they are and the build still succeeds.
const { fetchReviewStats, applyReviewStats } = await import(pathToFileURL(path.join(root, "src", "siteData.js")).href);
const stats = await fetchReviewStats(fetch, 5000);
if (stats) {
  const htmlFiles = [];
  const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (p.endsWith(".html")) htmlFiles.push(p); } };
  walk(dist);
  for (const f of htmlFiles) fs.writeFileSync(f, applyReviewStats(fs.readFileSync(f, "utf8"), stats));
  console.log(`review stats: ${stats.total} reviews applied to ${htmlFiles.length} pages`);
} else {
  console.log("review stats: UmmiYard not reachable, kept the built-in count");
}
