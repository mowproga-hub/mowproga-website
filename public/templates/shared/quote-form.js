/* Instant quote form for the lawn care templates.
 * Same flow and pricing logic as mowproga.com's quote form (mowing, leaves,
 * hedges, brush → yard size / add-ons → live estimate → name + phone).
 * It drops itself into the page's #quote section and takes its colors,
 * fonts and corner rounding from the template it sits in, so it matches
 * each design without per-template CSS.
 *
 * Prices come from the page's UMMIYARD_SAMPLE_DATA (PRICE_SMALL/MEDIUM/LARGE
 * = the every-2-weeks mowing rate). Town pages don't carry that data, so they
 * read it from ./index.html. Everything else is derived from those three
 * numbers with the same ratios Mow Pro uses, unless the data overrides it.
 *
 * DEMO_MODE (or no QUOTE_ENDPOINT): the form shows the success screen but
 * sends nothing. With QUOTE_ENDPOINT set it POSTs the lead as JSON.
 */
(function () {
  "use strict";
  var section = document.getElementById("quote");
  if (section && section.querySelector(".uyq")) return;

  function num(v, d) {
    var n = parseFloat(String(v == null ? "" : v).replace(/[^0-9.]/g, ""));
    return isFinite(n) && n > 0 ? n : d;
  }

  function loadData() {
    if (window.UMMIYARD_SAMPLE_DATA) return Promise.resolve(window.UMMIYARD_SAMPLE_DATA);
    return fetch("./index.html")
      .then(function (r) { return r.text(); })
      .then(function (html) {
        var m = html.match(/window\.UMMIYARD_SAMPLE_DATA\s*=\s*(\{[\s\S]*?\n\});/);
        return m ? JSON.parse(m[1]) : {};
      })
      .catch(function () { return {}; });
  }

  // ---------- theme: read it off the template ----------
  function cs(el) { return el ? getComputedStyle(el) : null; }
  function rgb(str) {
    var m = String(str || "").match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    var p = m[1].split(",").map(function (s) { return parseFloat(s); });
    if (p.length > 3 && p[3] === 0) return null;
    return p.slice(0, 3);
  }
  function lum(c) {
    if (!c) return 1;
    var a = c.map(function (v) { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
    return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
  }
  function bgOf(el) {
    while (el) {
      var c = rgb(cs(el).backgroundColor);
      if (c) return c;
      el = el.parentElement;
    }
    return [255, 255, 255];
  }
  function css(c) { return "rgb(" + c.map(Math.round).join(",") + ")"; }

  function theme() {
    // The brand color = the most colorful "primary" button on the page (some
    // templates use a white primary button on dark bands, so not just the first).
    var btns = [].slice.call(document.querySelectorAll(".btn-primary, .btn.primary, .button-primary"));
    if (!btns.length) btns = [].slice.call(document.querySelectorAll("a.btn, button"));
    var btn = null, best = -1;
    btns.forEach(function (el) {
      var c = rgb(cs(el).backgroundColor);
      if (!c) return;
      var mx = Math.max.apply(null, c), mn = Math.min.apply(null, c);
      var sat = mx === 0 ? 0 : (mx - mn) / mx;
      if (sat > best + 0.05) { best = sat; btn = el; }
    });
    var b = cs(btn);
    var body = document.body;
    var pageBg = bgOf(document.querySelector("main") || body);
    var text = rgb(cs(body).color) || (lum(pageBg) < 0.3 ? [245, 245, 240] : [24, 32, 26]);
    var accent = (b && rgb(b.backgroundColor)) || rgb(cs(document.documentElement).getPropertyValue("--brand")) || [45, 122, 74];
    var accentInk = (b && rgb(b.color)) || (lum(accent) > 0.45 ? [12, 20, 14] : [255, 255, 255]);
    var card = document.querySelector(".price-card, .service-card, .review-card, article");
    var h2 = document.querySelector("h2");
    var s = {
      "--uq-bg": css(pageBg),
      "--uq-text": css(text),
      "--uq-accent": css(accent),
      "--uq-accent-ink": css(accentInk),
      "--uq-font": cs(body).fontFamily,
      "--uq-head": h2 ? cs(h2).fontFamily : cs(body).fontFamily,
      "--uq-head-weight": h2 ? cs(h2).fontWeight : "700",
      "--uq-head-transform": h2 ? cs(h2).textTransform : "none",
      "--uq-radius": card ? cs(card).borderTopLeftRadius : "16px",
      "--uq-btn-radius": b ? b.borderTopLeftRadius : "10px",
      "--uq-dark": lum(pageBg) < 0.3 ? "1" : "0",
    };
    // On dark pages a lime/yellow accent reads fine as text; on light pages a
    // pale accent would vanish, so price text uses the accent's ink instead.
    s["--uq-price"] = lum(pageBg) < 0.3 || lum(accent) < 0.35 ? css(accent) : css(text);
    return s;
  }

  // ---------- styles ----------
  var STYLE = "\
:is(#quote,#uyq-modal) .uyq{--uq-line:color-mix(in srgb,var(--uq-text) 16%,transparent);--uq-muted:color-mix(in srgb,var(--uq-text) 66%,transparent);--uq-soft:color-mix(in srgb,var(--uq-accent) 13%,var(--uq-bg));\
max-width:560px;margin:34px auto 0;background:var(--uq-bg);color:var(--uq-text)!important;font-family:var(--uq-font);border:1px solid var(--uq-line);border-radius:var(--uq-radius);padding:26px 22px;box-shadow:0 18px 50px rgba(0,0,0,.18);text-align:left}\
:is(#quote,#uyq-modal) .uyq *{box-sizing:border-box}\
:is(#quote,#uyq-modal) .uyq p,:is(#quote,#uyq-modal) .uyq b,:is(#quote,#uyq-modal) .uyq small,:is(#quote,#uyq-modal) .uyq span,:is(#quote,#uyq-modal) .uyq label,:is(#quote,#uyq-modal) .uyq strong{color:inherit!important;font-family:inherit;letter-spacing:normal;text-transform:none;opacity:1!important;text-shadow:none}\
:is(#quote,#uyq-modal) .uyq h3{opacity:1!important;text-shadow:none}\
:is(#quote,#uyq-modal) .uyq h3{font-family:var(--uq-head);font-weight:var(--uq-head-weight);text-transform:var(--uq-head-transform);font-size:24px;line-height:1.15;margin:0 0 4px;color:var(--uq-text)!important;letter-spacing:-.01em}\
:is(#quote,#uyq-modal) .uyq .uq-sub{font-size:14px;color:var(--uq-muted)!important;margin:0 0 18px}\
:is(#quote,#uyq-modal) .uyq .uq-tabs{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:16px}\
:is(#quote,#uyq-modal) .uyq button{font-family:inherit}\
:is(#quote,#uyq-modal) .uyq .uq-tab,:is(#quote,#uyq-modal) .uyq .uq-pill{border:1.5px solid var(--uq-line);background:transparent;color:var(--uq-text)!important;border-radius:var(--uq-btn-radius);padding:11px 4px;font-size:14px;font-weight:700;cursor:pointer}\
:is(#quote,#uyq-modal) .uyq .uq-tab[aria-pressed=true]{background:var(--uq-accent);border-color:var(--uq-accent);color:var(--uq-accent-ink)!important}\
:is(#quote,#uyq-modal) .uyq .uq-pills{display:flex;gap:6px}:is(#quote,#uyq-modal) .uyq .uq-pill{flex:1;padding:9px 2px;font-size:12.5px}\
:is(#quote,#uyq-modal) .uyq .uq-pill[aria-pressed=true]{border-color:var(--uq-accent);background:var(--uq-soft)}\
:is(#quote,#uyq-modal) .uyq label.uq-l{display:block;font-size:11.5px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:var(--uq-muted)!important;margin:14px 0 6px}\
:is(#quote,#uyq-modal) .uyq input.uq-in{width:100%;padding:12px 13px;border:1px solid var(--uq-line);background:color-mix(in srgb,var(--uq-text) 4%,var(--uq-bg));color:var(--uq-text)!important;font-size:15px;font-family:inherit}\
:is(#quote,#uyq-modal) .uyq input.uq-in{border-radius:12px}\
:is(#quote,#uyq-modal) .uyq input.uq-in:focus{outline:2px solid var(--uq-accent);outline-offset:1px}\
:is(#quote,#uyq-modal) .uyq .uq-note{font-size:12px;color:var(--uq-muted)!important;margin-top:6px;line-height:1.45}\
:is(#quote,#uyq-modal) .uyq .uq-opt{display:flex;justify-content:space-between;align-items:center;gap:10px;border:1.5px solid var(--uq-line);border-radius:12px;padding:11px 14px;margin-top:8px;cursor:pointer;background:transparent;width:100%;color:var(--uq-text)!important;text-align:left;font-size:inherit}\
:is(#quote,#uyq-modal) .uyq .uq-opt[aria-pressed=true]{border-color:var(--uq-accent);background:var(--uq-soft)}\
:is(#quote,#uyq-modal) .uyq .uq-opt b{display:block;font-size:14px}:is(#quote,#uyq-modal) .uyq .uq-opt small{display:block;font-size:12px;color:var(--uq-muted)!important;margin-top:1px}\
:is(#quote,#uyq-modal) .uyq .uq-opt .uq-p{font-weight:800;font-size:14px;color:var(--uq-price)!important;white-space:nowrap}\
:is(#quote,#uyq-modal) .uyq .uq-chk{display:flex;align-items:center;gap:10px}\
:is(#quote,#uyq-modal) .uyq .uq-box{width:18px;height:18px;border-radius:5px;border:1.5px solid var(--uq-muted);flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:12px;line-height:1}\
:is(#quote,#uyq-modal) .uyq .uq-opt[aria-pressed=true] .uq-box{background:var(--uq-accent);border-color:var(--uq-accent);color:var(--uq-accent-ink)!important}\
:is(#quote,#uyq-modal) .uyq .uq-info{font-size:12.5px;line-height:1.5;color:var(--uq-muted)!important;background:var(--uq-soft);border-radius:12px;padding:10px 12px;margin-top:12px}\
:is(#quote,#uyq-modal) .uyq .uq-price{margin-top:18px;border-radius:14px;padding:16px;text-align:center;background:var(--uq-soft);border:1px solid color-mix(in srgb,var(--uq-accent) 35%,transparent)}\
:is(#quote,#uyq-modal) .uyq .uq-price small{display:block;font-size:11.5px;letter-spacing:.06em;text-transform:uppercase;color:var(--uq-muted)!important}\
:is(#quote,#uyq-modal) .uyq .uq-price strong{display:block;font-family:var(--uq-head);font-size:34px;line-height:1.15;color:var(--uq-price)!important}\
:is(#quote,#uyq-modal) .uyq .uq-price span{display:block;font-size:12.5px;color:var(--uq-muted)!important;margin-top:2px}\
:is(#quote,#uyq-modal) .uyq .uq-consent{display:flex;gap:10px;align-items:flex-start;font-size:12px;line-height:1.5;color:var(--uq-muted)!important;margin-top:14px;cursor:pointer}\
:is(#quote,#uyq-modal) .uyq .uq-consent input{width:19px;height:19px;margin-top:1px;flex-shrink:0;accent-color:var(--uq-accent)}\
:is(#quote,#uyq-modal) .uyq .uq-go{width:100%;margin-top:16px;border:0;border-radius:var(--uq-btn-radius);background:var(--uq-accent);color:var(--uq-accent-ink)!important;padding:15px;font-size:16px;font-weight:800;cursor:pointer;font-family:var(--uq-font)}\
:is(#quote,#uyq-modal) .uyq .uq-go[disabled]{opacity:.5;cursor:default}\
:is(#quote,#uyq-modal) .uyq .uq-steps{display:flex;gap:6px;margin:0 0 18px}\
:is(#quote,#uyq-modal) .uyq .uq-steps i{flex:1;height:4px;border-radius:99px;background:var(--uq-line)}\
:is(#quote,#uyq-modal) .uyq .uq-steps i.on{background:var(--uq-accent)}\
:is(#quote,#uyq-modal) .uyq .uq-back{border:0;background:none;padding:0 0 10px;font-size:13.5px;font-weight:700;cursor:pointer;color:var(--uq-muted)!important}\
:is(#quote,#uyq-modal) .uyq [hidden]{display:none!important}\
:is(#quote,#uyq-modal) .uyq .uq-err{font-size:12.5px;color:#d9534f!important;margin-top:8px}\
:is(#quote,#uyq-modal) .uyq .uq-priv{font-size:12px;color:var(--uq-muted)!important;text-align:center;margin:10px 0 0}\
:is(#quote,#uyq-modal) .uyq .uq-done{text-align:center;padding:18px 0}:is(#quote,#uyq-modal) .uyq .uq-done .uq-check{width:52px;height:52px;border-radius:50%;margin:0 auto 12px;background:var(--uq-accent);color:var(--uq-accent-ink)!important;display:flex;align-items:center;justify-content:center;font-size:26px;font-weight:800}\
:is(#quote,#uyq-modal) .uyq .uq-demo{display:inline-block;margin-top:10px;font-size:11.5px;font-weight:800;background:#FCE9A8;color:#5a4300!important;border-radius:6px;padding:3px 8px}\
@media(max-width:420px){:is(#quote,#uyq-modal) .uyq{padding:22px 16px}:is(#quote,#uyq-modal) .uyq .uq-tabs{grid-template-columns:repeat(2,1fr)}}\
\
#uyq-modal{position:fixed;inset:0;z-index:9999;background:rgba(5,8,6,.72);display:flex;align-items:flex-start;justify-content:center;padding:16px;overflow-y:auto;-webkit-overflow-scrolling:touch}\
#uyq-modal .uyq{position:relative;margin:24px auto;width:100%;max-width:460px}\
#uyq-modal .uq-steps{margin-right:40px!important;margin-top:6px!important}\
#uyq-modal .uq-x{position:absolute;top:10px;right:10px;width:36px;height:36px;border-radius:50%;border:0;background:transparent;color:var(--uq-text);font-size:24px;line-height:1;cursor:pointer;opacity:.7}\
body.uyq-lock{overflow:hidden}\
.price-card.uyq-clickable{cursor:pointer;transition:transform .15s ease}\
.price-card.uyq-clickable:hover{transform:translateY(-2px)}\
.price-card.uyq-clickable:focus-visible{outline:2px solid currentColor;outline-offset:3px}\
";

  // ---------- brand glow ----------
  // mowproga.com's signature look: key pieces get a thin border in the brand
  // color plus a soft glow of the same color. Applied here to the before/after
  // slider, the featured price card, the add-ons box, the owner photo and the
  // quote form, using whatever brand color this template uses.
  function applyGlow(t) {
    var c = (t["--uq-accent"].match(/\d+(\.\d+)?/g) || [45, 122, 74]).slice(0, 3).join(",");
    var dark = t["--uq-dark"] === "1";
    var a1 = dark ? 0.16 : 0.22, a2 = dark ? 0.3 : 0.32;
    var g = "0 0 28px rgba(" + c + "," + a1 + ")";
    var g2 = "0 0 0 1px rgba(" + c + ",.18),0 8px 30px rgba(" + c + "," + a2 + ")";
    var css =
      ".compare,.story-photo,.about__photo{border:1.5px solid rgb(" + c + ")!important;box-shadow:" + g + "!important}" +
      ".price-card:nth-child(2){border:2px solid rgb(" + c + ")!important;box-shadow:" + g2 + "!important}" +
      ".addons{border:1.5px solid rgba(" + c + ",.7)!important;box-shadow:" + g + "!important}" +
      ":is(#quote,#uyq-modal) .uyq{border:1.5px solid rgb(" + c + ")!important;box-shadow:0 0 34px rgba(" + c + "," + (a1 + 0.04) + ")!important}" +
      ":is(#quote,#uyq-modal) .uyq .uq-price{border:1.5px solid rgb(" + c + ")!important;box-shadow:0 0 22px rgba(" + c + "," + a1 + ")!important}" +
      ":is(#quote,#uyq-modal) .uyq .uq-tab[aria-pressed=true]{box-shadow:0 0 20px rgba(" + c + "," + (a2 - 0.05) + ")}";
    var el = document.createElement("style");
    el.id = "uy-brand-glow";
    el.textContent = css;
    document.head.appendChild(el);
  }

  // ---------- pricing ----------
  function pricing(d) {
    var s = num(d.PRICE_SMALL, 65), m = num(d.PRICE_MEDIUM, 75), l = num(d.PRICE_LARGE, 85);
    var r = function (x) { return Math.round(x); };
    var mow = {
      Weekly: { small: r(s * 0.85), medium: r(m * 0.87), large: r(l * 0.88) },
      Biweekly: { small: s, medium: m, large: l },
      Monthly: { small: s * 2, medium: m * 2, large: l * 2 },
      "One-time": { small: r(s * 1.6), medium: r(m * 1.6), large: r(l * 1.6) },
    };
    ["Weekly", "Biweekly", "Monthly", "One-time"].forEach(function (k) { mow[k].xl = null; });
    var unit = s / 65; // scale add-ons to the template's market
    var rr = function (x) { return Math.max(5, Math.round((x * unit) / 5) * 5); };
    return {
      mow: mow,
      leaf: { small: num(d.LEAF_SMALL, rr(127)), medium: num(d.LEAF_MEDIUM, rr(187)), large: num(d.LEAF_LARGE, rr(287)), xl: null },
      firstCut: num(d.FIRST_CUT_FEE, rr(25)),
      crack: num(d.CRACK_SPRAY_PRICE, rr(25)),
      edge: num(d.EDGE_RESTORE_PRICE, rr(50)),
      hedge: [
        { key: "h1", label: "1 – 6 shrubs", sub: "Small job · minimum visit", price: rr(100), max: 6 },
        { key: "h2", label: "7 – 12 shrubs", sub: "Medium job", price: rr(200), max: 12 },
        { key: "h3", label: "13 – 25 shrubs", sub: "Large job", price: rr(350), max: 25 },
        { key: "h4", label: "25+ shrubs or long hedge rows", sub: "Needs an on-site look", price: null, max: 0 },
      ],
      hedgeTall: rr(40), hedgeHaul: rr(40),
      brush: [
        { key: "b1", label: "Overgrown fence line or ditch", sub: "Tall grass & weeds outside the mowed lawn · up to ~150 ft", price: rr(75) },
        { key: "b2", label: "Small brushy area", sub: "Vines, briars, small saplings · about 10 × 50 ft", price: rr(150) },
        { key: "b3", label: "Medium brushy area", sub: "About 20 × 100 ft, like a grown-in fence line", price: rr(300) },
        { key: "b4", label: "Large area or wooded lot", sub: "Bigger than that, or trees over 3 in. thick", price: null },
      ],
      brushHaul: rr(75),
    };
  }

  var SIZES = [
    { key: "small", label: "Small yard", sub: "Under 5,000 sq ft" },
    { key: "medium", label: "Medium yard", sub: "5,000 – 10,000 sq ft" },
    { key: "large", label: "Large yard", sub: "10,000 – 20,000 sq ft" },
    { key: "xl", label: "Extra large / acreage", sub: "Over 20,000 sq ft" },
  ];
  var FREQS = [["Weekly", "Weekly"], ["Biweekly", "Every 2 wks"], ["Monthly", "Monthly"], ["One-time", "One-time"]];
  var SERVICES = [["mowing", "Mowing"], ["leaf", "Leaves"], ["hedge", "Hedges"], ["brush", "Brush"]];

  function esc(t) { return String(t == null ? "" : t).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function money(n) { return "$" + n + "+"; }

  var D = {}, THEME = null;

  function mount(d) {
    D = d;
    var styleEl = document.createElement("style");
    styleEl.textContent = STYLE;
    document.head.appendChild(styleEl);
    THEME = theme();
    applyGlow(THEME);
    footerTheme(THEME);
    wirePriceCards();
    wireQuoteLinks();
  }

  // Clicking a price card opens the quote form in a pop-up with that yard
  // size already picked, same as mowproga.com.
  function wirePriceCards() {
    var cards = [].slice.call(document.querySelectorAll(".price-card"));
    var sizes = ["small", "medium", "large", "xl"];
    cards.forEach(function (card, i) {
      var size = sizes[Math.min(i, 3)];
      card.classList.add("uyq-clickable");
      card.setAttribute("role", "button");
      card.setAttribute("tabindex", "0");
      card.setAttribute("aria-label", "Get a quote for a " + size + " yard");
      var go = function (e) {
        if (e.target.closest("a")) e.preventDefault();
        openModal({ svc: "mowing", size: size });
      };
      card.addEventListener("click", go);
      card.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(e); } });
    });
  }

  // Every "get a quote" button/link on the page opens the pop-up instead of
  // jumping somewhere. The form never sits open on the page.
  function wireQuoteLinks() {
    document.addEventListener("click", function (e) {
      var a = e.target.closest("a, button");
      if (!a || a.closest("#uyq-modal")) return;
      var href = a.getAttribute("href") || "";
      if (/^(tel|mailto|sms):/i.test(href)) return;
      var isQuote = a.hasAttribute("data-quote-open") || /#quote$/.test(href) || /\bquote\b/i.test(a.textContent || "");
      if (!isQuote) return;
      e.preventDefault();
      openModal({});
    }, true);
  }

  // Colors for the shared end-of-page block (site-end.css): a dark footer
  // tinted with the brand color, and a button color that stays readable on it.
  function footerTheme(t) {
    var root = document.documentElement;
    Object.keys(t).forEach(function (k) { root.style.setProperty(k, t[k]); });
    var acc = (t["--uq-accent"].match(/\d+(\.\d+)?/g) || [45, 122, 74]).slice(0, 3).map(Number);
    var mix = function (c1, c2, w) { return c1.map(function (v, i) { return v * w + c2[i] * (1 - w); }); };
    var bg = t["--uq-dark"] === "1" ? (t["--uq-bg"].match(/\d+(\.\d+)?/g) || [13, 21, 16]).slice(0, 3).map(Number) : mix(acc, [10, 13, 11], 0.22);
    // Dark brand colors get brightened a little so the button stands out on
    // the dark footer; the text on it is whichever of white/near-black reads better.
    var btn = lum(acc) < 0.12 ? mix(acc, [255, 255, 255], 0.75) : acc;
    var L = lum(btn), cw = 1.05 / (L + 0.05), cd = (L + 0.05) / (lum([11, 20, 13]) + 0.05);
    var ink = cd > cw ? [11, 20, 13] : [255, 255, 255];
    root.style.setProperty("--uqf-bg", css(bg));
    root.style.setProperty("--uqf-btn", css(btn));
    root.style.setProperty("--uqf-btn-ink", css(ink));
  }

  function openModal(preset) {
    closeModal();
    var ov = document.createElement("div");
    ov.id = "uyq-modal";
    ov.setAttribute("role", "dialog");
    ov.setAttribute("aria-modal", "true");
    ov.setAttribute("aria-label", "Get your instant quote");
    document.body.appendChild(ov);
    document.body.classList.add("uyq-lock");
    var box = makeForm(ov, preset, true);
    ov.addEventListener("click", function (e) { if (e.target === ov || e.target.closest(".uq-x")) closeModal(); });
    document.addEventListener("keydown", escClose);
    var first = box.querySelector("#uq-addr");
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 50);
  }
  function escClose(e) { if (e.key === "Escape") closeModal(); }
  function closeModal() {
    var ov = document.getElementById("uyq-modal");
    if (ov) ov.remove();
    document.body.classList.remove("uyq-lock");
    document.removeEventListener("keydown", escClose);
  }

  function makeForm(host, preset, inModal) {
    var d = D;
    var P = pricing(d);
    var biz = d.BUSINESS_NAME || "our team";
    var st = { svc: "mowing", address: "", freq: "Biweekly", size: "medium", crack: false, over: "none", edge: false, heavyTrees: false, hedge: "h1", tall: 0, hedgeOver10: false, hedgeOvergrown: false, hedgeHaul: false, brush: "b1", brushHaul: false, name: "", phone: "", textOk: false, done: false, err: "", step: 1 };
    Object.keys(preset || {}).forEach(function (k) { st[k] = preset[k]; });

    var box = document.createElement("div");
    box.className = "uyq";
    Object.keys(THEME).forEach(function (k) { box.style.setProperty(k, THEME[k]); });
    host.appendChild(box);

    function calc() {
      var isMow = st.svc === "mowing", isLeaf = st.svc === "leaf", isHedge = st.svc === "hedge", isBrush = st.svc === "brush";
      var recurring = st.freq !== "One-time";
      var overMild = isMow && st.over === "mild" && st.freq !== "Monthly";
      var hedge = P.hedge.filter(function (h) { return h.key === st.hedge; })[0];
      var brush = P.brush.filter(function (b) { return b.key === st.brush; })[0];
      var tall = Math.min(st.tall, hedge.max);
      var custom = isHedge ? hedge.price === null : isBrush ? brush.price === null : isLeaf ? P.leaf[st.size] === null : P.mow[st.freq][st.size] === null;
      var needsCustom = custom || (isMow && st.over === "severe") || (isLeaf && st.heavyTrees) || (isHedge && (st.hedgeOver10 || st.hedgeOvergrown));
      var normal = P.mow[st.freq][st.size] || 0;
      var overPrice = (st.freq === "One-time" ? P.mow.Biweekly[st.size] || 0 : normal) * 2;
      var first = isMow && recurring && !overMild ? P.firstCut : 0;
      var price = needsCustom ? null
        : isHedge ? hedge.price + tall * P.hedgeTall + (st.hedgeHaul ? P.hedgeHaul : 0)
        : isBrush ? brush.price + (st.brushHaul ? P.brushHaul : 0)
        : isLeaf ? P.leaf[st.size]
        : (overMild ? overPrice : normal + first) + (st.crack ? P.crack : 0) + (st.edge ? P.edge : 0);
      return { isMow: isMow, isLeaf: isLeaf, isHedge: isHedge, isBrush: isBrush, recurring: recurring, overMild: overMild, hedge: hedge, brush: brush, tall: tall, custom: custom, needsCustom: needsCustom, normal: normal, overPrice: overPrice, price: price, firstVisit: isMow && recurring && !needsCustom };
    }

    function opt(attr, on, title, sub, right, check) {
      return '<button type="button" class="uq-opt" ' + attr + ' aria-pressed="' + (on ? "true" : "false") + '">' +
        (check ? '<span class="uq-chk"><span class="uq-box">' + (on ? "✓" : "") + "</span>" : "<span>") +
        "<span><b>" + esc(title) + "</b>" + (sub ? "<small>" + esc(sub) + "</small>" : "") + "</span></span>" +
        '<span class="uq-p">' + esc(right) + "</span></button>";
    }

    function render() {
      var c = calc();
      var X = inModal ? '<button type="button" class="uq-x" aria-label="Close">×</button>' : "";
      if (st.done) {
        box.innerHTML = X + '<div class="uq-done"><div class="uq-check">✓</div><h3>Quote request sent!</h3><p class="uq-sub" style="margin:6px 0 0">' +
          esc(biz) + " will text or call you shortly" + (c.needsCustom ? " with custom pricing for your property." : " to confirm your " + money(c.price) + " estimate.") + "</p>" +
          (isDemo() ? '<span class="uq-demo">Sample site · this demo form doesn’t send anything</span>' : "") + "</div>";
        return;
      }
      var h = [];
      h.push('<div class="uq-steps" aria-label="Step ' + st.step + ' of 2"><i class="on"></i><i' + (st.step === 2 ? ' class="on"' : "") + "></i></div>");
      if (st.step === 1) {
      h.push("<h3>Get your instant quote</h3>");
      h.push('<p class="uq-sub">' + (c.isHedge ? "Enter your address and how many shrubs need trimming." : c.isBrush ? "Enter your address and how big the overgrown area is." : "Enter your address and pick your yard size to see your price.") + "</p>");
      h.push('<div class="uq-tabs" role="group" aria-label="Service">' + SERVICES.map(function (s) {
        return '<button type="button" class="uq-tab" data-svc="' + s[0] + '" aria-pressed="' + (st.svc === s[0]) + '">' + s[1] + "</button>";
      }).join("") + "</div>");
      h.push('<label class="uq-l" for="uq-addr">Property address</label><input class="uq-in" id="uq-addr" data-f="address" autocomplete="street-address" placeholder="Street address, city" value="' + esc(st.address) + '">');

      if (c.isMow) {
        h.push('<label class="uq-l">How often?</label><div class="uq-pills">' + FREQS.map(function (f) {
          return '<button type="button" class="uq-pill" data-freq="' + f[0] + '" aria-pressed="' + (st.freq === f[0]) + '">' + f[1] + "</button>";
        }).join("") + '</div><div class="uq-note">Prices are per visit. More frequent cuts cost less per visit because the grass never gets as tall.</div>');
      }
      if (c.isMow || c.isLeaf) {
        h.push('<label class="uq-l">Yard size</label>');
        if (c.isMow) h.push('<div class="uq-note" style="margin:-2px 0 2px">Mowing, edging, trimming & blow-off all included</div>');
        SIZES.forEach(function (o) {
          var p = c.isLeaf ? P.leaf[o.key] : P.mow[st.freq][o.key];
          h.push(opt('data-size="' + o.key + '"', st.size === o.key, o.label, o.sub, p === null ? "Custom" : money(p), false));
        });
      }
      if (c.isMow && !c.custom) {
        if (c.recurring && !c.overMild) h.push('<div class="uq-note" style="margin-top:12px">Your first visit includes a one-time ' + money(P.firstCut) + " first-cut fee: the first cut takes longer to set clean edges and learn your yard.</div>");
        h.push(opt('data-t="crack"', st.crack, "Sidewalk & driveway crack spray", "Weed-free walkways and driveway edges", "+" + money(P.crack), true));
        h.push('<label class="uq-l">Yard condition (if overgrown)</label>');
        if (st.freq !== "Monthly") h.push(opt('data-over="mild"', st.over === "mild", "A few weeks overgrown", c.recurring ? "First cut only, extra passes needed" : "Extra passes needed", money(c.overPrice), true));
        h.push(opt('data-over="severe"', st.over === "severe", "Very overgrown", "Grass over 12 inches tall", "Custom", true));
        h.push(opt('data-t="edge"', st.edge, "Edge restoration", "Grass grown fully over the sidewalk/driveway edge", "+" + money(P.edge), true));
      }
      if (c.isLeaf && !c.custom) {
        h.push(opt('data-t="heavyTrees"', st.heavyTrees, "Heavy tree coverage", "Lots of mature trees — needs an on-site look", "Custom", true));
      }
      if (c.isHedge) {
        h.push('<label class="uq-l">How many shrubs?</label>');
        P.hedge.forEach(function (o) { h.push(opt('data-hedge="' + o.key + '"', st.hedge === o.key, o.label, o.sub, o.price === null ? "Custom" : money(o.price), false)); });
        if (c.hedge.price !== null) {
          h.push('<label class="uq-l">Shrubs 6–10 ft tall (ladder work)</label><div class="uq-pills">');
          for (var i = 0; i <= Math.min(c.hedge.max, 6); i++) h.push('<button type="button" class="uq-pill" data-tall="' + i + '" aria-pressed="' + (c.tall === i) + '">' + (i === 6 && c.hedge.max > 6 ? "6+" : i) + "</button>");
          h.push('</div><div class="uq-note">+' + money(P.hedgeTall) + " each</div>");
          h.push(opt('data-t="hedgeOver10"', st.hedgeOver10, "Any shrubs over 10 ft tall", "Closer to tree work — needs an on-site look", "Custom", true));
          h.push(opt('data-t="hedgeOvergrown"', st.hedgeOvergrown, "Badly overgrown", "Hasn't been trimmed in a year or more", "Custom", true));
          h.push(opt('data-t="hedgeHaul"', st.hedgeHaul, "Haul away clippings", "Bagged and removed (default is piled on-site)", "+" + money(P.hedgeHaul), true));
        }
      }
      if (c.isBrush) {
        h.push('<div class="uq-info"><b>Already in a regular cut:</b> trimming around everything in your mowed lawn.<br><b>This is for:</b> areas outside the mowed lawn, growth over a foot tall, and woody stuff like vines, briars and saplings.</div>');
        h.push('<label class="uq-l">How big is the area?</label>');
        P.brush.forEach(function (o) { h.push(opt('data-brush="' + o.key + '"', st.brush === o.key, o.label, o.sub, o.price === null ? "Custom" : money(o.price), false)); });
        if (c.brush.price !== null) h.push(opt('data-t="brushHaul"', st.brushHaul, "Haul away debris", "Cut brush loaded up and removed (default is piled on-site)", "+" + money(P.brushHaul), true));
      }

        var ok1 = !!st.address.trim();
        h.push('<button type="button" class="uq-go" data-next' + (ok1 ? "" : " disabled") + ">Continue →</button>");
        h.push('<p class="uq-priv" data-hint' + (ok1 ? " hidden" : "") + ">Enter your property address to continue</p>");
      } else {
      h.push('<button type="button" class="uq-back" data-back>← Back</button>');
      h.push("<h3>Almost done</h3>");
      h.push('<p class="uq-sub">Here\'s your estimate for this property.</p>');

      // live price
      if (c.needsCustom) {
        h.push('<div class="uq-price"><small>' + (c.isHedge ? "Your hedges" : "Your property") + '</small><strong style="font-size:22px">Custom quote needed</strong><span>We\'ll look at your property and follow up with pricing</span></div>');
      } else {
        var then = "";
        if (c.firstVisit) {
          var per = st.freq === "Weekly" ? "about " + money(c.normal * 4) + " a month" : st.freq === "Biweekly" ? "about " + money(c.normal * 2) + " a month" : "once a month";
          then = "<span>Then " + money(c.normal) + " per visit (" + per + ")</span>";
        }
        h.push('<div class="uq-price"><small>' + (c.firstVisit ? "First visit" : "Estimated price") + "</small><strong>" + money(c.price) + "</strong>" + then + "<span>Final price confirmed once we see the property</span></div>");
      }

      h.push('<label class="uq-l" for="uq-name">Your name</label><input class="uq-in" id="uq-name" data-f="name" autocomplete="name" placeholder="Full name" value="' + esc(st.name) + '">');
      h.push('<label class="uq-l" for="uq-phone">Phone number</label><input class="uq-in" id="uq-phone" data-f="phone" type="tel" autocomplete="tel" placeholder="(555) 000-0000" value="' + esc(st.phone) + '">');
      h.push('<label class="uq-consent"><input type="checkbox" data-f="textOk"' + (st.textOk ? " checked" : "") + "><span>I agree to get texts from " + esc(biz) + " about my quote and service. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.</span></label>");
      var ready = st.name.trim() && st.phone.trim();
      h.push('<button type="button" class="uq-go" data-go' + (ready ? "" : " disabled") + ">Request This Quote →</button>");
      if (st.err) h.push('<div class="uq-err">' + esc(st.err) + "</div>");
      h.push('<p class="uq-priv">🔒 Your information is only used to provide your quote.</p>');
      }
      box.innerHTML = X + h.join("");
    }

    function isDemo() { return d.DEMO_MODE !== false || !d.QUOTE_ENDPOINT; }

    function submit() {
      var c = calc();
      var lead = { name: st.name, phone: st.phone, address: st.address, service: st.svc, frequency: c.isMow ? st.freq : undefined, size: st.size, price: c.needsCustom ? "Custom quote needed" : money(c.price), textConsent: st.textOk, source: location.pathname };
      if (isDemo()) { st.done = true; render(); return; }
      var go = box.querySelector("[data-go]");
      if (go) { go.disabled = true; go.textContent = "Sending…"; }
      fetch(d.QUOTE_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(lead) })
        .then(function () { st.done = true; render(); })
        .catch(function () { st.err = "Couldn't send — please call us instead."; render(); });
    }

    // Typing updates state without re-rendering (keeps focus); clicks re-render.
    box.addEventListener("input", function (e) {
      var f = e.target.getAttribute("data-f");
      if (!f) return;
      st[f] = e.target.type === "checkbox" ? e.target.checked : e.target.value;
      var go = box.querySelector("[data-go]");
      if (go) go.disabled = !(st.name.trim() && st.phone.trim());
      var next = box.querySelector("[data-next]"), hint = box.querySelector("[data-hint]");
      if (next) next.disabled = !st.address.trim();
      if (hint) hint.hidden = !!st.address.trim();
    });
    box.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b || !box.contains(b) || b.classList.contains("uq-x")) return;
      if (b.hasAttribute("data-go")) return submit();
      if (b.hasAttribute("data-next") || b.hasAttribute("data-back")) {
        st.step = b.hasAttribute("data-next") ? 2 : 1;
        render();
        var top = box.getBoundingClientRect().top;
        if (top < 0 || top > window.innerHeight * 0.5) box.scrollIntoView({ block: "start" });
        if (st.step === 2) { var nm = box.querySelector("#uq-name"); if (nm) nm.focus({ preventScroll: true }); }
        return;
      }
      var a;
      if ((a = b.getAttribute("data-svc"))) st.svc = a;
      else if ((a = b.getAttribute("data-freq"))) { st.freq = a; if (a === "Monthly" && st.over === "mild") st.over = "none"; }
      else if ((a = b.getAttribute("data-size"))) st.size = a;
      else if ((a = b.getAttribute("data-over"))) st.over = st.over === a ? "none" : a;
      else if ((a = b.getAttribute("data-hedge"))) { st.hedge = a; }
      else if ((a = b.getAttribute("data-tall")) !== null) st.tall = +a;
      else if ((a = b.getAttribute("data-brush"))) st.brush = a;
      else if ((a = b.getAttribute("data-t"))) st[a] = !st[a];
      else return;
      render();
    });

    render();
    return box;
  }

  function start() { loadData().then(mount); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
  else start();
})();
