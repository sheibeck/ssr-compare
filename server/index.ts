import { promises as fs } from 'fs';
import http from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { search } from '../shared/searchService.js';
import { parseState } from '../ssr-custom/src/shared/urlState.js';
import { renderSearchPage } from './renderSearchPage.js';
import { safeSerialize } from './safeSerialize.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// IIS uses named pipes or port from environment
const PORT = process.env.PORT || 3000;

// Helper to serve static files
async function serveStatic(filePath: string, res: http.ServerResponse) {
  try {
    const fullPath = path.join(__dirname, '..', filePath);
    const content = await fs.readFile(fullPath);
    const ext = path.extname(filePath);
    const contentType: Record<string, string> = {
      '.js': 'application/javascript',
      '.css': 'text/css',
      '.html': 'text/html',
      '.json': 'application/json',
    };
    res.setHeader('Content-Type', contentType[ext] || 'application/octet-stream');
    res.end(content);
  } catch (error) {
    res.writeHead(404);
    res.end('Not Found');
  }
}

// Create HTTP server for IIS (iisnode)
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  
  // Enable CORS for Nuxt dev server to call our API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  try {
    // Serve static assets for SSR-CUSTOM (client bundle)
    if (url.pathname.startsWith('/assets/')) {
      const filePath = url.pathname.replace('/assets/', 'ssr-custom/dist/client/');
      await serveStatic(filePath, res);
      return;
    }
    
    // API endpoint - shared by both implementations
    if (url.pathname === '/api/search') {
      const state = parseState(url);
      const data = await search(state);
      
      res.setHeader('Content-Type', 'application/json');
      res.writeHead(200);
      res.end(JSON.stringify({
        state,
        ...data,
      }));
      return;
    }
    
    // SSR route for SSR-CUSTOM implementation
    if (url.pathname === '/custom/search') {
      const state = parseState(url);
      const data = await search(state);
      const { head, body, bootState } = renderSearchPage(data, state);
      
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${head}
</head>
<body>
  <div id="app">${body}</div>
  
  <!-- Inject SSR state for client hydration -->
  <script id="__STATE__" type="application/json">${safeSerialize(bootState)}</script>
  
  <!-- Client bundle -->
  <script type="module" src="/assets/client.js"></script>
</body>
</html>`;
      
      res.setHeader('Content-Type', 'text/html');
      res.writeHead(200);
      res.end(html);
      return;
    }
    
    // Redirect root to custom implementation
    if (url.pathname === '/') {
      res.writeHead(302, { 'Location': '/custom/search' });
      res.end();
      return;
    }
    
    // 404 for all other routes
    res.writeHead(404);
    res.end('Not Found');
    
  } catch (error) {
    console.error('Server error:', error);
    res.writeHead(500);
    res.end('Internal Server Error');
  }
});

server.listen(PORT, () => {
  console.log(`IIS/Node.js SSR server running at http://localhost:${PORT}`);
  console.log(`- Custom SSR: http://localhost:${PORT}/custom/search?q=honda&sort=price_asc`);
  console.log(`- API endpoint: http://localhost:${PORT}/api/search`);
  console.log(`- Nuxt (separate): Run 'npm run dev' in ssr-vue folder`);
});
