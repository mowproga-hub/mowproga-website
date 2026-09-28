// One-off verification (not part of the build): serves dist/ the way
// vercel.json actually routes it (trailingSlash:false redirect + explicit
// rewrites to the per-route prerendered files, no SPA fallback for unknown
// paths) and checks real HTTP status codes for every sitemap URL plus the
// other files this task added.
import http from "node:http";
import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const port = 5095;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".xml": "application/xml", ".txt": "text/plain" };

const REWRITES = {
  "/about": "/about/index.html",
  "/fall-cleanup": "/fall-cleanup/index.html",
};

const server = http.createServer((req, res) => {
  const reqPath = req.url.split("?")[0];

  // vercel.json: "trailingSlash": false -> 308 redirect, strip trailing slash.
  if (reqPath.length > 1 && reqPath.endsWith("/")) {
    res.writeHead(308, { Location: reqPath.slice(0, -1) });
    return res.end();
  }

  const rewritten = REWRITES[reqPath];
  const target = rewritten || (reqPath === "/" ? "/index.html" : reqPath);
  const filePath = path.join(distDir, decodeURIComponent(target));

  if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404);
    return res.end("Not Found");
  }
  res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((resolve) => server.listen(port, resolve));

async function check(url) {
  const res = await fetch(`http://localhost:${port}${url}`, { redirect: "manual" });
  return res.status;
}

const sitemapUrls = fs
  .readFileSync(path.join(process.cwd(), "public", "sitemap.xml"), "utf8")
  .match(/<loc>(.*?)<\/loc>/g)
  .map((m) => new URL(m.replace(/<\/?loc>/g, "")).pathname);

console.log("=== Sitemap URLs ===");
for (const url of sitemapUrls) {
  console.log(`${await check(url)}  ${url}`);
}

console.log("\n=== Trailing-slash variants (should 308 redirect) ===");
for (const url of sitemapUrls.filter((u) => u !== "/")) {
  console.log(`${await check(url + "/")}  ${url}/`);
}

console.log("\n=== Other files ===");
for (const url of ["/llms.txt", "/robots.txt", "/sitemap.xml"]) {
  console.log(`${await check(url)}  ${url}`);
}

server.close();
