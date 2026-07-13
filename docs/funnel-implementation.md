# Funnel implementation notes

## Current status

The landing now has the browser-side P0 architecture in place:

- Required fields: `Nombre`, `Correo corporativo`, `Banda de ingreso`.
- Optional field: `WhatsApp`.
- Required privacy consent and optional marketing reminder opt-in.
- Attribution capture for first-touch and last-touch UTMs, `fbclid`, `_fbp`, derived `_fbc`, landing URL, referrer and creative ID from `utm_content`.
- DataLayer events without PII.
- Meta Pixel ID locked to `2249459879220653`.
- `ViewContent` is not used.
- Browser `Lead` fires only after confirmed GHL success.
- A shared `event_id` is sent to GHL and used by browser `Lead`.
- Meta/GA4/GTM scripts are consent-gated until the final privacy policy decides whether PageView may load automatically.
- Duplicate submits are disabled during request.
- Failed submissions preserve entered data.
- Confirmed success redirects to `thank-you.html`.

## Required GHL configuration

Set the approved endpoint in `src/config.js`:

```js
ghlRegistrationEndpoint: "https://..."
```

That endpoint must:

1. Create or upsert exactly one GHL contact.
2. Start the confirmation/reminder workflow.
3. Return HTTP 2xx with `{ "success": true }` only after GHL confirms success.
4. Return non-2xx or `{ "success": false, "code": "..." }` for failure.
5. Store all attribution and consent fields sent in the payload.
6. If GHL-native CAPI is enabled, send server `Lead` with the same `event_id`.
7. Use normalized/consented match keys, IP/UA as available in GHL, `_fbp`, `_fbc`.

## Required analytics configuration

Set these only after the accounts are confirmed:

```js
ga4MeasurementId: "G-...",
gtmContainerId: "GTM-..."
```

Events pushed to `dataLayer`:

- `landing_viewed`
- `cta_clicked` with `location`
- `registration_started`
- `registration_error` with non-PII `code`
- `registration_completed` with `event_id`
- `thank_you_viewed` with `event_id`

Do not send names, emails, phones or raw form values to GA4/GTM.

## Meta rule

The optimizer chain remains:

`Lead -> QualifiedApplication -> BookedCall -> ClosedWon`

Only this P1 page fires `Lead`. `QualifiedApplication` must be fired later at P2 after the qualifier pass.

## QA gate before traffic

Verify:

- One GHL contact.
- One confirmation workflow.
- One browser `Lead` plus one server `Lead`, deduped to 1.
- EMQ at least 6 in Meta Events Manager.
- Correct first-touch and last-touch UTMs.
- No PII leakage in GTM/GA4 debug.
- No duplicate Lead on refresh, back or double-click.
- Desktop/mobile form errors, network failure, retry and thank-you flow.
