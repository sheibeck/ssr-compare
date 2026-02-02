# SSR Demo

Minimal Server-Side Rendering (SSR) demo with TypeScript - no frameworks.

## Features

- ✅ Server-side rendering with Express
- ✅ Client-side hydration (attaches event handlers)
- ✅ Client-side navigation (SPA-like navigation without full page reloads)
- ✅ History API (back/forward button support)
- ✅ XSS protection (HTML escaping + safe JSON serialization)
- ✅ TypeScript

## What's Normally Handled by a Framework

This demo manually implements what modern frameworks do automatically:

- **SSR rendering**: Frameworks like Next.js, Nuxt, SvelteKit do this automatically
- **Hydration**: React/Vue/Svelte automatically attach event handlers to SSR content
- **Routing**: Vue Router, React Router, etc. handle URL parsing and navigation
- **State management**: Frameworks inject state automatically (`__NEXT_DATA__`, `__NUXT__`, etc.)
- **Build tooling**: Frameworks provide optimized builds, code splitting, HMR, etc.
- **Security**: Frameworks escape HTML and serialize state safely by default

## Setup

```bash
# Install dependencies
npm install

# Build (compiles TypeScript + bundles client code)
npm run build

# Run production server
npm start

# Or run in development mode (with auto-reload)
npm run dev
```

## Usage

Open http://localhost:3000 in your browser.

Try these URLs:
- http://localhost:3000/search
- http://localhost:3000/search?q=honda
- http://localhost:3000/search?q=truck&sort=price_asc
- http://localhost:3000/search?q=2024&page=2

## Project Structure

```
src/
├── shared/          # Code shared between client and server
│   ├── types.ts     # TypeScript interfaces
│   └── urlState.ts  # URL parsing/serialization
├── server/          # Server-only code
│   ├── index.ts              # Express server
│   ├── renderSearchPage.ts  # SSR HTML rendering
│   ├── searchService.ts     # Mock search API
│   └── safeSerialize.ts     # XSS-safe JSON serialization
└── client/          # Client-only code
    └── index.ts     # Hydration + client-side navigation
```

## How It Works

1. **Server receives request** → `/search?q=honda&sort=price_asc`
2. **Parse URL state** → `{ q: 'honda', page: 1, sort: 'price_asc' }`
3. **Fetch data** → Call mock search service
4. **Render HTML** → Generate full HTML document with results
5. **Inject state** → Add `<script id="__STATE__">{ state, data }</script>`
6. **Send to browser** → Full HTML page
7. **Client hydration** → Attach event listeners to existing HTML
8. **User interaction** → Click "Next" button
9. **Client navigation** → Fetch new HTML, swap content, update URL
10. **Repeat** → Back to step 7

## Security

- ✅ HTML escaping for user input (search query, result titles)
- ✅ XSS-safe JSON serialization (escapes `<`, `>`, `&`, line/paragraph separators)
- ✅ State injected as `application/json` (not executable JavaScript)
- ✅ No inline JavaScript (except the JSON state blob)

## What's Missing (Intentionally)

This is an MVP to demonstrate core concepts. Not included:

- ❌ Production optimizations (caching, compression, CDN)
- ❌ Code splitting / lazy loading
- ❌ Hot Module Replacement (HMR)
- ❌ CSS-in-JS or scoped styles
- ❌ Error boundaries
- ❌ Loading states
- ❌ SEO meta tags
- ❌ Filters/facets
- ❌ Real database or API calls
