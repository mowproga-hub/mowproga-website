// One-off smoke test (not part of the build): serves dist/ statically,
// loads each prerendered page in headless Chromium, and checks (1) no
// console errors/warnings during hydration and (2) the key interactive
// pieces still work after hydrateRoot takes over.
import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");
const port = 5098;
const MIME = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".webp": "image/webp", ".png": "image/png", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".xml": "application/xml", ".txt": "text/plain" };

function startServer() {
  const server = http.createServer((req, res) => {
    const reqPath = req.url.split("?")[0];
    let filePath = path.join(distDir, decodeURIComponent(reqPath));
    if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) filePath = path.join(filePath, "index.html");
    const candidate = fs.existsSync(filePath) && fs.statSync(filePath).isFile() ? filePath : path.join(distDir, "index.html");
    res.setHeader("Content-Type", MIME[path.extname(candidate)] || "application/octet-stream");
    fs.createReadStream(candidate).pipe(res);
  });
  return new Promise((resolve) => server.listen(port, () => resolve(server)));
}

async function main() {
  const server = await startServer();
  const sandboxChromium = "/opt/pw-browsers/chromium";
  const launchOptions = { headless: true };
  if (fs.existsSync(sandboxChromium)) launchOptions.executablePath = sandboxChromium;
  const browser = await chromium.launch(launchOptions);
  let allOk = true;

  try {
    for (const route of ["/", "/about", "/fall-cleanup"]) {
      const page = await browser.newPage();
      const messages = [];
      // This sandbox's own egress proxy blocks googletagmanager.com/google.com
      // outright — unrelated to the app, and not present on a real deploy.
      const isSandboxNetworkNoise = (text) => /ERR_TUNNEL_CONNECTION_FAILED|googletagmanager\.com|google\.com\/recaptcha/.test(text);
      page.on("console", (msg) => { if (["error", "warning"].includes(msg.type()) && !isSandboxNetworkNoise(msg.text())) messages.push(`[${msg.type()}] ${msg.text()}`); });
      page.on("pageerror", (err) => messages.push(`[pageerror] ${err.message}`));

      await page.goto(`http://localhost:${port}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(500); // let hydration + effects settle

      console.log(`\n=== ${route} ===`);
      console.log(messages.length ? messages.join("\n") : "(no console errors/warnings)");
      if (messages.length) allOk = false;

      // Interactivity: open the quote modal via the primary CTA button.
      const quoteBtn = page.getByRole("button", { name: /instant quote/i }).first();
      await quoteBtn.click({ timeout: 5000 });
      const modalVisible = await page.getByText(/property address/i).first().isVisible().catch(() => false);
      console.log("Quote modal opens:", modalVisible);
      if (!modalVisible) allOk = false;
      await page.keyboard.press("Escape").catch(() => {});

      await page.close();
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log(allOk ? "\nALL CHECKS PASSED" : "\nSOME CHECKS FAILED");
  process.exit(allOk ? 0 : 1);
}

main();
