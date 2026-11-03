import { useState, useEffect, useRef } from "react";
import {
  NEIGHBORHOODS, getNeighborhood, placeLabel, titleLabel, neighborhoodTitle, neighborhoodDescription, leafRuleText, leafServiceText,
  LEAF_PRICE_ROWS, LEAF_REMOVAL_SEO, LEAF_REMOVAL_INTRO, LEAF_REMOVAL_WHY, LEAF_REMOVAL_OPTIONS, LEAF_LOCAL_RULES, LEAF_REMOVAL_FAQ,
  FALL_CLEANUP_SEO, LEAF_PAGE_PHOTOS, FALL_PAGE_PHOTOS,
} from "./siteData.js";
import { Star, CheckCircle2, Phone, MapPin, ArrowRight, Scissors, Sprout, Wind, Upload, X, Plus, Trash2, MessageCircle, Send, ExternalLink, Leaf, ShieldCheck, CalendarCheck, CalendarDays, Zap, Menu, FileText, SprayCan, Shrub, Trees, Tractor, ChevronDown, Truck, Image as ImageIcon } from "lucide-react";

// g.page/r/{id}/review is Google's write-a-review shortlink — it drops
// visitors straight into a blank star-rating form, not a reviews list. It's
// the right link for a "leave us a review" CTA, but wrong for anything
// claiming to show existing reviews. This is the correct read-only link: a
// Maps search-action URL (Google's documented format for opening a specific
// listing by name+address without needing a Place ID) that lands on the
// business's Maps listing with its real rating and reviews visible.
const GOOGLE_REVIEWS_URL = "https://www.google.com/maps/search/?api=1&query=Mow+Pro+Lawn+Care+LLC%2C+1695+Hampton+Pass%2C+Douglasville%2C+GA+30134";

// Replace with your real Measurement ID from analytics.google.com (looks like "G-XXXXXXXXXX").
const GA_MEASUREMENT_ID = "G-RG2D6LV1ZL";

function loadGoogleAnalytics() {
  if (typeof window === "undefined" || window.gtag || GA_MEASUREMENT_ID === "G-XXXXXXXXXX") return;
  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  script.async = true;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", GA_MEASUREMENT_ID);
}

function trackEvent(name, params) {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", name, params || {});
  }
}

// Captures where a visitor came from (Nextdoor, Google, etc.) so it can be
// stamped on the lead email — no need to check Google Analytics to know
// where a customer found you. Reads ?utm_source (or a plain ?ref= for
// quick manual tagging) on first landing and stashes it in sessionStorage,
// so it survives even if they browse a few pages before requesting a quote.
// Only overwrites what's stored if the URL actually carries a new tag, so a
// later untagged pageview in the same session doesn't erase the original
// source.
function captureLeadSource() {
  if (typeof window === "undefined") return;
  try {
    const params = new URLSearchParams(window.location.search);
    let source = params.get("utm_source") || params.get("ref");
    // No tag? Fall back to the referring site (e.g. yelp.com, nextdoor.com),
    // since some listings like Yelp don't allow tracking URLs.
    if (!source && document.referrer) {
      try {
        const host = new URL(document.referrer).hostname.replace(/^www\./, "").replace(/^m\./, "");
        if (host && host !== window.location.hostname.replace(/^www\./, "")) source = `referral: ${host}`;
      } catch (e) { /* bad referrer — ignore */ }
    }
    if (source && !(sessionStorage.getItem("mp_lead_source") && source.startsWith("referral:"))) {
      sessionStorage.setItem("mp_lead_source", source);
    }
  } catch (e) {
    // sessionStorage can throw in some private-browsing modes — fine to skip
  }
}

function getLeadSource() {
  if (typeof window === "undefined") return "Website (no source tag)";
  try {
    return sessionStorage.getItem("mp_lead_source") || "Website (no source tag)";
  } catch (e) {
    return "Website (no source tag)";
  }
}

// Homepage FAQ — mirrored by hand in index.html (the crawler fallback <dl>
// and the FAQPage JSON-LD). Keep all three in sync when editing.
const HOME_FAQ = [
  {
    "q": "How much does lawn mowing cost in Douglasville, GA?",
    "a": "Every-2-weeks mowing starts at $65+ per visit for small yards (under 5,000 sq ft), $75+ for medium yards (5,000–10,000 sq ft), and $85+ for large yards (10,000–20,000 sq ft). Weekly service is $55+/$65+/$75+, monthly is $130+/$150+/$170+, and a one-time cut is $105+/$120+/$135+. New recurring customers have a one-time $25+ first-cut fee. Acreage over 20,000 sq ft gets a custom quote."
  },
  {
    "q": "What's included in every biweekly visit?",
    "a": "Every visit includes mowing, edging, weed eating along fence lines and obstacles, and blowing debris off your driveway and walkways. Hedge and shrub trimming (starting at $100) and crack weed spraying are available as add-ons."
  },
  {
    "q": "Which areas do you serve?",
    "a": "We serve Douglasville, GA (30134 and 30135) and nearby areas including Stewarts Mill, Shallowford Heights, Springwood Village, the Big A / Highway 166 area, Lithia Springs, Villa Rica, and Powder Springs. We service non-gated residential neighborhoods."
  },
  {
    "q": "Do I need to be home for service?",
    "a": "No — as long as the yard is accessible, you don't need to be there. We'll take care of it and you'll see the difference when you're back."
  },
  {
    "q": "What if it rains on my scheduled day?",
    "a": "We'll reach out to reschedule for the next dry day — no need to call and check, we'll handle it."
  },
  {
    "q": "Is there a contract?",
    "a": "No. Biweekly service, cancel anytime — no long-term commitment required."
  },
  {
    "q": "What if my lawn is overgrown?",
    "a": "The first cut on an overgrown lawn is priced at 2x the normal cut, covering the first 2 hours, then $55/hr after that. Restoring edges that have grown over sidewalks or driveways starts at $50. We confirm everything on your quote before any work starts."
  },
  {
    "q": "Do you do fall leaf cleanup?",
    "a": "Yes. Fall cleanup includes leaf removal, bed cleanout, and debris removal, with leaf removal starting at $130 for small yards. See our Fall Cleanup page for details and pricing."
  },
  {
    "q": "Is Mow Pro insured?",
    "a": "Yes. Mow Pro Lawn Care LLC is a registered Georgia business and carries general liability insurance."
  },
  {
    "q": "How can I pay?",
    "a": "We accept Zelle, Cash App, debit or credit card through an emailed invoice, and cash."
  },
  {
    "q": "How accurate is the instant quote?",
    "a": "It's a real starting estimate based on your yard size and what you tell us — we confirm the final price once we see the property in person, so there are no surprises."
  }
];

const DEFAULT_CONTENT = {
  headline: "Biweekly Lawn Mowing in Douglasville, GA",
  subheading: "Your yard, handled. Reliable mowing, edging, and cleanup from a local, family-run crew. Same-day quotes. Fast response. No contracts.",
  phone: "4046696945",
  serviceArea: "SERVING DOUGLASVILLE & SURROUNDING AREAS",
  price: "75",
  ratingLine: "5.0 stars · 65 reviews on Google",
  reviews: [
    { name: "Kelsey Mckay", stars: 5, screenshot: "/images/kelsey-mckay.webp", w: 800, h: 424 },
    { name: "Al", stars: 5, screenshot: "/images/al.webp", w: 800, h: 699 },
    { name: "Jamar Chappell", stars: 5, screenshot: "/images/jamar-chappell.webp", w: 800, h: 456 },
    { name: "Yolanda Le Fridge", stars: 5, screenshot: "/images/yolanda-le-fridge.webp", w: 800, h: 385 },
    { name: "P Hall", stars: 5, screenshot: "/images/p-hall.webp", w: 800, h: 353 },
    { name: "Skip Allen", stars: 5, screenshot: "/images/skip-allen.webp", w: 800, h: 656 },
    { name: "Lisa Banks", stars: 5, screenshot: "/images/lisa-banks.webp", w: 800, h: 518 },
    { name: "Dolly Johnson (Marlene)", stars: 5, screenshot: "/images/dolly-johnson.webp", w: 800, h: 407 },
    { name: "Ninti Chance", stars: 5, screenshot: "/images/ninti-chance.webp", w: 800, h: 837 },
    { name: "Toni Vasser", stars: 5, screenshot: "/images/toni-vasser.webp", w: 800, h: 570 },
    { name: "Jtillthebeast (Jimmy)", stars: 5, screenshot: "/images/jimmy-t.webp", w: 800, h: 303 },
    { name: "Tamekia Davis", stars: 5, screenshot: "/images/tamekia-davis.webp", w: 800, h: 444 },
    { name: "Courtney", stars: 5, screenshot: "/images/courtney.webp", w: 800, h: 481 },
    { name: "Joyce Hampton", stars: 5, screenshot: "/images/joyce-hampton.webp", w: 800, h: 696 },
    { name: "Jack Daughdrill", stars: 5, screenshot: "/images/jack-daughdrill.webp", w: 800, h: 425 },
    { name: "Elizabeth Chaney", stars: 5, screenshot: "/images/elizabeth-chaney.webp", w: 800, h: 355 },
  ],
  beforeAfterPairs: [
    { before: "/images/before-lawn.webp", after: "/images/after-lawn.webp" },
    { before: "/images/before-2.webp", after: "/images/after-2.webp" },
  ],
  introVideo: "",
  equipmentPhoto: "/images/equipment.webp",
};

// Base <head> tags as shipped in index.html, so non-home routes can restore
// them on the way out instead of leaving another page's SEO tags behind.
const DEFAULT_SEO = {
  title: "Lawn Care & Mowing Service in Douglasville, GA | Mow Pro GA",
  description: "Reliable biweekly lawn mowing, edging, and cleanup from a local, family-run crew in Douglasville, GA. Same-day quotes, no contracts. Get your free instant quote.",
  url: "https://mowproga.com/",
  image: "https://mowproga.com/images/our-story.webp",
};

// Kept in sync by hand with the PAGES/JSON_LD_BY_PATH constants in
// middleware.js — middleware.js sets these in the raw HTML for
// crawlers/direct loads, this applies the same values on the client for
// in-app SPA navigation (which never hits the middleware, since it's a
// pushState navigation, not a new request).
// FALL_CLEANUP_SEO comes from siteData.js (shared with middleware.js).

const FALL_CLEANUP_FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How much does fall yard cleanup cost in Douglasville, GA?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Fall cleanup is priced by yard size, same as leaf removal: small yards start at $130, medium at $260, large at $400, and extra-large or acreage properties get a custom quote. We confirm the exact price once we see the property in person.",
      },
    },
    {
      "@type": "Question",
      "name": "Do you bag and haul away the leaves, or leave them on the property?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "By default, leaves are blown off the lawn, beds, and hard surfaces and piled at the wood line or a spot you choose, at no extra charge. If you'd rather have them bagged and hauled off the property completely, that's an optional add-on at $5-8 per bag, confirmed once we see the volume.",
      },
    },
    {
      "@type": "Question",
      "name": "When should I schedule fall cleanup in Douglasville?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Most yards need it once leaves start dropping heavily, typically October through December in the Douglasville area. There's no contract, so you can book a one-time cleanup whenever your yard needs it.",
      },
    },
    {
      "@type": "Question",
      "name": "Does fall cleanup include flower bed and border cleanout?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes - a fall cleanup covers leaf removal from the lawn and beds, a final mow and edge, and clearing debris out of flower beds and borders, with driveways and walkways blown off clean.",
      },
    },
  ],
};

const FALL_CLEANUP_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": "Fall Yard Cleanup",
  "name": "Fall Yard Cleanup",
  "url": FALL_CLEANUP_SEO.url,
  "description": "Fall yard cleanup service including leaf removal, flower bed cleanout, and debris haul-away for residential properties in Douglasville and Douglas County, GA.",
  "areaServed": [
    { "@type": "City", "name": "Douglasville, GA" },
    { "@type": "City", "name": "Villa Rica, GA" },
    { "@type": "City", "name": "Lithia Springs, GA" },
    { "@type": "City", "name": "Powder Springs, GA" },
    { "@type": "AdministrativeArea", "name": "Douglas County, GA" },
  ],
  "priceRange": "$5-$8 per bag",
  "provider": {
    "@type": "LocalBusiness",
    "@id": "https://mowproga.com/#business",
    "name": "Mow Pro Lawn Care LLC",
    "telephone": "+14046696945",
    "url": FALL_CLEANUP_SEO.url,
    "image": FALL_CLEANUP_SEO.image,
    "priceRange": "$$",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "1695 Hampton Pass",
      "addressLocality": "Douglasville",
      "addressRegion": "GA",
      "postalCode": "30134",
      "addressCountry": "US",
    },
  },
};

// This page is for paid ad clicks (Nextdoor, etc.), not organic search — it's
// a deliberately thin, stripped-down duplicate of content that already lives
// on the homepage and /fall-cleanup for SEO purposes. So unlike those pages,
// it's marked noindex in middleware.js: its job is conversion, not ranking.
const LEAF_REMOVAL_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Leaf Removal",
  name: "Leaf Removal Service",
  url: LEAF_REMOVAL_SEO.url,
  description: LEAF_REMOVAL_SEO.description,
  areaServed: [
    { "@type": "City", name: "Douglasville, GA" },
    { "@type": "City", name: "Villa Rica, GA" },
    { "@type": "City", name: "Lithia Springs, GA" },
    { "@type": "AdministrativeArea", name: "Douglas County, GA" },
  ],
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    priceSpecification: { "@type": "PriceSpecification", minPrice: 130, priceCurrency: "USD" },
    description: "Leaf removal starts at $130 for small yards ($260 medium, $400 large). Leaves piled on-site at no charge, or bagged and hauled away for $5-8 per bag.",
  },
  provider: { "@id": "https://mowproga.com/#business" },
};

const LEAF_REMOVAL_FAQ_JSONLD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: LEAF_REMOVAL_FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

const QUOTE_SEO = {
  title: "Get a Free Lawn Care Quote | Mow Pro GA — Douglasville",
  description: "Fast, free quotes for lawn mowing and fall cleanup in Douglasville, GA. 5-star rated, no contracts. Get your price in under a minute.",
  url: "https://mowproga.com/quote",
  image: "https://mowproga.com/images/after-lawn.webp",
};

const ABOUT_SEO = {
  title: "About Mow Pro GA | Family-Run Lawn Care in Douglasville, GA",
  description: "Meet the family behind Mow Pro GA — a family-run lawn care crew serving Douglasville, GA. No franchise, no call center, just a local team that shows up. Get a free instant quote.",
  url: "https://mowproga.com/about",
  image: "https://mowproga.com/images/our-story.webp",
};

// Lightweight and honest rather than fabricated: this page is a founder
// story, not a service listing, so it just marks itself as the LocalBusiness's
// About page instead of inventing Service/FAQ schema that isn't there.
const ABOUT_JSONLD = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: ABOUT_SEO.url,
  name: ABOUT_SEO.title,
  description: ABOUT_SEO.description,
  mainEntity: { "@id": "https://mowproga.com/#business" },
};

function applyPageSEO(seo) {
  if (typeof document === "undefined") return;
  document.title = seo.title;
  const setContent = (selector, value) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute("content", value);
  };
  setContent('meta[name="description"]', seo.description);
  setContent('meta[property="og:title"]', seo.title);
  setContent('meta[property="og:description"]', seo.description);
  setContent('meta[property="og:url"]', seo.url);
  setContent('meta[property="og:image"]', seo.image);
  setContent('meta[name="twitter:title"]', seo.title);
  setContent('meta[name="twitter:description"]', seo.description);
  setContent('meta[name="twitter:image"]', seo.image);
  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.setAttribute("href", seo.url);
}

// Non-gated residential neighborhoods within the actual service area (7-mile
// primary radius from Douglasville core, 12-mile extension to Villa Rica) —
// mirrored by hand in middleware.js's NEIGHBORHOODS constant, since
// middleware and this Vite/React bundle are built and run separately and
// can't share a module. Keep both in sync when adding or editing one.
// NEIGHBORHOODS comes from siteData.js (shared with middleware.js).



// Real before/after photos of actual completed jobs — not staged per
// neighborhood (there's no photo library tagged by neighborhood), so rather
// than imply a photo was taken in a specific place, each page just alternates
// between the two general-purpose before/after pairs already used elsewhere
// on the site, for visual variety across the 6 pages.
const NEIGHBORHOOD_PHOTO_PAIRS = [
  { before: "/images/before-lawn.webp", after: "/images/after-lawn.webp", w: 1120, h: 708 },
  { before: "/images/before-2.webp", after: "/images/after-2.webp", w: 1120, h: 795 },
];

function neighborhoodPhotos(n) {
  const i = NEIGHBORHOODS.findIndex((x) => x.slug === n.slug);
  return NEIGHBORHOOD_PHOTO_PAIRS[i % 2];
}

// Kept in sync by hand with neighborhoodPage()/neighborhoodJsonLd() in
// middleware.js — that file sets these in the raw HTML for crawlers/direct
// loads, this applies the same values on the client for in-app SPA
// navigation (which never hits the middleware, since it's a pushState
// navigation, not a new request).
// Avoids the redundant "Villa Rica, Villa Rica GA" for the two entries where
// the neighborhood itself is the whole city, not a district within one.

// Shorter label for <title> tags only, so titles stay under ~60 characters
// (Google truncates longer ones). Uses n.short when a name is long.

function neighborhoodSEO(n) {
  return {
    title: neighborhoodTitle(n),
    description: neighborhoodDescription(n),
    url: `https://mowproga.com/lawn-care/${n.slug}`,
    image: `https://mowproga.com${neighborhoodPhotos(n).after}`,
  };
}

