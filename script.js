(function () {
  const config = window.STEPUP_FUNNEL_CONFIG || {};
  const form = document.querySelector("[data-ghl-form]");
  const formMessage = document.querySelector(".form-message");
  const consentBanner = document.querySelector("[data-consent-banner]");
  const consentAccept = document.querySelector("[data-consent-accept]");
  const consentDecline = document.querySelector("[data-consent-decline]");
  const consentKey = "stepup_consent_state";
  const attributionKey = "stepup_first_touch";
  const lastTouchKey = "stepup_last_touch";
  const sessionKey = "stepup_session_id";
  const leadEventKey = "stepup_last_lead_event_id";

  const allowedMetaPixelId = "2249459879220653";
  const dataLayer = (window.dataLayer = window.dataLayer || []);

  function nowIso() {
    return new Date().toISOString();
  }

  function uuid() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return "evt_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2);
  }

  function getSessionId() {
    let id = sessionStorage.getItem(sessionKey);
    if (!id) {
      id = uuid();
      sessionStorage.setItem(sessionKey, id);
    }
    return id;
  }

  function getCookie(name) {
    return document.cookie
      .split("; ")
      .find((row) => row.startsWith(name + "="))
      ?.split("=")
      .slice(1)
      .join("=") || "";
  }

  function setCookie(name, value, days) {
    const expires = new Date(Date.now() + days * 864e5).toUTCString();
    document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax; Secure`;
  }

  function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    const out = {};
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
      "campaign_id",
      "adset_id",
      "ad_id"
    ].forEach((key) => {
      const value = params.get(key);
      if (value) out[key] = value;
    });
    return out;
  }

  function deriveFbc(params) {
    const existing = getCookie("_fbc");
    if (existing) return existing;
    if (!params.fbclid) return "";
    const value = `fb.1.${Date.now()}.${params.fbclid}`;
    setCookie("_fbc", value, 90);
    return value;
  }

  function readStoredJson(key) {
    try {
      return JSON.parse(localStorage.getItem(key) || "null");
    } catch {
      return null;
    }
  }

  function storeAttribution() {
    const params = getQueryParams();
    const touch = {
      ...params,
      landing_url: window.location.href,
      referrer: document.referrer || "",
      timestamp: nowIso(),
      fbp: getCookie("_fbp"),
      fbc: deriveFbc(params),
      creative_id: params.utm_content || ""
    };

    if (!readStoredJson(attributionKey)) {
      localStorage.setItem(attributionKey, JSON.stringify(touch));
    }
    localStorage.setItem(lastTouchKey, JSON.stringify(touch));
    return touch;
  }

  function getConsent() {
    return readStoredJson(consentKey);
  }

  function saveConsent(state) {
    const payload = {
      status: state,
      version: config.consentVersion || "unversioned",
      timestamp: nowIso()
    };
    localStorage.setItem(consentKey, JSON.stringify(payload));
    return payload;
  }

  function pushEvent(name, params = {}) {
    dataLayer.push({
      event: name,
      event_time: nowIso(),
      page_location: window.location.href,
      page_title: document.title,
      session_id: getSessionId(),
      ...params
    });
  }

  function loadScript(src, attrs = {}) {
    if ([...document.scripts].some((script) => script.src === src)) return;
    const script = document.createElement("script");
    script.async = true;
    script.src = src;
    Object.entries(attrs).forEach(([key, value]) => script.setAttribute(key, value));
    document.head.appendChild(script);
  }

  function initMetaPixel() {
    if (config.metaPixelId !== allowedMetaPixelId) return;
    if (config.blockedPixelIds?.includes(config.metaPixelId)) return;
    if (window.fbq) return;

    !(function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");

    window.fbq("init", config.metaPixelId);
    window.fbq("track", "PageView");
  }

  function initGtmAndGa4() {
    if (config.gtmContainerId) {
      loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmContainerId)}`);
      dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    }

    if (config.ga4MeasurementId) {
      loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4MeasurementId)}`);
      window.gtag = function () {
        dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", config.ga4MeasurementId, { send_page_view: false });
    }
  }

  function activateMeasurement() {
    initMetaPixel();
    initGtmAndGa4();
  }

  function setupConsent() {
    const existing = getConsent();
    if (existing?.status === "accepted") {
      activateMeasurement();
      return existing;
    }
    if (!existing && consentBanner) consentBanner.hidden = false;
    return existing;
  }

  function getCtaLocation(link) {
    if (link.closest(".hero")) return "hero";
    if (link.closest(".closing")) return "closing";
    if (link.classList.contains("mobile-cta")) return "mobile_sticky";
    if (link.classList.contains("header-cta")) return "header";
    return "body";
  }

  function setupCtaTracking() {
    document.querySelectorAll('a[href="#registro"]').forEach((link) => {
      link.addEventListener("click", () => {
        pushEvent("cta_clicked", { location: getCtaLocation(link) });
      });
    });
  }

  function setupFormStartTracking() {
    if (!form) return;
    let started = false;
    form.addEventListener("input", () => {
      if (started) return;
      started = true;
      pushEvent("registration_started");
    });
  }

  function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
  }

  function sanitizePhone(phone) {
    return String(phone || "").replace(/[^\d+]/g, "").slice(0, 24);
  }

  function setFormBusy(isBusy) {
    if (!form) return;
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = isBusy;
      submitButton.textContent = isBusy ? "Enviando..." : "Reservar mi lugar gratis";
    }
    [...form.elements].forEach((element) => {
      if (element.type !== "hidden") element.toggleAttribute("aria-busy", isBusy);
    });
  }

  function showMessage(message, type = "info") {
    if (!formMessage) return;
    formMessage.textContent = message;
    formMessage.dataset.type = type;
  }

  function buildPayload(formData, eventId) {
    const consent = getConsent();
    const firstTouch = readStoredJson(attributionKey) || {};
    const lastTouch = readStoredJson(lastTouchKey) || storeAttribution();
    const params = getQueryParams();

    return {
      contact: {
        name: String(formData.get("name") || "").trim(),
        email: normalizeEmail(formData.get("email")),
        revenue_band: formData.get("revenue_band"),
        whatsapp: sanitizePhone(formData.get("whatsapp"))
      },
      routing: {
        source_page: "ceo_masterclass_p1",
        funnel_stage: "P1_registration",
        conversion_event: "Lead",
        optimizer_event: "QualifiedApplication_at_P2_only"
      },
      consent: {
        privacy_required: true,
        marketing_opt_in: true,
        consent_basis: "inline_notice_at_submission",
        version: config.consentVersion || "unversioned",
        timestamp: nowIso(),
        measurement_status: consent?.status || "unset"
      },
      attribution: {
        first_touch: firstTouch,
        last_touch: lastTouch,
        current: {
          ...params,
          landing_url: window.location.href,
          referrer: document.referrer || "",
          fbp: getCookie("_fbp"),
          fbc: deriveFbc(params),
          creative_id: params.utm_content || ""
        }
      },
      meta: {
        pixel_id: config.metaPixelId,
        event_name: config.eventNameLead || "Lead",
        event_id: eventId,
        event_source_url: config.eventSourceUrl || window.location.href,
        user_agent: navigator.userAgent
      }
    };
  }

  function isEndpointConfigured() {
    return /^https:\/\//.test(config.ghlRegistrationEndpoint || "");
  }

  function trackLeadAfterConfirmedSuccess(eventId) {
    pushEvent("registration_completed", { event_id: eventId });
    if (window.fbq && config.metaPixelId === allowedMetaPixelId) {
      window.fbq("track", "Lead", {}, { eventID: eventId });
    }
    sessionStorage.setItem(leadEventKey, eventId);
  }

  async function submitToGhl(payload) {
    const response = await fetch(config.ghlRegistrationEndpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: false
    });

    let body = {};
    try {
      body = await response.json();
    } catch {
      body = {};
    }

    if (!response.ok || body.success === false) {
      const code = body.code || `http_${response.status}`;
      throw new Error(code);
    }
    return body;
  }

  function setupRegistration() {
    if (!form) return;

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      if (!form.checkValidity()) {
        form.reportValidity();
        showMessage("Complete los campos obligatorios para reservar su lugar.", "error");
        pushEvent("registration_error", { code: "validation_failed" });
        return;
      }

      if (!isEndpointConfigured()) {
        showMessage("Registro pendiente de conexión: falta configurar el endpoint aprobado de GHL.", "error");
        pushEvent("registration_error", { code: "missing_ghl_endpoint" });
        return;
      }

      const eventId = uuid();
      const payload = buildPayload(new FormData(form), eventId);

      setFormBusy(true);
      showMessage("Enviando registro...", "info");

      try {
        await submitToGhl(payload);
        trackLeadAfterConfirmedSuccess(eventId);
        window.location.assign(`${config.thankYouUrl || "./thank-you.html"}?event_id=${encodeURIComponent(eventId)}`);
      } catch (error) {
        const code = error?.message || "network_failure";
        showMessage("No se pudo completar el registro. Sus datos siguen en el formulario; intente nuevamente.", "error");
        pushEvent("registration_error", { code });
        setFormBusy(false);
      }
    });
  }

  function setupThankYouTracking() {
    if (!document.body.classList.contains("thank-you-page")) return;
    const eventId = new URLSearchParams(window.location.search).get("event_id") || sessionStorage.getItem(leadEventKey) || "";
    pushEvent("thank_you_viewed", { event_id: eventId });
  }

  function setupConsentButtons() {
    consentAccept?.addEventListener("click", () => {
      saveConsent("accepted");
      if (consentBanner) consentBanner.hidden = true;
      activateMeasurement();
    });

    consentDecline?.addEventListener("click", () => {
      saveConsent("necessary_only");
      if (consentBanner) consentBanner.hidden = true;
    });
  }

  storeAttribution();
  if (!document.body.classList.contains("thank-you-page")) {
    pushEvent("landing_viewed");
  }
  setupConsent();
  setupConsentButtons();
  setupCtaTracking();
  setupFormStartTracking();
  setupRegistration();
  setupThankYouTracking();
})();
