# IIS → Node (Nuxt) at Enterprise Scale

You *can* run **IIS → Node (Nuxt/Nitro)** reliably at enterprise scale. This is a common pattern in Windows-first organizations. The key is **choosing the right IIS integration model**, because the wrong one introduces operational risk.

---

## Two Viable IIS Patterns (Choose Intentionally)

### Option A (Recommended): IIS as Reverse Proxy → Standalone Node Process

**How it works**
- IIS handles TLS termination, bindings, optional Windows auth, WAF, etc.
- IIS forwards traffic to a **separately managed Node/Nuxt server** (localhost or another host)
- Uses **URL Rewrite + Application Request Routing (ARR)**

**Why enterprises prefer this**
- Clean failure boundaries: Node can restart without taking IIS down
- Node stays stateless and horizontally scalable
- Easier to observe, scale, and operate
- Clear exit strategy (containers, Linux, cloud LB later)

**Operational reality**
- This is the *boring, reliable* choice
- Very common in mixed .NET + Node environments

---

### Option B (Use Cautiously): Host Nuxt via iisnode

**How it works**
- Nuxt runs *inside* IIS using `iisnode`
- Nuxt/Nitro provides an `iis_node` deployment preset

**Why some teams choose it**
- Single-server, IIS-only deployment model
- Lower initial friction for Windows-only ops teams

**Why enterprises often avoid it**
- App lifecycle is tightly coupled to IIS
- Harder process isolation and scaling
- More friction if you ever move off IIS
- Less flexible for high-visibility, frequently changing sites

**Rule of thumb**
- Works, but increases long-term risk
- Usually avoided for customer-facing, high-traffic apps

---

## What “At Scale” Really Means Here

At **millions of hits per week**, the extra IIS → Node hop is *not* your bottleneck.

Real bottlenecks are:
- SSR compute on cache misses
- Backend/API fan-out latency
- Image weight (especially carousels)
- Tail latency (p95 / p99)

This architecture must be **CDN-first**, with IIS + Node mostly serving:
- cache misses
- revalidation
- personalized routes

---

## Enterprise Failure Modes (and How to Avoid Them)

### 1) Forwarded Headers (Critical)

Behind IIS, Node must correctly handle:
- `X-Forwarded-For`
- `X-Forwarded-Proto`
- `X-Forwarded-Port`

These affect:
- canonical URLs
- secure cookies
- redirects
- rate limiting
- bot detection

**Rule**
- IIS must *own* these headers
- Strip any client-supplied versions
- Only trust headers set by your proxy

Misconfiguration here causes subtle, painful bugs.

---

### 2) WebSockets / “Live Stats”

If you use real-time stats or WebSockets:
- IIS + ARR *can* proxy them
- Configuration must be explicit
- This is a common source of “it works in dev, breaks in prod”

**Enterprise advice**
- If possible, prefer HTTP fetch/polling for stats
- Avoid WebSockets unless you truly need them

---

### 3) Timeouts and Response Buffering

Default IIS/ARR settings can cause:
- SSR responses to be cut off
- Large JSON payloads to fail
- Intermittent 502/504 errors under load

**Fix**
- Keep SSR responses fast
- Cache aggressively
- Avoid long-running SSR requests
- Tune proxy timeouts intentionally

---

## Recommended “Safe Enterprise” Setup

### Architecture

1. **CDN in front**
   - Cache HTML, JSON, and assets aggressively
   - Reduce SSR volume dramatically

2. **IIS Reverse Proxy**
   - URL Rewrite + ARR
   - Forward only what Node needs

3. **Standalone Node/Nuxt Service**
   - Run independently of IIS
   - Managed via:
     - Windows Service (NSSM), or
     - PM2 on Windows, or
     - Containers

4. **Horizontal Scaling**
   - Multiple Node workers (≈ one per core)
   - Load balance:
     - in IIS (multiple localhost ports), or
     - upstream (LB to multiple Node instances)

5. **Nuxt Route Rules**
   - SRP / VDP: cached (SWR / ISR)
   - Personalized routes: SSR, no cache
   - Admin/internal: client-only if appropriate

---

## When to Use iisnode Anyway

Choose **iisnode** if:
- You are strictly IIS-only
- You want the lowest initial change cost
- You accept tighter coupling and migration friction

Otherwise, **reverse proxy → standalone Node** is the safer long-term choice.

---

## One-Sentence Decision Rule (Use This in the Room)

> If we care about reliability, scale, and future flexibility, IIS should proxy to a standalone Node/Nuxt service—not host it directly.

---

## Recommendation: IIS Reverse Proxy → Standalone Node (Nuxt)

**Recommended approach:**  
Use **IIS as a reverse proxy** in front of a **standalone Node (Nuxt/Nitro) service**.

### Why this is the safest choice for a 100% IIS shop
- **Preserves IIS**: TLS, bindings, security tooling, and ops processes stay unchanged
- **Clean separation**: IIS handles routing/security; Node handles SSR and UI rendering
- **Better reliability**: Node restarts or failures don’t impact IIS
- **Scales predictably**: Stateless Node instances scale horizontally without re-architecture
- **Future-proof**: Easy path to containers, Linux, or cloud later

### How it fits our site
- Designed for **high-traffic, image-heavy SRP/VDP pages**
- Works with **CDN-first caching** so Node handles cache misses—not all traffic
- Supports SEO-critical SSR with controlled risk

### Bottom line
> **IIS → reverse proxy → standalone Node is the lowest-risk, enterprise-ready way to adopt Nuxt without disrupting our IIS-based platform.**
