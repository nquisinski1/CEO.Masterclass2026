(function () {
  const config = window.STEPUP_FUNNEL_CONFIG || {};
  const pageMeta = config.page || {};
  const consentBanner = document.querySelector("[data-consent-banner]");
  const consentAccept = document.querySelector("[data-consent-accept]");
  const consentDecline = document.querySelector("[data-consent-decline]");
  const consentKey = "stepup_consent_state";
  const attributionKey = "stepup_first_touch";
  const lastTouchKey = "stepup_last_touch";
  const sessionKey = "stepup_session_id";

  const dataLayer = (window.dataLayer = window.dataLayer || []);
  const pageLoadTs = Date.now();
  let experiment = null;

  function nowIso() {
    return new Date().toISOString();
  }

  function uuid() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID();
    return (
      "evt_" +
      Date.now().toString(36) +
      "_" +
      Math.random().toString(36).slice(2)
    );
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
    return (
      document.cookie
        .split("; ")
        .find((row) => row.startsWith(name + "="))
        ?.split("=")
        .slice(1)
        .join("=") || ""
    );
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
      "ad_id",
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
      creative_id: params.utm_content || "",
    };

    if (!readStoredJson(attributionKey)) {
      localStorage.setItem(attributionKey, JSON.stringify(touch));
    }
    localStorage.setItem(lastTouchKey, JSON.stringify(touch));
    return touch;
  }

  // Consent canonical store = a cookie shared across *.stepupandco.com so the
  // LP (ceo.) and the thank-you subdomain honor one choice — localStorage is
  // origin-scoped and can never cross that boundary (fix round F1).
  function consentCookieAttributes() {
    const domain = window.location.hostname.endsWith("stepupandco.com")
      ? "; Domain=.stepupandco.com"
      : "";
    return "; Path=/; Max-Age=31536000; SameSite=Lax" + domain;
  }

  function writeConsentCookie(payload) {
    document.cookie =
      consentKey +
      "=" +
      encodeURIComponent(JSON.stringify(payload)) +
      consentCookieAttributes();
  }

  function readConsentCookie() {
    const raw = getCookie(consentKey);
    if (!raw) return null;
    try {
      return JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }

  function getConsent() {
    const fromCookie = readConsentCookie();
    if (fromCookie) return fromCookie;
    const legacy = readStoredJson(consentKey);
    if (legacy) {
      // Pre-cookie visitors stored their choice in localStorage — migrate it
      // silently so the cookie becomes the single source of truth.
      writeConsentCookie(legacy);
      return legacy;
    }
    return null;
  }

  function saveConsent(state) {
    const payload = {
      status: state,
      version: config.consentVersion || "unversioned",
      timestamp: nowIso(),
    };
    writeConsentCookie(payload);
    return payload;
  }

  function getConsentState() {
    const stored = getConsent();
    if (stored?.status === "necessary_only") return "necessary_only";
    if (stored?.status === "accepted") return "accepted";
    return "granted_default";
  }

  function pushEvent(name, params = {}) {
    const base = {
      event: name,
      event_time: nowIso(),
      page_location: window.location.href,
      page_title: document.title,
      session_id: getSessionId(),
      page_id: pageMeta.pageId || "",
      offer: pageMeta.offer || "",
      build_version: pageMeta.buildVersion || "",
      consent_state: getConsentState(),
    };
    if (experiment) {
      base.experiment_id = experiment.experiment_id;
      base.variant = experiment.variant;
    }
    dataLayer.push({ ...base, ...params });
  }

  function getExperiment() {
    if (
      !pageMeta.experimentId ||
      !Array.isArray(pageMeta.variants) ||
      pageMeta.variants.length < 2
    )
      return null;
    const key = "stepup_exp_" + pageMeta.experimentId;
    let variant = localStorage.getItem(key);
    if (!variant) {
      variant =
        pageMeta.variants[Math.floor(Math.random() * pageMeta.variants.length)];
      localStorage.setItem(key, variant);
      pushEvent("experiment_exposure", {
        experiment_id: pageMeta.experimentId,
        variant,
      });
    }
    return { experiment_id: pageMeta.experimentId, variant };
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

    if (/^GTM-[A-Z0-9]+$/.test(config.gtmContainerId || "")) {
      dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
      loadScript(
        `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(config.gtmContainerId)}`,
      );
    }

    // GA4 loads via the GTM container's own GA4 Configuration tag; this direct
    // gtag path only activates if a measurement id is ever set here directly.
    if (config.ga4MeasurementId) {
      loadScript(
        `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(config.ga4MeasurementId)}`,
      );
      window.gtag = function () {
        dataLayer.push(arguments);
      };
      window.gtag("js", new Date());
      window.gtag("config", config.ga4MeasurementId, { send_page_view: false });
    }
  }

  function getCtaLocation(link) {
    if (link.classList.contains("inline-link")) return "mechanism_inline";
    if (link.closest(".hero")) return "hero";
    if (link.closest(".closing")) return "closing";
    if (link.classList.contains("mobile-cta")) return "mobile_sticky";
    if (link.classList.contains("header-cta")) return "header";
    return "body";
  }

  function setupCtaTracking() {
    document.querySelectorAll('a[href="#registro"]').forEach((link) => {
      link.addEventListener("click", () => {
        const location = getCtaLocation(link);
        pushEvent("cta_clicked", {
          location,
          cta_id: location + "_registro",
          destination: link.getAttribute("href"),
        });
      });
    });
  }

  function setupSectionTracking() {
    if (!("IntersectionObserver" in window)) return;
    const seen = new Set();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          // Tall sections can never reach ratio 0.5, so also count "fills half the viewport".
          const fillsViewport =
            entry.intersectionRect.height >= window.innerHeight * 0.5;
          if (entry.intersectionRatio < 0.5 && !fillsViewport) return;
          const id =
            entry.target.id ||
            String(entry.target.className).split(" ")[0] ||
            "section";
          if (seen.has(id)) return;
          seen.add(id);
          pushEvent("section_viewed", { section_id: id });
        });
      },
      { threshold: [0.15, 0.5] },
    );
    document
      .querySelectorAll("main > section")
      .forEach((section) => observer.observe(section));
  }

  function setupScrollDepth() {
    const fired = new Set();
    const marks = [25, 50, 75, 90];
    window.addEventListener(
      "scroll",
      () => {
        const doc = document.documentElement;
        const pct =
          ((window.scrollY + window.innerHeight) / doc.scrollHeight) * 100;
        marks.forEach((mark) => {
          if (pct >= mark && !fired.has(mark)) {
            fired.add(mark);
            pushEvent("scroll_depth", { pct: mark });
          }
        });
      },
      { passive: true },
    );
  }

  function setupWebVitals() {
    if (!("PerformanceObserver" in window)) return;
    let lcp = 0;
    let cls = 0;
    let inp = 0;
    let reported = false;

    try {
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        if (entries.length) lcp = entries[entries.length - 1].startTime;
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // LCP unsupported in this browser; other vitals still report below.
    }

    try {
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (!entry.hadRecentInput) cls += entry.value;
        });
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      // CLS unsupported in this browser; other vitals still report below.
    }

    try {
      new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          if (entry.duration > inp) inp = entry.duration;
        });
      }).observe({ type: "event", buffered: true, durationThreshold: 40 });
    } catch {
      // INP unsupported in this browser; other vitals still report below.
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState !== "hidden" || reported) return;
      reported = true;
      pushEvent("web_vitals", {
        lcp_ms: Math.round(lcp),
        cls: Math.round(cls * 1000) / 1000,
        inp_ms: Math.round(inp),
      });
    });
  }

  function setupConsentBanner() {
    // LIGHT/opt-out model (Decision A): measurement always fires on load via
    // initGtmAndGa4() above. The banner only offers a choice going forward —
    // it never gates the initial pageview.
    if (!getConsent() && consentBanner) consentBanner.hidden = false;
  }

  function setupConsentButtons() {
    consentAccept?.addEventListener("click", () => {
      pushEvent("consent_choice", {
        choice: "accepted",
        ms_to_choice: Date.now() - pageLoadTs,
      });
      saveConsent("accepted");
      if (consentBanner) consentBanner.hidden = true;
    });

    consentDecline?.addEventListener("click", () => {
      pushEvent("consent_choice", {
        choice: "necessary_only",
        ms_to_choice: Date.now() - pageLoadTs,
      });
      saveConsent("necessary_only");
      if (consentBanner) consentBanner.hidden = true;
    });
  }

  storeAttribution();
  experiment = getExperiment();
  initGtmAndGa4();
  // Guards the still-published legacy thank-you.html stub (body.thank-you-page,
  // pre-dates the GHL-iframe pivot and shares this script file) from misfiring
  // landing_viewed. The live index.html body carries no class, so this is a
  // no-op there — see 08a_CODE_PASS_EVIDENCE.md Open Question #6.
  if (!document.body.classList.contains("thank-you-page")) {
    pushEvent("landing_viewed");
  }
  setupConsentBanner();
  setupConsentButtons();
  setupCtaTracking();
  setupSectionTracking();
  setupScrollDepth();
  setupWebVitals();
})();
