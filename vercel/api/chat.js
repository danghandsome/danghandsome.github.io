// codeassist live demo — Vercel serverless function (Node runtime, AWS egress).
// Holds the Anthropic API key server-side and returns a bounded answer as JSON.
// (Node/AWS egress is NOT blocked by Anthropic, unlike Cloudflare Worker IPs.)

const SAMPLE_WORKSPACE = `
Answer about THIS small sample C# hospital-module workspace only:

// PriceWorker.cs
public class PriceWorker {
  public decimal Calculate(decimal unitPrice, int qty, decimal vatRate, decimal discount) {
    var subtotal = unitPrice * qty;
    var afterDiscount = subtotal - discount;
    return afterDiscount + afterDiscount * vatRate;
  }
}

// CheckHeinGOV.cs  — validates a BHYT (health-insurance) card against the BHXH gateway
public static class CheckHeinGOV {
  public static bool Check(HeinCard card) {
    return HeinGOVManager.Check(card);
  }
}

// frmTransaction__Save.cs
partial class frmTransaction {
  void SaveProcess() {
    var dto = BuildDto();
    var result = new BackendAdapter(param).Post<HIS_TRANSACTION>(uri, consumer, dto, param);
    // (no null-guards or error logging yet)
  }
}
`;

const SYSTEM =
  "You are codeassist, a coding-assistant demo. Answer concisely (under ~120 words) about the " +
  "sample workspace below. If asked to change code, describe the change and show a short snippet. " +
  "You cannot access any real files — only this sample.\n" + SAMPLE_WORKSPACE;

export default = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "https://danghandsome.github.io");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).send("Method not allowed");

  const message = String((req.body && req.body.message) || "").slice(0, 500).trim();
  if (!message) return res.status(400).json({ error: "empty message" });

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5",
        max_tokens: 500,
        system: SYSTEM,
        messages: [{ role: "user", content: message }],
      }),
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(502).json({ error: "upstream", status: r.status, detail: data });
    }
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");
    return res.status(200).json({ text: text });
  } catch (e) {
    return res.status(500).json({ error: String(e) });
  }
};
