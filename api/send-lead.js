// Vercel serverless function — automatically sends the lead's quote request
// straight to Joseph's email using Resend, with zero action needed from the
// visitor. The RESEND_API_KEY stays hidden here, same pattern as api/chat.js.

// Pure function, kept separate from the handler so the email content can be
// unit-tested without needing a live RESEND_API_KEY or network access.
export function buildEmail({ name, phone, address, size, price, service, crackSpray, overgrown, edgeRestore, heavyTrees, bagHaul, tallCount, hedgeOver10, hedgeOvergrown, hedgeHaul, source, frequency, regularPrice, brushHaul, textConsent }, firstContact) {
  // form.overgrownLevel is "none" | "mild" | "severe" — "none" is a
  // non-empty string, so a plain `overgrown ? "Yes" : "No"` check always
  // printed "Yes" regardless of what was actually selected.
  const overgrownLabel =
    overgrown === "mild" ? "Yes — mild (a few weeks overgrown)" :
    overgrown === "severe" ? "Yes — severe (over 12in tall)" :
    "No";

  // The quote form has sent `service`/`heavyTrees`/`bagHaul` for leaf
  // removal requests all along, but this template never rendered them,
  // so every lead email showed only the mowing add-on fields (crack
  // spray, edge restoration) no matter which service was requested.
  const isLeaf = service === "Leaf removal";
  const isHedge = service === "Hedge trimming";
  const isBrush = service === "Brush & overgrowth";

  // Shown right at the top since this is meant to be read at a glance on a
  // phone, not dug for — "Nextdoor", "Google", or "Website (no source tag)"
  // when the visitor arrived without a ?utm_source= or ?ref= tag on the link.
  const sourceLabel = source || "Website (no source tag)";

  const html = `
    <h2>New quote request from mowproga.com</h2>
    <p style="font-size:16px;padding:8px 10px;background:#F1F7E8;border-radius:6px"><b>First contact:</b> ${firstContact || (textConsent === true ? "Couldn't confirm the thank-you text. Check your UmmiYard Inbox before texting them" : "📞 You reach out first: CALL (no texts allowed)")}</p>
    <p><b>Source:</b> ${sourceLabel}</p>
    <p><b>Name:</b> ${name}</p>
    <p><b>Phone:</b> ${phone}</p>
    <p><b>Agreed to texts:</b> ${textConsent === true ? "YES - OK to text" : textConsent === false ? "NO - call only, do not text" : "Not asked"}</p>
    <p><b>Address:</b> ${address}</p>
    ${service ? `<p><b>Service:</b> ${service}</p>` : ""}
    <p><b>${isHedge ? "Shrubs" : isBrush ? "Area" : "Yard size"}:</b> ${size}</p>
    ${frequency ? `<p><b>How often:</b> ${frequency}</p>` : ""}
    ${isBrush ? `
    <p><b>Haul away debris:</b> ${brushHaul ? "Yes" : "No (piled on-site)"}</p>
    ` : isHedge ? `
    <p><b>Shrubs 6–10 ft tall:</b> ${tallCount || 0}</p>
    <p><b>Any over 10 ft:</b> ${hedgeOver10 ? "Yes" : "No"}</p>
    <p><b>Badly overgrown:</b> ${hedgeOvergrown ? "Yes" : "No"}</p>
    <p><b>Haul away clippings:</b> ${hedgeHaul ? "Yes" : "No (piled on-site)"}</p>
    ` : isLeaf ? `
    <p><b>Bag &amp; haul away:</b> ${bagHaul ? "Yes" : "No (piled on-site)"}</p>
    <p><b>Heavy tree coverage:</b> ${heavyTrees ? "Yes" : "No"}</p>
    ` : `
    <p><b>Crack spray add-on:</b> ${crackSpray ? "Yes" : "No"}</p>
    <p><b>Overgrown/first-cut:</b> ${overgrownLabel}</p>
    <p><b>Edge restoration:</b> ${edgeRestore ? "Yes" : "No"}</p>
    `}
    <p><b>Estimated price:</b> ${price}</p>
    ${regularPrice ? `<p><b>Regular price after that:</b> ${regularPrice}</p>` : ""}
  `;

  const subject = service ? `New ${service} quote request from ${name}` : `New quote request from ${name}`;

  return { subject, html };
}

// Short list of the extras the customer picked, for the UmmiYard request card.
export function addonsOf(b = {}) {
  const out = [];
  if (b.service === "Leaf removal") { if (b.bagHaul) out.push("Bag & haul"); if (b.heavyTrees) out.push("Heavy trees"); }
  else if (b.service === "Hedge trimming") { if (b.tallCount) out.push(`${b.tallCount} tall shrubs`); if (b.hedgeOver10) out.push("Some over 10 ft"); if (b.hedgeOvergrown) out.push("Overgrown"); if (b.hedgeHaul) out.push("Haul clippings"); }
  else if (b.service === "Brush & overgrowth") { if (b.brushHaul) out.push("Haul debris"); }
  else if (b.service === "Mowing") { if (b.crackSpray) out.push("Crack spray"); if (b.overgrown === "mild") out.push("Overgrown (mild)"); if (b.overgrown === "severe") out.push("Overgrown (severe)"); if (b.edgeRestore) out.push("Edge restore"); }
  return out.join(", ");
}

// Hands the lead to UmmiYard (Requests tab + phone alert, and the thank-you
// text when the customer agreed to texts). Server to server, locked with
// WEBSITE_LEAD_SECRET. Never blocks or breaks the lead email.
export async function forwardToUmmiYard(b = {}, { fetchImpl = fetch, env = process.env } = {}) {
  const secret = env.WEBSITE_LEAD_SECRET;
  if (!secret) return { skipped: "no_secret" };
  const url = env.UMMIYARD_LEAD_URL || "https://www.ummiyard.com/api/website-lead";
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 8000);
  try {
    const r = await fetchImpl(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-lead-secret": secret },
      body: JSON.stringify({
        name: b.name, phone: b.phone, address: b.address, service: b.service, size: b.size,
        frequency: b.frequency, priceNum: b.priceNum, firstVisit: b.firstVisit, regularCut: b.regularCut,
        priceLabel: b.price, addons: addonsOf(b), textConsent: b.textConsent, source: b.source,
        brand: "Mow Pro GA", contact: "Joseph",
      }),
      signal: ctrl.signal,
    });
    return await r.json().catch(() => ({ status: r.status }));
  } catch (e) {
    console.error("forwardToUmmiYard:", e.message);
    return { error: e.message };
  } finally {
    clearTimeout(timer);
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Runs alongside the email; awaited below so Vercel doesn't cut it off.
  const forwarding = forwardToUmmiYard(req.body || {});

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    await forwarding;
    return res.status(500).json({ error: "Server is missing its Resend API key." });
  }

  try {
    // Wait for UmmiYard (max 8s) so the email can say whether the customer
    // already got the thank-you text or Joseph must reach out first.
    const fwd = await forwarding;
    const { subject, html } = buildEmail(req.body, fwd && typeof fwd.firstContact === "string" ? fwd.firstContact : null);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // TODO: once your domain is verified on Resend, change this to
        // something like "quotes@mowproga.com" instead of the shared testing address.
        from: "Mow Pro Website <onboarding@resend.dev>",
        to: ["mowproga@gmail.com"], // TODO: replace if this isn't the right inbox
        subject,
        html,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Resend error");
    await forwarding;
    res.status(200).json({ success: true });
  } catch (err) {
    await forwarding;
    res.status(500).json({ error: err.message || "Something went wrong sending the lead." });
  }
}
