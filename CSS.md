# VHCLIAA SRP CSS Architecture (Nuxt-focused)

## Purpose

This document defines a practical CSS architecture for the VHCLIAA SRP when built with Nuxt/Vue SSR and embedded into a larger SITE. The goal:

- Keep the VHCLIAA CSS surface minimal, cacheable, and optimized for fast first paint.
- Avoid forcing the SITE to inline one giant CSS blob that hurts initial load and cacheability.
- Provide a repeatable Nuxt-friendly pattern for component-scoped styles, global tokens, critical CSS, and lazy-loaded CSS chunks.

## Core Principles

1. **CSS must scale with components**
   - Styles should be easy to find, edit, and reason about alongside the Vue components they belong to.

2. **CSS delivery must be cache-friendly**
   - Styles should not be duplicated per request.
   - Large CSS blobs must not be inlined into HTML responses.

3. **CSS isolation must be explicit**
   - VHCLIAA styles must not leak outward.
   - External styles must not implicitly control SRP internals.

4. **Performance > cleverness**
   - Simple, predictable CSS beats “magic” encapsulation.
   - Delivery strategy matters more than selector tricks.

5. **Collaborate with SITE**
   - Provide deterministic critical CSS and a small set of well-versioned stylesheet URLs the SITE can include rather than inlining all styles.

## SRP Boundary

All VHCLIAA SRP markup is wrapped in a guaranteed root element:

- Class: `.vh-srp`
- Purpose: strict styling boundary and namespace root

All VHCLIAA-owned CSS **must live under this root**.

No VHCLIAA CSS may:
- target `body`, `html`, or unscoped elements
- rely on global class names such as `.btn`, `.grid`, `.card`

## Authoring Strategy

### Component Internals: Scoped Styles

- Use `<style scoped>` inside Vue Single File Components. The Vue compiler adds component-specific attributes to selectors and keeps component CSS isolated while remaining normal CSS at runtime.
- Benefits:
   - Co-located styles and markup (easier refactor)
   - Auto-prefixed selectors reduce accidental leakage
   - Component authors see behavior and presentation together

Scoped styles are intended for component internals: layout, internal states, and local visual variants. They are an authoring convenience — not an argument for shipping a huge single-file CSS payload.

### Shared Styling: Namespaced Global SRP CSS

Some styles must be shared across many components. These must not be repeated inside multiple scoped blocks.

Examples:
- spacing scale
- typography scale
- color tokens
- grid and layout primitives
- shared UI affordances

These belong in **SRP-wide CSS**, always namespaced under `.vh-srp`.

-- Store tokens and primitives in a single `global.css` (or equivalent entry CSS) imported by Nuxt once at the SRP root. Keep this file minimal: color tokens, spacing scale, typography, and layout primitives only.
-- Always scope global rules under the `.vh-srp` namespace to avoid leaking into the host SITE. Aim for low specificity utilities and variables rather than broad selectors.

## CSS Delivery Model

### Required: Single Versioned SRP CSS Asset

VHCLIAA ships **one SRP CSS bundle** per build:

- versioned (hash or versioned query)
- cacheable long-term
- loaded once per page

This bundle (the build output) should be organized as:
- `global.[hash].css` — small, cacheable file with tokens and minimal scaffolding
- `critical.[hash].css` (optional) — tiny inline/preload chunk needed for first paint
- chunked component CSS files emitted by Vite/Nuxt for async components and route-based splits

The build must NOT force the SITE to inline every emitted file. Instead, publish the files to a CDN and provide the SITE with a small set of stable URLs (or a JSON manifest) it can reference.

This approach ensures:
- minimal HTML payload size
- strong browser and CDN caching
- consistent styling across requests

## What We Explicitly Avoid

- Inlining full SRP CSS into every SSR response
- Mixing multiple domains’ CSS into a single inline blob
- Duplicating shared primitives inside many scoped components
- Relying on cascade accidents or selector wars for isolation
- Adding additional SRP “data caches” at the CSS layer

