export default async function handler(req, res) {
  // Solo POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body || {};
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Missing prompt" });
    }

    // Seguridad básica: limitar tamaño del input
    if (prompt.length > 3000) {
      return res.status(400).json({ error: "Prompt too long" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "Server misconfigured (no API key)" });
    }

    const endpoint =
      "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent";

    const r = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await r.json();

    if (!r.ok || data?.error) {
      return res.status(500).json({
        error: data?.error?.message || "Gemini API error",
      });
    }

    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No pude analizar el mercado en este momento.";

    return res.status(200).json({ text });
  } catch (e) {
    return res.status(500).json({ error: e.message || "Unknown error" });
  }
}
