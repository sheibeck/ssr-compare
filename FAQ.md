# FAQ — SSR & Client-Side

Q: Why do I need client-side state if the server already rendered the page?

A: Server-side rendering (SSR) provides ready-to-render HTML for a fast first paint and SEO, but client-side state is required for ongoing interactivity after the page loads — things like clicks, modals, filters, infinite scroll, optimistic UI updates, and transient form state. Client state also enables navigation without full page reloads, preserving scroll position and animations.

Nuxt note: Nuxt provides built-in routing, automatic hydration, and state helpers (Pinia / `useState`) that make client-side state easier to manage with less boilerplate.

Q: What is hydration and why does it matter?

A: Hydration is the client-side process that attaches event handlers and recreates component state for server-rendered HTML so the page becomes interactive. It matters because hydration must be deterministic: the DOM produced by client-side code should match the server output to avoid visual or behavioral mismatches.

Nuxt note: Nuxt and Vue handle component hydration automatically for you and provide conventions to avoid common mismatch sources.

Q: What are common pitfalls when using SSR and hydration?

A: Common issues include hydration mismatches (caused by non-deterministic rendering like random IDs, Date.now(), or locale-specific output), unsafe serialization (embedding state into HTML without escaping), and sending too much serialized state which inflates the payload. Fix mismatches by making rendering deterministic or running non-deterministic code only on the client; use a safe serializer (see [server/safeSerialize.ts](server/safeSerialize.ts)); and serialize only the minimal state needed for the initial view.

Nuxt note: Nuxt's SSR conventions, built-in escaping, and helpers like `useAsyncData` / `useState` reduce the risk of mismatches and help you avoid over-serializing data.

Q: When should I rely on SSR-only (no client JavaScript)?

A: SSR-only is appropriate for static documents, content pages, or other views where no interactivity is required. It offers the best performance and simplicity when client interactivity is unnecessary.

Nuxt note: Nuxt supports fully static (prerender) sites where you can ship no client JS for specific pages or routes.

Q: When should I add progressive client-side JavaScript?

A: Add small, focused client modules for features that require interactivity (search, filters, modals). Defer heavy features (carousels, maps, third-party widgets) behind lazy-loading to keep initial payloads small.

Nuxt note: Nuxt makes progressive enhancement straightforward via lazy-loaded components, dynamic imports, and the `client-only` pattern for browser-only code.

Q: What are performance best practices for SSR + client hydration?

A: Serialize minimal state required for hydration; code-split and lazy-load interactive features; prefer event delegation over many individual listeners; and measure real-user metrics like TTFB, FCP, and TTI to guide optimizations.

Nuxt note: Nuxt provides automatic path-based code-splitting, prefetching, and other optimizations that reduce manual tuning.

Q: What security considerations should I keep in mind?

A: Never inject raw or unsanitized user content into server-rendered templates. Use safe serialization, HTML-escape user input, apply a Content Security Policy (CSP), and sanitize any third-party HTML before insertion.

Nuxt note: Nuxt/Vue templates escape output by default; avoid `v-html` or sanitize inputs when using it.
