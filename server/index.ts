import express from 'express';
import { search } from '../shared/searchService.js';
import { parseState } from '../ssr-custom/src/shared/urlState.js';
import { renderSearchPage } from './renderSearchPage.js';
import { safeSerialize } from './safeSerialize.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for Nuxt dev server to call our API
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

// Serve static assets for ssr-custom (client bundle)
app.use('/assets', express.static('ssr-custom/dist/client'));

// API endpoint - shared by both implementations
app.get('/api/search', async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const state = parseState(url);
    const data = await search(state);
    
    res.json({
      state,
      ...data,
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// SSR route for ssr-custom implementation
app.get('/custom/search', async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
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
    
    res.send(html);
  } catch (error) {
    console.error('Error rendering search page:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Redirect root to custom implementation
app.get('/', (req, res) => {
  res.redirect('/custom/search');
});

app.listen(PORT, () => {
  console.log(`Shared SSR server running at http://localhost:${PORT}`);
  console.log(`- Custom SSR: http://localhost:${PORT}/custom/search?q=honda&sort=price_asc`);
  console.log(`- API endpoint: http://localhost:${PORT}/api/search`);
  console.log(`- Nuxt (separate): Run 'npm run dev' in ssr-vue folder`);
});
