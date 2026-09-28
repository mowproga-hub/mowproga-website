// Post-build static prerendering. Vite builds a CSR-only shell (empty
// <div id="root">), which is invisible to any crawler that doesn't execute
// JavaScript (GPTBot, ClaudeBot, PerplexityBot never render JS at all, and
// Googlebot's first HTML pass doesn't either). This script boots the real
// built app in headless Chromium for each route, waits for it to render,
// and saves the resulting HTML — head (title/meta/canonical/JSON-LD, set
// client-side by applyPageSEO/setPageJsonLd in src/App.jsx) and body alike
// — as that route's static file. A real visitor's browser then mounts React
// on top of it with plain createRoot (see src/main.jsx) — not hydrateRoot,
// since this codebase's extensive inline style={{...}} usage can't produce
// a byte-for-byte match against the browser-renormalized styles in this
// saved markup. Crawlers get the real content either way; real visitors get
// a normal working app.
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const port = 5099;

const ROUTES = [
  { path: "/", outFile: path.join(distDir, "index.html") },
  { path: "/about", outFile: path.join(distDir, "about", "index.html") },
  { path: "/fall-cleanup", outFile: path.join(distDir, "fall-cleanup", "index.html") },
];

const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain", ".json": "application/json" };

// Plain SPA-fallback static server: serves a real file from dist/ if one
// exists at the requested path, otherwise falls back to the root
// index.html so client-side routing (pathToRoute in App.jsx) can take
// over — this mirrors how the site behaves today for any direct load of
// /about or /fall-cleanup, before this script has produced their
// dedicated static files.
function startServer() {
  const server = http.createServer((req, res) => {
    const reqPath = req.url.split("?")[0];
    const filePath = path.join(distDir, decodeURIComponent(reqPath));
    const isInsideDist = filePath.startsWith(distDir);
    const candidate = isInsideDist && fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : path.join(distDir, "index.html");
    const ext = path.extname(candidate);
    res.setHeader("Content-Type", MIME[ext] || "application/octet-stream");
    fs.createReadStream(candidate).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

async function main() {
  if (!fs.existsSync(path.join(distDir, "index.html"))) {
    console.error("dist/index.html not found — run `vite build` before prerendering.");
    process.exit(1);
  }

  const server = await startServer();
  // This dev sandbox pins a specific Chromium build outside Playwright's
  // normal browser cache (see the environment's README). A real build
  // machine (e.g. Vercel) won't have that path — there, `playwright`
  // (unlike `playwright-core`) self-installs its own Chromium via
  // postinstall, so omitting executablePath lets it find that instead.
  const sandboxChromium = "/opt/pw-browsers/chromium";
  const launchOptions = { headless: true };
  if (fs.existsSync(sandboxChromium)) launchOptions.executablePath = sandboxChromium;
  const browser = await chromium.launch(launchOptions);

  try {
    for (const route of ROUTES) {
      const page = await browser.newPage();
      await page.goto(`http://localhost:${port}${route.path}`, { waitUntil: "networkidle" });
      // applyPageSEO/setPageJsonLd run in a useEffect right after mount —
      // waiting for the real page <h1> confirms the component tree (and
      // that effect, which fires in the same commit) has rendered.
      await page.waitForSelector("h1", { timeout: 15000 });
      const html = await page.content();

      fs.mkdirSync(path.dirname(route.outFile), { recursive: true });
      fs.writeFileSync(route.outFile, "<!doctype html>\n" + html);
      console.log(`Prerendered ${route.path} -> ${path.relative(distDir, route.outFile)} (${html.length} bytes)`);
      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
