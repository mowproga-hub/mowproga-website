import { useState, useEffect, useRef } from "react";
import { Star, CheckCircle2, Phone, MapPin, ArrowRight, Scissors, Sprout, Wind, Upload, X, Plus, Trash2, MessageCircle, Send, ExternalLink } from "lucide-react";

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
    const source = params.get("utm_source") || params.get("ref");
    if (source) sessionStorage.setItem("mp_lead_source", source);
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
    "a": "Biweekly mowing starts at $55 per visit for small yards (under 5,000 sq ft), $70 for medium yards (5,000–10,000 sq ft), and $90 for large yards (10,000–20,000 sq ft). Acreage over 20,000 sq ft gets a custom quote."
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
    "a": "The first cut on an overgrown lawn is priced at 2x the normal cut, covering the first 2 hours, then $55/hr after that. Restoring edges that have grown over sidewalks or driveways starts at $25. We confirm everything on your quote before any work starts."
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
  headline: "Your Yard, Handled — Without Lifting a Finger.",
  subheading: "Reliable mowing, edging, and cleanup from a local, family-run crew. Same-day quotes. Fast response. No contracts.",
  phone: "4046696945",
  serviceArea: "SERVING DOUGLASVILLE & SURROUNDING AREAS",
  price: "70",
  ratingLine: "5.0 stars · 55 reviews on Google",
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
  title: "Mow Pro GA | Lawn Mowing & Edging in Douglasville, GA",
  description: "Reliable biweekly lawn mowing, edging, and cleanup from a local, family-run crew in Douglasville, GA. Same-day quotes, no contracts. Get your free instant quote.",
  url: "https://mowproga.com/",
  image: "https://mowproga.com/images/our-story.webp",
};

// Kept in sync by hand with the PAGES/JSON_LD_BY_PATH constants in
// middleware.js — middleware.js sets these in the raw HTML for
// crawlers/direct loads, this applies the same values on the client for
// in-app SPA navigation (which never hits the middleware, since it's a
// pushState navigation, not a new request).
const FALL_CLEANUP_SEO = {
  title: "Fall Yard Cleanup Douglasville GA | Leaf Removal & Debris Removal | Mow Pro Lawn Care",
  description: "Fall yard cleanup in Douglasville, GA — leaf removal, bed cleanout, and debris haul-away. Call 404-669-6945 or request a free fall cleanup quote today.",
  url: "https://mowproga.com/fall-cleanup",
  image: "https://mowproga.com/images/after-fall.webp",
};

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
const NEIGHBORHOODS = [
  { slug: "stewarts-mill", name: "Stewarts Mill", city: "Douglasville" },
  { slug: "shallowford-heights", name: "Shallowford Heights", city: "Douglasville" },
  { slug: "springwood-village", name: "Springwood Village", city: "Douglasville" },
  { slug: "big-a", name: "the Big A / Highway 166 area", city: "Douglasville" },
  { slug: "lithia-springs", name: "Lithia Springs", city: "Lithia Springs" },
  { slug: "villa-rica", name: "Villa Rica", city: "Villa Rica" },
];

function getNeighborhood(slug) {
  return NEIGHBORHOODS.find((n) => n.slug === slug) || null;
}

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
function placeLabel(n) {
  return n.name === n.city ? `${n.name}, GA` : `${n.name}, ${n.city}, GA`;
}

function neighborhoodSEO(n) {
  return {
    title: `Lawn Care in ${placeLabel(n)} | Mow Pro GA`,
    description: `Biweekly lawn mowing, edging, and cleanup for homeowners in ${placeLabel(n)}. Local, family-run crew, same-day quotes, no contracts. Call 404-669-6945.`,
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
    areaServed: { "@type": n.slug === "lithia-springs" || n.slug === "villa-rica" ? "City" : "Neighborhood", name: placeLabel(n) },
    provider: {
      "@type": "LocalBusiness",
      "@id": "https://mowproga.com/#business",
      name: "Mow Pro Lawn Care LLC",
      telephone: "+14046696945",
      url: seo.url,
      image: seo.image,
      priceRange: "$$",
      address: {
        "@type": "PostalAddress",
        streetAddress: "1695 Hampton Pass",
        addressLocality: "Douglasville",
        addressRegion: "GA",
        postalCode: "30134",
        addressCountry: "US",
      },
    },
  };
}

