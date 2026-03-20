import express from "express";
import { config } from "./config";
import { auth } from "./middleware/auth";
import { rateLimit } from "./middleware/rateLimit";
import { proxy } from "./proxy";

const app = express();

app.use(express.json({ limit: "10mb" }));

app.get("/", (_, res) => {
    res.setHeader("Content-Type", "text/html");
    res.setHeader("Cache-Control", "public, max-age=300");

    res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${config.siteName}</title>
        <style>
          body {
            font-family: sans-serif;
            background: #0f172a;
            color: #e2e8f0;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 90dvh;
          }
          .box {
            text-align: center;
          }
          .status {
            color: #22c55e;
            font-weight: bold;
          }
        </style>
      </head>
      <body>
        <div class="box">
          <h1>${config.siteName}</h1>
          <p class="status">● Running</p>
          <p>API ready</p>
        </div>
      </body>
    </html>
  `);
});

app.use(["/v1", "/api"], auth, rateLimit, proxy);

app.use((_, res) => {
    res.status(404).json({ error: "Not found" });
});

app.listen(config.port, () => {
    console.log(`Proxy running on ${config.port}`);
});
