> ⛔ **SUPERSEDED 2026-07-13** — Santiago ruled the live form stays a **GHL-native iframe embed** (`app.stepupandco.com/widget/form/Ic4yCMY5X2zsR9G54w14`). GHL fires the `Lead` via its own Conversions API workflow (dataset `2249459879220653`, the M2 token); there is **no custom proxy and no custom endpoint**. This document is retained for history only. Current design: `0. StepUp5-Adds/_drafts/measurement_os/06_GHL_FORM_ARCHITECTURE.md`.

# GHL Registration Endpoint Contract — P1 Masterclass form

**What this is:** the exact interface between the already-built P1 form (`src/script.js`) and the GHL backend you will build. Fill the endpoint URL into `config.js → ghlRegistrationEndpoint`. The frontend `POST`s JSON and treats **HTTP 2xx without `success:false`** as a confirmed registration — only then does it fire the browser `Lead` and redirect to the thank-you page. One fact to grep for: **the browser fires the browser-side `Lead`; your endpoint must fire the server-side (CAPI) `Lead` reusing `meta.event_id` so the two dedupe to 1.**

Status: DRAFT contract for P0.0 + server side of P0.1. Nothing here sends traffic until the P0 QA gate is VERIFIED.

---

## 0. Architecture decision (read first)

`config.js → ghlRegistrationEndpoint` is called with a **cross-origin browser `fetch` from `https://ceo.stepupandco.com`**. That has three consequences that decide what you point it at:

1. **CORS** — the browser sends `Content-Type: application/json`, which forces a **preflight `OPTIONS`**. The endpoint MUST answer the preflight and return `Access-Control-Allow-Origin`. A raw GHL inbound webhook usually does **not** return CORS headers → the fetch fails silently.
2. **No secrets in the browser** — upserting via the GHL API needs an API key. **A key can never live in `config.js`/browser JS.** So the API call must happen server-side.
3. **The CAPI `Lead`** must fire server-side with the shared `event_id`. That is also server work.

**Recommended target: a thin serverless proxy** (Cloudflare Worker / Vercel / Netlify function — ~40 lines) that does all four jobs: answers CORS, holds the GHL API key, upserts the contact, and fires the CAPI `Lead`. One component satisfies P0.0 **and** the server half of P0.1.

| Option | CORS | Hides API key | Confirms upsert synchronously | Fires CAPI w/ shared event_id | Verdict |
|---|---|---|---|---|---|
| **Thin serverless proxy** → GHL API | ✅ you control | ✅ | ✅ | ✅ | **Recommended** |
| GHL native inbound webhook | ⚠️ often no | n/a | ⚠️ "received" ≠ "created" | ❌ (needs separate GHL-native CAPI) | Only if CORS verified + CAPI wired separately |

The rest of this contract is identical regardless of which you choose — it's the request/response shape the frontend already speaks.

---

## 1. Request (what the frontend sends)

```
POST <ghlRegistrationEndpoint>
Content-Type: application/json
```

Body (exact shape produced by `buildPayload()` in `src/script.js`):

```json
{
  "contact": {
    "name": "Ana Torres",
    "email": "ana@empresa.com",
    "revenue_band": "10m_50m",
    "whatsapp": "+525512345678"
  },
  "routing": {
    "source_page": "ceo_masterclass_p1",
    "funnel_stage": "P1_registration",
    "conversion_event": "Lead",
    "optimizer_event": "QualifiedApplication_at_P2_only"
  },
  "consent": {
    "privacy_required": true,
    "marketing_opt_in": true,
    "consent_basis": "inline_notice_at_submission",
    "version": "mx-lfpdppp-v1-2026-07-13",
    "timestamp": "2026-07-13T18:22:04.512Z",
    "measurement_status": "accepted"
  },
  "attribution": {
    "first_touch": { "utm_source": "...", "utm_medium": "...", "utm_campaign": "...", "utm_content": "...", "utm_term": "...", "fbclid": "...", "campaign_id": "...", "adset_id": "...", "ad_id": "...", "landing_url": "...", "referrer": "...", "timestamp": "...", "fbp": "fb.1...", "fbc": "fb.1...", "creative_id": "..." },
    "last_touch": { "...": "same shape as first_touch" },
    "current":    { "...": "same shape, at moment of submit" }
  },
  "meta": {
    "pixel_id": "2249459879220653",
    "event_name": "Lead",
    "event_id": "b1e6c4e2-9a7f-4c1a-8f0e-3d2b1a0c9e8d",
    "event_source_url": "https://ceo.stepupandco.com/",
    "user_agent": "Mozilla/5.0 ..."
  }
}
```

