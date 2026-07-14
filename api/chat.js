// Vercel serverless function — this runs on Vercel's servers, not in the
// visitor's browser, so the API key here is never exposed publicly.
// Vercel automatically turns any file in /api into a live endpoint at
// https://mowproga.com/api/chat

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "Server is missing its Anthropic API key." });
  }

  try {
    const { messages, system, tools } = req.body;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 500,
        system,
        messages,
        ...(tools ? { tools } : {}),
      }),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong reaching Claude." });
  }
}
