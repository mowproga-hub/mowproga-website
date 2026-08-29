// Vercel serverless function — automatically sends the lead's quote request
// straight to Joseph's email using Resend, with zero action needed from the
// visitor. The RESEND_API_KEY stays hidden here, same pattern as api/chat.js.

// Pure function, kept separate from the handler so the email content can be
// unit-tested without needing a live RESEND_API_KEY or network access.
export function buildEmail({ name, phone, address, size, price, service, crackSpray, overgrown, edgeRestore, heavyTrees, bagHaul }) {
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

  const html = `
    <h2>New quote request from mowproga.com</h2>
    <p><b>Name:</b> ${name}</p>
    <p><b>Phone:</b> ${phone}</p>
    <p><b>Address:</b> ${address}</p>
    ${service ? `<p><b>Service:</b> ${service}</p>` : ""}
    <p><b>Yard size:</b> ${size}</p>
    ${isLeaf ? `
    <p><b>Bag &amp; haul away:</b> ${bagHaul ? "Yes" : "No (mulch into lawn)"}</p>
    <p><b>Heavy tree coverage:</b> ${heavyTrees ? "Yes" : "No"}</p>
    ` : `
    <p><b>Crack spray add-on:</b> ${crackSpray ? "Yes" : "No"}</p>
    <p><b>Overgrown/first-cut:</b> ${overgrownLabel}</p>
    <p><b>Edge restoration:</b> ${edgeRestore ? "Yes" : "No"}</p>
    `}
    <p><b>Estimated price:</b> ${price}</p>
  `;

  const subject = service ? `New ${service} quote request from ${name}` : `New quote request from ${name}`;

  return { subject, html };
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing its Resend API key." });
  }

  try {
    const { subject, html } = buildEmail(req.body);

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
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Something went wrong sending the lead." });
  }
}
