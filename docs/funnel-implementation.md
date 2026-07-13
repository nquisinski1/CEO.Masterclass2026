# Funnel implementation notes

## Current status

The landing now uses the approved embedded GHL form:

- GHL form URL: `https://app.stepupandco.com/widget/form/Ic4yCMY5X2zsR9G54w14`.
- Form name: `LP/CEO.stepupandco`.
- Field routing, required fields, success handling and workflow start must be verified inside GHL.
- Attribution capture for first-touch and last-touch UTMs, `fbclid`, `_fbp`, derived `_fbc`, landing URL, referrer and creative ID from `utm_content`.
- DataLayer events without PII.
- Meta Pixel ID locked to `2249459879220653`.
- `ViewContent` is not used.
- The previous direct local form submit is no longer active while the GHL iframe is embedded.
- `Lead`, CAPI, deduplication and thank-you routing must be confirmed in the embedded GHL form/workflow.
- Meta/GA4/GTM scripts are consent-gated until the final privacy policy decides whether PageView may load automatically.

## Required GHL configuration

The embedded GHL form must:

1. Create or upsert exactly one GHL contact.
2. Start the confirmation/reminder workflow.
3. Use the dedicated thank-you destination or equivalent GHL confirmation state.
4. Store all attribution and consent fields available to the GHL form.
5. If GHL-native CAPI is enabled, send server `Lead` with a deduplication strategy accepted by Meta.
6. Use normalized/consented match keys, IP/UA as available in GHL, `_fbp`, `_fbc`.

## Required analytics configuration

Set these only after the accounts are confirmed:

```js
ga4MeasurementId: "G-...",
gtmContainerId: "GTM-..."
```

Events pushed to `dataLayer`:

- `landing_viewed`
- `cta_clicked` with `location`
- `registration_started`, `registration_error`, `registration_completed` and `thank_you_viewed` only if GHL exposes compatible embed events or the flow redirects to the local thank-you page.

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