### Field reference

| Field | Type / values | Notes |
|---|---|---|
| `contact.name` | string | trimmed |
| `contact.email` | string, lowercased | **dedupe key** |
| `contact.revenue_band` | `under_1m` \| `1m_5m` \| `5m_10m` \| `10m_50m` \| `50m_plus` \| `investor_portfolio` | routing input for P2 (P1 does not route doors) |
| `contact.whatsapp` | string, digits/`+` only, ≤24 chars, may be `""` | optional |
| `routing.*` | constants | pass through / store as-is |
| `consent.privacy_required` | `true` | implied via inline notice at submit |
| `consent.marketing_opt_in` | `true` | ⚠️ basis is inline notice, not an explicit checkbox — see §6 |
| `consent.consent_basis` | `"inline_notice_at_submission"` | store on contact |
| `consent.version` | string | LFPDPPP notice version; store on contact |
| `consent.timestamp` | ISO-8601 | store on contact |
| `consent.measurement_status` | `accepted` \| `necessary_only` \| `unset` | analytics/pixel consent state |
| `attribution.first_touch` / `last_touch` / `current` | objects | persist all three; bind `creative_id`/`utm_content` to the 15-creative map |
| `meta.pixel_id` | `"2249459879220653"` | LATAM dataset — the only allowed one |
| `meta.event_id` | UUID | **reuse verbatim for the CAPI `Lead`** so browser+server dedupe to 1 |
| `meta.event_source_url` | string | pass to CAPI |
| `meta.user_agent` | string | pass to CAPI as `client_user_agent` |

---

## 2. Response (what the frontend expects back)

The frontend logic (`submitToGhl()`), verbatim in behavior:

```
success  = HTTP 2xx  AND  body.success !== false
failure  = non-2xx   OR   body.success === false
on failure: error code shown/logged = body.code || ("http_" + status)
```

**Success — return HTTP 200:**
```json
{ "success": true, "contact_id": "ghl_abc123", "event_id": "b1e6c4e2-9a7f-4c1a-8f0e-3d2b1a0c9e8d" }
```
(Minimum viable: any 2xx with a body that does not contain `success:false`. `contact_id`/`event_id` are recommended for logging/QA.)

**Failure — return 4xx/5xx or `success:false` with a short, NON-PII code:**
```json
{ "success": false, "code": "upsert_failed" }
```
On failure the frontend keeps the user's typed data, shows a retry message, and logs `registration_error` with `code`. **Never put an email/name/phone in `code`.**

### Suggested error codes (→ become `registration_error` codes)

| `code` | When |
|---|---|
| `invalid_payload` | missing/malformed required fields |
| `upsert_failed` | GHL contact create/update failed |
| `workflow_trigger_failed` | contact saved but automation didn't start |
| `rate_limited` | too many submits from one IP/email |
| `server_error` | unhandled backend error |

