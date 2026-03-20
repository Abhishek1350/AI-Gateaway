import { config } from "./config.js";

export async function proxy(req: any, res: any) {
    const url = config.target + req.originalUrl;

    const controller = new AbortController();

    // kill request after 5 min (safety)
    const timeout = setTimeout(() => controller.abort(), 300000);

    try {
        const upstream = await fetch(url, {
            method: req.method,
            headers: {
                ...req.headers,
                host: undefined,
            },
            body:
                req.method === "GET" || req.method === "HEAD"
                    ? undefined
                    : JSON.stringify(req.body),
            signal: controller.signal,
        });

        // forward status
        res.status(upstream.status);

        // forward headers
        upstream.headers.forEach((value, key) => {
            if (key.toLowerCase() === "transfer-encoding") return;
            res.setHeader(key, value);
        });

        // STREAM (this is the important part)
        if (upstream.body) {
            const reader = upstream.body.getReader();

            res.setHeader("Connection", "keep-alive");

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                res.write(value);
            }

            res.end();
        } else {
            res.end();
        }
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
