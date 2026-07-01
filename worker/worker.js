// codeassist — live demo backend (Cloudflare Worker)
// The Anthropic API key stays here, server-side (as a Secret). The browser never sees it.
// Bounded on purpose: cheap model, small max_tokens, one streamed answer over a sample workspace.

const ALLOWED_ORIGIN = "https://danghandsome.github.io"; // only the portfolio may call this
const MODEL = "claude-haiku-4-5";                          // cheapest model — keeps cost tiny
const MAX_TOKENS = 500;                                    // hard cap per answer

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

const CORS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

    let body;
    try { body = await request.json(); } catch { return txt("bad json", 400); }
    const message = String(body.message || "").slice(0, 500).trim();
    if (!message) return txt("empty message", 400);

    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        stream: true,
        system:
          "You are codeassist, a coding-assistant demo. Answer concisely (under ~120 words) about the " +
          "sample workspace below. If asked to change code, describe the change and show a short snippet. " +
          "You cannot access any real files — only this sample.\n" + SAMPLE_WORKSPACE,
        messages: [{ role: "user", content: message }],
      }),
    });

    if (!upstream.ok || !upstream.body) {
      const detail = await upstream.text().catch(() => "");
      return txt("upstream error: " + detail.slice(0, 200), 502);
    }

    // Convert Claude's SSE into a plain-text stream the browser can read directly.
    const reader = upstream.body.getReader();
    const decoder = new TextDecoder();
    const encoder = new TextEncoder();
    let buf = "";
    const stream = new ReadableStream({
      async pull(controller) {
        const { done, value } = await reader.read();
        if (done) { controller.close(); return; }
        buf += decoder.decode(value, { stream: true });
        let i;
        while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i).trim();
          buf = buf.slice(i + 1);
          if (!line.startsWith("data:")) continue;
          const payload = line.slice(5).trim();
          if (payload === "[DONE]" || !payload) continue;
          try {
            const evt = JSON.parse(payload);
            if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta") {
              controller.enqueue(encoder.encode(evt.delta.text));
            }
          } catch { /* ignore partial line */ }
        }
      },
      cancel() { reader.cancel(); },
    });

    return new Response(stream, { headers: { ...CORS, "content-type": "text/plain; charset=utf-8" } });
  },
};

function txt(msg, status) {
  return new Response(msg, { status, headers: CORS });
}
