const buckets = new Map<string, { count: number; ts: number }>();

const WINDOW = 60_000;

export function rateLimit(req: any, res: any, next: any) {
    const key = req.apiKey;

    if (key.role === "master") return next();

    const limit = key.rateLimit || 60;
    const now = Date.now();

    let bucket = buckets.get(key.key);

    if (!bucket) {
        bucket = { count: 0, ts: now };
        buckets.set(key.key, bucket);
    }

    if (now - bucket.ts > WINDOW) {
        bucket.count = 0;
        bucket.ts = now;
    }

    bucket.count++;

    if (bucket.count > limit) {
        return res.status(429).json({ error: "Rate limit exceeded" });
    }

    next();
}

// cleanup to prevent memory leak
setInterval(() => {
    const now = Date.now();

    for (const [key, bucket] of buckets.entries()) {
        if (now - bucket.ts > WINDOW * 2) {
            buckets.delete(key);
        }
    }
}, 60_000);
