// Vercel serverless function — proxies Google Static Maps requests so the
// API key never appears in the browser. Requires a GOOGLE_MAPS_API_KEY
// environment variable set in the Vercel project settings.
//
// Setup steps:
// 1. Go to console.cloud.google.com, create/select a project
// 2. Enable the "Maps Static API"
// 3. Create an API key under Credentials
// 4. Restrict the key to the "Maps Static API" only (API restrictions),
//    and optionally restrict by IP to Vercel's servers for extra safety
// 5. In your Vercel project: Settings -> Environment Variables ->
//    add GOOGLE_MAPS_API_KEY with the key value
// 6. Google requires a billing account on the Cloud project, but the
//    Static Maps API has a generous free monthly quota that a single
//    local business site is very unlikely to exceed.

export default async function handler(req, res) {
  const { address } = req.query;

  if (!address || typeof address !== "string" || address.trim().length < 5) {
    res.status(400).send("Missing or invalid address");
    return;
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    res.status(500).send("Map preview is not configured");
    return;
  }

  const params = new URLSearchParams({
    center: address,
    zoom: "19",
    size: "640x360",
    scale: "2",
    maptype: "satellite",
    markers: `color:red|${address}`,
    key: apiKey,
  });

  try {
    const googleRes = await fetch(`https://maps.googleapis.com/maps/api/staticmap?${params.toString()}`);

    if (!googleRes.ok) {
      res.status(502).send("Failed to load map");
      return;
    }

    const buffer = Buffer.from(await googleRes.arrayBuffer());
    res.setHeader("Content-Type", googleRes.headers.get("content-type") || "image/png");
    // Cache each address's preview for a day — property imagery doesn't
    // change often, and this keeps repeat lookups from hitting the API again.
    res.setHeader("Cache-Control", "public, max-age=86400");
    res.status(200).send(buffer);
  } catch (err) {
    res.status(500).send("Map preview error");
  }
}
