(function () {
  "use strict";

  const config = window.STEPUP_THANK_YOU_CONFIG || {};
  const pageMeta = config.page || {};
  const dataLayer = (window.dataLayer = window.dataLayer || []);
  // Canonical consent store = the cookie shared across *.stepupandco.com (same
  // name the LP writes). The old localStorage key is legacy, read-only for
  // migration — localStorage can never cross the subdomain boundary (fix F1).
  const consentCookieName = "stepup_consent_state";
  const legacyConsentKey = "stepup_campaign_consent";
  const sessionKey = "stepup_campaign_session_id";
  const pageLoadTs = Date.now();
  let volatileSessionId = "";

  function nowIso() {
    return new Date().toISOString();
  }

  function getSessionId() {
    let value = "";
    try {
      value = sessionStorage.getItem(sessionKey) || "";
    } catch {
      value = volatileSessionId;
    }

    if (!value) {
      value =
        (window.crypto?.randomUUID && window.crypto.randomUUID()) ||
        "evt_" +
          Date.now().toString(36) +
          "_" +
          Math.random().toString(36).slice(2);
      volatileSessionId = value;
      try {
        sessionStorage.setItem(sessionKey, value);
      } catch {
        // Some local previews block storage. The in-memory ID keeps tracking stable for this view.
      }
    }
    return value;
  }

  function sanitizeUrl() {
    const url = new URL(window.location.href);
    let changed = false;

    [...url.searchParams.keys()].forEach((key) => {
      if (key !== "cid") {
        url.searchParams.delete(key);
        changed = true;
      }
    });

    const cid = url.searchParams.get("cid") || "";
    if (cid && !/^[A-Za-z0-9_-]{1,128}$/.test(cid)) {
      url.searchParams.delete("cid");
      changed = true;
    }

    if (changed) {
      try {
        window.history.replaceState(
          {},
          document.title,
          url.pathname + url.search + url.hash,
        );
      } catch {
        // The URL is still excluded from analytics below if file previews reject replaceState.
      }
    }
  }

  function getContactId() {
    // GHL's on-submit redirect carries the journey key as ?cid={{contact.id}}.
    // ABSENT-SAFE: GHL does not always resolve the merge tag on iframe redirects
    // today, so this must degrade to "" rather than fail.
    const value = new URLSearchParams(window.location.search).get("cid") || "";
    return /^[A-Za-z0-9_-]{1,128}$/.test(value) ? value : "";
  }

  function getCookie(name) {
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="))
        ?.split("=")
        .slice(1)
        .join("=") || ""
    );
  }

  function consentCookieAttributes() {
    const domain = window.location.hostname.endsWith("stepupandco.com")
      ? "; Domain=.stepupandco.com"
      : "";
    return "; Path=/; Max-Age=31536000; SameSite=Lax" + domain;
  }

  function writeConsentCookie(payload) {
    document.cookie =
      consentCookieName +
      "=" +
      encodeURIComponent(JSON.stringify(payload)) +
      consentCookieAttributes();
  }

  function readConsentCookie() {
    const raw = getCookie(consentCookieName);
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }

  function readLegacyConsent() {
    try {
      return JSON.parse(localStorage.getItem(legacyConsentKey) || "null");
    } catch {
      return null;
    }
  }

  function readConsent() {
    const fromCookie = readConsentCookie();
    if (fromCookie) return fromCookie;
    const legacy = readLegacyConsent();
    if (legacy) {
      // Pre-cookie visitors stored their choice in this page's localStorage —
      // migrate it silently so the cookie becomes the single source of truth.
      // The pre-cookie script's decline vocabulary was "declined"; normalize it
      // to "necessary_only" so the migrated decliner stays blocked (F1 intent).
      if (legacy.status === "declined") legacy.status = "necessary_only";
      writeConsentCookie(legacy);
      return legacy;
    }
    return null;
  }

  function saveConsent(status) {
    const value = {
      status,
      version: config.tracking?.consentVersion || "unversioned",
      timestamp: nowIso(),
    };
    writeConsentCookie(value);
    return value;
  }

  function getConsentState() {
    const stored = readConsent();
    if (stored?.status === "necessary_only") return "necessary_only";
    if (stored?.status === "accepted") return "accepted";
    return "granted_default";
  }

  function pushEvent(name, params) {
    dataLayer.push({
      event: name,
      event_time: nowIso(),
      page_location:
        window.location.origin === "null"
          ? window.location.pathname
          : window.location.origin + window.location.pathname,
      page_title: document.title,
      session_id: getSessionId(),
      page_id: pageMeta.pageId || "",
      offer: pageMeta.offer || "",
      build_version: pageMeta.buildVersion || "",
      consent_state: getConsentState(),
      ...(params || {}),
    });
  }

  function setText(selector, value) {
    const element = document.querySelector(selector);
    if (element && value) element.textContent = value;
  }

  function safeHttpUrl(value) {
    if (!value) return "";
    try {
      const url = new URL(value, window.location.href);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  }

  function configureExternalLink(selector, value, hideWhenMissing) {
    const link = document.querySelector(selector);
    if (!link) return;
    const url = safeHttpUrl(value);
    if (!url) {
      if (hideWhenMissing) link.hidden = true;
      return;
    }
    link.href = url;
    link.hidden = false;
  }

  function configurePage() {
    setText("[data-session-title]", config.session?.title);
    setText("[data-session-date]", config.session?.dateLabel);
    setText("[data-session-access]", config.session?.accessLabel);
    setText("[data-closing-note]", config.session?.closingNote);
    setText("[data-vsl-duration]", config.vsl?.durationLabel);
    setText("[data-current-year]", new Date().getFullYear());

    const privacyUrl = safeHttpUrl(config.links?.privacyUrl);
    document
      .querySelectorAll("[data-privacy-link], [data-consent-privacy-link]")
      .forEach((link) => {
        if (!privacyUrl) return;
        link.href = privacyUrl;
        link.removeAttribute("aria-disabled");
      });

    const companyUrl = safeHttpUrl(config.links?.companyUrl);
    document.querySelectorAll("[data-company-link]").forEach((link) => {
      if (companyUrl) link.href = companyUrl;
    });

    configureExternalLink("[data-report-link]", config.links?.reportUrl, false);
    configureExternalLink(
      '[data-social-link="linkedin"]',
      config.links?.linkedinUrl,
      false,
    );
    configureExternalLink(
      '[data-social-link="instagram"]',
      config.links?.instagramUrl,
      false,
    );
    configureExternalLink(
      '[data-social-link="youtube"]',
      config.links?.youtubeUrl,
      true,
    );

    document.querySelectorAll("[data-authority-link]").forEach((link) => {
      link.addEventListener("click", () => {
        pushEvent("authority_content_clicked", {
          source: link.dataset.authorityLink || "unknown",
        });
      });
    });

    const p2Cta = document.querySelector("[data-p2-cta]");
    const qualifierUrl = safeHttpUrl(config.p2?.qualifierUrl);
    if (p2Cta && qualifierUrl) {
      p2Cta.href = qualifierUrl;
      p2Cta.textContent = config.p2?.label || "Completar diagnóstico inicial";
      p2Cta.hidden = false;
      p2Cta.addEventListener("click", () => {
        pushEvent("qualifier_cta_clicked", { location: "thank_you" });
      });
    }
  }

  function setupVsl() {
    const trigger = document.querySelector("[data-vsl-trigger]");
    const message = document.querySelector("[data-vsl-message]");
    const youtubeId = String(config.vsl?.youtubeId || "").trim();

    trigger?.addEventListener("click", () => {
      if (!/^[A-Za-z0-9_-]{11}$/.test(youtubeId)) {
        if (message) {
          message.textContent =
            "El video será conectado antes del lanzamiento.";
          message.hidden = false;
        }
        return;
      }

      const iframe = document.createElement("iframe");
      iframe.className = "vsl-frame";
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(youtubeId)}?autoplay=1&rel=0&modestbranding=1`;
      iframe.title = "Mensaje de Harold Mesa antes de la masterclass";
      iframe.allow =
        "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
      iframe.allowFullscreen = true;
      trigger.replaceWith(iframe);
      if (message) message.hidden = true;
      pushEvent("vsl_started", { location: "thank_you" });
    });
  }

  async function copyInviteUrl(value) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(value);
      return;
    }

    const textarea = document.createElement("textarea");
    textarea.value = value;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    textarea.remove();
  }

  function setupSharing() {
    const module = document.querySelector("[data-invite-module]");
    const registrationUrl = safeHttpUrl(config.share?.registrationUrl);
    if (!module || !registrationUrl) {
      if (module) module.hidden = true;
      return;
    }

    const shareUrl = registrationUrl.endsWith("/")
      ? registrationUrl.slice(0, -1)
      : registrationUrl;
    const share = module.querySelector("[data-registration-share]");
    const status = module.querySelector("[data-share-status]");

    share?.addEventListener("click", async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: "Masterclass ejecutiva · StepUp & Company",
            text: "Te invito a registrarte en esta masterclass ejecutiva con Harold Mesa.",
            url: shareUrl,
          });
          if (status) status.textContent = "Enlace compartido.";
          pushEvent("invite_shared", { channel: "native_share" });
          return;
        } catch (error) {
          if (error?.name === "AbortError") {
            if (status) status.textContent = "Compartir cancelado.";
            return;
          }
        }
      }

      try {
        await copyInviteUrl(shareUrl);
        if (status) status.textContent = "Enlace copiado. Ya puedes enviarlo.";
        pushEvent("invite_shared", { channel: "copy" });
      } catch {
        if (status)
          status.textContent =
            "No fue posible copiar. Abre la página de registro y copia su dirección.";
      }
    });
  }

  function loadScript(src) {
    if ([...document.scripts].some((script) => script.src === src)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    document.head.appendChild(script);
  }

  function initGtmAndGa4() {
    // Consent signal MUST land in the dataLayer before gtm.js loads so GTM's own
    // consent-exception triggers (Page View + Custom Events) evaluate correctly
    // from the very first pageview onward (Decision A, LIGHT/opt-out model).
    dataLayer.push({ consent_state: getConsentState() });

    const gtmId = String(config.tracking?.gtmContainerId || "");
    if (/^GTM-[A-Z0-9]+$/.test(gtmId)) {
      dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      loadScript(
        `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(gtmId)}`,
      );
    }

    const ga4Id = String(config.tracking?.ga4MeasurementId || "");
    if (/^G-[A-Z0-9]+$/.test(ga4Id)) {
      loadScript(
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(ga4Id)}`,
      );
      window.gtag = function () {
        dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", ga4Id, { send_page_view: false });
    }
  }

  function setupConsentBanner() {
    // LIGHT/opt-out model (Decision A): measurement always fires on load via
    // initGtmAndGa4() above. The banner only offers a choice going forward —
    // it never gates the initial pageview.
    const banner = document.querySelector("[data-consent-banner]");
    if (!readConsent() && banner) banner.hidden = false;
  }

  function setupConsentButtons() {
    const banner = document.querySelector("[data-consent-banner]");
    const accept = document.querySelector("[data-consent-accept]");
    const decline = document.querySelector("[data-consent-decline]");

    accept?.addEventListener("click", () => {
      pushEvent("consent_choice", {
        choice: "accepted",
        ms_to_choice: Date.now() - pageLoadTs,
      });
      saveConsent("accepted");
      if (banner) banner.hidden = true;
    });

    decline?.addEventListener("click", () => {
      pushEvent("consent_choice", {
        choice: "necessary_only",
        ms_to_choice: Date.now() - pageLoadTs,
      });
      saveConsent("necessary_only");
      if (banner) banner.hidden = true;
    });
  }

  sanitizeUrl();
  configurePage();
  setupVsl();
  setupSharing();
  initGtmAndGa4();

  // Identity model (Sol F7): contact_id is the durable GHL journey key, carried
  // via ?cid on the redirect. It is the ONLY identifier this codebase pushes,
  // and only on this page. event_id is also populated with the same value so
  // the frozen GTM container's `{{DLV - event_id}}` mapping (used by both the
  // registration_completed and thank_you_viewed GA4 Event tags) resolves —
  // see 08a_CODE_PASS_EVIDENCE.md Open Question #1 for why both keys are sent.
  const contactId = getContactId();
  pushEvent("thank_you_viewed", { event_id: contactId, contact_id: contactId });
  pushEvent("registration_completed", {
    event_id: contactId,
    contact_id: contactId,
  });

  setupConsentBanner();
  setupConsentButtons();
})();
