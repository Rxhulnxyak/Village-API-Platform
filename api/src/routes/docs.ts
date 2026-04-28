import { Router, Request, Response } from 'express';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>VillageAPI Documentation</title>
      <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/inter-ui@3.19.3/inter.css">
      <style>
        :root {
          --brand: #6366f1;
          --bg: #0f172a;
          --surface: #1e293b;
          --text: #f8fafc;
          --muted: #94a3b8;
          --border: #334155;
        }
        body {
          font-family: 'Inter', sans-serif;
          background: var(--bg);
          color: var(--text);
          margin: 0;
          line-height: 1.6;
        }
        header {
          padding: 3rem 1.5rem;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(to bottom, #1e1b4b, var(--bg));
        }
        .container {
          max-width: 900px;
          margin: 0 auto;
          padding: 2rem 1.5rem;
        }
        h1 { font-size: 2.5rem; margin: 0; }
        .badge { background: var(--brand); padding: 0.25rem 0.75rem; border-radius: 999px; font-size: 0.8rem; }
        .endpoint {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }
        .method {
          display: inline-block;
          font-weight: 800;
          font-size: 0.8rem;
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
          margin-right: 0.5rem;
        }
        .GET { background: #10b981; color: white; }
        .POST { background: #3b82f6; color: white; }
        code {
          background: #000;
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-family: monospace;
          color: #f472b6;
        }
        pre {
          background: #000;
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          font-size: 0.9rem;
        }
      </style>
    </head>
    <body>
      <header>
        <div class="container">
          <h1>VillageAPI <span class="badge">v1.0</span></h1>
          <p style="color: var(--muted)">High-performance Indian geographical data engine.</p>
        </div>
      </header>
      <div class="container">
        <h2>Endpoints</h2>
        
        <div class="endpoint">
          <h3><span class="method GET">GET</span> /v1/states</h3>
          <p>List all states and union territories in India.</p>
          <h4>Response</h4>
          <pre>[
  { "id": "cl...", "mddsCode": "01", "name": "JAMMU & KASHMIR" },
  ...
]</pre>
        </div>

        <div class="endpoint">
          <h3><span class="method GET">GET</span> /v1/search</h3>
          <p>Fuzzy search for villages by name and optionally hierarchy.</p>
          <h4>Parameters</h4>
          <ul>
            <li><code>q</code>: Search query (min 3 chars). Example: <code>?q=Rampur, Bihar</code></li>
            <li><code>limit</code>: Max results (default 25)</li>
          </ul>
        </div>

        <div class="endpoint">
          <h3><span class="method GET">GET</span> /v1/villages/:subDistrictId</h3>
          <p>Get all villages within a specific sub-district (tehsil/block).</p>
          <h4>Response</h4>
          <pre>{
  "villages": [...],
  "total": 142,
  "page": 1,
  "totalPages": 3
}</pre>
        </div>

        <div class="auth">
          <h2>Authentication</h2>
          <p>All requests must include the following headers:</p>
          <pre>X-API-KEY: your_api_key\nX-API-SECRET: your_api_secret</pre>
        </div>
      </div>
    </body>
    </html>
  `);
});

export default router;
