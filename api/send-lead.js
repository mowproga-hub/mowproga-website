// Vercel serverless function — automatically sends the lead's quote request
// straight to Joseph's email using Resend, with zero action needed from the
// visitor. The RESEND_API_KEY stays hidden here, same pattern as api/chat.js.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing its Resend API key." });
  }

  try {
    const { name, phone, address, size, price, crackSpray, overgrown, edgeRestore } = req.body;

    const bodyHtml = `
      <h2>New quote request from mowproga.com</h2>
      <p><b>Name:</b> ${name}</p>
      <p><b>Phone:</b> ${phone}</p>
      <p><b>Address:</b> ${address}</p>
      <p><b>Yard size:</b> ${size}</p>
      <p><b>Crack spray add-on:</b> ${crackSpray ? "Yes" : "No"}</p>
      <p><b>Overgrown/first-cut:</b> ${overgrown ? "Yes" : "No"}</p>
      <p><b>Edge restoration:</b> ${edgeRestore ? "Yes" : "No"}</p>
      <p><b>Estimated price:</b> ${price}</p>
    `;

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
        subject: `New quote request from ${name}`,
        html: bodyHtml,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.message || "Resend error");
    res.status(200).json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message || "Something went wrong sending the lead." });
  }
}