Also avoid:
- Requiring the SITE to concatenate VHCLIAA and DESIGN CSS into one inline blob. That eliminates caching benefits and forces every visitor to download unchanged VHCLIAA CSS repeatedly.

## Performance Implications

Following this architecture:
- reduces HTML size
- improves TTFB and parse time
- increases cache hit ratios
- avoids CSS re-downloads across navigations
- keeps first paint predictable

Using scoped styles does not materially harm performance when:
- styles are extracted into a single asset
- shared patterns are not duplicated excessively

## Summary

VHCLIAA CSS must be:

- Component-aligned in authoring
- Namespaced at runtime
- Extracted into a single cacheable asset
- Minimal and intentional when inlined
- Explicitly bounded by the SRP root

This architecture balances **developer productivity**, **runtime performance**, and **long-term maintainability** while enabling the SITE to take a minimal, cacheable set of CSS assets instead of inlining one giant file.

---

# Layout Contract (Grid Abstraction Summary)

## Goal
Standardize layout across domains **without binding markup to a specific grid framework**, so the grid can be replaced later with minimal impact.

## Core Idea
- **Do not use grid framework classes directly** in templates.
- Define a **small, owned set of layout classes** (the contract).
- Map those classes to a grid provider (Bootstrap grid, Pure grid, etc.) via a thin adapter layer.

## What the Contract Owns
A minimal, stable vocabulary:
- Container
- Row
- Column
- Column spans (e.g., half, third)
- Breakpoints (sm / md / lg)
- Gaps
- Card-style auto grids (if needed)

Example naming (illustrative):
- `l-container`
- `l-row`
- `l-col`
- `l-col-6`
- `l-col-md-4`
- `l-gap-md`

## What Developers Use
- Only **contract classes** (or layout components that emit them).
- Never provider-specific classes (`row`, `col-*`, `pure-g`, etc.).

## Adapter Layer
- A single CSS file maps contract classes → provider behavior.
- Namespaced under the app root (e.g., `.vh-srp`).
- This is the *only* place that knows about the grid framework.

## Why This Works
- Markup stays stable even if the grid framework changes.
- Migration means updating the adapter, not every component.
- Prevents gradual lock-in to provider-specific features.
- Keeps layouts consistent across teams and domains.

## Guardrails
- Keep the contract small and boring.
- Avoid provider-only features (ordering, offsets, exotic utilities).
- Enforce via code review or linting: no provider classes in templates.

## Result
- Shared grid standard across domains
- Low CSS weight and good page speed
- Future-proof layout system with a clean escape hatch

---
# Grid Frameworks
## Purpose
A CSS framework could help bridge the gape between UX/DES/SITE. Having a common grid framework means less mess going from UX Mock to code. But, we don't want to be hard coded to a specific framework so we can change later as needed. And we want something with light overhead. A grid is good! Just how we implement it is important. How can we use a grid framework without being hard dependent on said framework? Framework agnostic as it were.

## Example contract (Illustrative only!! We could use any framework here so as not to re-invent the wheel)
```
/* 1) Bring in Bootstrap Sass */
@import "bootstrap/scss/functions";
@import "bootstrap/scss/variables";
@import "bootstrap/scss/mixins";

/* 2) Define contract classes under vh-srp */
.vh-srp {
  .l-container {
    @include make-container();
  }

  .l-row {
    @include make-row();
  }

  .l-col {
    @include make-col-ready();
  }

  .l-col-12 { @include make-col(12); }
  .l-col-6  { @include make-col(6); }

  @media (min-width: map-get($grid-breakpoints, md)) {
    .l-col-md-3 { @include make-col(3); }
    .l-col-md-4 { @include make-col(4); }
    .l-col-md-9 { @include make-col(9); }
  }
}
```

Maybe this is overkill, but frees us from dependency while still having the guard rails of framework instead of manually trying to tweek grids, sapcing, etc everywhere.