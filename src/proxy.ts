import { config } from "./config.js";

export async function proxy(req: any, res: any) {
  const url = config.target + req.originalUrl;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 300000);

  try {
    const upstream = await fetch(url, {
      method: req.method,
      headers: {
        ...req.headers,
        host: undefined,
        "content-length": undefined,
      },
      body:
        req.method === "GET" || req.method === "HEAD"
          ? undefined
          : req,
      signal: controller.signal,
    });

    res.status(upstream.status);

    upstream.headers.forEach((value, key) => {
      if (key.toLowerCase() === "transfer-encoding") return;
      res.setHeader(key, value);
    });

    res.setHeader("Connection", "keep-alive");

    if (upstream.body) {
      const reader = upstream.body.getReader();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        res.write(value);
      }
    }

    res.end();
  } catch (err: any) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Upstream timeout" });
    }

    return res.status(500).json({
      error: "Proxy error",
      details: err.message,
    });
  } finally {
    clearTimeout(timeout);
  }
}