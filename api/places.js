// Vercel serverless function — proxies Google's Places API (New) Autocomplete
// and Place Details endpoints for the quote form's property-address field,
// so GOOGLE_MAPS_API_KEY never reaches the browser. Same pattern as
// api/staticmap.js and api/chat.js.
//
// Two modes, chosen by req.body.mode:
//   "autocomplete" — as the visitor types, returns matching address
//                     predictions, biased toward the service area
//   "details"      — once a prediction is picked, returns its place_id,
//                     formatted_address, and lat/lng
//
// Both take the same sessionToken (a random ID the frontend generates once
// per search) so Google bills the whole search as one cheaper "session"
// instead of per keystroke.
//
// Place Details only requests id/formattedAddress/location — the
// Essentials SKU. Nothing from Pro/Enterprise tiers (no displayName,
// ratings, photos, reviews, or hours) is ever requested.
//
// Setup: reuses the same GOOGLE_MAPS_API_KEY environment variable as
// api/staticmap.js. Set it in Vercel's Environment Variables to the same
// key value used for ummiyard's GOOGLE_MAPS_API_KEY — that key's
// Application restrictions should stay "None" (it's called server-side
// here and in ummiyard, never from a browser, so there's no referrer for
// Google to check), and its API restrictions should include Places API
// (New) and Geocoding API.

// Roughly centered on Douglasville, GA — biases (does not exclude)
// results toward the actual service area: Douglasville, Villa Rica,
// Lithia Springs, Dallas. A 40km radius comfortably covers all four
// without reaching outside Georgia.
const SERVICE_AREA_BIAS = {
  circle: {
    center: { latitude: 33.7515, longitude: -84.7477 },
    radius: 40000.0,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing its Google Maps API key." });
  }

  const { mode, input, placeId, sessionToken } = req.body;

  try {
    if (mode === "autocomplete") {
      if (!input || !input.trim()) {
        return res.status(200).json({ predictions: [] });
      }
      const response = await fetch("https://places.googleapis.com/v1/places:autocomplete", {
        method: "POST",
        headers: { "Content-Type": "application/json", "X-Goog-Api-Key": apiKey },
        body: JSON.stringify({
          input,
          includedRegionCodes: ["us"],
          locationBias: SERVICE_AREA_BIAS,
          ...(sessionToken ? { sessionToken } : {}),
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(200).json({ predictions: [], error: data.error?.message || "Autocomplete request failed." });
      }
      const predictions = (data.suggestions || [])
        .map((s) => s.placePrediction)
        .filter(Boolean)
        .map((p) => ({ placeId: p.placeId, description: p.text?.text || "" }));
      return res.status(200).json({ predictions });
    }

    if (mode === "details") {
      if (!placeId) {
        return res.status(400).json({ error: "Missing 'placeId'." });
      }
      const params = new URLSearchParams(sessionToken ? { sessionToken } : {});
      const response = await fetch(`https://places.googleapis.com/v1/places/${placeId}?${params}`, {
        headers: {
          "X-Goog-Api-Key": apiKey,
          // Essentials tier only: id + formattedAddress + location.
          "X-Goog-FieldMask": "id,formattedAddress,location",
        },
      });
      const data = await response.json();
      if (!response.ok) {
        return res.status(200).json({ error: data.error?.message || "Place details request failed." });
      }
      return res.status(200).json({
        placeId: data.id,
        formattedAddress: data.formattedAddress,
        lat: data.location?.latitude,
        lng: data.location?.longitude,
      });
    }

    res.status(400).json({ error: "Invalid mode — expected 'autocomplete' or 'details'." });
  } catch (err) {
    res.status(500).json({ error: "Something went wrong with the address lookup." });
  }
}
