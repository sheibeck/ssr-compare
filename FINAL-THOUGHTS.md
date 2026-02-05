> **Assumption**  
> We are confident running a **reverse proxy: IIS → Node**

---

# 🏆 Winner: ssr-vue (Nuxt 3)

## Why It’s Your Best Choice

### 1. True SSR + Real Interactivity
- Nuxt provides **actual SSR** (server-rendered HTML on every request) with automatic hydration
- Full Vue reactivity for rich UX features
- One codebase seamlessly handles both server and client

---

### 2. Rich Features Are Table Stakes
Looking at your requirements (compare modals, infinite scroll, carousels, slide drawers):

- **ssr-razor / ssr-custom**  
  ~400+ lines of vanilla JS *per feature*, maintaining parallel C# and JS codebases

- **ssr-vue**  
  Composables, reactive state, built-in transitions — features become trivial

---

### 3. Bundle Size Reality Check
- Full app with all features (gzipped):  
  **ssr-vue ~102KB** vs **ssr-razor ~53KB**
- **ssr-vue includes:**
  - Framework
  - State management
  - Routing
  - Dev tools
- **ssr-razor requires:**
  - Manual implementation of everything
  - No tree-shaking
  - Manual code splitting

**That extra ~49KB buys ~10× developer productivity.**

---

### 4. Maintainability Win
- Single TypeScript codebase vs C# backend + vanilla JS frontend
- Type-safe end-to-end
- One mental model, one set of patterns
- Auto-imports, file-based routing, hot reload

---

## What About ssr-hybrid?

Your **ssr-hybrid** approach is architecturally interesting, but it creates an awkward compromise.

### The Issue
- ASP.NET Core does SSR → sends HTML
- Vue “islands” hydrate small pieces
- Every filter/sort requires a server roundtrip for new HTML
- Vue islands must then re-hydrate with new props

### The Problem
- Vue is treated like jQuery (DOM enhancement) instead of a reactive system
- ~27KB bundle, but very limited interactivity
- Complex mental model: *when does the server vs client handle updates?*
- Best of neither world:
  - Not as simple as **ssr-razor**
  - Not as powerful as full **Nuxt**

---

## The Other Options

### ssr-razor — *Only if:*
- Your team is 100% .NET
- Zero JavaScript expertise is desired
- Features stay simple (forms, basic AJAX)
- You’re okay maintaining two parallel codebases as complexity grows

### ssr-custom — *Only if:*
- Educational purposes
- Extreme control requirements
- **Not for production**

---

## Bottom Line (When Node Is Acceptable)

With Node.js on IIS handled, **Nuxt 3** gives you:

- ✅ Full SSR for performance and SEO
- ✅ Modern reactive framework for rich UX
- ✅ Single, maintainable codebase
- ✅ Battle-tested at scale
- ✅ Best developer experience

The bundle size “cost” (~50KB extra) is negligible compared to avoiding  
**hundreds of lines of vanilla JS** for every interactive feature you’ll build.

**Go with ssr-vue unless you have a strong organizational reason to stay .NET-only.**

---

---

# If Complex UX Is a MUST *and* Node.js Makes You Nervous

## 🏆 Winner: ssr-hybrid

Here’s the reality check.

---

## ❌ ssr-razor Alone Won’t Cut It

For truly complex client-side interactions  
(compare modals, carousels, slide drawers, infinite scroll):

### Vanilla JS Reality
- Compare modal with cross-page state sync: **~400 lines**
- Carousel with touch/swipe: **~300 lines**  
  *(or import ~28KB Swiper)*
- Slide drawer with focus trapping: **~250 lines**
- Infinite scroll with deduplication: **~200 lines**

**Total:** ~**1,200+ lines** of vanilla JS  
→ plus maintaining it forever.

That’s not sustainable. You’re effectively building your own framework — badly.

---

## ssr-hybrid: The Pragmatic Compromise

Your **ssr-hybrid** approach solves this exact problem.

---

## What You Get

### 1. Native IIS Deployment ✅
- ASP.NET Core runs natively on IIS
- No Node.js, no iisnode
- Standard .NET deployment your ops team already knows

---

### 2. Vue for Complex Interactivity ✅
- ~**27KB** Vue runtime for interactive “islands”
- Full Vue features:
  - Reactive state
  - Transitions
  - Components
- Write **~100 lines** instead of **~400 lines** of vanilla JS per feature

---

### 3. True SSR Performance ✅
- Server renders everything (Razor templates)
- Vue hydrates **only** the interactive pieces
- Fast initial load with a rich client experience
