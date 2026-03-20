import { Request, Response, NextFunction } from "express";
import { config } from "../config";

export function auth(req: Request, res: Response, next: NextFunction) {
    const token =
        req.headers.authorization?.replace("Bearer ", "") ||
        req.headers["x-api-key"];

    const key = config.apiKeys.find((k) => k.key === token);

    if (!key) {
        return res.status(401).json({ error: "Invalid API key" });
    }

    (req as any).apiKey = key;
    next();
}