function neighborhoodJsonLd(n) {
  const seo = neighborhoodSEO(n);
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Residential Lawn Mowing & Edging",
    name: `Lawn Care in ${n.name}`,
    url: seo.url,
    description: seo.description,
    areaServed: { "@type": n.name === n.city ? "City" : "Neighborhood", name: placeLabel(n) },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Lawn care and leaf removal in ${n.name}`,
      itemListElement: [
        { "@type": "Offer", priceCurrency: "USD", priceSpecification: { "@type": "PriceSpecification", minPrice: 65, priceCurrency: "USD" }, itemOffered: { "@type": "Service", name: "Biweekly Lawn Mowing & Edging" } },
        { "@type": "Offer", priceCurrency: "USD", priceSpecification: { "@type": "PriceSpecification", minPrice: 130, priceCurrency: "USD" }, url: "https://mowproga.com/leaf-removal", itemOffered: { "@type": "Service", name: "Leaf Removal", serviceType: "Leaf Removal" } },
        { "@type": "Offer", priceCurrency: "USD", priceSpecification: { "@type": "PriceSpecification", minPrice: 130, priceCurrency: "USD" }, url: "https://mowproga.com/fall-cleanup", itemOffered: { "@type": "Service", name: "Fall Yard Cleanup", serviceType: "Fall Cleanup" } },
      ],
    },
    provider: { "@id": "https://mowproga.com/#business" },
  };
}

function pathToRoute(path) {
  if (path === "/about") return "about";
  if (path === "/fall-cleanup") return "fall-cleanup";
  if (path === "/leaf-removal") return "leaf-removal";
  if (path === "/quote") return "quote";
  if (path.startsWith("/lawn-care/")) {
    const slug = path.slice("/lawn-care/".length);
    if (getNeighborhood(slug)) return `neighborhood:${slug}`;
  }
  return "home";
}

function setPageJsonLd(json) {
  if (typeof document === "undefined") return;
  const existing = document.getElementById("page-jsonld");
  if (!json) {
    if (existing) existing.remove();
    return;
  }
  const script = existing || document.createElement("script");
  script.id = "page-jsonld";
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(json);
  if (!existing) document.head.appendChild(script);
}

function EditableText({ value, onChange, editing, style, as = "span", multiline = false }) {
  if (!editing) {
    const Tag = as;
    return <Tag style={style}>{value}</Tag>;
  }
  const commonStyle = { ...style, background: "#1C2B1B", border: "1px dashed #8FBC6A", borderRadius: 6, padding: "2px 6px", width: "100%", fontFamily: "inherit", color: style?.color || "#F5F3EE" };
  return multiline ? (
    <textarea value={value} onChange={(e) => onChange(e.target.value)} style={{ ...commonStyle, resize: "vertical", minHeight: 60 }} />
  ) : (
    <input value={value} onChange={(e) => onChange(e.target.value)} style={commonStyle} />
  );
}

function JobPhotos({ photos }) {
  return (
    <div style={{ marginBottom: 50 }}>
      <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 20px" }}>More Real Mow Pro Jobs</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, maxWidth: 760, margin: "0 auto" }}>
        {photos.map((p) => (
          <figure key={p.src} style={{ margin: 0 }}>
            <img src={p.src} alt={p.alt} width={p.w} height={p.h} loading="lazy" style={{ width: "100%", height: "auto", display: "block", borderRadius: 14, boxShadow: "0 12px 30px -14px rgba(0,0,0,0.5)" }} />
            <figcaption style={{ fontSize: 13, color: "#7C8A78", marginTop: 8, textAlign: "center" }}>{p.caption}</figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}

function BeforeAfterSlider({ before, after, aspect = "4/3" }) {
  const [pct, setPct] = useState(50);
  const [interacted, setInteracted] = useState(false);
  const wrapRef = useRef(null);
  const draggingRef = useRef(false);

  const setFromClientX = (clientX) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    let p = ((clientX - rect.left) / rect.width) * 100;
    p = Math.max(0, Math.min(100, p));
    setPct(p);
  };

  useEffect(() => {
    const onMove = (e) => { if (draggingRef.current) setFromClientX(e.clientX); };
    const onUp = () => { draggingRef.current = false; };
    const onTouchMove = (e) => { if (draggingRef.current) setFromClientX(e.touches[0].clientX); };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  const startDrag = (clientX) => {
    setInteracted(true);
    draggingRef.current = true;
    setFromClientX(clientX);
  };

  return (
    <div
      ref={wrapRef}
      onMouseDown={(e) => startDrag(e.clientX)}
      onTouchStart={(e) => startDrag(e.touches[0].clientX)}
      style={{
        position: "relative", width: "100%", aspectRatio: aspect, borderRadius: 14, overflow: "hidden",
        userSelect: "none", touchAction: "pan-y", cursor: "ew-resize",
        boxShadow: "0 12px 30px -14px rgba(0,0,0,0.5)",
      }}
    >
      <style>{`
        @keyframes mpSwipeHint {
          0%, 100% { transform: translateX(-14px); }
          50% { transform: translateX(14px); }
        }
      `}</style>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${after})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", top: 12, right: 12, background: "#8FBC6A", color: "#0F1A10", fontWeight: 800, fontSize: 12, padding: "4px 10px", borderRadius: 6, letterSpacing: "0.04em" }}>AFTER</div>
      </div>
      <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - pct}% 0 0)`, backgroundImage: `url(${before})`, backgroundSize: "cover", backgroundPosition: "center" }}>
        <div style={{ position: "absolute", top: 12, left: 12, background: "#0F1A10CC", color: "#F5F3EE", fontWeight: 800, fontSize: 12, padding: "4px 10px", borderRadius: 6, letterSpacing: "0.04em" }}>BEFORE</div>
      </div>
      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${pct}%`, width: 3, background: "#fff", transform: "translateX(-50%)", boxShadow: "0 0 0 1px rgba(0,0,0,0.15)" }}>
        <div style={{
          position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
          width: 40, height: 40, borderRadius: "50%", background: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#0F1A10",
          boxShadow: "0 4px 14px rgba(0,0,0,0.3)",
        }}>↔</div>
      </div>
      {!interacted && (
        <div style={{
          position: "absolute", bottom: 14, left: "50%", transform: "translateX(-50%)",
          background: "rgba(15,26,16,0.85)", color: "#fff", padding: "8px 16px", borderRadius: 999,
          fontSize: 13, fontWeight: 700, display: "flex", alignItems: "center", gap: 8,
          pointerEvents: "none", whiteSpace: "nowrap",
        }}>
          <span style={{ display: "inline-block", animation: "mpSwipeHint 1.4s ease-in-out infinite" }}>↔</span>
          Swipe to compare
        </div>
      )}
    </div>
  );
}

function ImageSlot({ label, src, onUpload, editing, badgeColor, badgeText }) {
  const fileRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpload(reader.result);
    reader.readAsDataURL(file);
  };
  return (
    <div style={{ borderRadius: 14, overflow: "hidden", border: "1px solid #24331F", position: "relative", background: "#152016", minHeight: 260 }}>
      {src ? (
        <img src={src} alt={label} style={{ width: "100%", height: 260, objectFit: "cover", display: "block" }} />
      ) : (
        <div style={{ height: 260, display: "flex", alignItems: "center", justifyContent: "center", color: "#7C8A78", fontSize: 13 }}>No photo yet</div>
      )}
      <div style={{ position: "absolute", top: 12, left: 12, background: badgeColor, color: badgeColor === "#8FBC6A" ? "#0F1A10" : "#F5F3EE", fontWeight: 800, fontSize: 13, padding: "5px 12px", borderRadius: 999 }}>
        {badgeText}
      </div>
      {editing && (
        <>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{ display: "none" }} />
          <button
            onClick={() => fileRef.current?.click()}
            style={{ position: "absolute", bottom: 12, right: 12, background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 8, padding: "8px 12px", fontSize: 12.5, fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}
          >
            <Upload size={13} /> Upload photo
          </button>
        </>
      )}
    </div>
  );
}

const SIZE_OPTIONS = [
  { key: "small", label: "Small yard", sub: "Under 5,000 sq ft", addOn: -10 },
  { key: "medium", label: "Medium yard", sub: "5,000 – 10,000 sq ft", addOn: 0 },
  { key: "large", label: "Large yard", sub: "10,000 – 20,000 sq ft", addOn: 10 },
  { key: "xl", label: "Extra large / acreage", sub: "Over 20,000 sq ft", addOn: null },
];

// Leaf removal starting prices by the same size tiers as mowing. Shown as a
// "+" starting price since actual cost depends heavily on tree coverage and
// volume.
const LEAF_PRICES = { small: 130, medium: 260, large: 400, xl: null };

// Hedge trimming: priced by shrub count (easier for customers than hedge
// length), with a $100 minimum. Shrubs 6-10 ft tall add a per-shrub ladder
// fee; anything over 10 ft, 25+ shrubs, or badly overgrown is a custom quote.
const HEDGE_OPTIONS = [
  { key: "h1", label: "1 – 6 shrubs", sub: "Small job · $100 minimum", price: 100, max: 6 },
  { key: "h2", label: "7 – 12 shrubs", sub: "Medium job", price: 200, max: 12 },
  { key: "h3", label: "13 – 25 shrubs", sub: "Large job", price: 350, max: 25 },
  { key: "h4", label: "25+ shrubs or long hedge rows", sub: "Needs an on-site look", price: null, max: 0 },
];
const HEDGE_TALL_FEE = 40;
const HEDGE_HAUL_FEE = 40;

// Mowing price per visit by how often we come — same numbers as the UmmiYard
// quote form. Less frequent = taller grass each visit = more work per cut.
const MOW_FREQUENCIES = [
  { key: "Weekly", label: "Weekly" },
  { key: "Biweekly", label: "Every 2 wks" },
  { key: "Monthly", label: "Monthly" },
  { key: "One-time", label: "One-time" },
];
const MOW_PRICES = {
  Weekly: { small: 55, medium: 65, large: 75, xl: null },
  Biweekly: { small: 65, medium: 75, large: 85, xl: null },
  Monthly: { small: 130, medium: 150, large: 170, xl: null },
  "One-time": { small: 105, medium: 120, large: 135, xl: null },
};
const FIRST_CUT_FEE = 25; // once, on a new recurring customer's first visit
const CRACK_SPRAY_PRICE = 25;
const EDGE_RESTORE_PRICE = 50;

// Brush & overgrowth — anything a regular cut doesn't cover: areas outside
// the mowed lawn, growth over a foot tall, or woody underbrush.
const BRUSH_OPTIONS = [
  { key: "b1", label: "Overgrown fence line or ditch", sub: "Tall grass & weeds outside the mowed lawn · up to ~150 ft", price: 75 },
  { key: "b2", label: "Small brushy area", sub: "Vines, briars, privet, small saplings · about 10 × 50 ft", price: 150 },
  { key: "b3", label: "Medium brushy area", sub: "About 20 × 100 ft, like a grown-in back fence line", price: 300 },
  { key: "b4", label: "Large area or wooded lot", sub: "Bigger than that, or trees over 3 inches thick", price: null },
];
const BRUSH_HAUL_FEE = 75;

// Address field with live Google-powered suggestions, via api/places.js
// (Places API (New), proxied server-side so the API key never reaches the
// browser). Debounced so it doesn't fire a request on every keystroke, and
// uses a session token per search so Google bills the whole lookup as one
// cheaper "session" instead of per-keystroke pricing.
function AddressAutocompleteInput({ value, onChange, placeholder, style }) {
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const sessionTokenRef = useRef(null);
  const debounceRef = useRef(null);
  const wrapRef = useRef(null);

  const newSessionToken = () => {
    sessionTokenRef.current = (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  };

  const fetchSuggestions = async (text) => {
    if (!sessionTokenRef.current) newSessionToken();
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "autocomplete", input: text, sessionToken: sessionTokenRef.current }),
      });
      const data = await res.json();
      setSuggestions(data.predictions || []);
      setOpen((data.predictions || []).length > 0);
    } catch (e) {
      setSuggestions([]);
    }
  };

  const handleChange = (e) => {
    const text = e.target.value;
    onChange(text);
    clearTimeout(debounceRef.current);
    if (!text.trim() || text.trim().length < 3) {
      setSuggestions([]); setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(() => fetchSuggestions(text), 300);
  };

  const selectSuggestion = async (prediction) => {
    setOpen(false);
    setSuggestions([]);
    try {
      const res = await fetch("/api/places", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "details", placeId: prediction.placeId, sessionToken: sessionTokenRef.current }),
      });
      const data = await res.json();
      onChange(data.formattedAddress || prediction.description);
    } catch (e) {
      onChange(prediction.description);
    }
    newSessionToken(); // start a fresh session for the next search
  };

  useEffect(() => {
    const onClickOutside = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>
      <input
        style={style}
        value={value}
        onChange={handleChange}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        placeholder={placeholder}
        autoComplete="off"
        inputMode="text"
      />
      {open && suggestions.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50,
          background: "#152016", border: "1px solid #2A3A28", borderRadius: 8,
          marginTop: 4, boxShadow: "0 4px 14px rgba(0,0,0,0.35)", maxHeight: 220, overflowY: "auto",
        }}>
          {suggestions.map((s) => (
            <div
              key={s.placeId}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectSuggestion(s)}
              style={{ padding: "9px 12px", fontSize: 13.5, color: "#F5F3EE", cursor: "pointer", borderBottom: "1px solid #2A3A28" }}
            >
              {s.description}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuoteModal({ open, onClose, basePrice, initialServiceType = "mowing" }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ address: "", size: "medium", name: "", phone: "", crackSpray: false, overgrownLevel: "none", edgeRestore: false, serviceType: initialServiceType, heavyTrees: false, bagHaul: false, hedgeSize: "h1", tallCount: 0, hedgeOver10: false, hedgeOvergrown: false, hedgeHaul: false, frequency: "Biweekly", brushSize: "b1", brushHaul: false });
  const [submitting, setSubmitting] = useState(false);
  const [textOk, setTextOk] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const isLeaf = form.serviceType === "leaf";
  const isHedge = form.serviceType === "hedge";
  const isBrush = form.serviceType === "brush";
  const isMowing = !isLeaf && !isHedge && !isBrush;
  const freq = MOW_PRICES[form.frequency] ? form.frequency : "Biweekly";
  const recurring = freq !== "One-time";
  const brushOption = BRUSH_OPTIONS.find((b) => b.key === form.brushSize) || BRUSH_OPTIONS[0];
  // Monthly already prices in a month of growth, so it has no "overgrown" option.
  const overgrownMild = form.overgrownLevel === "mild" && freq !== "Monthly";
  const selectedOption = SIZE_OPTIONS.find((s) => s.key === form.size);
  const hedgeOption = HEDGE_OPTIONS.find((h) => h.key === form.hedgeSize);
  const maxTall = hedgeOption?.max || 0;
  const tallCount = Math.min(form.tallCount, maxTall);
  const isCustomQuote = isHedge
    ? hedgeOption?.price === null
    : isBrush ? brushOption.price === null
    : isLeaf ? LEAF_PRICES[form.size] === null : MOW_PRICES[freq][form.size] === null;
  const needsCustomQuote = isCustomQuote
    || (isMowing && form.overgrownLevel === "severe")
    || (isLeaf && form.heavyTrees)
    || (isHedge && (form.hedgeOver10 || form.hedgeOvergrown));
  // Regular per-visit price for the chosen frequency and yard size.
  const normalCutPrice = MOW_PRICES[freq][form.size] ?? 0;
  // Overgrown price = 2x the regular every-2-weeks cut (one-time included).
  const overgrownPrice = (freq === "One-time" ? MOW_PRICES.Biweekly[form.size] ?? 0 : normalCutPrice) * 2;
  const firstCutFee = recurring && !overgrownMild ? FIRST_CUT_FEE : 0;
  const price = needsCustomQuote
    ? null
    : isHedge
    ? hedgeOption.price + tallCount * HEDGE_TALL_FEE + (form.hedgeHaul ? HEDGE_HAUL_FEE : 0)
    : isBrush
    ? brushOption.price + (form.brushHaul ? BRUSH_HAUL_FEE : 0)
    : isLeaf
    ? LEAF_PRICES[form.size]
    : (overgrownMild ? overgrownPrice : normalCutPrice + firstCutFee) + (form.crackSpray ? CRACK_SPRAY_PRICE : 0) + (form.edgeRestore ? EDGE_RESTORE_PRICE : 0);
  // Every price is a starting price, confirmed once we see the yard.
  const showPlus = true;
  const isFirstVisitPrice = isMowing && recurring && !needsCustomQuote;

  const submit = async () => {
    setSubmitting(true);

    trackEvent("generate_lead", { value: price || 0, currency: "USD", yard_size: form.size });
    try {
      await fetch("/api/send-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          phone: form.phone,
          address: form.address,
          size: isHedge ? (hedgeOption?.label || "") : isBrush ? brushOption.label : (selectedOption?.label || ""),
          service: isHedge ? "Hedge trimming" : isBrush ? "Brush & overgrowth" : isLeaf ? "Leaf removal" : "Mowing",
          frequency: isMowing ? freq : undefined,
          regularPrice: isMowing && recurring && !needsCustomQuote ? `$${normalCutPrice}+ per visit` : undefined,
          brushHaul: isBrush ? form.brushHaul : undefined,
          tallCount: isHedge ? tallCount : undefined,
          hedgeOver10: isHedge ? form.hedgeOver10 : undefined,
          hedgeOvergrown: isHedge ? form.hedgeOvergrown : undefined,
          hedgeHaul: isHedge ? form.hedgeHaul : undefined,
          crackSpray: form.crackSpray,
          overgrown: overgrownMild ? "mild" : form.overgrownLevel === "severe" ? "severe" : "none",
          edgeRestore: form.edgeRestore,
          heavyTrees: form.heavyTrees,
          bagHaul: form.bagHaul,
          price: needsCustomQuote ? "Custom quote needed" : `$${price}+${isFirstVisitPrice ? " (first visit)" : ""}`,
          textConsent: textOk,
          source: getLeadSource(),
        }),
      });
    } catch (e) {
      // Even if the email send fails, still show the confirmation — the
      // visitor already gave real contact info, worth following up manually.
    }
    setSubmitting(false);
    setDone(true);
  };

  const close = () => {
    onClose();
    setTimeout(() => { setStep(1); setDone(false); setTextOk(false); setForm({ address: "", size: "medium", name: "", phone: "", crackSpray: false, overgrownLevel: "none", edgeRestore: false, serviceType: initialServiceType, heavyTrees: false, bagHaul: false, hedgeSize: "h1", tallCount: 0, hedgeOver10: false, hedgeOvergrown: false, hedgeHaul: false, frequency: "Biweekly", brushSize: "b1", brushHaul: false }); }, 300);
  };

  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(6,10,7,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#152016", border: "1px solid #24331F", borderRadius: 18, padding: 26, width: "100%", maxWidth: 420, color: "#F5F3EE", position: "relative", maxHeight: "calc(100vh - 32px)", overflowY: "auto", WebkitOverflowScrolling: "touch", margin: "auto" }}>
        <button onClick={close} aria-label="Close" style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: "#7C8A78", cursor: "pointer" }}><X size={20} /></button>

        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2 size={40} color="#8FBC6A" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>Quote request sent!</div>
            <div style={{ fontSize: 14, color: "#B9C4B2" }}>
              Our team will text or call you shortly
              {needsCustomQuote ? " with custom pricing for your property." : ` to confirm your $${price}+ estimate.`}
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {[1, 2].map((s) => <div key={s} style={{ flex: 1, height: 4, borderRadius: 999, background: s <= step ? "#8FBC6A" : "#2A3A28" }} />)}
            </div>

            {step === 1 && (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Get your instant quote</div>
                <div style={{ fontSize: 13, color: "#B9C4B2", marginBottom: 14 }}>{isHedge ? "Enter your address and how many shrubs need trimming." : isBrush ? "Enter your address and how big the overgrown area is." : "Enter your address and yard size for an estimated price."} All prices are starting prices; slopes or uneven ground can add a little.</div>

                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[{ key: "mowing", label: "Mowing" }, { key: "leaf", label: "Leaves" }, { key: "hedge", label: "Hedges" }, { key: "brush", label: "Brush" }].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setForm({ ...form, serviceType: s.key })}
                      style={{
                        flex: 1, padding: "10px 4px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                        border: `1.5px solid ${form.serviceType === s.key ? "#8FBC6A" : "#2A3A28"}`,
                        background: form.serviceType === s.key ? "#8FBC6A" : "transparent",
                        color: form.serviceType === s.key ? "#0F1A10" : "#F5F3EE",
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>

                <label style={miniLabel}>Property address</label>
                <AddressAutocompleteInput
                  style={miniInput}
                  value={form.address}
                  onChange={(v) => setForm({ ...form, address: v })}
                  placeholder="Start typing your address…"
                />
                {isMowing && (
                  <>
                    <label style={{ ...miniLabel, marginTop: 12 }}>How often?</label>
                    <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                      {MOW_FREQUENCIES.map((f) => (
                        <button key={f.key} onClick={() => setForm({ ...form, frequency: f.key })} style={{
                          flex: 1, padding: "9px 2px", borderRadius: 10, fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                          border: `1.5px solid ${freq === f.key ? "#8FBC6A" : "#2A3A28"}`, background: freq === f.key ? "#1C2B1B" : "transparent", color: "#F5F3EE",
                        }}>{f.label}</button>
                      ))}
                    </div>
                    <div style={{ fontSize: 11.5, color: "#7C8A78", marginTop: 6 }}>Prices are per visit. More frequent cuts cost less per visit because the grass never gets as tall.</div>
                  </>
                )}
                {!isHedge && !isBrush && <label style={{ ...miniLabel, marginTop: 12 }}>Yard size</label>}
                {isMowing && <div style={{ fontSize: 11.5, color: "#9AAE94", marginTop: -2 }}>Mowing, edging, weed eating & blow-off all included</div>}
                {!isHedge && !isBrush && SIZE_OPTIONS.map((opt) => (
                  <div
                    key={opt.key}
                    onClick={() => setForm({ ...form, size: opt.key })}
                    style={{
                      border: `1.5px solid ${form.size === opt.key ? "#8FBC6A" : "#2A3A28"}`,
                      background: form.size === opt.key ? "#1C2B1B" : "transparent",
                      borderRadius: 10, padding: "10px 14px", marginTop: 8, cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13.5 }}>{opt.label}</div>
                      <div style={{ fontSize: 11.5, color: "#7C8A78" }}>{opt.sub}</div>
                    </div>
                    <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>
                      {isLeaf
                        ? (LEAF_PRICES[opt.key] === null ? "Custom" : `$${LEAF_PRICES[opt.key]}+`)
                        : (MOW_PRICES[freq][opt.key] === null ? "Custom" : `$${MOW_PRICES[freq][opt.key]}+`)}
                    </div>
                  </div>
                ))}

                {!isCustomQuote && isMowing && recurring && !overgrownMild && (
                  <div style={{ fontSize: 11.5, color: "#B9C4B2", marginTop: 12, lineHeight: 1.45 }}>Your first visit includes a one-time ${FIRST_CUT_FEE}+ first-cut fee: the first cut takes longer to set clean edges and learn your yard.</div>
                )}

                {!isCustomQuote && isMowing && (
                  <div
                    onClick={() => setForm({ ...form, crackSpray: !form.crackSpray })}
                    style={{
                      border: `1.5px solid ${form.crackSpray ? "#8FBC6A" : "#2A3A28"}`,
                      background: form.crackSpray ? "#1C2B1B" : "transparent",
                      borderRadius: 10, padding: "10px 14px", marginTop: 14, cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.crackSpray ? "#8FBC6A" : "#5C6B57"}`,
                        background: form.crackSpray ? "#8FBC6A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {form.crackSpray && <CheckCircle2 size={14} color="#0F1A10" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>Sidewalk & driveway crack spray</div>
                        <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Weed-free walkways and driveway edges</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>+${CRACK_SPRAY_PRICE}+</div>
                  </div>
                )}

                {!isCustomQuote && isMowing && (
                  <>
                    <label style={{ ...miniLabel, marginTop: 14 }}>Yard condition (if overgrown)</label>
                    {freq !== "Monthly" && <div
                      onClick={() => setForm({ ...form, overgrownLevel: form.overgrownLevel === "mild" ? "none" : "mild" })}
                      style={{
                        border: `1.5px solid ${form.overgrownLevel === "mild" ? "#8FBC6A" : "#2A3A28"}`,
                        background: form.overgrownLevel === "mild" ? "#1C2B1B" : "transparent",
                        borderRadius: 10, padding: "10px 14px", marginTop: 8, cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.overgrownLevel === "mild" ? "#8FBC6A" : "#5C6B57"}`,
                          background: form.overgrownLevel === "mild" ? "#8FBC6A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {form.overgrownLevel === "mild" && <CheckCircle2 size={14} color="#0F1A10" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>A few weeks overgrown</div>
                          <div style={{ fontSize: 11.5, color: "#7C8A78" }}>{recurring ? "First cut only, extra passes needed" : "Extra passes needed"}</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>${overgrownPrice}+</div>
                        <div style={{ fontSize: 10.5, color: "#7C8A78" }}>{freq === "One-time" ? "overgrown price" : "2× first cut"}</div>
                      </div>
                    </div>}

                    <div
                      onClick={() => setForm({ ...form, overgrownLevel: form.overgrownLevel === "severe" ? "none" : "severe" })}
                      style={{
                        border: `1.5px solid ${form.overgrownLevel === "severe" ? "#8FBC6A" : "#2A3A28"}`,
                        background: form.overgrownLevel === "severe" ? "#1C2B1B" : "transparent",
                        borderRadius: 10, padding: "10px 14px", marginTop: 8, cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.overgrownLevel === "severe" ? "#8FBC6A" : "#5C6B57"}`,
                          background: form.overgrownLevel === "severe" ? "#8FBC6A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {form.overgrownLevel === "severe" && <CheckCircle2 size={14} color="#0F1A10" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Very overgrown</div>
                          <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Grass over 12 inches tall</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>Custom</div>
                    </div>
                  </>
                )}

                {!isCustomQuote && isMowing && (
                  <div
                    onClick={() => setForm({ ...form, edgeRestore: !form.edgeRestore })}
                    style={{
                      border: `1.5px solid ${form.edgeRestore ? "#8FBC6A" : "#2A3A28"}`,
                      background: form.edgeRestore ? "#1C2B1B" : "transparent",
                      borderRadius: 10, padding: "10px 14px", marginTop: 8, cursor: "pointer",
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.edgeRestore ? "#8FBC6A" : "#5C6B57"}`,
                        background: form.edgeRestore ? "#8FBC6A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                      }}>
                        {form.edgeRestore && <CheckCircle2 size={14} color="#0F1A10" />}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>Edge restoration</div>
                        <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Grass grown fully over the sidewalk/driveway edge</div>
                      </div>
                    </div>
                    <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>+${EDGE_RESTORE_PRICE}+</div>
                  </div>
                )}

                {isLeaf && !isCustomQuote && (
                  <>
                    <div
                      onClick={() => setForm({ ...form, heavyTrees: !form.heavyTrees })}
                      style={{
                        border: `1.5px solid ${form.heavyTrees ? "#8FBC6A" : "#2A3A28"}`,
                        background: form.heavyTrees ? "#1C2B1B" : "transparent",
                        borderRadius: 10, padding: "10px 14px", marginTop: 14, cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.heavyTrees ? "#8FBC6A" : "#5C6B57"}`,
                          background: form.heavyTrees ? "#8FBC6A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {form.heavyTrees && <CheckCircle2 size={14} color="#0F1A10" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Heavy tree coverage</div>
                          <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Lots of mature trees — needs an on-site look</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>Custom</div>
                    </div>

                    <div
                      onClick={() => setForm({ ...form, bagHaul: !form.bagHaul })}
                      style={{
                        border: `1.5px solid ${form.bagHaul ? "#8FBC6A" : "#2A3A28"}`,
                        background: form.bagHaul ? "#1C2B1B" : "transparent",
                        borderRadius: 10, padding: "10px 14px", marginTop: 8, cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.bagHaul ? "#8FBC6A" : "#5C6B57"}`,
                          background: form.bagHaul ? "#8FBC6A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {form.bagHaul && <CheckCircle2 size={14} color="#0F1A10" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Bag & haul away</div>
                          <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Leaves bagged and removed from the property (default is piled on-site)</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>$5–8/bag</div>
                    </div>
                  </>
                )}

                {isHedge && (
                  <>
                    <label style={{ ...miniLabel, marginTop: 12 }}>How many shrubs?</label>
                    {HEDGE_OPTIONS.map((opt) => (
                      <div
                        key={opt.key}
                        onClick={() => setForm({ ...form, hedgeSize: opt.key })}
                        style={{
                          border: `1.5px solid ${form.hedgeSize === opt.key ? "#8FBC6A" : "#2A3A28"}`,
                          background: form.hedgeSize === opt.key ? "#1C2B1B" : "transparent",
                          borderRadius: 10, padding: "10px 14px", marginTop: 8, cursor: "pointer",
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{opt.label}</div>
                          <div style={{ fontSize: 11.5, color: "#7C8A78" }}>{opt.sub}</div>
                        </div>
                        <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>{opt.price === null ? "Custom" : `$${opt.price}+`}</div>
                      </div>
                    ))}
                  </>
                )}

                {isHedge && !isCustomQuote && (
                  <>
                    <label style={{ ...miniLabel, marginTop: 14 }}>How many are taller than 6 ft?</label>
                    <div style={{ border: "1.5px solid #2A3A28", borderRadius: 10, padding: "10px 14px", marginTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13.5 }}>Shrubs 6 – 10 ft tall</div>
                        <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Ladder work · ${HEDGE_TALL_FEE}+ each</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <button
                          aria-label="Fewer tall shrubs"
                          onClick={() => setForm({ ...form, tallCount: Math.max(0, tallCount - 1) })}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #2A3A28", background: "transparent", color: "#F5F3EE", fontSize: 18, fontWeight: 800, cursor: "pointer" }}
                        >−</button>
                        <div style={{ minWidth: 18, textAlign: "center", fontWeight: 800, fontSize: 15 }}>{tallCount}</div>
                        <button
                          aria-label="More tall shrubs"
                          onClick={() => setForm({ ...form, tallCount: Math.min(maxTall, tallCount + 1) })}
                          style={{ width: 30, height: 30, borderRadius: 8, border: "1.5px solid #2A3A28", background: "transparent", color: "#F5F3EE", fontSize: 18, fontWeight: 800, cursor: "pointer" }}
                        >+</button>
                      </div>
                    </div>
                    <div
                      onClick={() => setForm({ ...form, hedgeOver10: !form.hedgeOver10 })}
                      style={{
                        border: `1.5px solid ${form.hedgeOver10 ? "#8FBC6A" : "#2A3A28"}`,
                        background: form.hedgeOver10 ? "#1C2B1B" : "transparent",
                        borderRadius: 10, padding: "10px 14px", marginTop: 8, cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.hedgeOver10 ? "#8FBC6A" : "#5C6B57"}`,
                          background: form.hedgeOver10 ? "#8FBC6A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {form.hedgeOver10 && <CheckCircle2 size={14} color="#0F1A10" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Any shrubs over 10 ft tall</div>
                          <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Closer to tree work — needs an on-site look</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>Custom</div>
                    </div>
                    <div
                      onClick={() => setForm({ ...form, hedgeOvergrown: !form.hedgeOvergrown })}
                      style={{
                        border: `1.5px solid ${form.hedgeOvergrown ? "#8FBC6A" : "#2A3A28"}`,
                        background: form.hedgeOvergrown ? "#1C2B1B" : "transparent",
                        borderRadius: 10, padding: "10px 14px", marginTop: 8, cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.hedgeOvergrown ? "#8FBC6A" : "#5C6B57"}`,
                          background: form.hedgeOvergrown ? "#8FBC6A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {form.hedgeOvergrown && <CheckCircle2 size={14} color="#0F1A10" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Badly overgrown</div>
                          <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Hasn't been trimmed in a year or more</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>Custom</div>
                    </div>
                    <div
                      onClick={() => setForm({ ...form, hedgeHaul: !form.hedgeHaul })}
                      style={{
                        border: `1.5px solid ${form.hedgeHaul ? "#8FBC6A" : "#2A3A28"}`,
                        background: form.hedgeHaul ? "#1C2B1B" : "transparent",
                        borderRadius: 10, padding: "10px 14px", marginTop: 8, cursor: "pointer",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{
                          width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.hedgeHaul ? "#8FBC6A" : "#5C6B57"}`,
                          background: form.hedgeHaul ? "#8FBC6A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                          {form.hedgeHaul && <CheckCircle2 size={14} color="#0F1A10" />}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>Haul away clippings</div>
                          <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Bagged and removed (default is piled on-site)</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>+${HEDGE_HAUL_FEE}+</div>
                    </div>
                  </>
                )}

                {isBrush && (
                  <>
                    <div style={{ fontSize: 12, color: "#B9C4B2", background: "#0F1A10", borderRadius: 10, padding: "10px 12px", marginTop: 12, lineHeight: 1.5 }}>
                      <b style={{ color: "#F5F3EE" }}>Already in a regular cut:</b> weed eating around everything in your mowed lawn (beds, trees, posts, fences, the AC unit).<br />
                      <b style={{ color: "#F5F3EE" }}>This is for:</b> areas outside the mowed lawn, growth over a foot tall, and woody stuff like vines, briars, privet and saplings.
                    </div>
                    <label style={{ ...miniLabel, marginTop: 12 }}>How big is the area?</label>
                    {BRUSH_OPTIONS.map((opt) => (
                      <div key={opt.key} onClick={() => setForm({ ...form, brushSize: opt.key })} style={{
                        border: `1.5px solid ${form.brushSize === opt.key ? "#8FBC6A" : "#2A3A28"}`, background: form.brushSize === opt.key ? "#1C2B1B" : "transparent",
                        borderRadius: 10, padding: "10px 14px", marginTop: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10,
                      }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13.5 }}>{opt.label}</div>
                          <div style={{ fontSize: 11.5, color: "#7C8A78" }}>{opt.sub}</div>
                        </div>
                        <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5, whiteSpace: "nowrap" }}>{opt.price === null ? "Custom" : `$${opt.price}+`}</div>
                      </div>
                    ))}
                    {brushOption.price !== null && (
                      <div onClick={() => setForm({ ...form, brushHaul: !form.brushHaul })} style={{
                        border: `1.5px solid ${form.brushHaul ? "#8FBC6A" : "#2A3A28"}`, background: form.brushHaul ? "#1C2B1B" : "transparent",
                        borderRadius: 10, padding: "10px 14px", marginTop: 14, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${form.brushHaul ? "#8FBC6A" : "#5C6B57"}`, background: form.brushHaul ? "#8FBC6A" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {form.brushHaul && <CheckCircle2 size={14} color="#0F1A10" />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 13.5 }}>Haul away debris</div>
                            <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Cut brush loaded up and removed (default is piled on-site)</div>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>+${BRUSH_HAUL_FEE}+</div>
                      </div>
                    )}
                  </>
                )}

                <button disabled={!form.address.trim()} onClick={() => setStep(2)} style={{ ...modalBtn, opacity: form.address.trim() ? 1 : 0.5, marginTop: 18 }}>
                  Continue <ArrowRight size={15} />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 4 }}>Almost done</div>
                <div style={{ fontSize: 13, color: "#B9C4B2", marginBottom: 16 }}>Here's your estimate for this property.</div>

                <div style={{ background: "#0F1A10", borderRadius: 12, padding: 16, textAlign: "center" }}>
                  {needsCustomQuote ? (
                    <>
                      <div style={{ fontSize: 11.5, color: "#7C8A78", textTransform: "uppercase" }}>{isHedge ? "Your hedges" : "Property size"}</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#8FBC6A", lineHeight: 1.4 }}>Custom Quote Needed</div>
                      <div style={{ fontSize: 12, color: "#B9C4B2", marginTop: 4 }}>Our team will assess your property and follow up with pricing</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 11.5, color: "#7C8A78", textTransform: "uppercase" }}>{isFirstVisitPrice ? "First visit" : "Estimated price"}</div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: "#8FBC6A" }}>${price}{showPlus && "+"}</div>
                      {isFirstVisitPrice && (
                        <div style={{ fontSize: 12.5, color: "#F5F3EE", marginTop: 2 }}>Then ${normalCutPrice}+ per visit ({freq === "Weekly" ? `about $${normalCutPrice * 4}+` : freq === "Biweekly" ? `about $${normalCutPrice * 2}+` : `$${normalCutPrice}+`} a month)</div>
                      )}
                      <div style={{ fontSize: 11.5, color: "#B9C4B2", marginTop: 2 }}>Final price confirmed once we see the property</div>
                    </>
                  )}
                </div>

                <div style={{ fontSize: 13, color: "#B9C4B2", margin: "18px 0 12px" }}>Where should we send the confirmation?</div>
                <label style={miniLabel}>Your name</label>
                <input style={miniInput} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                <label style={{ ...miniLabel, marginTop: 10 }}>Phone number</label>
                <input style={miniInput} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(404) 000-0000" />

                <label style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 12, color: "#B9C4B2", lineHeight: 1.5, marginTop: 16, cursor: "pointer", }}>
                  <input type="checkbox" checked={textOk} onChange={(e) => setTextOk(e.target.checked)} style={{ width: 20, height: 20, marginTop: 1, flexShrink: 0, accentColor: "#8FBC6A" }} />
                  <span>I agree to get texts from Mow Pro GA about my quote and service. Msg frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help. <a href="/terms.html" target="_blank" rel="noopener noreferrer" style={{ color: "#8FBC6A" }}>Terms</a> · <a href="/privacy.html" target="_blank" rel="noopener noreferrer" style={{ color: "#8FBC6A" }}>Privacy</a></span>
                </label>
                <button disabled={!form.name.trim() || !form.phone.trim() || submitting} onClick={submit} style={{ ...modalBtn, opacity: form.name.trim() && form.phone.trim() ? 1 : 0.5, marginTop: 12 }}>
                  {submitting ? "Sending…" : "Request This Quote"}
                </button>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

const miniLabel = { display: "block", fontSize: 11.5, fontWeight: 700, color: "#9AAE94", marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.03em" };
const miniInput = { width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid #2A3A28", background: "#0F1A10", color: "#F5F3EE", fontSize: 14, boxSizing: "border-box" };
const modalBtn = { width: "100%", background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 10, padding: "13px", fontWeight: 800, fontSize: 14.5, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 };

const BUSINESS_CONTEXT = `You are the friendly virtual assistant for Mow Pro Lawn Care LLC, a locally owned, family-run lawn care company in Douglasville, Georgia. Answer visitor questions helpfully and naturally, then work toward collecting their name, phone number, address, and what service they need so the Mow Pro team can follow up with a real quote.

SERVICES & PRICING:
- Mowing (mowing, edging, weed eating, debris blow-off all included), price per visit by how often we come. All prices are starting prices ("+"):
  - Every 2 weeks (most popular): Small yard (under 5,000 sq ft) $65+, Medium yard (5,000-10,000 sq ft) $75+, Large yard (10,000-20,000 sq ft) $85+
  - Weekly: Small $55+, Medium $65+, Large $75+
  - Monthly: Small $130+, Medium $150+, Large $170+ (a month of growth is close to an overgrown cut every visit)
  - One-time cut (lawn not overgrown): Small $105+, Medium $120+, Large $135+
  - Extra large/acreage (over 20,000 sq ft): custom quote after our team assesses it in person
- First-cut fee: new weekly, every-2-weeks, and monthly customers pay a one-time $25+ on their first visit (the first cut takes longer to set clean edges and learn the yard). It doesn't apply if the overgrown price applies instead.
- Overgrown fee: if it's been a few weeks since it was last cut, the first cut is 2x the regular every-2-weeks price for that yard size (e.g. a Medium yard's $75 cut becomes $150 for the first overgrown cut). One-time cuts on an overgrown lawn use this same overgrown price. That covers the first 2 hours on-site; if the job runs longer than that, it's $55/hr for each additional hour. If the grass is over 12 inches tall, that needs a custom quote — the team has to see it in person before pricing it, don't guess a number for that case
- Edge restoration (grass grown fully over sidewalk/driveway edge): $50+ for a typical driveway and sidewalk; $75-100+ for long driveways, corner lots, or edges buried several inches deep
- Sidewalk & driveway crack weed spraying: $25+
- Brush & overgrowth (anything a regular cut doesn't cover: areas outside the mowed lawn, growth over a foot tall, or woody underbrush like vines, briars, privet, and saplings): overgrown fence line or ditch (up to ~150 ft) $75+, small brushy area (about 10x50 ft) $150+, medium brushy area (about 20x100 ft) $300+, large area or wooded lot (or trees over 3 inches thick) custom quote. Hauling the cut brush away is +$75+; default is piled on-site. A regular cut already includes weed eating around everything inside the mowed lawn.
- Hedge & shrub trimming ($100 minimum per visit): 1-6 shrubs $100+, 7-12 shrubs $200+, 13-25 shrubs $350+. Shrubs 6-10 ft tall add $40 each (ladder work). Anything over 10 ft tall, 25+ shrubs or long hedge rows, or badly overgrown shrubs needs a custom quote in person. Includes clean shaping and blowing off beds and walkways, with clippings piled on-site; hauling clippings away is +$40. Mowing clients get 10% off hedge trimming added to a regular visit.
- Leaf removal (separate service from mowing): Small yard $130+, Medium yard $260+, Large yard $400+, Extra large: custom quote. Default is blowing leaves off the lawn, beds, and hard surfaces into a pile at the wood line or a spot the customer chooses; bagging and hauling them away is $5-8 per bag depending on actual volume, confirmed once we see the property. Heavy tree coverage needs a custom quote in person.
- Fall Cleanup (seasonal bundle, see the /fall-cleanup page): leaf removal plus a final fall mow & edge and flower bed/border cleanout, with driveways and walkways blown off clean. Priced the same as leaf removal above by yard size — mention this as the go-to fall service when someone asks about leaves, fall cleanup, or getting the yard ready for winter.
- No contracts, cancel anytime
- Service area: Douglasville and surrounding Douglas County, GA, including Villa Rica, Lithia Springs, and Powder Springs

GIVING QUOTE ESTIMATES: If someone gives you their address and wants a quote, you cannot look up the property automatically. Instead, ask them a quick question to estimate size — e.g. "Is your yard small (like a townhome-sized lot), medium (typical suburban yard), or large (over a quarter acre)?" or ask for an approximate square footage if they know it. Once you have a rough size, give them the matching price from the tiers above, and ask if the yard needs the first-cut fee, edge restoration, or crack spraying too, adding those if relevant. ALWAYS clearly state that this is only an ESTIMATE and that the team will confirm the final price once they actually see the property in person — never present a number as final or guaranteed. Say something like: "Based on what you've described, that would run about $X — but that's just an estimate. Our team will confirm the exact price once we see the yard in person."

TONE: Warm, direct, no corporate jargon. Keep answers short (2-4 sentences). If asked something you don't know (e.g. availability for a specific date, whether we offer a service not listed above), say the team will confirm that personally, and ask for their contact info so he can follow up.

Once you have their name AND at least a phone number or address, use the submit_lead tool right away to actually send their information to the Mow Pro team — don't just say you will, actually call the tool. You can keep chatting naturally after that if they have more questions.`;

const CHAT_TOOLS = [
  {
    name: "submit_lead",
    description: "Send a visitor's contact info and quote details to the Mow Pro team so they can follow up. Call this as soon as you have a name plus a phone number or address — don't wait until the end of the conversation.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Visitor's name" },
        phone: { type: "string", description: "Phone number, if given" },
        address: { type: "string", description: "Property address, if given" },
        service: { type: "string", description: "What they're asking about, e.g. 'biweekly mowing, medium yard, overgrown'" },
        estimated_price: { type: "string", description: "The estimate you gave them, if any, e.g. '$85+' or 'custom quote needed'" },
      },
      required: ["name"],
    },
  },
];

function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [showNudge, setShowNudge] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Hi! I'm here to help with any questions about Mow Pro's services or pricing. What can I help you with?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [leadSent, setLeadSent] = useState(false);

  const submitLead = async (details) => {
    try {
      await fetch("/api/send-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: details.name || "",
          phone: details.phone || "(not given — chat lead)",
          address: details.address || "(not given — chat lead)",
          size: details.service || "See chat conversation",
          price: details.estimated_price || "Not estimated",
          crackSpray: false, overgrown: "none", edgeRestore: false,
          source: getLeadSource(),
        }),
      });
      setLeadSent(true);
      trackEvent("chat_lead_sent", {});
    } catch (e) {}
  };

  // Proactive nudge: shows once per session, triggered by whichever
  // comes first — 15s on page, or scrolling past 50% of the page.
  // Never forces the chat panel open, just a small dismissible bubble.
  useEffect(() => {
    if (sessionStorage.getItem("mp_chat_nudge_shown")) return;

    const triggerNudge = () => {
      if (sessionStorage.getItem("mp_chat_nudge_shown")) return;
      sessionStorage.setItem("mp_chat_nudge_shown", "1");
      setShowNudge(true);
      trackEvent("chat_nudge_shown", {});
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };

    const onScroll = () => {
      const scrolled = window.scrollY + window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      if (pageHeight > 0 && scrolled / pageHeight >= 0.5) triggerNudge();
    };

    const timer = setTimeout(triggerNudge, 15000);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearTimeout(timer);
    };
  }, []);

  const openFromNudge = () => {
    setShowNudge(false);
    setOpen(true);
    trackEvent("chat_nudge_clicked", {});
  };

  const dismissNudge = (e) => {
    e.stopPropagation();
    setShowNudge(false);
    trackEvent("chat_nudge_dismissed", {});
  };

  useEffect(() => {
    if (open) setShowNudge(false);
  }, [open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input.trim() };
    let conversation = [...messages, userMsg];
    setMessages(conversation);
    setInput("");
    setLoading(true);
    try {
      let keepGoing = true;
      let safetyCounter = 0;
      while (keepGoing && safetyCounter < 6) {
        safetyCounter++;
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            system: BUSINESS_CONTEXT,
            tools: CHAT_TOOLS,
            messages: conversation.map((m) => ({ role: m.role, content: m.content })),
          }),
        });
        const data = await res.json();
        const toolUses = (data?.content || []).filter((c) => c.type === "tool_use");
        const textParts = (data?.content || []).filter((c) => c.type === "text").map((c) => c.text).join("\n");

        if (textParts) {
          setMessages((prev) => [...prev, { role: "assistant", content: textParts }]);
        }

        if (toolUses.length > 0 && data.stop_reason === "tool_use") {
          conversation = [...conversation, { role: "assistant", content: data.content }];
          const toolResults = [];
          for (const tu of toolUses) {
            if (tu.name === "submit_lead" && !leadSent) await submitLead(tu.input);
            toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: "Lead sent to the Mow Pro team." });
          }
          conversation = [...conversation, { role: "user", content: toolResults }];
        } else {
          keepGoing = false;
        }
      }
      trackEvent("chat_widget_message", {});
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong — feel free to text or call us directly at (404) 669-6945." }]);
    }
    setLoading(false);
  };

  return (
    <>
      {open && (
        <div className="mp-chat-window" style={{
          position: "fixed", bottom: 88, right: 20, width: "min(340px, calc(100vw - 40px))", height: 440,
          background: "#152016", border: "1px solid #24331F", borderRadius: 16, boxShadow: "0 12px 32px rgba(0,0,0,0.35)",
          zIndex: 200, display: "flex", flexDirection: "column", overflow: "hidden",
        }}>
          <div style={{ background: "#0F1A10", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #24331F" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#F5F3EE", fontWeight: 700, fontSize: 13.5 }}>
              <MessageCircle size={16} color="#8FBC6A" /> Mow Pro Assistant
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close chat" style={{ background: "none", border: "none", color: "#7C8A78", cursor: "pointer" }}><X size={18} /></button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 14 }}>
            {messages.map((m, i) => (
              <div key={i} style={{ marginBottom: 10, display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                <div style={{
                  maxWidth: "82%", padding: "8px 12px", borderRadius: 10, fontSize: 13, lineHeight: 1.45, whiteSpace: "pre-wrap",
                  background: m.role === "user" ? "#8FBC6A" : "#1C2B1B",
                  color: m.role === "user" ? "#0F1A10" : "#D8DED2",
                }}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && <div style={{ fontSize: 12, color: "#7C8A78", fontStyle: "italic" }}>Typing…</div>}
          </div>
          <div style={{ borderTop: "1px solid #24331F", padding: 10, display: "flex", gap: 6 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask a question..."
              style={{ flex: 1, background: "#0F1A10", border: "1px solid #2A3A28", borderRadius: 8, padding: "8px 10px", color: "#F5F3EE", fontSize: 13 }}
            />
            <button onClick={send} disabled={loading} style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 8, padding: "8px 11px", cursor: "pointer" }}>
              <Send size={14} />
            </button>
          </div>
        </div>
      )}

      {showNudge && !open && (
        <div
          className="mp-chat-nudge"
          onClick={openFromNudge}
          style={{
            position: "fixed", bottom: 88, right: 20, zIndex: 190,
            maxWidth: 240, background: "#152016", border: "1px solid #24331F",
            borderRadius: 14, padding: "12px 14px", boxShadow: "0 8px 24px rgba(0,0,0,0.35)",
            cursor: "pointer", display: "flex", alignItems: "flex-start", gap: 8,
          }}
        >
          <div style={{ fontSize: 13, color: "#F5F3EE", lineHeight: 1.4 }}>
            👋 Want a free instant quote? Just ask.
          </div>
          <button
            onClick={dismissNudge}
            aria-label="Dismiss"
            style={{ background: "none", border: "none", color: "#7C8A78", cursor: "pointer", flexShrink: 0, padding: 0, lineHeight: 0 }}
          >
            <X size={15} />
          </button>
        </div>
      )}

      <button
        className="mp-chat-bubble"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close chat" : "Open chat"}
        style={{
          position: "fixed", bottom: 20, right: 20, width: 56, height: 56, borderRadius: "50%",
          background: "#8FBC6A", border: "none", boxShadow: "0 6px 18px rgba(0,0,0,0.3)", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 200,
        }}
      >
        {open ? <X size={22} color="#0F1A10" /> : <MessageCircle size={22} color="#0F1A10" />}
      </button>
    </>
  );
}

function AboutPage({ content, navigate, setShowQuote, showQuote }) {
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0F1A10", color: "#F5F3EE", minHeight: "100vh" }}>
      {/* NAV */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 10, padding: "18px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 18, background: "none", border: "none", color: "#F5F3EE", cursor: "pointer", padding: 0, textDecoration: "none" }}>
          <img src="/images/logo.png" alt="Mow Pro GA logo" style={{ width: 40, height: 40, borderRadius: "50%", display: "block" }} />
          Mow Pro GA
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "flex-end", rowGap: 8 }}>
          <a href="/fall-cleanup" onClick={(e) => { e.preventDefault(); navigate("/fall-cleanup"); }} style={{ background: "none", border: "none", color: "#F5F3EE", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "none" }}>
            Fall Cleanup
          </a>
          <a href="/leaf-removal" onClick={(e) => { e.preventDefault(); navigate("/leaf-removal"); }} style={{ background: "none", border: "none", color: "#F5F3EE", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "none" }}>
            Leaf Removal
          </a>
          <a href={`tel:${content.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#F5F3EE", textDecoration: "none" }}>
            <Phone size={14} color="#8FBC6A" />
            {content.phone}
          </a>
          <button onClick={() => setShowQuote(true)} style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            Get Quote
          </button>
        </div>
      </div>

      {/* BACK LINK */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "20px 24px 0" }}>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#8FBC6A", fontWeight: 700, fontSize: 13.5, cursor: "pointer", padding: 0, textDecoration: "none" }}>
          ← Back to home
        </a>
      </div>

      {/* STORY */}
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "24px 24px 70px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8FBC6A", marginBottom: 12 }}>Our Story</div>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 24px" }}>
          Built one yard — and one door hanger — at a time.
        </h1>

        <div style={{ width: "100%", maxHeight: 420, overflow: "hidden", borderRadius: 16, marginBottom: 30, boxShadow: "0 16px 40px -18px rgba(0,0,0,0.5)" }}>
          <img src="/images/our-story.webp" alt="Joseph on the Mow Pro GA mower" width="700" height="1516" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
        </div>

        <div style={{ fontSize: 16, color: "#D8DED2", lineHeight: 1.85 }}>
          <p style={{ margin: "0 0 22px" }}>
            Mow Pro Lawn Care LLC didn't start with a business plan. It started with a truck, a mower, and a decision to build something real for my family in Douglasville.
          </p>
          <p style={{ margin: "0 0 22px" }}>
            My son's been part of that from early on. Most weekends, he's out with me hanging door hangers around the neighborhood — not because he has to, but because he wanted to help. It's hot, thankless work, especially in a Georgia July. Some folks stopped him mid-hang just to say they already had a lawn guy. I think even he was starting to wonder if any of it was actually doing anything.
          </p>
          <p style={{ margin: "0 0 22px" }}>
            Then one afternoon, right after he hung our 97th door hanger of the day, my phone rang. A new customer, calling because of the hanger he'd just placed. Before the day was out, five more calls came in from that same neighborhood.
          </p>
          <p style={{ margin: "0 0 22px" }}>
            I watched it click for him — the hours in that heat weren't wasted, they were working. That's not a lesson you can just tell a kid. He had to feel it for himself.
          </p>
          <p style={{ margin: "0 0 22px" }}>
            That's what Mow Pro GA actually is. Not a franchise, not a call center, not a crew of strangers rotating through your yard. It's a family building something real, one lawn and one door hanger at a time — and hopefully, something my kids will be proud to say they helped build from the ground up.
          </p>
          <p style={{ margin: 0 }}>
            When you book with us, that's what you're getting: a family business that shows up, stands behind its work, and has a very good reason to make sure it's done right every single time.
          </p>
        </div>

        <div style={{ marginTop: 44, textAlign: "center" }}>
          <button onClick={() => setShowQuote(true)} style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 10, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Get My Free Instant Quote <ArrowRight size={18} />
          </button>
        </div>
      </main>

      <QuoteModal open={showQuote} onClose={() => setShowQuote(false)} basePrice={content.price} />
      <ChatWidget />

      <div style={{ textAlign: "center", padding: "20px 20px 0" }}>
        <a href="https://urbanagcouncil.com" target="_blank" rel="noopener noreferrer">
          <img
            src="/images/urban-ag-council-badge.webp"
            alt="Mow Pro Lawn Care is a proud member of the Georgia Urban Ag Council"
            style={{ maxWidth: 160, width: "100%", height: "auto" }}
          />
        </a>
      </div>
      <div style={{ textAlign: "center", padding: 20, fontSize: 12.5, color: "#7C8A78" }}>
        Mow Pro GA · Mow Pro Lawn Care LLC · Douglasville, GA
      </div>
    </div>
  );
}

const SERVICE_AREAS = ["Douglasville", "Villa Rica", "Lithia Springs", "Powder Springs"];

const FALL_FAQ = [
  { q: "How much does fall yard cleanup cost in Douglasville, GA?", a: "Fall cleanup is priced by yard size, same as leaf removal: small yards start at $130, medium at $260, large at $400, and extra-large or acreage properties get a custom quote. We confirm the exact price once we see the property in person." },
  { q: "Do you bag and haul away the leaves, or leave them on the property?", a: "By default, leaves are blown off the lawn, beds, and hard surfaces and piled at the wood line or a spot you choose, at no extra charge. If you'd rather have them bagged and hauled off the property completely, that's an optional add-on at $5–8 per bag, confirmed once we see the volume." },
  { q: "When should I schedule fall cleanup in Douglasville?", a: "Most yards need it once leaves start dropping heavily, typically October through December in the Douglasville area. There's no contract, so you can book a one-time cleanup whenever your yard needs it." },
  { q: "Does fall cleanup include flower bed and border cleanout?", a: "Yes — a fall cleanup covers leaf removal from the lawn and beds, a final mow and edge, and clearing debris out of flower beds and borders, with driveways and walkways blown off clean." },
];

function FallCleanupPage({ content, navigate, setShowQuote, showQuote }) {
  const openQuote = (location) => { trackEvent("quote_opened", { location: `fall_cleanup_${location}` }); setShowQuote(true); };
  const goTo = (path) => (e) => { e.preventDefault(); navigate(path); };
  const phoneDisplay = formatPhone(content.phone);
  const sizes = SIZE_OPTIONS.filter((o) => LEAF_PRICES[o.key] !== null);
  return (
    <SiteShell
      content={content} navigate={navigate} showQuote={showQuote} setShowQuote={setShowQuote}
      active="services" quoteType="leaf" trackPrefix="fall_cleanup_"
      ctaTitle="Ready to Clear the Leaves Before Winter?"
      ctaText="Text, call, or request a quote — most yards confirmed same day."
    >
      <main>
      {/* HERO — real leaf photo as a full-bleed background */}
      <section className="mp-fhero">
        <img className="mp-fhero-bg" src="/images/fall-hero.webp" srcSet="/images/fall-hero-900.webp 900w, /images/fall-hero.webp 1672w" sizes="(max-width: 760px) 900px, 1240px" alt="A pile of raked autumn leaves on a green lawn" width="1672" height="941" fetchPriority="high" />
        <div className="mp-fhero-in">
          <a href="/" onClick={goTo("/")} className="mp-back">← Back to Home</a>
          <div className="mp-fhero-pillrow"><span className="mp-pill mp-pill-fall"><Leaf size={13} /> FALL CLEANUP SERVICES</span></div>
          <h1>Fall Yard Cleanup in Douglasville, GA</h1>
          <p className="mp-hero-services">Leaf Removal • Bed Cleanout • Final Mow • Haul-Away</p>
          <p className="mp-hero-sub">Leaves piling up faster than you can rake them? We handle fall yard cleanup — leaf removal, bed cleanout, and debris haul-away — for homeowners throughout Douglas County.</p>
          <div className="mp-fhero-btns">
            <button onClick={() => openQuote("hero")} className="mp-btn mp-btn-lg"><FileText size={19} /> Get My Free Fall Cleanup Quote <ArrowRight size={18} /></button>
            <a href={`tel:${content.phone}`} className="mp-btn-outline mp-btn-lg"><Phone size={18} /> Call {phoneDisplay}</a>
          </div>
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="mp-rating">
            <GoogleG size={24} />
            <strong>5.0</strong>
            <span className="mp-stars">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={17} fill="#FBBC04" color="#FBBC04" />)}</span>
            <span className="mp-rating-sep" />
            <span className="mp-u">65 Google Reviews</span>
          </a>
        </div>
      </section>

      <div className="mp-wrap mp-fwrap"><TrustBar /></div>

      {/* WHAT'S INCLUDED */}
      <section className="mp-wrap mp-fwrap mp-sec">
        <div className="mp-eyebrow">WHAT'S INCLUDED</div>
        <h2 className="mp-h2">Leaf Removal &amp; Fall Yard Cleanup</h2>
        <p className="mp-lead">A complete fall cleanup to keep your yard clean, healthy, and ready for winter.</p>
        <div className="mp-fsvc-grid">
          {[
            [<Wind key="i" />, "Leaf Removal", "Full-yard leaf clearing from the lawn, beds, and hardscapes."],
            [<Tractor key="i" />, "Fall Mow & Edge", "One last clean cut and edge before the grass goes dormant."],
            [<Sprout key="i" />, "Bed Cleanout", "Leaves and debris cleared out of flower beds and borders."],
            [<Trash2 key="i" />, "Bag & Haul Away", "Leaves bagged and removed from the property instead of piled on-site — $5–8/bag."],
          ].map(([icon, t, d]) => (
            <div key={t} className="mp-card mp-fsvc">
              <div className="mp-fsvc-icon">{icon}</div>
              <div><h3>{t}</h3><p>{d}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="mp-wrap mp-fwrap mp-sec-sm">
        <div className="mp-eyebrow">REAL RESULTS</div>
        <h2 className="mp-h2">See the Difference</h2>
        <p className="mp-lead">A real Mow Pro fall cleanup — Douglasville, GA.</p>
        <div className="mp-ba-frame mp-fba">
          <BeforeAfterSlider before="/images/before-leaf-driveway.webp" after="/images/after-leaf-driveway.webp" aspect="5/2" />
        </div>
      </section>

      {/* PRICING */}
      <section id="fall-pricing" className="mp-wrap mp-fwrap mp-sec-sm">
        <div className="mp-fprice">
          <div className="mp-fprice-head">
            <Leaf size={34} className="mp-fprice-leaf" />
            <div>
              <h2 className="mp-h2">Fall Cleanup Pricing</h2>
              <p className="mp-lead">Leaf removal is priced by yard size. We confirm the exact price once we see the property in person.</p>
            </div>
          </div>
          <div className="mp-price-grid">
            {sizes.map((s, i) => (
              <button key={s.key} className={`mp-card mp-price${i === 0 ? " is-featured" : ""}`} onClick={() => openQuote(`pricing_${s.key}`)}>
                <Leaf size={20} className="mp-price-icon mp-orange" />
                <div className="mp-price-name">{["Small Yards", "Medium Yards", "Large Yards"][i]}</div>
                <div className="mp-price-amt">${LEAF_PRICES[s.key]}+</div>
                <div className="mp-price-per">Starting price</div>
                <div className="mp-price-size">{s.sub}</div>
              </button>
            ))}
          </div>
          <div className="mp-card mp-fhaul">
            <Truck size={34} className="mp-fhaul-icon" />
            <div className="mp-fhaul-txt"><strong>Bag &amp; haul away</strong><span>Optional add-on</span><span className="mp-dim">(default is piled on-site)</span></div>
            <b>$5–8/bag</b>
          </div>
          <p className="mp-price-note"><CheckCircle2 size={19} color="#A6E35A" /> Reference pricing — your exact price is confirmed in person before any work starts.</p>
        </div>
      </section>

      {/* REVIEWS — real review, quoted word for word */}
      <section className="mp-wrap mp-fwrap mp-sec-sm">
        <h2 className="mp-h2">What Neighbors Are Saying</h2>
        <p className="mp-lead mp-lead-tight">Real reviews from local customers on Google.</p>
        <div className="mp-frev-bar">
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="mp-rev-badge mp-rev-badge-plain">
            <GoogleG size={24} /> <strong>5.0</strong> <span className="mp-rating-sep" /> <span className="mp-u">65 Reviews</span>
          </a>
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="mp-btn-outline mp-btn-sm">Read All Reviews <ArrowRight size={15} /></a>
        </div>
        <div className="mp-card mp-frev">
          <div className="mp-stars">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={19} fill="#FBBC04" color="#FBBC04" />)}</div>
          <p>“On time, grass looks great! Does a great job edging the yard which really makes it look good. 10/10 service.”</p>
          <div className="mp-frev-who">
            <span className="mp-frev-av">J</span>
            <div><strong>Jimmy T.</strong><span>Google review</span></div>
          </div>
        </div>
      </section>

      {/* SERVICE AREAS */}
      <section className="mp-wrap mp-fwrap mp-sec-sm">
        <div className="mp-farea-head">
          <MapPin size={28} color="#A6E35A" />
          <div>
            <h2 className="mp-h2">Fall Cleanup Service Areas</h2>
            <p className="mp-lead mp-lead-tight">Proudly serving Douglasville and Douglas County, GA, including:</p>
          </div>
        </div>
        <div className="mp-chips mp-chips-row">
          {SERVICE_AREAS.map((area) => (
            <span key={area} className="mp-chip"><MapPin size={14} color="#A6E35A" /> {area}</span>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mp-wrap mp-fwrap mp-sec-sm mp-faq">
        <h2 className="mp-h2">Fall Cleanup Questions</h2>
        <p className="mp-lead mp-lead-tight">Quick answers to common questions.</p>
        {FALL_FAQ.map((item, i) => (
          <details key={i} className="mp-faq-item">
            <summary>{item.q}<Plus size={18} className="mp-faq-plus" /></summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
      </main>
    </SiteShell>
  );
}

// ─── Leaf Removal service page ──────────────────────────────────────────────
// Copy lives in siteData.js so the crawler version (middleware.js) matches.
function LeafRemovalPage({ content, navigate, setShowQuote, showQuote }) {
  const card = { border: "1px solid #24331F", borderRadius: 12, padding: "16px 18px", background: "#152016", textAlign: "left" };
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0F1A10", color: "#F5F3EE", minHeight: "100vh" }}>
      {/* NAV */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 10, padding: "18px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 18, background: "none", border: "none", color: "#F5F3EE", cursor: "pointer", padding: 0, textDecoration: "none" }}>
          <img src="/images/logo.png" alt="Mow Pro GA logo" style={{ width: 40, height: 40, borderRadius: "50%", display: "block" }} />
          Mow Pro GA
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "flex-end", rowGap: 8 }}>
          <a href="/fall-cleanup" onClick={(e) => { e.preventDefault(); navigate("/fall-cleanup"); }} style={{ background: "none", border: "none", color: "#F5F3EE", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "none" }}>
            Fall Cleanup
          </a>
          <a href={`tel:${content.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#F5F3EE", textDecoration: "none" }}>
            <Phone size={14} color="#8FBC6A" />
            {content.phone}
          </a>
          <button onClick={() => setShowQuote(true)} style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            Get Quote
          </button>
        </div>
      </div>

      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px 0" }}>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "#8FBC6A", fontWeight: 700, fontSize: 13.5, textDecoration: "none" }}>
          ← Back to home
        </a>
      </div>

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "24px 24px 0", textAlign: "center" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8FBC6A", marginBottom: 12 }}>Leaf Removal</div>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 16px" }}>
          Leaf Removal Service in Douglasville, GA
        </h1>
        <p style={{ fontSize: 16, color: "#D8DED2", lineHeight: 1.7, margin: "0 auto 26px", maxWidth: 560 }}>{LEAF_REMOVAL_INTRO}</p>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
          <button
            onClick={() => { trackEvent("quote_opened", { location: "leaf_removal_hero" }); setShowQuote(true); }}
            style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 10, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            Get My Free Leaf Removal Quote <ArrowRight size={18} />
          </button>
          <a href={`tel:${content.phone}`} style={{ background: "transparent", color: "#F5F3EE", border: "1.5px solid #3A4A38", borderRadius: 10, padding: "16px 26px", fontSize: 15, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Phone size={16} /> Call Now
          </a>
        </div>
        <a
          href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer"
          aria-label={`${content.ratingLine} — opens in a new tab`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#B9C4B2", textDecoration: "underline", marginBottom: 46 }}
        >
          <div style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="#8FBC6A" color="#8FBC6A" />)}
          </div>
          {content.ratingLine}
          <ExternalLink size={12} />
        </a>

        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>See the Difference</h2>
          <p style={{ color: "#B9C4B2", margin: "0 0 20px" }}>A real Mow Pro leaf job, before and after</p>
          <div style={{ maxWidth: 400, margin: "0 auto" }}>
            <BeforeAfterSlider before="/images/before-leaf-driveway.webp" after="/images/after-leaf-driveway.webp" aspect="3/4" />
            <p style={{ textAlign: "center", fontSize: 12.5, color: "#7C8A78", marginTop: 8 }}>Drag to see it before — and after</p>
          </div>
        </div>

        <JobPhotos photos={LEAF_PAGE_PHOTOS} />

        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 10px" }}>Why Clear the Leaves</h2>
          <p style={{ color: "#B9C4B2", lineHeight: 1.7, maxWidth: 560, margin: "0 auto" }}>{LEAF_REMOVAL_WHY}</p>
        </div>

        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 20px" }}>How Our Leaf Removal Works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
            {LEAF_REMOVAL_OPTIONS.map(([t, d]) => (
              <div key={t} style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15.5, marginBottom: 6 }}><Wind size={18} color="#8FBC6A" />{t}</div>
                <div style={{ fontSize: 14, color: "#B9C4B2", lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Leaf Removal Pricing</h2>
          <p style={{ color: "#B9C4B2", margin: "0 auto 20px", lineHeight: 1.6, maxWidth: 560 }}>Priced by yard size. Regular mowing customers get a discounted leaf rate. We confirm the exact price once we see the property in person.</p>
          <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
            {[...LEAF_PRICE_ROWS, ["Bag & haul away (optional, default is piled on-site)", "$5–8/bag"]].map(([label, price]) => (
              <div key={label} style={{ border: "1px solid #24331F", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, background: "#152016" }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{label}</div>
                <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 15, whiteSpace: "nowrap" }}>{price}</div>
              </div>
            ))}
          </div>
          <button
            onClick={() => { trackEvent("quote_opened", { location: "leaf_removal_pricing" }); setShowQuote(true); }}
            style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 10, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24 }}
          >
            Get My Free Leaf Removal Quote <ArrowRight size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>What to Do With the Leaves in Douglas County</h2>
          <p style={{ color: "#B9C4B2", margin: "0 auto 20px", lineHeight: 1.6, maxWidth: 560 }}>Leaf pickup rules depend on where you live. Here's how it works around here:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {LEAF_LOCAL_RULES.map(([t, d]) => (
              <div key={t} style={card}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 800, fontSize: 15, marginBottom: 6 }}><MapPin size={16} color="#8FBC6A" />{t}</div>
                <div style={{ fontSize: 14, color: "#B9C4B2", lineHeight: 1.6 }}>{d}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Leaf Removal by Neighborhood</h2>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10, marginTop: 16 }}>
            {NEIGHBORHOODS.map((n) => (
              <a key={n.slug} href={`/lawn-care/${n.slug}`} onClick={(e) => { e.preventDefault(); navigate(`/lawn-care/${n.slug}`); }}
                style={{ display: "flex", alignItems: "center", gap: 6, background: "#152016", border: "1px solid #24331F", borderRadius: 999, padding: "8px 16px", fontSize: 13.5, fontWeight: 700, color: "#F5F3EE", textDecoration: "none" }}>
                <MapPin size={14} color="#8FBC6A" />{n.short || n.name.replace(/^the /, "")}
              </a>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 20, textAlign: "left" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", margin: "0 0 24px" }}>Leaf Removal Questions</h2>
          {LEAF_REMOVAL_FAQ.map(([q, a]) => (
            <div key={q} style={{ borderBottom: "1px solid #24331F", padding: "18px 0" }}>
              <div style={{ fontWeight: 700, fontSize: 15.5, color: "#F5F3EE", marginBottom: 6 }}>{q}</div>
              <div style={{ fontSize: 14, color: "#B9C4B2", lineHeight: 1.6 }}>{a}</div>
            </div>
          ))}
          <p style={{ textAlign: "center", color: "#B9C4B2", fontSize: 14.5, marginTop: 22 }}>
            Want the full end-of-season package? See our{" "}
            <a href="/fall-cleanup" onClick={(e) => { e.preventDefault(); navigate("/fall-cleanup"); }} style={{ color: "#8FBC6A", fontWeight: 700, textDecoration: "none" }}>fall yard cleanup</a>.
          </p>
        </div>
      </main>

      <div style={{ background: "#8FBC6A", color: "#0F1A10", padding: "40px 24px", textAlign: "center", marginTop: 30 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Leaves piling up?</h2>
        <p style={{ margin: "0 0 20px", opacity: 0.85 }}>Text, call, or request a quote — most yards confirmed same day.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => { trackEvent("quote_opened", { location: "leaf_removal_footer" }); setShowQuote(true); }} style={{ background: "#0F1A10", color: "#F5F3EE", border: "none", borderRadius: 10, padding: "14px 30px", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Get My Free Instant Quote
          </button>
          <a href={`tel:${content.phone}`} style={{ background: "transparent", color: "#0F1A10", border: "1.5px solid #0F1A10", borderRadius: 10, padding: "14px 30px", fontSize: 15, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Phone size={16} /> Call Mow Pro Now
          </a>
        </div>
      </div>

      <QuoteModal open={showQuote} onClose={() => setShowQuote(false)} basePrice={content.price} initialServiceType="leaf" />
      <ChatWidget />

      <div style={{ textAlign: "center", padding: "20px 20px 0" }}>
        <a href="https://urbanagcouncil.com" target="_blank" rel="noopener noreferrer">
          <img src="/images/urban-ag-council-badge.webp" alt="Mow Pro Lawn Care is a proud member of the Georgia Urban Ag Council" style={{ maxWidth: 160, width: "100%", height: "auto" }} />
        </a>
      </div>
      <div style={{ textAlign: "center", padding: 20, fontSize: 12.5, color: "#7C8A78" }}>
        Mow Pro GA · Mow Pro Lawn Care LLC · Douglasville, GA
      </div>
    </div>
  );
}

// Same pricing tiers shown on the homepage and /fall-cleanup, reused here so
// a neighborhood page's numbers can't drift out of sync with the real prices.
const NEIGHBORHOOD_NEARBY_LIST = (currentSlug) =>
  NEIGHBORHOODS.filter((x) => x.slug !== currentSlug).map((x) => x.name).join(", ");

function NeighborhoodPage({ neighborhood, content, navigate, setShowQuote, showQuote }) {
  const n = neighborhood;
  const photos = neighborhoodPhotos(n);
  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0F1A10", color: "#F5F3EE", minHeight: "100vh" }}>
      {/* NAV */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 10, padding: "18px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 18, background: "none", border: "none", color: "#F5F3EE", cursor: "pointer", padding: 0, textDecoration: "none" }}>
          <img src="/images/logo.png" alt="Mow Pro GA logo" style={{ width: 40, height: 40, borderRadius: "50%", display: "block" }} />
          Mow Pro GA
        </a>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "flex-end", rowGap: 8 }}>
          <a href="/fall-cleanup" onClick={(e) => { e.preventDefault(); navigate("/fall-cleanup"); }} style={{ background: "none", border: "none", color: "#F5F3EE", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "none" }}>
            Fall Cleanup
          </a>
          <a href="/leaf-removal" onClick={(e) => { e.preventDefault(); navigate("/leaf-removal"); }} style={{ background: "none", border: "none", color: "#F5F3EE", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "none" }}>
            Leaf Removal
          </a>
          <a href={`tel:${content.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#F5F3EE", textDecoration: "none" }}>
            <Phone size={14} color="#8FBC6A" />
            {content.phone}
          </a>
          <button onClick={() => setShowQuote(true)} style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            Get Quote
          </button>
        </div>
      </div>

      {/* BACK LINK */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px 0" }}>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#8FBC6A", fontWeight: 700, fontSize: 13.5, cursor: "pointer", padding: 0, textDecoration: "none" }}>
          ← Back to home
        </a>
      </div>

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "24px 24px 0", textAlign: "center" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8FBC6A", marginBottom: 12 }}>Local Lawn Care</div>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 16px" }}>
          Lawn Care in {placeLabel(n)}
        </h1>
        <p style={{ fontSize: 16, color: "#D8DED2", lineHeight: 1.7, margin: "0 auto 26px", maxWidth: 560 }}>
          Mow Pro GA provides biweekly lawn mowing, edging, and yard cleanup to homeowners in {n.name === n.city ? n.name : `${n.name}, a non-gated residential area of ${n.city}, Georgia`}. Local, family-run, and fully insured — we quote every job in person and stand behind every cut. Same-day quotes, no contracts.
        </p>
        {n.intro && (
          <p style={{ fontSize: 15, color: "#B9C4B2", lineHeight: 1.7, margin: "-10px auto 26px", maxWidth: 560 }}>{n.intro}</p>
        )}

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 20 }}>
          <button
            onClick={() => { trackEvent("quote_opened", { location: "neighborhood_hero", neighborhood: n.slug }); setShowQuote(true); }}
            style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 10, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            Get My Free Instant Quote <ArrowRight size={18} />
          </button>
          <a href={`tel:${content.phone}`} style={{ background: "transparent", color: "#F5F3EE", border: "1.5px solid #3A4A38", borderRadius: 10, padding: "16px 26px", fontSize: 15, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Phone size={16} /> Call Now
          </a>
        </div>

        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${content.ratingLine} — opens in a new tab`}
          style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13.5, color: "#B9C4B2", textDecoration: "underline", marginBottom: 46 }}
        >
          <div style={{ display: "flex", gap: 2 }}>
            {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={13} fill="#8FBC6A" color="#8FBC6A" />)}
          </div>
          {content.ratingLine}
          <ExternalLink size={12} />
        </a>

        {/* BEFORE / AFTER — a real completed job, not staged for this
            specific neighborhood (no photo library is tagged that way), but
            genuine proof of work rather than a stock or invented image. Sized
            with an explicit aspect-ratio via BeforeAfterSlider so it doesn't
            shift layout while loading, and it's the only large image this
            page loads — no separate preload, no eager hint — so it doesn't
            add weight beyond what the homepage already costs. */}
        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>See the Difference</h2>
          <p style={{ color: "#B9C4B2", margin: "0 0 20px" }}>A real Mow Pro GA yard, before and after</p>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <BeforeAfterSlider before={photos.before} after={photos.after} />
            <p style={{ textAlign: "center", fontSize: 12.5, color: "#7C8A78", marginTop: 8 }}>Drag to see it before — and after</p>
          </div>
        </div>

        {/* WHAT'S INCLUDED */}
        <div style={{ marginBottom: 50, textAlign: "left" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px", textAlign: "center" }}>What's Included, Every Visit</h2>
          <p style={{ textAlign: "center", color: "#B9C4B2", margin: "0 0 24px" }}>No surprises. No upsells. Just a clean yard.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
            <ServiceCard icon={<Scissors size={22} color="#8FBC6A" />} title="Mowing & Edging" desc="Clean, consistent cuts with sharp, well-maintained equipment." />
            <ServiceCard icon={<Sprout size={22} color="#8FBC6A" />} title="Weed Eating" desc="Fence lines, mailboxes, and obstacles — fully trimmed, every time." />
            <ServiceCard icon={<Wind size={22} color="#8FBC6A" />} title="Blow-Off Cleanup" desc="Driveways and walkways left spotless when we're done." />
            <ServiceCard icon={<Sprout size={22} color="#8FBC6A" />} title="Crack Spray Add-On" desc="Keep walkways weed-free — available as an add-on, +$25+." />
          </div>
        </div>

        {/* PRICING */}
        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>{n.name} Lawn Care Pricing</h2>
          <p style={{ color: "#B9C4B2", margin: "0 auto 20px", lineHeight: 1.6, maxWidth: 560 }}>
            Every-2-weeks maintenance starting at $65+ per visit, priced by yard size. Mowing, edging, weed eating, and blow-off are all included — no surprise add-ons. Weekly, monthly, and one-time cuts are also available (see the quote form). We confirm the exact price once we see the property in person.
          </p>
          <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "left" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {SIZE_OPTIONS.map((opt) => (
                <div key={opt.key} style={{ border: "1px solid #24331F", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#152016" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: "#7C8A78" }}>{opt.sub}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 15 }}>
                    {MOW_PRICES.Biweekly[opt.key] == null ? "Custom" : `$${MOW_PRICES.Biweekly[opt.key]}+`}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => { trackEvent("quote_opened", { location: "neighborhood_pricing", neighborhood: n.slug }); setShowQuote(true); }}
            style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 10, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24 }}
          >
            Get My Free Instant Quote <ArrowRight size={18} />
          </button>
        </div>

        {/* LEAF REMOVAL & FALL CLEANUP — local leaf-disposal rules for this area */}
        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 12px" }}>Leaf Removal & Fall Cleanup in {n.name}</h2>
          <p style={{ color: "#B9C4B2", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 12px" }}>{leafRuleText(n)}</p>
          <p style={{ color: "#B9C4B2", lineHeight: 1.7, maxWidth: 560, margin: "0 auto 18px" }}>{leafServiceText(n)}</p>
          <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "left", display: "flex", flexDirection: "column", gap: 10 }}>
            {LEAF_PRICE_ROWS.map(([label, price]) => (
              <div key={label} style={{ border: "1px solid #24331F", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, background: "#152016" }}>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>{label}</div>
                <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 15, whiteSpace: "nowrap" }}>{price}</div>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", marginTop: 16 }}>
            <a href="/leaf-removal" onClick={(e) => { e.preventDefault(); navigate("/leaf-removal"); }} style={{ color: "#8FBC6A", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Leaf removal service →</a>
            <a href="/fall-cleanup" onClick={(e) => { e.preventDefault(); navigate("/fall-cleanup"); }} style={{ color: "#8FBC6A", fontWeight: 700, fontSize: 14, textDecoration: "none" }}>Fall yard cleanup →</a>
          </div>
        </div>

        {/* LOCAL FAQ — only for neighborhoods with page-specific questions */}
        {n.faq && (
          <div style={{ marginBottom: 50, textAlign: "left", maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", margin: "0 0 24px" }}>{n.name} Lawn Care Questions</h2>
            {n.faq.map(([q, a]) => (
              <div key={q} style={{ borderBottom: "1px solid #24331F", padding: "18px 0" }}>
                <div style={{ fontWeight: 700, fontSize: 15.5, color: "#F5F3EE", marginBottom: 6 }}>{q}</div>
                <div style={{ fontSize: 14, color: "#B9C4B2", lineHeight: 1.6 }}>{a}</div>
              </div>
            ))}
          </div>
        )}

        {/* NEARBY */}
        <div style={{ marginBottom: 20 }}>
          <h2 style={{ fontSize: 22, fontWeight: 800, margin: "0 0 10px" }}>Also Serving Nearby</h2>
          <p style={{ color: "#B9C4B2", lineHeight: 1.6, maxWidth: 560, margin: "0 auto" }}>
            Mow Pro GA also serves {NEIGHBORHOOD_NEARBY_LIST(n.slug)}, plus Douglasville and Douglas County, GA generally.
          </p>
        </div>
      </main>

      {/* FOOTER CTA */}
      <div style={{ background: "#8FBC6A", color: "#0F1A10", padding: "40px 24px", textAlign: "center", marginTop: 30 }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Ready for a yard you don't have to think about?</h2>
        <p style={{ margin: "0 0 20px", opacity: 0.85 }}>Text, call, or request a quote — most yards confirmed same day.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => { trackEvent("quote_opened", { location: "neighborhood_footer", neighborhood: n.slug }); setShowQuote(true); }} style={{ background: "#0F1A10", color: "#F5F3EE", border: "none", borderRadius: 10, padding: "14px 30px", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Get My Free Instant Quote
          </button>
          <a href={`tel:${content.phone}`} style={{ background: "transparent", color: "#0F1A10", border: "1.5px solid #0F1A10", borderRadius: 10, padding: "14px 30px", fontSize: 15, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Phone size={16} /> Call Mow Pro Now
          </a>
        </div>
      </div>

      <QuoteModal open={showQuote} onClose={() => setShowQuote(false)} basePrice={content.price} />
      <ChatWidget />

      <div style={{ textAlign: "center", padding: "20px 20px 0" }}>
        <a href="https://urbanagcouncil.com" target="_blank" rel="noopener noreferrer">
          <img
            src="/images/urban-ag-council-badge.webp"
            alt="Mow Pro Lawn Care is a proud member of the Georgia Urban Ag Council"
            style={{ maxWidth: 160, width: "100%", height: "auto" }}
          />
        </a>
      </div>
      <div style={{ textAlign: "center", padding: 20, fontSize: 12.5, color: "#7C8A78" }}>
        Mow Pro GA · Mow Pro Lawn Care LLC · Douglasville, GA
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────
// QUOTE LANDING PAGE — built specifically for paid ad clicks (Nextdoor first,
// same shape works for any platform), not for organic visitors browsing the
// site. Follows conversion-centered design principles (Oli Gardner/Unbounce):
//   - 1:1 attention ratio: no nav links, no "About", no footer link maze —
//     the only things a visitor can click on this page lead to a quote.
//   - Message match: headline and body copy mirror the ad's own wording
//     exactly, so a visitor recognizes they landed in the right place.
//   - Design match: same real photo style, same brand colors as the ad.
//   - Trust signals (rating) sit right under the headline, not buried below
//     the fold.
//   - A sticky click-to-call bar runs alongside the quote-form path, since
//     some mobile visitors will always prefer calling over typing.
function QuoteLandingPage({ content, showQuote, setShowQuote, quoteServiceType, setQuoteServiceType }) {
  const openQuote = (serviceType, location) => {
    trackEvent("quote_opened", { location });
    setQuoteServiceType(serviceType);
    setShowQuote(true);
  };

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0F1A10", color: "#F5F3EE", minHeight: "100vh", paddingBottom: 84 }}>
      {/* Minimal header — logo only, no nav links, nothing to click except
          the two paths to a quote below */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "18px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 17 }}>
          <img src="/images/logo.png" alt="Mow Pro GA logo" style={{ width: 36, height: 36, borderRadius: "50%", display: "block" }} />
          Mow Pro GA
        </div>
      </div>

      <main style={{ maxWidth: 480, margin: "0 auto", padding: "8px 20px 0", textAlign: "center" }}>
        {/* HEADLINE — message-matches the Nextdoor ad exactly */}
        <h1 style={{ fontSize: "clamp(24px, 6vw, 32px)", fontWeight: 800, lineHeight: 1.2, margin: "0 0 10px" }}>
          Professional Lawn Care <span style={{ color: "#8FBC6A" }}>•</span> Douglasville <span style={{ color: "#8FBC6A" }}>•</span> Trusted by Neighbors
        </h1>

        {/* TRUST BAR — right under the headline, not buried below the fold.
            Links to the real Google review page so the claim is verifiable
            instead of just text; opens in a new tab specifically because
            this is reference material a visitor checks mid-task (deciding
            whether to trust us enough to fill out the quote form below),
            not a general nav link — the quote page stays open behind it. */}
        <a
          href={GOOGLE_REVIEWS_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${content.ratingLine} — opens in a new tab`}
          onClick={() => trackEvent("reviews_link_click", { location: "quote_page_trust_bar" })}
          style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#1C2B1B", border: "1px solid #2A3A28", color: "#F5F3EE", fontSize: 13.5, fontWeight: 700, padding: "8px 16px", borderRadius: 999, margin: "0 0 20px", textDecoration: "underline", textUnderlineOffset: 2, cursor: "pointer" }}
        >
          <div style={{ display: "flex", gap: 1 }}>
            {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="#8FBC6A" color="#8FBC6A" />)}
          </div>
          {content.ratingLine}
          <ExternalLink size={12} style={{ opacity: 0.7, flexShrink: 0 }} />
        </a>

        {/* REAL PHOTO — proof of actual work, no stock imagery */}
        <div style={{ marginBottom: 24 }}>
          <BeforeAfterSlider before="/images/before-lawn.webp" after="/images/after-lawn.webp" />
        </div>

        <p style={{ fontSize: 15.5, color: "#D8DED2", lineHeight: 1.6, margin: "0 0 28px" }}>
          Mowing, edging, weed eating — all included. Fall cleanup & leaf removal now available. Book now before peak season.
        </p>

        {/* THE ONE DECISION ON THIS PAGE: pick a service, land straight in the quote form */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
          <button
            onClick={() => openQuote("leaf", "quote_page_fall")}
            style={{
              background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 14,
              padding: "20px 22px", cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
            }}
          >
            <span>
              <span style={{ display: "block", fontSize: 17, fontWeight: 800 }}>Fall Cleanup & Leaf Removal</span>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, opacity: 0.85, marginTop: 2 }}>Leaves bagged or piled — you choose</span>
            </span>
            <ArrowRight size={22} style={{ flexShrink: 0 }} />
          </button>

          <button
            onClick={() => openQuote("mowing", "quote_page_mowing")}
            style={{
              background: "transparent", color: "#F5F3EE", border: "1.5px solid #3A4A38", borderRadius: 14,
              padding: "20px 22px", cursor: "pointer", textAlign: "left",
              display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
            }}
          >
            <span>
              <span style={{ display: "block", fontSize: 17, fontWeight: 800 }}>Lawn Mowing</span>
              <span style={{ display: "block", fontSize: 13, fontWeight: 600, opacity: 0.75, marginTop: 2 }}>Mowing, edging, weed eating — all included</span>
            </span>
            <ArrowRight size={22} style={{ flexShrink: 0 }} />
          </button>
        </div>

        <div style={{ fontSize: 12.5, color: "#7C8A78", marginBottom: 20 }}>
          No contracts. Free estimate. Most quotes confirmed same day.
        </div>
      </main>

      {/* Keyed by service type so switching between the two buttons above
          resets the modal to the right service instead of reusing whatever
          the form's internal state happened to be from a previous open. */}
      <QuoteModal key={quoteServiceType} open={showQuote} onClose={() => setShowQuote(false)} basePrice={content.price} initialServiceType={quoteServiceType} />

      {/* STICKY CALL BAR — thumb-reachable parallel path to the form, always
          visible since this traffic is ~100% mobile app users */}
      <a
        href={`tel:${content.phone}`}
        onClick={() => trackEvent("call_click", { location: "quote_page_sticky" })}
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, background: "#0F1A10",
          borderTop: "1px solid #24331F", padding: "14px 20px", display: "flex",
          alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none",
          color: "#F5F3EE", fontWeight: 800, fontSize: 15.5, zIndex: 150,
        }}
      >
        <Phone size={18} color="#8FBC6A" /> Call {content.phone} for a Free Estimate
      </a>
    </div>
  );
}

export default function MowProLanding() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const editing = false; // Public site — editing happens by updating the code directly, not in-browser.
  const [showQuote, setShowQuote] = useState(false);
  const [quoteServiceType, setQuoteServiceType] = useState("mowing");
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [showMorePairs, setShowMorePairs] = useState(false);
  const [route, setRoute] = useState(() => pathToRoute(typeof window !== "undefined" ? window.location.pathname : "/"));

  useEffect(() => {
    loadGoogleAnalytics();
    captureLeadSource();
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(pathToRoute(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (route === "fall-cleanup") {
      applyPageSEO(FALL_CLEANUP_SEO);
      setPageJsonLd([FALL_CLEANUP_JSONLD, FALL_CLEANUP_FAQ_JSONLD]);
    } else if (route === "leaf-removal") {
      applyPageSEO(LEAF_REMOVAL_SEO);
      setPageJsonLd([LEAF_REMOVAL_JSONLD, LEAF_REMOVAL_FAQ_JSONLD]);
    } else if (route === "about") {
      applyPageSEO(ABOUT_SEO);
      setPageJsonLd([ABOUT_JSONLD]);
    } else if (route === "quote") {
      applyPageSEO(QUOTE_SEO);
      setPageJsonLd(null);
    } else if (route.startsWith("neighborhood:")) {
      const n = getNeighborhood(route.slice("neighborhood:".length));
      if (n) {
        applyPageSEO(neighborhoodSEO(n));
        setPageJsonLd(n.faq
          ? [neighborhoodJsonLd(n), { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: n.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) }]
          : [neighborhoodJsonLd(n)]);
      }
    } else {
      applyPageSEO(DEFAULT_SEO);
      setPageJsonLd(null);
    }
  }, [route]);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setRoute(pathToRoute(path));
    window.scrollTo(0, 0);
  };

  const update = (key, value) => setContent((c) => ({ ...c, [key]: value }));
  const updateReview = (i, key, value) => {
    const next = [...content.reviews];
    next[i] = { ...next[i], [key]: value };
    setContent((c) => ({ ...c, reviews: next }));
  };
  const addReview = () => setContent((c) => ({ ...c, reviews: [...c.reviews, { name: "New client", text: "", stars: 5, screenshot: "" }] }));
  const removeReview = (i) => setContent((c) => ({ ...c, reviews: c.reviews.filter((_, idx) => idx !== i) }));

  if (route === "about") {
    return <AboutPage content={content} navigate={navigate} setShowQuote={setShowQuote} showQuote={showQuote} />;
  }

  if (route === "fall-cleanup") {
    return <FallCleanupPage content={content} navigate={navigate} setShowQuote={setShowQuote} showQuote={showQuote} />;
  }

  if (route === "leaf-removal") {
    return <LeafRemovalPage content={content} navigate={navigate} setShowQuote={setShowQuote} showQuote={showQuote} />;
  }

  if (route.startsWith("neighborhood:")) {
    const n = getNeighborhood(route.slice("neighborhood:".length));
    if (n) {
      return <NeighborhoodPage neighborhood={n} content={content} navigate={navigate} setShowQuote={setShowQuote} showQuote={showQuote} />;
    }
  }

  if (route === "quote") {
    return (
      <QuoteLandingPage
        content={content}
        showQuote={showQuote}
        setShowQuote={setShowQuote}
        quoteServiceType={quoteServiceType}
        setQuoteServiceType={setQuoteServiceType}
      />
    );
  }

  const openQuote = (location) => { trackEvent("quote_opened", { location }); setShowQuote(true); };
  const goTo = (path) => (e) => { e.preventDefault(); navigate(path); };
  const phoneDisplay = formatPhone(content.phone);
  const visibleReviews = showAllReviews ? content.reviews : content.reviews.slice(0, 3);
  const visiblePairs = showMorePairs ? content.beforeAfterPairs : content.beforeAfterPairs.slice(0, 1);

  return (
    <SiteShell
      content={content} navigate={navigate} showQuote={showQuote} setShowQuote={setShowQuote} active="home"
      ctaTitle="Ready for a Yard You Don't Have to Think About?"
      ctaText="Get a free quote today and see why Douglasville homeowners trust Mow Pro GA."
    >
      <main>
      {/* HERO */}
      <section className="mp-hero">
        <div className="mp-hero-img">
          <img src={content.equipmentPhoto} alt="Mow Pro GA's Ferris mower, trimmers and blower in front of the company trailer" width="1402" height="713" fetchPriority="high" />
        </div>
        <div className="mp-hero-text">
          <div className="mp-pill"><MapPin size={13} /> {content.serviceArea}</div>
          <h1>Reliable Lawn Care in Douglasville, GA</h1>
          <p className="mp-hero-services">Mowing • Edging • Trimming • Cleanup</p>
          <p className="mp-hero-sub">Locally owned, family-run lawn care. Clean, consistent results, on-time service, fully insured, and no contracts.</p>
          <div className="mp-hero-btns">
            <button onClick={() => openQuote("hero")} className="mp-btn mp-btn-lg"><FileText size={19} /> Get My Free Instant Quote <ArrowRight size={18} /></button>
            <a href={`tel:${content.phone}`} className="mp-btn-outline mp-btn-lg"><Phone size={18} /> Call {phoneDisplay}</a>
          </div>
          <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="mp-rating">
            <GoogleG size={24} />
            <strong>5.0</strong>
            <span className="mp-stars">{[1, 2, 3, 4, 5].map((i) => <Star key={i} size={17} fill="#FBBC04" color="#FBBC04" />)}</span>
            <span className="mp-rating-sep" />
            <span className="mp-u">65 Google Reviews</span>
          </a>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="mp-wrap">
        <TrustBar />

        {/* FALL BANNER */}
        <div className="mp-fall">
          <div className="mp-fall-leaves" aria-hidden="true">
            <Leaf size={46} /><Leaf size={34} /><Leaf size={28} />
          </div>
          <img src="/images/before-leaf-driveway.webp" alt="" className="mp-fall-img" loading="lazy" />
          <div className="mp-fall-body">
            <div className="mp-fall-text">
              <span className="mp-fall-tag"><Leaf size={12} /> FALL SEASON SERVICE</span>
              <h2>Fall Cleanup &amp; Leaf Removal</h2>
              <p>Leaf removal, bed cleanup, and seasonal yard prep.</p>
            </div>
            <a href="/fall-cleanup" onClick={goTo("/fall-cleanup")} className="mp-btn">Get a Fall Cleanup Quote <ArrowRight size={17} /></a>
          </div>
        </div>
      </div>

      {/* SERVICES */}
      <section id="services" className="mp-wrap mp-sec">
        <div className="mp-eyebrow">OUR SERVICES</div>
        <h2 className="mp-h2">What's Included, Every Visit</h2>
        <p className="mp-lead">A clean, well-maintained yard — every time.</p>
        <div className="mp-svc-grid">
          {[
            [<Tractor key="i" />, "Mowing & Edging", "Clean, consistent cuts with sharp, well-maintained equipment."],
            [<Sprout key="i" />, "Weed Eating", "Fence lines, mailboxes, and obstacles fully trimmed."],
            [<Wind key="i" />, "Blow-Off Cleanup", "Driveways and walkways left spotless when we're done."],
          ].map(([icon, t, d]) => (
            <div key={t} className="mp-card mp-svc">
              <div className="mp-svc-icon">{icon}</div>
              <h3>{t}</h3>
              <p>{d}</p>
            </div>
          ))}
          <div className="mp-card mp-svc mp-addons mp-hide-sm">
            <div className="mp-addons-icon"><Plus size={22} /></div>
            <h3>Optional Add-Ons</h3>
            <ul>
              <li><a href="/leaf-removal" onClick={goTo("/leaf-removal")}><CheckIcon /> Leaf Removal</a></li>
              <li><CheckIcon /> Hedge &amp; Shrub Trimming</li>
              <li><CheckIcon /> Crack / Weed Spray</li>
              <li><CheckIcon /> Overgrown Cleanup</li>
            </ul>
          </div>
        </div>
        <div className="mp-show-sm">
          <div className="mp-eyebrow mp-eyebrow-sm">POPULAR ADD-ONS</div>
          <div className="mp-addon-row">
            {[[<SprayCan key="i" />, "Crack & Weed Spray"], [<Shrub key="i" />, "Hedge & Shrub Trimming"], [<Trees key="i" />, "Overgrowth Clearing"]].map(([icon, t]) => (
              <div key={t} className="mp-card mp-addon-chip">{icon}<span>{t}</span></div>
            ))}
          </div>
        </div>
      </section>

      {/* BEFORE / AFTER */}
      <section className="mp-wrap mp-sec mp-ba">
        <div className="mp-ba-text">
          <div className="mp-eyebrow mp-hide-sm">REAL RESULTS</div>
          <h2 className="mp-h2">See the Difference</h2>
          <p className="mp-lead">Real yards, real results in Douglasville, GA.</p>
          {content.beforeAfterPairs.length > 1 && (
            <button className="mp-btn-outline mp-hide-sm" onClick={() => setShowMorePairs((v) => !v)}>
              <ImageIcon size={17} /> {showMorePairs ? "Show Less" : "View More Results"}
            </button>
          )}
        </div>
        <div className="mp-ba-slides">
          {visiblePairs.map((pair, i) => (
            <div key={i} className="mp-ba-frame">
              <BeforeAfterSlider before={pair.before} after={pair.after} aspect="16/9" />
            </div>
          ))}
          {content.beforeAfterPairs.length > 1 && (
            <button className="mp-btn-outline mp-show-sm mp-full" onClick={() => setShowMorePairs((v) => !v)}>
              <ImageIcon size={17} /> {showMorePairs ? "Show Less" : "View More Results"}
            </button>
          )}
        </div>
      </section>

      {/* REVIEWS — real Google review screenshots */}
      <section id="reviews" className="mp-wrap mp-sec">
        <div className="mp-rev-head">
          <div>
            <div className="mp-eyebrow mp-hide-sm"><Star size={13} fill="#A6E35A" color="#A6E35A" /> CUSTOMER REVIEWS</div>
            <h2 className="mp-h2">What Neighbors Are Saying</h2>
            <p className="mp-lead">Real reviews from local customers on Google.</p>
          </div>
          <div className="mp-rev-actions">
            <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="mp-rev-badge">
              <GoogleG size={22} /> <strong>5.0</strong><span className="mp-hide-sm">&nbsp;Rating</span> <span className="mp-rating-sep" /> <span className="mp-u">65 Reviews</span>
            </a>
            <a href={GOOGLE_REVIEWS_URL} target="_blank" rel="noopener noreferrer" className="mp-btn-outline mp-btn-sm mp-hide-sm">Read All Reviews <ArrowRight size={15} /></a>
          </div>
        </div>
        <div className="mp-rev-grid">
          {visibleReviews.map((r, i) => (
            <div key={i} className="mp-card mp-rev">
              <img src={r.screenshot} alt={`Google review from ${r.name}`} width={r.w || 800} height={r.h || 500} loading="lazy" />
            </div>
          ))}
        </div>
        {content.reviews.length > 3 && (
          <div className="mp-center">
            <button className="mp-btn-outline" onClick={() => setShowAllReviews((v) => !v)}>
              {showAllReviews ? "Show Fewer Reviews" : `See ${content.reviews.length - 3} More Reviews`}
            </button>
          </div>
        )}
      </section>

      {/* PRICING */}
      <section id="pricing" className="mp-wrap mp-sec">
        <h2 className="mp-h2">Simple, Honest Pricing</h2>
        <p className="mp-lead">Biweekly lawn maintenance with clear, upfront rates.</p>
        <div className="mp-price-grid">
          {SIZE_OPTIONS.filter((s) => s.addOn !== null && s.addOn !== undefined).slice(0, 3).map((s, i) => (
            <button key={s.key} className={`mp-card mp-price${i === 0 ? " is-featured" : ""}`} onClick={() => openQuote(`pricing_${i}`)}>
              <Sprout size={20} className="mp-price-icon" />
              <div className="mp-price-name">{["Small Yards", "Medium Yards", "Large Yards"][i]}</div>
              <div className="mp-price-amt">${parseInt(content.price, 10) + s.addOn}+</div>
              <div className="mp-price-per">per visit</div>
              <div className="mp-price-size">{s.sub}</div>
            </button>
          ))}
        </div>
        <p className="mp-price-note"><CheckCircle2 size={19} color="#A6E35A" /> Estimates are starting prices and are confirmed in person based on property size, condition, and services needed.</p>
        <p className="mp-price-more">Weekly from $55+, monthly from $130+, one-time cuts from $105+. Over 20,000 sq ft gets a custom quote. New recurring customers have a one-time $25+ first-cut fee. Leaf season (Oct–Dec): recurring clients add leaf cleanup at a discounted $45/hr. Brush &amp; overgrowth clearing from $75+. No contracts — cancel anytime.</p>
      </section>

      {/* WHO WE ARE */}
      <section className="mp-wrap mp-sec-sm">
        <div className="mp-card mp-who">
          <div className="mp-who-img">
            <img src="/images/our-story.webp" alt="Joseph, owner of Mow Pro GA, on the company's Ferris mower" width="700" height="1516" loading="lazy" />
          </div>
          <div className="mp-who-body">
            <div className="mp-eyebrow">WHO WE ARE</div>
            <h2>A Local, Family-Run Business</h2>
            <p>Mow Pro GA is a locally owned, family-run, fully insured lawn care company in Douglasville, GA. Every job is quoted in person, every visit is held to the same standard, and every finished yard gets a photo-confirmed invoice. Your property is handled by our trusted, experienced team — familiar faces, not a rotating crew. The whole family is part of it, down to the kids handing out door hangers around the neighborhood. When you book with Mow Pro, you're booking a family that's building something real, one yard at a time.</p>
            <a href="/about" onClick={goTo("/about")} className="mp-link">Read Our Full Story <ArrowRight size={15} /></a>
          </div>
        </div>
      </section>

      {/* NEIGHBORHOODS — real links to each neighborhood page for visitors and crawlers */}
      <section className="mp-wrap mp-sec-sm mp-center">
        <h2 className="mp-h2">Neighborhoods We Serve</h2>
        <p className="mp-lead">Proudly serving Douglasville, GA and nearby areas, including:</p>
        <div className="mp-chips">
          {NEIGHBORHOODS.map((n) => (
            <a key={n.slug} href={`/lawn-care/${n.slug}`} onClick={goTo(`/lawn-care/${n.slug}`)} className="mp-chip">
              <MapPin size={14} color="#A6E35A" /> {n.name}
            </a>
          ))}
        </div>
      </section>

      {/* FAQ — <details> keeps every answer in the page for Google */}
      <section id="faq" className="mp-wrap mp-sec-sm mp-faq">
        <h2 className="mp-h2">Frequently Asked Questions</h2>
        <p className="mp-lead">Quick answers to common questions.</p>
        {HOME_FAQ.map((item, i) => (
          <details key={i} className="mp-faq-item">
            <summary>{item.q}<Plus size={18} className="mp-faq-plus" /></summary>
            <p>{item.a}</p>
          </details>
        ))}
      </section>
      </main>
    </SiteShell>
  );
}

function formatPhone(p) {
  return String(p).replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
}

// Shared header, closing CTA band, footer, quote modal, chat and sticky mobile
// bar for every redesigned page, so they all look and behave the same.
function SiteShell({ content, navigate, showQuote, setShowQuote, active, quoteType = "mowing", trackPrefix = "", ctaTitle, ctaText, children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const openQuote = (location) => { trackEvent("quote_opened", { location: trackPrefix + location }); setShowQuote(true); };
  const goTo = (path) => (e) => { e.preventDefault(); setMenuOpen(false); navigate(path); };
  const jump = (id) => (e) => {
    e.preventDefault();
    setMenuOpen(false);
    const go = () => { const el = document.getElementById(id); if (el) el.scrollIntoView({ behavior: "smooth", block: "start" }); };
    if (window.location.pathname === "/") go();
    else { navigate("/"); setTimeout(go, 80); }
  };
  const phoneDisplay = formatPhone(content.phone);
  return (
    <div className="mp" style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0A130B", color: "#F5F3EE", minHeight: "100vh" }}>
      {/* NAV */}
      <header className="mp-nav">
        <div className="mp-nav-in">
          <a href="/" onClick={goTo("/")} className="mp-brand">
            <img src="/images/logo.png" alt="Mow Pro GA logo" width="44" height="44" />
            <span>
              <span className="mp-brand-name">Mow Pro GA</span>
              <span className="mp-brand-sub">Lawn Care • Douglasville, GA</span>
            </span>
          </a>
          <nav className="mp-links" aria-label="Main">
            <a href="/" onClick={goTo("/")} className={active === "home" ? "is-active" : undefined}>Home</a>
            <div className="mp-drop">
              <a href="/#services" onClick={jump("services")}>Services <ChevronDown size={14} /></a>
              <div className="mp-drop-menu">
                <a href="/#services" onClick={jump("services")}>Lawn Mowing &amp; Edging</a>
                <a href="/fall-cleanup" onClick={goTo("/fall-cleanup")}>Fall Cleanup</a>
                <a href="/leaf-removal" onClick={goTo("/leaf-removal")}>Leaf Removal</a>
              </div>
            </div>
            <a href="/#pricing" onClick={jump("pricing")}>Pricing</a>
            <a href="/about" onClick={goTo("/about")}>About</a>
            <a href="/#reviews" onClick={jump("reviews")}>Reviews</a>
            <a href="/#faq" onClick={jump("faq")}>FAQ</a>
          </nav>
          <div className="mp-nav-cta">
            <a href={`tel:${content.phone}`} className="mp-btn-outline mp-hide-sm"><Phone size={16} /> {phoneDisplay}</a>
            <button onClick={() => openQuote("nav")} className="mp-btn mp-hide-sm">Get Free Quote</button>
            <a href={`tel:${content.phone}`} className="mp-icon-btn mp-show-sm" aria-label={`Call ${phoneDisplay}`}><Phone size={20} /></a>
            <button className="mp-menu-btn mp-show-sm" aria-label="Menu" aria-expanded={menuOpen} onClick={() => setMenuOpen((o) => !o)}>
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav className="mp-mobile-menu" aria-label="Mobile">
            <a href="/#services" onClick={jump("services")}>Services</a>
            <a href="/fall-cleanup" onClick={goTo("/fall-cleanup")}>Fall Cleanup</a>
            <a href="/leaf-removal" onClick={goTo("/leaf-removal")}>Leaf Removal</a>
            <a href="/#pricing" onClick={jump("pricing")}>Pricing</a>
            <a href="/about" onClick={goTo("/about")}>About</a>
            <a href="/#reviews" onClick={jump("reviews")}>Reviews</a>
            <a href="/#faq" onClick={jump("faq")}>FAQ</a>
            <button onClick={() => { setMenuOpen(false); openQuote("mobile_menu"); }} className="mp-btn mp-full">Get My Free Instant Quote <ArrowRight size={18} /></button>
          </nav>
        )}
      </header>

      {children}

      {/* CTA BAND */}
      <div className="mp-wrap">
        <div className="mp-cta">
          <div className="mp-cta-left">
            <CalendarDays size={52} className="mp-cta-icon" />
            <div>
              <h2>{ctaTitle}</h2>
              <p>{ctaText}</p>
            </div>
          </div>
          <div className="mp-cta-btns">
            <button onClick={() => openQuote("footer")} className="mp-btn mp-btn-lg">Get My Free Instant Quote <ArrowRight size={18} /></button>
            <a href={`tel:${content.phone}`} className="mp-btn-outline mp-btn-lg mp-btn-dark"><Phone size={17} /> Call {phoneDisplay}</a>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="mp-wrap mp-footer">
        <div className="mp-foot-top">
          <a href="/" onClick={goTo("/")} className="mp-brand">
            <img src="/images/logo.png" alt="Mow Pro GA logo" width="40" height="40" loading="lazy" />
            <span><span className="mp-brand-name">Mow Pro GA</span><span className="mp-brand-sub">Lawn Care • Douglasville, GA</span></span>
          </a>
          <nav className="mp-foot-links" aria-label="Footer">
            <a href="/" onClick={goTo("/")}>Home</a>
            <a href="/#services" onClick={jump("services")}>Services</a>
            <a href="/#pricing" onClick={jump("pricing")}>Pricing</a>
            <a href="/about" onClick={goTo("/about")}>About</a>
            <a href="/#reviews" onClick={jump("reviews")}>Reviews</a>
            <a href="/#faq" onClick={jump("faq")}>FAQ</a>
          </nav>
          <a href="https://urbanagcouncil.com" target="_blank" rel="noopener noreferrer" className="mp-badge">
            <img src="/images/urban-ag-council-badge.webp" alt="Mow Pro Lawn Care is a proud member of the Georgia Urban Ag Council" loading="lazy" />
          </a>
        </div>
        <div className="mp-foot-bottom">
          <span>© {new Date().getFullYear()} Mow Pro Lawn Care LLC. All rights reserved.</span>
          <span className="mp-foot-legal">
            <a href="/privacy.html">Privacy Policy</a>
            <a href="/terms.html">Terms of Service</a>
            <a href="/text-messaging.html">Text Message Terms</a>
          </span>
        </div>
      </footer>

      <QuoteModal open={showQuote} onClose={() => setShowQuote(false)} basePrice={content.price} initialServiceType={quoteType} />
      <ChatWidget />

      {/* STICKY MOBILE ACTION BAR */}
      <div className="mp-sticky-bar">
        <a href={`tel:${content.phone}`} className="mp-btn-outline"><Phone size={16} /> Call</a>
        <button onClick={() => openQuote("sticky_bar")} className="mp-btn">Get My Free Instant Quote</button>
      </div>
      <style>{HOME_CSS}</style>
    </div>
  );
}

function TrustBar() {
  return (
    <div className="mp-trust">
      {[
        [<Leaf key="i" />, "Local & Family-Run", "Proudly serving Douglasville"],
        [<ShieldCheck key="i" />, "Fully Insured", "Your property is protected"],
        [<CalendarCheck key="i" />, "No Contracts", "Cancel anytime"],
        [<Zap key="i" />, "Fast, Same-Day Quotes", "Know your price quickly"],
      ].map(([icon, t, s]) => (
        <div key={t} className="mp-trust-item">
          <div className="mp-trust-icon">{icon}</div>
          <div><div className="mp-trust-t">{t}</div><div className="mp-trust-s">{s}</div></div>
        </div>
      ))}
    </div>
  );
}

function GoogleG({ size = 22 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-4z"/>
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/>
      <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 36.5 26.8 37 24 37c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 40.5 16.3 45 24 45z"/>
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.3 5.3C40.9 36.6 44 30.9 44 24c0-1.4-.1-2.7-.4-3.5z"/>
    </svg>
  );
}

function CheckIcon() {
  return <CheckCircle2 size={16} color="#A6E35A" style={{ flexShrink: 0 }} />;
}

const HOME_CSS = `
.mp *{box-sizing:border-box}
.mp a{color:inherit}
.mp .mp-btn{color:#0A160B}
.mp .mp-btn-outline{color:#F5F3EE}
.mp-wrap{max-width:1100px;margin:0 auto;padding-left:20px;padding-right:20px}
.mp-btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:linear-gradient(180deg,#B9F26A 0%,#8ED24A 100%);color:#0A160B;border:none;border-radius:10px;padding:11px 18px;font-size:14.5px;font-weight:800;cursor:pointer;text-decoration:none;box-shadow:0 0 0 1px rgba(185,242,106,.25),0 6px 22px rgba(142,210,74,.25);font-family:inherit}
.mp-btn-outline{display:inline-flex;align-items:center;justify-content:center;gap:8px;background:rgba(10,19,11,.55);color:#F5F3EE;border:1.5px solid #A6E35A;border-radius:10px;padding:10px 18px;font-size:14.5px;font-weight:800;cursor:pointer;text-decoration:none;font-family:inherit}
.mp-btn-lg{padding:15px 24px;font-size:16px}
.mp-btn-sm{padding:9px 14px;font-size:13.5px}
.mp-btn-dark{background:rgba(5,12,6,.35);border-color:#0A160B;color:#F5F3EE}
.mp-full{width:100%}
.mp-u{text-decoration:underline;text-underline-offset:3px}
.mp-center{text-align:center}
.mp-icon-btn{display:flex;align-items:center;justify-content:center;width:46px;height:46px;border:1.5px solid #A6E35A;border-radius:10px;color:#A6E35A !important}
.mp-menu-btn{background:none;border:none;color:#F5F3EE;cursor:pointer;padding:6px;display:flex}
.mp-show-sm{display:none !important}

/* nav */
.mp-nav{position:relative;z-index:40;border-bottom:1px solid rgba(166,227,90,.14);background:#0A130B}
.mp-nav-in{max-width:1100px;margin:0 auto;padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.mp-brand{display:flex;align-items:center;gap:10px;text-decoration:none}
.mp-brand img{border-radius:50%;display:block}
.mp-brand-name{display:block;font-weight:900;font-size:21px;letter-spacing:-.01em;line-height:1.1}
.mp-brand-sub{display:block;font-size:11.5px;color:#C9D3C2;font-weight:500}
.mp-links{display:flex;align-items:center;gap:26px;font-size:14px;font-weight:600}
.mp-links>a,.mp-drop>a{text-decoration:none;color:#E6EBE0;display:inline-flex;align-items:center;gap:3px;padding:6px 0;border-bottom:2px solid transparent}
.mp-links a.is-active{border-bottom-color:#A6E35A}
.mp-links a:hover{color:#A6E35A}
.mp-drop{position:relative}
.mp-drop-menu{display:none;position:absolute;top:100%;left:-12px;background:#102012;border:1px solid #2A4A22;border-radius:10px;padding:8px;min-width:210px;box-shadow:0 12px 30px rgba(0,0,0,.45)}
.mp-drop:hover .mp-drop-menu,.mp-drop:focus-within .mp-drop-menu{display:block}
.mp-drop-menu a{display:block;padding:9px 10px;border-radius:7px;text-decoration:none;font-size:14px}
.mp-drop-menu a:hover{background:#1A311A}
.mp-nav-cta{display:flex;align-items:center;gap:12px}
.mp-mobile-menu{display:flex;flex-direction:column;padding:6px 20px 18px;border-top:1px solid #1E331C;background:#0A130B}
.mp-mobile-menu a{padding:13px 4px;border-bottom:1px solid #18291A;text-decoration:none;font-weight:700;font-size:16px}
.mp-mobile-menu .mp-btn{margin-top:14px;padding:15px}

/* hero */
.mp-hero{position:relative;max-width:1240px;margin:0 auto;display:grid;grid-template-columns:1.05fr 1fr;min-height:430px;overflow:hidden}
.mp-hero-img{grid-column:2;grid-row:1;position:relative;clip-path:polygon(18% 0,100% 0,100% 100%,0 100%)}
.mp-hero-img::before{content:"";position:absolute;inset:0;z-index:1;background:linear-gradient(90deg,rgba(10,19,11,.35),transparent 40%)}
.mp-hero-img::after{content:"";position:absolute;left:0;top:0;bottom:0;width:18%;z-index:2;background:linear-gradient(to bottom right,transparent calc(50% - 2px),#8ED24A calc(50% - 2px),#8ED24A calc(50% + 2px),transparent calc(50% + 2px))}
.mp-hero-img{overflow:hidden}
.mp-hero-img img{position:absolute;inset:0}
.mp-hero-img img{width:100%;height:100%;object-fit:cover;object-position:30% center;display:block;transform:scale(1.14);transform-origin:20% 20%}
.mp-hero-text{grid-column:1;grid-row:1;padding:30px 28px 44px 20px;display:flex;flex-direction:column;justify-content:center;position:relative;z-index:3}
.mp-pill{display:inline-flex;align-self:flex-start;align-items:center;gap:6px;background:#173418;border:1px solid #2E5A25;color:#E6F5D8;font-size:12px;font-weight:800;letter-spacing:.02em;padding:6px 13px;border-radius:999px;margin-bottom:16px}
.mp-pill svg{color:#A6E35A}
.mp-hero h1{font-size:clamp(32px,4.6vw,48px);font-weight:900;line-height:1.06;letter-spacing:-.025em;margin:0 0 12px}
.mp-hero-services{color:#A6E35A;font-weight:800;font-size:clamp(17px,2vw,21px);margin:0 0 12px}
.mp-hero-sub{color:#DCE3D6;font-size:15.5px;line-height:1.55;margin:0 0 22px;max-width:470px}
.mp-hero-btns{display:flex;gap:14px;flex-wrap:wrap;margin-bottom:18px}
.mp-rating{display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-size:15px;color:#F5F3EE}
.mp-stars{display:inline-flex;gap:1px}
.mp-rating-sep{display:inline-block;width:1px;height:16px;background:#5A6C55;margin:0 4px}

/* trust bar */
.mp-trust{display:grid;grid-template-columns:repeat(4,1fr);background:linear-gradient(180deg,#132414,#0E1B0F);border:1px solid #2A4A22;border-radius:14px;padding:14px 8px;position:relative;z-index:4;margin-top:-6px;box-shadow:0 10px 30px rgba(0,0,0,.35)}
.mp-trust-item{display:flex;align-items:center;gap:12px;padding:4px 16px;border-left:1px solid #2A4A22}
.mp-trust-item:first-child{border-left:none}
.mp-trust-icon svg{width:32px;height:32px;color:#A6E35A;stroke-width:1.8}
.mp-trust-t{font-weight:800;font-size:14px}
.mp-trust-s{font-size:11.5px;color:#B9C4B2;margin-top:2px}

/* fall banner */
.mp-fall{position:relative;margin-top:22px;border:1.5px solid #E08A2E;border-radius:14px;overflow:hidden;background:linear-gradient(90deg,#2A1606 0%,#1A2410 30%,#132013 60%,#2A1606 100%)}
.mp-fall-img{position:absolute;right:0;top:0;height:100%;width:34%;object-fit:cover;opacity:.75;-webkit-mask-image:linear-gradient(90deg,transparent,#000 55%);mask-image:linear-gradient(90deg,transparent,#000 55%)}
.mp-fall-leaves{position:absolute;left:10px;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;gap:2px;color:#E8892A;opacity:.95}
.mp-fall-leaves svg:nth-child(1){transform:rotate(-25deg);color:#F2A33A}
.mp-fall-leaves svg:nth-child(2){transform:rotate(30deg) translateX(18px);color:#D9531E}
.mp-fall-leaves svg:nth-child(3){transform:rotate(-10deg);color:#E9B23C}
.mp-fall-body{position:relative;display:flex;align-items:center;justify-content:space-between;gap:20px;padding:18px 36% 18px 200px}
.mp-fall-body .mp-btn{white-space:nowrap}
.mp-fall-tag{display:inline-flex;align-items:center;gap:5px;background:#5B8E2A;color:#F5FBEF;font-size:11px;font-weight:800;padding:4px 10px;border-radius:999px}
.mp-fall h2{font-size:clamp(21px,2.6vw,27px);font-weight:900;margin:6px 0 4px;letter-spacing:-.01em}
.mp-fall p{margin:0;color:#E6E1D6;font-size:14px}

/* sections */
.mp-sec{padding-top:46px;padding-bottom:10px}
.mp-sec-sm{padding-top:34px;padding-bottom:6px}
.mp-eyebrow{display:flex;align-items:center;gap:6px;color:#A6E35A;font-size:12.5px;font-weight:900;letter-spacing:.05em;margin-bottom:6px}
.mp-eyebrow-sm{margin-top:16px}
.mp-h2{font-size:clamp(24px,3.2vw,31px);font-weight:900;letter-spacing:-.02em;margin:0 0 4px;line-height:1.15}
.mp-lead{color:#C9D3C2;font-size:14.5px;margin:0 0 20px}
.mp-card{background:linear-gradient(180deg,#132414,#0E1B0F);border:1px solid #2A4A22;border-radius:14px}
.mp-svc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:18px}
.mp-svc{padding:22px}
.mp-svc-icon{width:44px;height:44px;border-radius:10px;background:#244A1D;display:flex;align-items:center;justify-content:center;margin-bottom:16px}
.mp-svc-icon svg{color:#A6E35A;width:26px;height:26px}
.mp-svc h3{font-size:17px;font-weight:800;margin:0 0 6px}
.mp-svc p{font-size:14px;color:#C9D3C2;line-height:1.5;margin:0}
.mp-addons{border:1.5px solid #8ED24A;box-shadow:0 0 24px rgba(142,210,74,.12)}
.mp-addons-icon{width:38px;height:38px;border-radius:50%;border:2px solid #A6E35A;color:#A6E35A;display:flex;align-items:center;justify-content:center;margin-bottom:12px}
.mp-addons ul{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:6px}
.mp-addons li,.mp-addons li a{display:flex;align-items:center;gap:7px;font-size:13.5px;color:#E6EBE0;text-decoration:none}
.mp-addon-row{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.mp-addon-chip{display:flex;align-items:center;gap:8px;padding:10px;font-size:12.5px;font-weight:700;line-height:1.25}
.mp-addon-chip svg{color:#A6E35A;width:24px;height:24px;flex-shrink:0}

/* before/after */
.mp-ba{display:grid;grid-template-columns:.62fr 1.38fr;gap:36px;align-items:center}
.mp-ba-slides{display:flex;flex-direction:column;gap:16px}
.mp-ba-frame{border:1.5px solid #A6E35A;border-radius:16px;overflow:hidden;box-shadow:0 0 30px rgba(142,210,74,.12)}
.mp-ba-frame>div{border-radius:0 !important}

/* reviews */
.mp-rev-head{display:flex;justify-content:space-between;align-items:flex-end;gap:16px;flex-wrap:wrap}
.mp-rev-actions{display:flex;align-items:center;gap:22px;margin-bottom:20px}
.mp-rev-badge{display:inline-flex;align-items:center;gap:6px;text-decoration:none;font-size:14.5px}
.mp-rev-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-items:start}
.mp-rev{overflow:hidden;padding:6px}
.mp-rev img{width:100%;height:auto;display:block;border-radius:9px}
.mp-rev-grid+.mp-center{margin-top:18px}

/* pricing */
.mp-price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.mp-price{display:flex;flex-direction:column;align-items:center;padding:20px 12px;color:#F5F3EE;cursor:pointer;font-family:inherit;text-align:center}
.mp-price.is-featured{border:2px solid #A6E35A;box-shadow:0 0 30px rgba(166,227,90,.18)}
.mp-price-icon{color:#A6E35A;margin-bottom:6px}
.mp-price-name{font-size:14px;font-weight:700}
.mp-price-amt{font-size:clamp(30px,4vw,40px);font-weight:900;color:#A6E35A;letter-spacing:-.02em;margin:4px 0 0}
.mp-price-per{font-size:13px;color:#C9D3C2}
.mp-price-size{font-size:13px;color:#C9D3C2;margin-top:4px}
.mp-price-note svg{flex-shrink:0}
.mp-price-note{display:flex;align-items:center;justify-content:center;gap:8px;text-align:left;font-size:14px;color:#E6EBE0;margin:16px auto 6px;max-width:620px}
.mp-price-more{font-size:12.5px;color:#93A08D;text-align:center;max-width:720px;margin:0 auto;line-height:1.55}

/* who */
.mp-who{display:grid;grid-template-columns:240px 1fr;overflow:hidden}
.mp-who-img{overflow:hidden}
.mp-who-img img{width:100%;height:100%;max-height:320px;object-fit:cover;object-position:center 15%;display:block;transform:scale(1.08)}
.mp-who-body{padding:22px 24px}
.mp-who h2{font-size:22px;font-weight:900;margin:0 0 8px}
.mp-who p{font-size:14px;color:#D2DACB;line-height:1.6;margin:0 0 10px}
.mp-link{display:inline-flex;align-items:center;gap:5px;color:#A6E35A !important;font-weight:800;font-size:14px;text-decoration:none}

/* chips */
.mp-chips{display:flex;flex-wrap:wrap;justify-content:center;gap:10px}
.mp-chip{display:inline-flex;align-items:center;gap:6px;background:#132414;border:1px solid #2A4A22;border-radius:999px;padding:8px 16px;font-size:13.5px;font-weight:700;text-decoration:none}

/* faq */
.mp-faq{max-width:900px}
.mp-faq-item{background:#0F1C10;border:1px solid #244020;border-radius:9px;margin-bottom:8px}
.mp-faq-item summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:12px;padding:13px 16px;font-weight:700;font-size:14.5px}
.mp-faq-item summary::-webkit-details-marker{display:none}
.mp-faq-plus{flex-shrink:0;transition:transform .2s}
.mp-faq-item[open] .mp-faq-plus{transform:rotate(45deg);color:#A6E35A}
.mp-faq-item p{margin:0;padding:0 16px 15px;color:#C9D3C2;font-size:14px;line-height:1.6}

/* cta */
.mp-cta{margin-top:40px;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:30px 36px;border:1.5px solid #A6E35A;border-radius:18px;background:radial-gradient(circle at 85% 50%,rgba(142,210,74,.35),transparent 55%),linear-gradient(120deg,#1E4A17,#2D6A1F 55%,#1C4415)}
.mp-cta-left{display:flex;gap:22px;align-items:flex-start}
.mp-cta-icon{color:#B9F26A;flex-shrink:0}
.mp-cta h2{font-size:clamp(22px,2.8vw,30px);font-weight:900;margin:0 0 8px;line-height:1.15;letter-spacing:-.015em}
.mp-cta p{margin:0;color:#E6F0DE;font-size:15px;max-width:420px}
.mp-cta-btns{display:flex;flex-direction:column;gap:12px;min-width:250px}

/* footer */
.mp-footer{padding-top:30px;padding-bottom:90px}
.mp-foot-top{display:flex;align-items:center;justify-content:space-between;gap:20px;flex-wrap:wrap}
.mp-foot-links{display:flex;gap:22px;flex-wrap:wrap;font-size:13.5px;font-weight:600}
.mp-foot-links a{text-decoration:none}
.mp-badge img{width:110px;height:auto;display:block}
.mp-foot-bottom{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-top:18px;padding-top:16px;border-top:1px solid #1C2E1B;font-size:12.5px;color:#93A08D}
.mp-foot-legal{display:flex;gap:16px;flex-wrap:wrap}
.mp-foot-legal a{color:#93A08D}

.mp-sticky-bar{position:fixed;bottom:0;left:0;right:0;z-index:150;display:none;gap:8px;padding:10px 14px;background:#0A130B;border-top:1px solid #24402B;box-shadow:0 -4px 16px rgba(0,0,0,.35)}
.mp-sticky-bar .mp-btn-outline{flex:1;padding:13px}
.mp-sticky-bar .mp-btn{flex:2;padding:13px}

@media (max-width:980px){
  .mp-links{display:none}
  .mp-svc-grid{grid-template-columns:repeat(3,1fr)}
  .mp-addons{display:none}
  .mp-svc-grid~.mp-show-sm{display:block !important}
  .mp-fall-body{padding-left:120px}
}
@media (max-width:760px){
  .mp-hide-sm{display:none !important}
  .mp-show-sm{display:flex !important}
  div.mp-show-sm{display:block !important}
  .mp-brand-name{font-size:18px}
  .mp-brand-sub{font-size:10.5px}
  .mp-hero{display:flex;flex-direction:column;min-height:0;text-align:center}
  .mp-hero-text{order:1}
  .mp-hero-img{order:2}
  .mp-hero-text{padding:18px 20px 0;align-items:center}
  .mp-pill{align-self:center;font-size:10px;letter-spacing:0;padding:5px 10px;margin-bottom:12px;white-space:nowrap}
  .mp-hero h1{font-size:clamp(30px,8.4vw,40px);margin-bottom:8px}
  .mp-hero-services{font-size:16.5px;margin-bottom:8px}
  .mp-hero-sub{font-size:14.5px;margin:0 auto 16px}
  .mp-hero-btns{flex-direction:column;width:100%;gap:10px;margin-bottom:14px}
  .mp-hero-btns>*{width:100%}
  .mp-hero-img{clip-path:none;height:230px;margin-top:6px}
  .mp-hero-img::after{display:none}
  .mp-hero-img::before{background:linear-gradient(180deg,#0A130B 0%,rgba(10,19,11,0) 35%,rgba(10,19,11,0) 70%,#0A130B 100%)}
  .mp-hero-img img{object-position:28% 60%}
  .mp-trust{grid-template-columns:repeat(4,1fr);padding:12px 2px;margin-top:-28px}
  .mp-trust-item{flex-direction:column;text-align:center;gap:6px;padding:2px 4px}
  .mp-trust-icon svg{width:28px;height:28px}
  .mp-trust-t{font-size:11.5px;line-height:1.2}
  .mp-trust-s{display:none}
  .mp-fall-img{width:38%}
  .mp-fall-leaves{left:-6px}
  .mp-fall-leaves svg:nth-child(3){display:none}
  .mp-fall-body{flex-direction:column;text-align:center;padding:16px 16px 18px}
  .mp-fall-text{position:relative;z-index:1}
  .mp-fall h2{font-size:23px}
  .mp-svc-grid{grid-template-columns:repeat(3,1fr);gap:9px}
  .mp-svc{padding:13px 11px}
  .mp-svc-icon{background:none;width:auto;height:auto;justify-content:flex-start;margin-bottom:8px}
  .mp-svc h3{font-size:14px}
  .mp-svc p{font-size:12px}
  .mp-addon-chip{font-size:11px;padding:9px 8px;gap:6px}
  .mp-addon-chip svg{width:20px;height:20px}
  .mp-ba{display:block}
  .mp-ba-slides .mp-btn-outline{margin-top:2px}
  .mp-rev-head{flex-wrap:wrap}
  .mp-rev-head .mp-h2{font-size:22px}
  .mp-rev-head .mp-lead{margin-bottom:10px}
  .mp-rev-actions{margin-bottom:14px}
  .mp-rev-actions{margin-bottom:0}
  .mp-rev-badge{border:1px solid #2A4A22;border-radius:999px;padding:6px 10px;font-size:13px;white-space:nowrap}
  .mp-rev-grid{grid-template-columns:1fr;gap:12px}
  .mp-price-grid{gap:9px}
  .mp-price{padding:14px 4px}
  .mp-price-name{font-size:12px}
  .mp-price-amt{font-size:27px}
  .mp-price-per,.mp-price-size{font-size:11.5px}
  .mp-price-note{font-size:12.5px}
  .mp-who{grid-template-columns:42% 1fr}
  .mp-who-img img{max-height:none;min-height:100%}
  .mp-who-body{padding:14px 14px 16px}
  .mp-who h2{font-size:17px}
  .mp-who p{font-size:12.5px;display:-webkit-box;-webkit-line-clamp:7;-webkit-box-orient:vertical;overflow:hidden}
  .mp-chip{font-size:12px;padding:7px 12px}
  .mp-faq-item summary{font-size:13.5px;padding:12px 14px}
  .mp-cta{flex-direction:column;align-items:stretch;padding:22px 18px;margin-top:30px}
  .mp-cta-left{gap:14px}
  .mp-cta-icon{width:40px;height:40px}
  .mp-cta-btns{min-width:0}
  .mp-foot-top{flex-direction:column;align-items:center;text-align:center}
  .mp-foot-links{justify-content:center;gap:16px}
  .mp-foot-bottom{flex-direction:column;align-items:center;text-align:center}
}
@media (max-width:640px){
  .mp-sticky-bar{display:flex}
  .mp-chat-bubble{bottom:84px !important}
  .mp-chat-window{bottom:152px !important}
  .mp-chat-nudge{bottom:152px !important}
}
/* fall + shared page extras */
.mp-orange{color:#F2A33A !important}
.mp-back{display:inline-flex;align-self:flex-start;color:#A6E35A !important;font-weight:700;font-size:13.5px;text-decoration:none;margin-bottom:14px}
.mp-pill-fall{background:#3A2310;border-color:#7A4A1C;color:#FBE7CF}
.mp-pill-fall svg{color:#F2A33A}
.mp-hero-fall .mp-hero-img::after{background:linear-gradient(to bottom right,transparent calc(50% - 2px),#E08A2E calc(50% - 2px),#E08A2E calc(50% + 2px),transparent calc(50% + 2px))}
.mp-hero-fall .mp-hero-img img{transform:none}
.mp-lead-wide{max-width:820px;line-height:1.6}
.mp-svc-icon-fall{background:#3A2310}
.mp-svc-icon-fall svg{color:#F2A33A}
.mp-ba-fall{max-width:560px}
.mp-h3{font-size:20px;font-weight:900;margin:0 0 14px}
.mp-jobs{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;align-items:start}
.mp-job{margin:0;padding:6px;overflow:hidden}
.mp-job img{width:100%;height:auto;display:block;border-radius:9px}
.mp-job figcaption{font-size:13px;color:#C9D3C2;padding:10px 8px 6px;text-align:center}
.mp-price-extras{display:grid;grid-template-columns:repeat(2,1fr);gap:18px;margin-top:14px}
.mp-extra{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:14px 18px}
.mp-extra strong{display:block;font-size:14.5px}
.mp-extra span{display:block;font-size:12.5px;color:#93A08D;margin-top:2px}
.mp-extra b{color:#A6E35A;font-size:16px;white-space:nowrap}
.mp-faq-more{text-align:center;color:#C9D3C2;font-size:14.5px;margin-top:18px}
@media (max-width:760px){
  .mp-back{align-self:center}
  .mp-svc-grid.mp-svc-grid-4{grid-template-columns:repeat(2,1fr)}
  .mp-svc-icon-fall{background:none}
  .mp-ba-fall{max-width:none}
  .mp-jobs{grid-template-columns:1fr;gap:12px}
  .mp-price-extras{grid-template-columns:1fr;gap:9px}
  .mp-lead-wide{font-size:13.5px}
}
/* fall cleanup page (v2 mockup) */
.mp-fwrap{max-width:980px}
.mp-fhero{position:relative;overflow:hidden;max-width:1240px;margin:0 auto;min-height:470px;display:flex;align-items:center}
.mp-fhero-bg{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;object-position:right center}
.mp-fhero::after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,#0A130B 0%,rgba(10,19,11,.9) 30%,rgba(10,19,11,.45) 52%,rgba(10,19,11,0) 72%),linear-gradient(180deg,rgba(10,19,11,.0) 70%,#0A130B 100%)}
.mp-fhero-in{position:relative;z-index:2;padding:22px 20px 56px;max-width:640px;display:flex;flex-direction:column}
.mp-fhero-pillrow{display:flex;justify-content:center;max-width:460px}
.mp-fhero h1{font-size:clamp(32px,4.6vw,46px);font-weight:900;line-height:1.06;letter-spacing:-.025em;margin:0 0 10px}
.mp-fhero .mp-hero-sub{max-width:520px}
.mp-fhero-btns{display:flex;flex-direction:column;gap:10px;max-width:460px;margin-bottom:16px}
.mp-fhero-btns>*{width:100%}
.mp-fhero .mp-pill{align-self:auto}
.mp-fsvc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
.mp-fsvc{display:flex;gap:16px;align-items:flex-start;padding:16px 18px}
.mp-fsvc-icon{width:48px;height:48px;border-radius:10px;background:linear-gradient(180deg,#8ED24A,#5FA82E);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.mp-fsvc-icon svg{color:#0A160B;width:28px;height:28px}
.mp-fsvc h3{font-size:16.5px;font-weight:800;margin:0 0 4px}
.mp-fsvc p{font-size:13.5px;color:#C9D3C2;line-height:1.45;margin:0}
.mp-fba{margin-top:4px;max-width:760px}
.mp-fprice{border:1.5px solid #8ED24A;border-radius:18px;padding:22px 20px 16px;background:linear-gradient(180deg,#132A12,#0C1A0D);box-shadow:0 0 30px rgba(142,210,74,.12)}
.mp-fprice-head{display:flex;gap:16px;align-items:flex-start;margin-bottom:6px}
.mp-fprice-leaf{color:#A6E35A;flex-shrink:0;margin-top:2px}
.mp-fhaul{display:flex;align-items:center;gap:18px;padding:12px 20px;margin-top:12px}
.mp-fhaul-icon{color:#A6E35A;flex-shrink:0;margin-left:14px}
.mp-fhaul-txt{flex:1}
.mp-fhaul-txt strong{display:block;font-size:15px}
.mp-fhaul-txt span{display:block;font-size:13.5px;color:#C9D3C2}
.mp-fhaul-txt .mp-dim{color:#93A08D;font-size:12.5px}
.mp-fhaul b{color:#A6E35A;font-size:20px;font-weight:900;padding-left:28px;border-left:1px solid #2A4A22;white-space:nowrap}
.mp-lead-tight{margin-bottom:12px}
.mp-frev-bar{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
.mp-rev-badge-plain{border:none !important;padding:0 !important;font-size:16px !important}
.mp-frev{padding:18px 20px}
.mp-frev p{font-size:15px;margin:10px 0 14px;line-height:1.5}
.mp-frev-who{display:flex;align-items:center;gap:10px}
.mp-frev-who .mp-frev-av{display:flex;width:36px;height:36px;border-radius:50%;background:#D9DDD6;color:#5B6358;font-weight:800;display:flex;align-items:center;justify-content:center;font-size:17px}
.mp-frev-who strong{display:block;font-size:14px}
.mp-frev-who span{display:block;font-size:12.5px;color:#C9D3C2}
.mp-farea-head{display:flex;gap:12px;align-items:flex-start}
.mp-farea-head svg{flex-shrink:0;margin-top:4px}
.mp-chips-row{justify-content:flex-start;padding-left:40px}
@media (max-width:760px){
  .mp-fhero{min-height:0}
  .mp-fhero-bg{object-position:78% center}
  .mp-fhero::after{background:linear-gradient(90deg,rgba(10,19,11,.86) 0%,rgba(10,19,11,.6) 50%,rgba(10,19,11,.05) 100%),linear-gradient(180deg,rgba(10,19,11,.55) 0%,rgba(10,19,11,0) 30%,rgba(10,19,11,0) 75%,#0A130B 100%)}
  .mp-fhero-in{padding:14px 20px 48px;text-align:left}
  .mp-fhero .mp-back{align-self:flex-start;margin-bottom:8px}
  .mp-fhero-pillrow{max-width:none;margin-bottom:2px}
  .mp-fhero .mp-pill{align-self:auto;margin-bottom:10px}
  .mp-fhero h1{font-size:clamp(30px,8.6vw,40px)}
  .mp-fhero .mp-hero-services{font-size:15.5px}
  .mp-fhero .mp-hero-sub{font-size:14.5px;margin:0 0 14px}
  .mp-fhero .mp-rating{font-size:14.5px}
  .mp-fsvc-grid{gap:9px}
  .mp-fsvc{flex-direction:row;gap:10px;padding:12px 10px}
  .mp-fsvc-icon{width:38px;height:38px}
  .mp-fsvc-icon svg{width:22px;height:22px}
  .mp-fsvc h3{font-size:14px}
  .mp-fsvc p{font-size:12px}
  .mp-fprice{padding:16px 12px 12px}
  .mp-fprice-head{gap:12px}
  .mp-fprice-leaf{width:28px;height:28px}
  .mp-fhaul{gap:12px;padding:10px 14px}
  .mp-fhaul-icon{margin-left:0;width:30px;height:30px}
  .mp-fhaul b{font-size:17px;padding-left:14px}
  .mp-frev-bar .mp-btn-sm{font-size:12.5px;padding:7px 12px}
  .mp-chips-row{padding-left:0;justify-content:center;gap:8px}
  .mp-chips-row .mp-chip{font-size:12px;padding:6px 11px;gap:5px;white-space:nowrap}
  .mp-chips-row .mp-chip svg{width:11px;height:11px}
  .mp-fprice .mp-price-size{font-size:10.5px}
  .mp-farea-head svg{width:24px;height:24px}
}

`;

function ServiceCard({ icon, title, desc }) {
  return (
    <div style={{ background: "#152016", border: "1px solid #24331F", borderRadius: 14, padding: 22 }}>
      <div style={{ marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "#B9C4B2", lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}
