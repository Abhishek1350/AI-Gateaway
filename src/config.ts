export type ApiKey = {
  key: string;
  role?: "master";
  rateLimit?: number;
};

function loadKeys(): ApiKey[] {
  const keys: ApiKey[] = [];

  if (process.env.MASTER_KEY) {
    keys.push({
      key: process.env.MASTER_KEY,
      role: "master",
    });
  }

  let i = 1;
  while (process.env[`API_KEY_${i}`]) {
    keys.push({
      key: process.env[`API_KEY_${i}`]!,
      rateLimit: Number(process.env[`API_KEY_${i}_LIMIT`] || 60),
    });
    i++;
  }

  return keys;
}

export const config = {
  port: Number(process.env.PORT || 3000),
  target: process.env.TARGET_URL!,
  siteName: process.env.SITE_NAME || "Proxy",
  apiKeys: loadKeys(),
};