function pathToRoute(path) {
  if (path === "/about") return "about";
  if (path === "/fall-cleanup") return "fall-cleanup";
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

function BeforeAfterSlider({ before, after }) {
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
        position: "relative", width: "100%", aspectRatio: "4/3", borderRadius: 14, overflow: "hidden",
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
  { key: "small", label: "Small yard", sub: "Under 5,000 sq ft", addOn: -15 },
  { key: "medium", label: "Medium yard", sub: "5,000 – 10,000 sq ft", addOn: 0 },
  { key: "large", label: "Large yard", sub: "10,000 – 20,000 sq ft", addOn: 20 },
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
  const [form, setForm] = useState({ address: "", size: "medium", name: "", phone: "", crackSpray: false, overgrownLevel: "none", edgeRestore: false, serviceType: initialServiceType, heavyTrees: false, bagHaul: false, hedgeSize: "h1", tallCount: 0, hedgeOver10: false, hedgeOvergrown: false, hedgeHaul: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const CRACK_SPRAY_PRICE = 15;
  const EDGE_RESTORE_PRICE = 25;
  const isLeaf = form.serviceType === "leaf";
  const isHedge = form.serviceType === "hedge";
  const isMowing = !isLeaf && !isHedge;
  const selectedOption = SIZE_OPTIONS.find((s) => s.key === form.size);
  const hedgeOption = HEDGE_OPTIONS.find((h) => h.key === form.hedgeSize);
  const maxTall = hedgeOption?.max || 0;
  const tallCount = Math.min(form.tallCount, maxTall);
  const isCustomQuote = isHedge
    ? hedgeOption?.price === null
    : isLeaf ? LEAF_PRICES[form.size] === null : selectedOption?.addOn === null;
  const needsCustomQuote = isCustomQuote
    || (isMowing && form.overgrownLevel === "severe")
    || (isLeaf && form.heavyTrees)
    || (isHedge && (form.hedgeOver10 || form.hedgeOvergrown));
  const normalCutPrice = parseInt(basePrice, 10) + (selectedOption?.addOn || 0);
  const price = needsCustomQuote
    ? null
    : isHedge
    ? hedgeOption.price + tallCount * HEDGE_TALL_FEE + (form.hedgeHaul ? HEDGE_HAUL_FEE : 0)
    : isLeaf
    ? LEAF_PRICES[form.size]
    : (form.overgrownLevel === "mild" ? normalCutPrice * 2 : normalCutPrice) + (form.crackSpray ? CRACK_SPRAY_PRICE : 0) + (form.edgeRestore ? EDGE_RESTORE_PRICE : 0);
  const showPlus = isLeaf || isHedge || form.overgrownLevel === "mild" || form.edgeRestore;

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
          size: isHedge ? (hedgeOption?.label || "") : (selectedOption?.label || ""),
          service: isHedge ? "Hedge trimming" : isLeaf ? "Leaf removal" : "Mowing",
          tallCount: isHedge ? tallCount : undefined,
          hedgeOver10: isHedge ? form.hedgeOver10 : undefined,
          hedgeOvergrown: isHedge ? form.hedgeOvergrown : undefined,
          hedgeHaul: isHedge ? form.hedgeHaul : undefined,
          crackSpray: form.crackSpray,
          overgrown: form.overgrownLevel,
          edgeRestore: form.edgeRestore,
          heavyTrees: form.heavyTrees,
          bagHaul: form.bagHaul,
          price: needsCustomQuote ? "Custom quote needed" : `$${price}`,
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
    setTimeout(() => { setStep(1); setDone(false); setForm({ address: "", size: "medium", name: "", phone: "", crackSpray: false, overgrownLevel: "none", edgeRestore: false, serviceType: initialServiceType, heavyTrees: false, bagHaul: false, hedgeSize: "h1", tallCount: 0, hedgeOver10: false, hedgeOvergrown: false, hedgeHaul: false }); }, 300);
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
              {needsCustomQuote ? " with custom pricing for your property." : ` to confirm your $${price} estimate.`}
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
                <div style={{ fontSize: 13, color: "#B9C4B2", marginBottom: 14 }}>{isHedge ? "Enter your address and how many shrubs need trimming." : "Enter your address and yard size for an estimated price."}</div>

                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[{ key: "mowing", label: "Mowing" }, { key: "leaf", label: "Leaves" }, { key: "hedge", label: "Hedges" }].map((s) => (
                    <button
                      key={s.key}
                      onClick={() => setForm({ ...form, serviceType: s.key })}
                      style={{
                        flex: 1, padding: "10px", borderRadius: 10, fontSize: 13.5, fontWeight: 700, cursor: "pointer",
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
                {!isHedge && <label style={{ ...miniLabel, marginTop: 12 }}>Yard size</label>}
                {isMowing && <div style={{ fontSize: 11.5, color: "#9AAE94", marginTop: -2 }}>Mowing, edging, weed eating & blow-off all included</div>}
                {!isHedge && SIZE_OPTIONS.map((opt) => (
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
                        : (opt.addOn === null ? "Custom" : `$${parseInt(basePrice, 10) + opt.addOn}`)}
                    </div>
                  </div>
                ))}

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
                    <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>+${CRACK_SPRAY_PRICE}</div>
                  </div>
                )}

                {!isCustomQuote && isMowing && (
                  <>
                    <label style={{ ...miniLabel, marginTop: 14 }}>Yard condition (if overgrown)</label>
                    <div
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
                          <div style={{ fontSize: 11.5, color: "#7C8A78" }}>First-cut fee for a couple extra passes</div>
                        </div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>${normalCutPrice * 2}</div>
                        <div style={{ fontSize: 10.5, color: "#7C8A78" }}>2× cut price</div>
                      </div>
                    </div>

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
                        <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Ladder work · +${HEDGE_TALL_FEE} each</div>
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
                      <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>+${HEDGE_HAUL_FEE}</div>
                    </div>
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
                      <div style={{ fontSize: 11.5, color: "#7C8A78", textTransform: "uppercase" }}>Estimated price</div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: "#8FBC6A" }}>${price}{showPlus && "+"}</div>
                      {showPlus && (
                        <div style={{ fontSize: 11.5, color: "#B9C4B2", marginTop: 2 }}>Final price confirmed once we see the property</div>
                      )}
                    </>
                  )}
                </div>

                <div style={{ fontSize: 13, color: "#B9C4B2", margin: "18px 0 12px" }}>Where should we send the confirmation?</div>
                <label style={miniLabel}>Your name</label>
                <input style={miniInput} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
                <label style={{ ...miniLabel, marginTop: 10 }}>Phone number</label>
                <input style={miniInput} value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="(404) 000-0000" />

                <button disabled={!form.name.trim() || !form.phone.trim() || submitting} onClick={submit} style={{ ...modalBtn, opacity: form.name.trim() && form.phone.trim() ? 1 : 0.5, marginTop: 16 }}>
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
- Biweekly maintenance (mowing, edging, weed eating, debris blow-off): Small yard (under 5,000 sq ft) $55, Medium yard (5,000-10,000 sq ft) $70, Large yard (10,000-20,000 sq ft) $90, Extra large/acreage (over 20,000 sq ft): custom quote after our team assesses it in person
- First-cut/overgrown fee: if it's been a few weeks since it was last cut, the price doubles the normal cut price for that yard size (e.g. a Medium yard's normal $70 cut becomes $140 for the first overgrown cut). That covers the first 2 hours on-site; if the job runs longer than that, it's $55/hr for each additional hour. If the grass is over 12 inches tall, that needs a custom quote — the team has to see it in person before pricing it, don't guess a number for that case
- Edge restoration (grass grown fully over sidewalk/driveway edge): $25+
- Sidewalk & driveway crack weed spraying: $15
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
        estimated_price: { type: "string", description: "The estimate you gave them, if any, e.g. '$90+' or 'custom quote needed'" },
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

function FallCleanupPage({ content, navigate, setShowQuote, showQuote }) {
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

      {/* BACK LINK */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "20px 24px 0" }}>
        <a href="/" onClick={(e) => { e.preventDefault(); navigate("/"); }} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#8FBC6A", fontWeight: 700, fontSize: 13.5, cursor: "pointer", padding: 0, textDecoration: "none" }}>
          ← Back to home
        </a>
      </div>

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "24px 24px 0", textAlign: "center" }}>
        {/* HERO */}
        <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8FBC6A", marginBottom: 12 }}>Fall Cleanup Services</div>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 16px" }}>
          Fall Yard Cleanup in Douglasville, GA
        </h1>
        <p style={{ fontSize: 16, color: "#D8DED2", lineHeight: 1.7, margin: "0 auto 26px", maxWidth: 560 }}>
          Leaves piling up faster than you can rake them? We handle fall yard cleanup — leaf removal, bed cleanout, and debris haul-away — for homeowners throughout Douglasville and Douglas County, so your lawn goes into winter looking as good as it did in spring.
        </p>

        {/* CTA — kept high on the page so it's visible without scrolling */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 40 }}>
          <button
            onClick={() => { trackEvent("quote_opened", { location: "fall_cleanup_hero" }); setShowQuote(true); }}
            style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 10, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
          >
            Get My Free Instant Quote <ArrowRight size={18} />
          </button>
          <a href={`tel:${content.phone}`} style={{ background: "transparent", color: "#F5F3EE", border: "1.5px solid #3A4A38", borderRadius: 10, padding: "16px 26px", fontSize: 15, fontWeight: 800, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 8 }}>
            <Phone size={16} /> Call Now
          </a>
        </div>

        {/* BEFORE / AFTER */}
        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>See the Difference</h2>
          <p style={{ color: "#B9C4B2", margin: "0 0 20px" }}>Real fall cleanups — Douglasville, GA and nearby</p>
          <div style={{ maxWidth: 560, margin: "0 auto" }}>
            <BeforeAfterSlider before="/images/before-fall.webp" after="/images/after-fall.webp" />
            <p style={{ textAlign: "center", fontSize: 12.5, color: "#7C8A78", marginTop: 8 }}>Drag to see it before — and after</p>
          </div>
        </div>

        {/* LEAF REMOVAL & FALL CLEANUP SERVICES */}
        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Leaf Removal & Fall Yard Cleanup</h2>
          <p style={{ color: "#B9C4B2", margin: "0 auto 24px", lineHeight: 1.6, maxWidth: 560 }}>
            Fall service covers everything a Douglasville-area yard needs before winter: clearing fallen leaves off the lawn and beds, a final mow and edge, and blowing off driveways and walkways. Leaves are blown into a pile at the wood line or a spot you choose at no extra charge by default, or bagged and hauled away if you'd rather have them gone completely.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, textAlign: "left" }}>
            <ServiceCard icon={<Wind size={22} color="#8FBC6A" />} title="Leaf Removal" desc="Full-yard leaf clearing from the lawn, beds, and hardscapes." />
            <ServiceCard icon={<Scissors size={22} color="#8FBC6A" />} title="Fall Mow & Edge" desc="One last clean cut and edge before the grass goes dormant." />
            <ServiceCard icon={<Sprout size={22} color="#8FBC6A" />} title="Bed Cleanout" desc="Leaves and debris cleared out of flower beds and borders." />
            <ServiceCard icon={<Wind size={22} color="#8FBC6A" />} title="Bag & Haul Away" desc="Leaves bagged and removed from the property instead of piled on-site — $5–8/bag." />
          </div>
        </div>

        {/* PRICING */}
        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Fall Cleanup Pricing</h2>
          <p style={{ color: "#B9C4B2", margin: "0 auto 20px", lineHeight: 1.6, maxWidth: 560 }}>
            Leaf removal is priced by yard size, same as our other services — We confirm the exact price once we see the property in person.
          </p>
          <div style={{ maxWidth: 480, margin: "0 auto", textAlign: "left" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
              {SIZE_OPTIONS.map((opt) => (
                <div key={opt.key} style={{ border: "1px solid #24331F", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", background: "#152016", cursor: "default" }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5 }}>{opt.label}</div>
                    <div style={{ fontSize: 12, color: "#7C8A78" }}>{opt.sub}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 15 }}>
                    {LEAF_PRICES[opt.key] === null ? "Custom" : `$${LEAF_PRICES[opt.key]}+`}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ background: "#1C2B1B", border: "1px solid #24331F", borderRadius: 10, padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "default" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14.5 }}>Bag & haul away</div>
                <div style={{ fontSize: 12, color: "#7C8A78" }}>Optional add-on — default is piled on-site</div>
              </div>
              <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 15 }}>$5–8/bag</div>
            </div>
            <div style={{ fontSize: 12, color: "#7C8A78", textAlign: "center", marginTop: 14 }}>Reference pricing — get your exact quote below</div>
          </div>
          <button
            onClick={() => { trackEvent("quote_opened", { location: "fall_cleanup_pricing" }); setShowQuote(true); }}
            style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 10, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8, marginTop: 24 }}
          >
            Get My Free Fall Cleanup Quote <ArrowRight size={18} />
          </button>
        </div>

        {/* SERVICE AREAS */}
        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Fall Cleanup Service Areas</h2>
          <p style={{ color: "#B9C4B2", margin: "0 0 20px" }}>Proudly serving Douglasville and Douglas County, GA, including:</p>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
            {SERVICE_AREAS.map((area) => (
              <div key={area} style={{ display: "flex", alignItems: "center", gap: 6, background: "#152016", border: "1px solid #24331F", borderRadius: 999, padding: "8px 16px", fontSize: 13.5, fontWeight: 700 }}>
                <MapPin size={14} color="#8FBC6A" />
                {area}
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div style={{ marginBottom: 20, textAlign: "left" }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, textAlign: "center", margin: "0 0 24px" }}>Fall Cleanup Questions</h2>
          {[
            { q: "How much does fall yard cleanup cost in Douglasville, GA?", a: "Fall cleanup is priced by yard size, same as leaf removal: small yards start at $130, medium at $260, large at $400, and extra-large or acreage properties get a custom quote. We confirm the exact price once we see the property in person." },
            { q: "Do you bag and haul away the leaves, or leave them on the property?", a: "By default, leaves are blown off the lawn, beds, and hard surfaces and piled at the wood line or a spot you choose, at no extra charge. If you'd rather have them bagged and hauled off the property completely, that's an optional add-on at $5–8 per bag, confirmed once we see the volume." },
            { q: "When should I schedule fall cleanup in Douglasville?", a: "Most yards need it once leaves start dropping heavily, typically October through December in the Douglasville area. There's no contract, so you can book a one-time cleanup whenever your yard needs it." },
            { q: "Does fall cleanup include flower bed and border cleanout?", a: "Yes — a fall cleanup covers leaf removal from the lawn and beds, a final mow and edge, and clearing debris out of flower beds and borders, with driveways and walkways blown off clean." },
          ].map((item, i) => (
            <div key={i} style={{ borderBottom: "1px solid #24331F", padding: "18px 0" }}>
              <div style={{ fontWeight: 700, fontSize: 15.5, color: "#F5F3EE", marginBottom: 6 }}>{item.q}</div>
              <div style={{ fontSize: 14, color: "#B9C4B2", lineHeight: 1.6 }}>{item.a}</div>
            </div>
          ))}
        </div>
      </main>

      {/* FOOTER CTA */}
      <div style={{ background: "#8FBC6A", color: "#0F1A10", padding: "40px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Ready to clear the leaves before winter?</h2>
        <p style={{ margin: "0 0 20px", opacity: 0.85 }}>Text, call, or request a quote — most yards confirmed same day.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => { trackEvent("quote_opened", { location: "fall_cleanup_footer" }); setShowQuote(true); }} style={{ background: "#0F1A10", color: "#F5F3EE", border: "none", borderRadius: 10, padding: "14px 30px", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
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
            <ServiceCard icon={<Sprout size={22} color="#8FBC6A" />} title="Crack Spray Add-On" desc="Keep walkways weed-free — available as an add-on, +$15." />
          </div>
        </div>

        {/* PRICING */}
        <div style={{ marginBottom: 50 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>{n.name} Lawn Care Pricing</h2>
          <p style={{ color: "#B9C4B2", margin: "0 auto 20px", lineHeight: 1.6, maxWidth: 560 }}>
            Biweekly maintenance starting at $55 per visit, priced by yard size. Mowing, edging, weed eating, and blow-off are all included — no surprise add-ons. We confirm the exact price once we see the property in person.
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
                    {opt.key === "small" ? "$55" : opt.key === "medium" ? "$70" : opt.key === "large" ? "$90" : "Custom"}
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
        setPageJsonLd([neighborhoodJsonLd(n)]);
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

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0F1A10", color: "#F5F3EE" }}>
      {/* NAV */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", rowGap: 10, padding: "18px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 18 }}>
          <img src="/images/logo.png" alt="Mow Pro GA logo" style={{ width: 40, height: 40, borderRadius: "50%", display: "block" }} />
          Mow Pro GA
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap", justifyContent: "flex-end", rowGap: 8 }}>
          <a href="/fall-cleanup" onClick={(e) => { e.preventDefault(); navigate("/fall-cleanup"); }} style={{ background: "none", border: "none", color: "#F5F3EE", fontSize: 13, fontWeight: 700, cursor: "pointer", padding: 0, textDecoration: "none" }}>
            Fall Cleanup
          </a>
          <a href={`tel:${content.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#F5F3EE", textDecoration: "none" }}>
            <Phone size={14} color="#8FBC6A" />
            <EditableText editing={editing} value={content.phone} onChange={(v) => update("phone", v)} style={{ fontSize: 13, color: "#F5F3EE", maxWidth: 140 }} />
          </a>
          <button onClick={() => { trackEvent("quote_opened", { location: "nav" }); setShowQuote(true); }} style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            Get Quote
          </button>
        </div>
      </div>

      <main>
      {/* HERO */}
      <div style={{ maxWidth: 780, margin: "0 auto", padding: "60px 24px 50px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#1C2B1B", color: "#8FBC6A", fontSize: 12.5, fontWeight: 700, padding: "6px 14px", borderRadius: 999, marginBottom: 22, maxWidth: 420 }}>
          <MapPin size={12} style={{ flexShrink: 0 }} />
          <EditableText editing={editing} value={content.serviceArea} onChange={(v) => update("serviceArea", v)} style={{ fontSize: 12.5, color: "#8FBC6A" }} />
        </div>
        <EditableText
          editing={editing}
          multiline
          value={content.headline}
          onChange={(v) => update("headline", v)}
          as="h1"
          style={{ fontSize: "clamp(28px, 6vw, 48px)", fontWeight: 800, lineHeight: 1.12, margin: "0 0 20px", letterSpacing: "-0.02em", display: "block" }}
        />
        <EditableText
          editing={editing}
          multiline
          value={content.subheading}
          onChange={(v) => update("subheading", v)}
          as="p"
          style={{ fontSize: 17, color: "#B9C4B2", maxWidth: 520, margin: "0 auto 32px", lineHeight: 1.6, display: "block" }}
        />
        <button onClick={() => { trackEvent("quote_opened", { location: "hero" }); setShowQuote(true); }} style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 10, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
          Get My Free Instant Quote <ArrowRight size={18} />
        </button>
        <div style={{ marginTop: 16, display: "flex", justifyContent: "center", alignItems: "center", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((i) => <Star key={i} size={16} fill="#8FBC6A" color="#8FBC6A" />)}
          {editing ? (
            <EditableText editing={editing} value={content.ratingLine} onChange={(v) => update("ratingLine", v)} style={{ marginLeft: 6, fontSize: 13.5, color: "#B9C4B2" }} />
          ) : (
            <a
              href={GOOGLE_REVIEWS_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${content.ratingLine} — opens in a new tab`}
              style={{ marginLeft: 6, fontSize: 13.5, color: "#B9C4B2", textDecoration: "underline", textUnderlineOffset: 2, display: "inline-flex", alignItems: "center", gap: 4 }}
            >
              {content.ratingLine}
              <ExternalLink size={11} style={{ opacity: 0.7, flexShrink: 0 }} />
            </a>
          )}
        </div>

        {content.equipmentPhoto && (
          <div style={{ marginTop: 32, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
            <img src={content.equipmentPhoto} alt="Mow Pro Lawn Care equipment" width="1402" height="713" fetchPriority="high" style={{ width: "100%", height: "auto", borderRadius: 14, border: "1px solid #24331F", display: "block" }} />
            <div style={{ fontSize: 12.5, color: "#7C8A78", marginTop: 8 }}>Real gear, real crew — not stock photos</div>
          </div>
        )}
      </div>

      {/* SERVICES */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "40px 24px" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>What's Included, Every Visit</h2>
        <p style={{ textAlign: "center", color: "#B9C4B2", margin: "0 0 36px" }}>No surprises. No upsells. Just a clean yard.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
          <ServiceCard icon={<Scissors size={22} color="#8FBC6A" />} title="Mowing & Edging" desc="Clean, consistent cuts with sharp, well-maintained equipment." />
          <ServiceCard icon={<Sprout size={22} color="#8FBC6A" />} title="Weed Eating" desc="Fence lines, mailboxes, and obstacles — fully trimmed, every time." />
          <ServiceCard icon={<Wind size={22} color="#8FBC6A" />} title="Blow-Off Cleanup" desc="Driveways and walkways left spotless when we're done." />
          <ServiceCard icon={<Sprout size={22} color="#8FBC6A" />} title="Sidewalk & Driveway Crack Spray" desc="Keep walkways weed-free — available as an add-on, +$15." />
        </div>
      </div>

      {/* BEFORE / AFTER */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "20px 24px 60px" }}>
        <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>See the Difference</h2>
        <p style={{ textAlign: "center", color: "#B9C4B2", margin: "0 0 30px" }}>Real yards, real results — Douglasville, GA</p>
        {content.beforeAfterPairs.map((pair, i) => (
          <div key={i} style={{ marginBottom: i < content.beforeAfterPairs.length - 1 ? 30 : 0, maxWidth: 560, marginLeft: "auto", marginRight: "auto" }}>
            <BeforeAfterSlider before={pair.before} after={pair.after} />
            <p style={{ textAlign: "center", fontSize: 12.5, color: "#7C8A78", marginTop: 8 }}>Drag to see it before — and after</p>
          </div>
        ))}
        {editing && (
          <button
            onClick={() => update("beforeAfterPairs", [...content.beforeAfterPairs, { before: "", after: "" }])}
            style={{ border: "1px dashed #3A4A38", borderRadius: 14, padding: 16, background: "none", color: "#8FBC6A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13.5, fontWeight: 700, width: "100%", marginTop: 20 }}
          >
            <Plus size={15} /> Add another before/after pair
          </button>
        )}
      </div>

      {/* TESTIMONIALS */}
      <div style={{ background: "#152016", padding: "60px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ textAlign: "center", fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>What Neighbors Are Saying</h2>
          <p style={{ textAlign: "center", color: "#7C8A78", fontSize: 12.5, margin: "0 0 30px" }}>Real screenshots, straight from Google</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, alignItems: "start" }}>
            {content.reviews.map((r, i) => (
              <div key={i} style={{ background: "#0F1A10", border: "1px solid #24331F", borderRadius: 14, overflow: "hidden", position: "relative" }}>
                {r.screenshot ? (
                  <img src={r.screenshot} alt={`Review from ${r.name}`} width={r.w || 800} height={r.h || 500} loading="lazy" style={{ width: "100%", height: "auto", display: "block" }} />
                ) : (
                  <div style={{ padding: 20 }}>
                    <div style={{ display: "flex", gap: 2, marginBottom: 10 }}>
                      {Array.from({ length: r.stars }).map((_, si) => <Star key={si} size={14} fill="#8FBC6A" color="#8FBC6A" />)}
                    </div>
                    <EditableText editing={editing} multiline value={r.text} onChange={(v) => updateReview(i, "text", v)} as="p" style={{ fontSize: 14, color: "#D8DED2", lineHeight: 1.55, margin: "0 0 14px", display: "block" }} />
                    <EditableText editing={editing} value={r.name} onChange={(v) => updateReview(i, "name", v)} style={{ fontSize: 13, fontWeight: 700, color: "#8FBC6A" }} />
                  </div>
                )}
                {editing && (
                  <button onClick={() => removeReview(i)} aria-label="Remove review" style={{ position: "absolute", top: 10, right: 10, background: "rgba(15,26,16,0.85)", border: "none", borderRadius: 6, color: "#B3441E", cursor: "pointer", padding: 5 }}>
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
            {editing && (
              <button onClick={addReview} style={{ border: "1px dashed #3A4A38", borderRadius: 14, padding: 20, background: "none", color: "#8FBC6A", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13.5, fontWeight: 700 }}>
                <Plus size={15} /> Add review
              </button>
            )}
          </div>
          <div style={{ textAlign: "center", marginTop: 30 }}>
            <a
              href="https://g.page/r/Ce4jwGMDfTNvEAE/review"
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackEvent("leave_review_clicked", {})}
              style={{
                display: "inline-flex", alignItems: "center", gap: 12,
                background: "#FFFFFF", color: "#3C4043", border: "1px solid #DADCE0",
                borderRadius: 10, padding: "14px 26px", fontSize: 15, fontWeight: 600,
                textDecoration: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.25)",
                fontFamily: "'Google Sans', Roboto, Arial, sans-serif",
              }}
            >
              <svg width="22" height="22" viewBox="0 0 48 48">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.4-.1-2.7-.4-4z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.5 5.1 29.6 3 24 3 16.3 3 9.7 7.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 45c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.3 36.5 26.8 37 24 37c-5.2 0-9.6-3.1-11.3-7.6l-6.5 5C9.6 40.5 16.3 45 24 45z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.2-4.1 5.6l6.3 5.3C40.9 36.6 44 30.9 44 24c0-1.4-.1-2.7-.4-3.5z"/>
              </svg>
              <span>
                <div style={{ fontWeight: 700 }}>Leave Us a Review</div>
                <div style={{ fontSize: 11.5, color: "#5F6368", display: "flex", alignItems: "center", gap: 3 }}>
                  {Array.from({ length: 5 }).map((_, i) => <Star key={i} size={11} fill="#FBBC04" color="#FBBC04" />)}
                  <span style={{ marginLeft: 3 }}>on Google</span>
                </div>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* PRICING */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "60px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 8px" }}>Simple, Honest Pricing</h2>
        <p style={{ color: "#B9C4B2", margin: "0 0 30px" }}>Biweekly maintenance starting at</p>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "baseline", gap: 4 }}>
          <span style={{ fontSize: 56, fontWeight: 800, color: "#8FBC6A" }}>$</span>
          {editing
            ? <EditableText editing={editing} value={content.price} onChange={(v) => update("price", v)} style={{ fontSize: 56, fontWeight: 800, color: "#8FBC6A", width: 90 }} />
            : <span style={{ fontSize: 56, fontWeight: 800, color: "#8FBC6A" }}>{parseInt(content.price, 10) + SIZE_OPTIONS[0].addOn}</span>}
        </div>
        <div style={{ color: "#B9C4B2", fontSize: 14, marginBottom: 8 }}>per visit</div>
        <div style={{ color: "#8FBC6A", fontSize: 14.5, fontWeight: 700, marginBottom: 30 }}>Everything included. No hidden add-ons.</div>
        <div style={{ display: "inline-flex", flexDirection: "column", gap: 10, textAlign: "left", marginBottom: 34 }}>
          {["Mowing, edging & weed eating — all included", "Debris blown off walkways & driveway — included", "No contracts — cancel anytime", "First-cut & edge-restoration fees apply if overgrown — see quote form for details"].map((f) => (
            <div key={f} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14.5, color: "#D8DED2" }}>
              <CheckCircle2 size={17} color="#8FBC6A" /> {f}
            </div>
          ))}
        </div>
        <div>
          <button onClick={() => { trackEvent("quote_opened", { location: "pricing" }); setShowQuote(true); }} style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 10, padding: "16px 36px", fontSize: 16, fontWeight: 800, cursor: "pointer" }}>
            Get My Free Instant Quote
          </button>
        </div>
      </div>

      {/* FOUNDER STORY */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "10px 24px 50px" }}>
        <div style={{ background: "#152016", border: "1px solid #24331F", borderRadius: 16, padding: 28 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8FBC6A", marginBottom: 10 }}>Who We Are</div>
          <p style={{ fontSize: 15, color: "#D8DED2", lineHeight: 1.7, margin: 0 }}>
            Mow Pro GA is a locally owned, family-run, fully insured lawn care company in Douglasville, GA. Every job is quoted in person, every visit is held to the same standard, and every finished yard gets a photo-confirmed invoice. Your property is handled by our trusted, experienced team — familiar faces, not a rotating crew. This isn't a side project — the whole family is part of it, down to the kids handing out door hangers around the neighborhood and watching the results land in real time. One afternoon, right after hanger number 97, a client called. When you book with Mow Pro, you're not booking a call center; you're booking a family that's building something real, one yard at a time.
          </p>
          <a href="/about" onClick={(e) => { e.preventDefault(); navigate("/about"); }} style={{ background: "none", border: "none", color: "#8FBC6A", fontWeight: 700, fontSize: 14, marginTop: 14, cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: 5, textDecoration: "none" }}>
            Read our full story <ArrowRight size={14} />
          </a>
        </div>
      </div>

      {/* SERVICE AREAS — real links to each neighborhood page, so visitors
          and crawlers alike can discover them from the homepage instead of
          relying on the sitemap alone. */}
      <div style={{ maxWidth: 700, margin: "0 auto", padding: "10px 24px 50px", textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Neighborhoods We Serve</h2>
        <p style={{ color: "#B9C4B2", margin: "0 0 20px" }}>Proudly serving Douglasville, GA and nearby, including:</p>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: 10 }}>
          {NEIGHBORHOODS.map((n) => (
            <a
              key={n.slug}
              href={`/lawn-care/${n.slug}`}
              onClick={(e) => { e.preventDefault(); navigate(`/lawn-care/${n.slug}`); }}
              style={{ display: "flex", alignItems: "center", gap: 6, background: "#152016", border: "1px solid #24331F", borderRadius: 999, padding: "8px 16px", fontSize: 13.5, fontWeight: 700, color: "#F5F3EE", textDecoration: "none" }}
            >
              <MapPin size={14} color="#8FBC6A" />
              {n.name}
            </a>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "10px 24px 60px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", margin: "0 0 30px" }}>Before You Reach Out</h2>
        {HOME_FAQ.map((item, i) => (
          <div key={i} style={{ borderBottom: "1px solid #24331F", padding: "18px 0" }}>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: "#F5F3EE", marginBottom: 6 }}>{item.q}</div>
            <div style={{ fontSize: 14, color: "#B9C4B2", lineHeight: 1.6 }}>{item.a}</div>
          </div>
        ))}
      </div>

      </main>

      {/* FOOTER CTA */}
      <div style={{ background: "#8FBC6A", color: "#0F1A10", padding: "40px 24px", textAlign: "center" }}>
        <h2 style={{ fontSize: 24, fontWeight: 800, margin: "0 0 8px" }}>Ready for a yard you don't have to think about?</h2>
        <p style={{ margin: "0 0 20px", opacity: 0.85 }}>Text, call, or request a quote — most yards confirmed same day.</p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={() => { trackEvent("quote_opened", { location: "footer" }); setShowQuote(true); }} style={{ background: "#0F1A10", color: "#F5F3EE", border: "none", borderRadius: 10, padding: "14px 30px", fontSize: 15, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
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
      <div style={{ textAlign: "center", padding: 20, fontSize: 12.5, color: "#7C8A78", paddingBottom: 90 }}>
        <div style={{ marginBottom: 10 }}>
          Mow Pro GA · Mow Pro Lawn Care LLC · Douglasville, GA
        </div>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/privacy.html" style={{ color: "#7C8A78", textDecoration: "underline" }}>Privacy Policy</a>
          <a href="/terms.html" style={{ color: "#7C8A78", textDecoration: "underline" }}>Terms of Service</a>
        </div>
      </div>

      {/* STICKY MOBILE ACTION BAR */}
      <div
        className="mp-sticky-bar"
        style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 150,
          display: "none", gap: 8, padding: "10px 14px",
          background: "#0F1A10", borderTop: "1px solid #24331F",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.35)",
        }}
      >
        <a
          href={`tel:${content.phone}`}
          style={{
            flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
            background: "transparent", color: "#F5F3EE", border: "1.5px solid #3A4A38",
            borderRadius: 10, padding: "13px", fontSize: 14.5, fontWeight: 800, textDecoration: "none",
          }}
        >
          <Phone size={16} /> Call
        </a>
        <button
          onClick={() => { trackEvent("quote_opened", { location: "sticky_bar" }); setShowQuote(true); }}
          style={{
            flex: 2, background: "#8FBC6A", color: "#0F1A10", border: "none",
            borderRadius: 10, padding: "13px", fontSize: 14.5, fontWeight: 800, cursor: "pointer",
          }}
        >
          Get My Free Instant Quote
        </button>
      </div>
      <style>{`
        @media (max-width: 640px) {
          .mp-sticky-bar { display: flex !important; }
          .mp-chat-bubble { bottom: 84px !important; }
          .mp-chat-window { bottom: 152px !important; }
          .mp-chat-nudge { bottom: 152px !important; }
        }
      `}</style>
    </div>
  );
}

function ServiceCard({ icon, title, desc }) {
  return (
    <div style={{ background: "#152016", border: "1px solid #24331F", borderRadius: 14, padding: 22 }}>
      <div style={{ marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: 13.5, color: "#B9C4B2", lineHeight: 1.5 }}>{desc}</div>
    </div>
  );
}
