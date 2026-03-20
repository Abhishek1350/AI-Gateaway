export type ApiKey = {
    key: string;
    role?: "master";
    rateLimit?: number;
};

export const config = {
    port: Number(process.env.PORT || 3000),
    target: process.env.TARGET_URL!,
    siteName: process.env.SITE_NAME || "AI Gateway",
    apiKeys: JSON.parse(process.env.API_KEYS || "[]") as ApiKey[],
};
