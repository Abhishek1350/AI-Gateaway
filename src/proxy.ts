import { Readable } from "node:stream";
import { config } from "./config.js";

export async function proxy(req: any, res: any) {
  const url = config.target + req.originalUrl;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300000);

  const headers: Record<string, string> = {};

  for (const [key, value] of Object.entries(req.headers)) {
    if (!value) continue;

    const k = key.toLowerCase();

    // skip problematic headers
    if (
      k === "host" ||
      k === "content-length" ||
      k === "transfer-encoding" ||
      k === "connection"
    ) {
      continue;
    }

    // @ts-ignore
    headers[key] = Array.isArray(value) ? value.join(",") : value;
  }

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers,
      body: req.method === "GET" || req.method === "HEAD" ? undefined : req,
      // @ts-ignore
      duplex: "half",
      signal: controller.signal,
    });

    res.status(upstream.status);

    upstream.headers.forEach((value, key) => {
      const k = key.toLowerCase();

      if (
        k === "transfer-encoding" ||
        k === "content-length" ||
        k === "connection" ||
        k === "content-encoding"
      )
        return;

      res.setHeader(key, value);
    });

    if (upstream.body) {
      const nodeStream = Readable.fromWeb(upstream.body as any);
      nodeStream.pipe(res);
    } else {
      res.end();
    }
  } catch (err: any) {
    console.error("Proxy error:", err);
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Upstream timeout" });
    }

    return res.status(500).json({
      error: "Proxy error",
      details: err.message,
      cause: err.cause?.message || err.cause,
    });
  } finally {
    clearTimeout(timeout);
  }
}