(`validation_failed`, `missing_ghl_endpoint`, and `http_*` are produced by the frontend itself — you don't return those.)

---

## 3. Required backend behavior

1. **CORS** — handle `OPTIONS` preflight; on the `POST` return `Access-Control-Allow-Origin` from an **explicit multi-origin allowlist covering EVERY LP domain** (the masterclass domain + the 10M Engine domain + any future LP — echo the matching request origin, never `*`), `Access-Control-Allow-Methods: POST, OPTIONS`, `Access-Control-Allow-Headers: Content-Type`.
2. **Validate** `contact.email`, `contact.name`, `contact.revenue_band` are present.
3. **Upsert ONE contact by email** — refresh/back/double-click/retry must never create a duplicate.
4. **Persist** contact fields + all consent fields + attribution (first/last/current) as GHL custom fields (or a structured note). Bind `creative_id`/`utm_content` to the 15-creative map.
5. **Trigger the confirmation + reminder workflow exactly once** per contact (idempotent — key off `email` or `meta.event_id`).
6. **Fire the server-side CAPI `Lead`** to dataset `2249459879220653`:
   - `event_id` = `meta.event_id` (verbatim — this is what dedupes it against the browser `Lead`)
   - `event_source_url` = `meta.event_source_url`, `action_source` = `website`
   - user_data (hashed SHA-256): `em` (email), `ph` (whatsapp, E.164 digits), optionally `fn` (first name)
   - unhashed: `client_ip_address` (from the request), `client_user_agent` = `meta.user_agent`, `fbp` = `attribution.current.fbp`, `fbc` = `attribution.current.fbc`
   - → this drives **dedup = 1** and **EMQ ≥ 6**.
7. **Respond `success:true` only after the contact upsert succeeded** — so the browser `Lead` never fires on an unconfirmed registration. The workflow trigger and CAPI send may run async (do **not** fail the user's registration if only the CAPI call errors) — **BUT async ≠ fire-and-forget** (Sol F2, 2026-07-13): a lost server `Lead` silently breaks dedup==1 while the browser side looks healthy. The CAPI send MUST use a **durable outbox: persist the pending event (same `event_id`) before responding, retry with backoff until Meta accepts, alert on repeated failure** (a failure log you actually check counts; a dropped promise does not).
8. Respond within a few seconds.
9. **Return `contact_id` in every success response** — it is the durable journey key (Sol F7) that joins P1 registration → webinar → P2 qualifier → booking → close across GHL/CRM/CAPI. Later funnel stages generate their OWN idempotent `event_id`s but always carry this `contact_id`.

---

## 4. Security

- **No GHL API key in `config.js` or any browser file.** If the upsert uses the GHL API, it is server-side only → use the proxy option.
- Rate-limit by IP + email.
- No PII in response `code`s or in anything sent to GA4/GTM/dataLayer.
- Idempotency (contact upsert + workflow + Lead) prevents duplicate contacts and duplicate `Lead`s.

---

## 5. Acceptance test (maps to the P0 QA gate)

- [ ] Submit the real form → **exactly one** contact appears in GHL.
- [ ] Confirmation email/workflow fires **once**.
- [ ] Events Manager Test Events shows **one browser `Lead` + one server `Lead` deduped to 1** (same `event_id`).
- [ ] Server `Lead` **EMQ ≥ 6**.
- [ ] UTMs / `fbclid` / `_fbp` / `_fbc` / creative_id landed on the contact.
- [ ] Refresh, browser-back, and double-click produce **no** duplicate contact and **no** duplicate `Lead`.
- [ ] A forced network failure keeps the user's typed data and shows a retry (no contact created).
- [ ] Thank-you page loads with `?event_id=...`.

---

## 6. Open decision blocking "done"

`consent.marketing_opt_in` is now `true` on every submit, with basis `inline_notice_at_submission` (the checkboxes were removed 2026-07-13). This **conflicts with `AGENTS.md` rule 11 / P0.4 ("no marketing reminders without explicit opt-in")**, and `privacy.html` still says reminders require *"opt-in explícito."* Santiago must ratify the consent model (implied-via-notice / revert to a checkbox / split) and legal must reconcile `privacy.html` before paid traffic. Until then, treat WhatsApp/email reminders as **pending legal sign-off**, even though the payload carries `marketing_opt_in:true`.
