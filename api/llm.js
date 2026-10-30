export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!process.env.OPENROUTER_API_KEY) {
    return res.status(503).json({
      error: "LLM API is not configured yet. Add OPENROUTER_API_KEY to enable responses."
    });
  }

  const body = typeof req.body === "string" ? safeJsonParse(req.body) : req.body || {};
  const prompt = typeof body.prompt === "string" ? body.prompt.trim() : "";
  const context = body.context || {};
  const model = typeof body.model === "string" && body.model ? body.model : "openrouter/free";

  if (!prompt) {
    return res.status(400).json({ error: "Prompt is required." });
  }

  try {
    const upstream = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://acme-private-credit-drafting-portal-demo.vercel.app",
        "X-Title": "Acme Private Credit Drafting Portal Demo"
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        temperature: 0.4,
        messages: [
          {
            role: "system",
            content:
              "You are an assistant for Acme Private Credit's private credit drafting portal. Provide concise, useful answers for finance and drafting-related prompts. If the user asks for market outlooks or projections, answer with caveats that they are directional views, not guaranteed outcomes."
          },
          {
            role: "user",
            content: buildPrompt(prompt, context)
          }
        ]
      })
    });

    const payload = await upstream.json();

    if (!upstream.ok) {
      return res.status(upstream.status).json({
        error: payload?.error?.message || payload?.error || "OpenRouter request failed."
      });
    }

    return res.status(200).json({
      answer: payload?.choices?.[0]?.message?.content || "No response returned.",
      model: payload?.model || model
    });
  } catch (error) {
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Unexpected LLM request failure."
    });
  }
}

function safeJsonParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return {};
  }
}

function buildPrompt(prompt, context) {
  const contextLines = [
    `Selected repository: ${context.selectedRepository || "Unknown"}`,
    `Accessible paths: ${(context.accessiblePaths || []).join(", ") || "None provided"}`,
    `Selected drafting template: ${context.selectedTemplate || "Unknown"}`,
    `Selected processing model: ${context.selectedModel || "Unknown"}`
  ];

  const uploadedDocument = context.uploadedDocument || {};
  const documentSection = uploadedDocument.fileName
    ? `\nUploaded document: ${uploadedDocument.fileName}\nDocument status: ${
        uploadedDocument.extractionStatus || "No extraction status"
      }\nDocument excerpt:\n${(uploadedDocument.extractedText || "No PDF text extracted").slice(0, 8000)}`
    : "";

  return `${contextLines.join("\n")}${documentSection}\n\nUser prompt:\n${prompt}`;
}
