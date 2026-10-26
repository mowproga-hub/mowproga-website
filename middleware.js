// Serves genuinely unique <head> tags (title, description, canonical, OG,
// Twitter, JSON-LD) AND real, readable body content for routes that
// vercel.json rewrites straight to the raw index.html. The React app also
// patches the <head> tags client-side on SPA navigation (see applyPageSEO in
// src/App.jsx), but that alone isn't enough: Google's own guidance is that it
// may not pick up a canonical link injected only via JavaScript, and
// crawlers that don't execute JS at all (GPTBot, ClaudeBot, PerplexityBot)
// would otherwise see the homepage's title, description, and JSON-LD on
// every one of these pages instead of their own — and, worse, they'd see NO
// actual page content at all, since every page's real copy only ever
// existed inside a React component. This runs before any JS executes, so
// crawlers, curl, and "view source" all see the real per-page title, tags,
// and readable text.
//
// The `content` field on each page below is plain HTML dropped straight
// into <div id="root">. React (src/main.jsx) mounts with
// createRoot().render(), which fully replaces whatever's already inside
// #root the instant it runs, so a JS-enabled visitor never sees this markup
// — they get the real interactive page. Only non-JS clients (AI crawlers,
// curl, "view source") ever actually read it.
import {
  NEIGHBORHOODS, placeLabel, neighborhoodTitle, neighborhoodDescription, leafRuleText, leafServiceText,
  LEAF_PRICE_ROWS, LEAF_REMOVAL_SEO, LEAF_REMOVAL_INTRO, LEAF_REMOVAL_WHY, LEAF_REMOVAL_OPTIONS,
  LEAF_LOCAL_RULES, LEAF_REMOVAL_FAQ, FALL_CLEANUP_SEO, LEAF_PAGE_PHOTOS, FALL_PAGE_PHOTOS, jobPhotosHtml,
} from "./src/siteData.js";

export const config = {
  matcher: [
    "/fall-cleanup",
    "/leaf-removal",
    "/lawn-care/winston",
    "/about",
    "/quote",
    "/lawn-care/stewarts-mill",
    "/lawn-care/shallowford-heights",
    "/lawn-care/springwood-village",
    "/lawn-care/big-a",
    "/lawn-care/lithia-springs",
    "/lawn-care/villa-rica",
  ],
};

// NEIGHBORHOODS, placeLabel() etc. come from src/siteData.js (shared with the React app).

// Real before/after photos of actual completed jobs — mirrored from
// src/App.jsx's NEIGHBORHOOD_PHOTO_PAIRS/neighborhoodPhotos(). There's no
// photo library tagged by neighborhood, so rather than imply a photo was
// taken in a specific place, each page just alternates between these two
// general-purpose pairs already used elsewhere on the site.
const NEIGHBORHOOD_PHOTO_PAIRS = [
  { before: "/images/before-lawn.webp", after: "/images/after-lawn.webp", w: 1120, h: 708 },
  { before: "/images/before-2.webp", after: "/images/after-2.webp", w: 1120, h: 795 },
];

function neighborhoodPhotos(n) {
  const i = NEIGHBORHOODS.findIndex((x) => x.slug === n.slug);
  return NEIGHBORHOOD_PHOTO_PAIRS[i % 2];
}

function neighborhoodPricingList() {
  return `
    <ul>
      <li>Small yard (under 5,000 sq ft): $65+ every 2 weeks · $55+ weekly · $130+ monthly · $105+ one-time</li>
      <li>Medium yard (5,000–10,000 sq ft): $75+ every 2 weeks · $65+ weekly · $150+ monthly · $120+ one-time</li>
      <li>Large yard (10,000–20,000 sq ft): $85+ every 2 weeks · $75+ weekly · $170+ monthly · $135+ one-time</li>
      <li>Extra large / acreage (over 20,000 sq ft): custom quote</li>
    </ul>
    <p>Hedge &amp; shrub trimming: 1–6 shrubs $100+, 7–12 shrubs $200+, 13–25 shrubs $350+ (shrubs 6–10 ft tall +$40 each).</p>
  `;
}

function neighborhoodPage(n) {
  const title = neighborhoodTitle(n);
  const description = neighborhoodDescription(n);
  const url = `https://mowproga.com/lawn-care/${n.slug}`;
  const photos = neighborhoodPhotos(n);
  const image = `https://mowproga.com${photos.after}`;
  return {
    title,
    description,
    url,
    image,
    content: `
      <main>
        <h1>Lawn Care in ${placeLabel(n)}</h1>
        <p>Mow Pro GA provides biweekly lawn mowing, edging, and yard cleanup to homeowners in ${n.name === n.city ? n.name : `${n.name}, a non-gated residential area of ${n.city}, Georgia`}. Local, family-run, and fully insured — we quote every job in person and stand behind every cut. Same-day quotes, no contracts.</p>
        ${n.intro ? `<p>${n.intro}</p>` : ""}
        <p>Call or text <a href="tel:4046696945">404-669-6945</a>, or request a free instant quote online.</p>
        <p><a href="https://www.google.com/maps/search/?api=1&amp;query=Mow+Pro+Lawn+Care+LLC%2C+1695+Hampton+Pass%2C+Douglasville%2C+GA+30134" target="_blank" rel="noopener noreferrer">5.0 stars, 63 reviews on Google</a></p>

        <h2>See the Difference</h2>
        <p>A real Mow Pro GA yard, before and after:</p>
        <img src="${photos.before}" alt="Before a Mow Pro GA lawn service visit" width="${photos.w}" height="${photos.h}" loading="lazy" />
        <img src="${photos.after}" alt="After a Mow Pro GA lawn service visit" width="${photos.w}" height="${photos.h}" loading="lazy" />

        <h2>What's Included, Every Visit</h2>
        <ul>
          <li><strong>Mowing &amp; Edging</strong> — Clean, consistent cuts with sharp, well-maintained equipment.</li>
          <li><strong>Weed Eating</strong> — Fence lines, mailboxes, and obstacles — fully trimmed, every time.</li>
          <li><strong>Blow-Off Cleanup</strong> — Driveways and walkways left spotless when we're done.</li>
          <li><strong>Sidewalk &amp; Driveway Crack Spray</strong> — Available as an add-on, +$25+.</li>
        </ul>

        <h2>${n.name} Lawn Care Pricing</h2>
        <p>Every-2-weeks maintenance starting at $65+ per visit, with mowing, edging, weed eating, and blow-off all included, priced by yard size and how often we come (new recurring customers have a one-time $25+ first-cut fee):</p>
        ${neighborhoodPricingList()}
        <p>No contracts — cancel anytime. We confirm the exact price once we see the property in person.</p>

        <h2>Leaf Removal &amp; Fall Cleanup in ${n.name}</h2>
        <p>${leafRuleText(n)}</p>
        <p>${leafServiceText(n)}</p>
        <ul>${LEAF_PRICE_ROWS.map(([k, v]) => `<li>${k}: ${v}</li>`).join("")}</ul>
        <p><a href="/leaf-removal">Leaf removal service</a> · <a href="/fall-cleanup">Fall yard cleanup</a></p>

        <h2>Also Serving Nearby</h2>
        <p>Mow Pro GA also serves ${NEIGHBORHOODS.filter((x) => x.slug !== n.slug).map((x) => x.name).join(", ")}, plus Douglasville and Douglas County, GA generally.</p>

        <p><a href="/">Mow Pro GA home</a> · <a href="/leaf-removal">Leaf Removal</a> · <a href="/fall-cleanup">Fall Cleanup Services</a> · <a href="/about">About Mow Pro GA</a></p>
        <address>Mow Pro GA · Mow Pro Lawn Care LLC · 1695 Hampton Pass, Douglasville, GA 30134</address>
      </main>
    `,
  };
}

function leafRemovalPage() {
  return {
    ...LEAF_REMOVAL_SEO,
    content: `
      <main>
        <h1>Leaf Removal Service in Douglasville, GA</h1>
        <p>${LEAF_REMOVAL_INTRO}</p>
        <p>Call or text <a href="tel:4046696945">404-669-6945</a>, or request a free instant leaf removal quote online.</p>

        ${jobPhotosHtml(LEAF_PAGE_PHOTOS)}

        <h2>Why Clear the Leaves</h2>
        <p>${LEAF_REMOVAL_WHY}</p>

        <h2>How Our Leaf Removal Works</h2>
        <ul>${LEAF_REMOVAL_OPTIONS.map(([t, d]) => `<li><strong>${t}</strong> — ${d}</li>`).join("")}</ul>

        <h2>Leaf Removal Pricing</h2>
        <ul>${LEAF_PRICE_ROWS.map(([k, v]) => `<li>${k}: ${v}</li>`).join("")}<li>Bag &amp; haul away (optional, default is piled on-site): $5–8/bag</li></ul>
        <p>Regular mowing customers get a discounted leaf rate. We confirm the exact price once we see the property in person.</p>

        <h2>What to Do With the Leaves in Douglas County</h2>
        <ul>${LEAF_LOCAL_RULES.map(([t, d]) => `<li><strong>${t}:</strong> ${d}</li>`).join("")}</ul>

        <h2>Leaf Removal by Neighborhood</h2>
        <p>${NEIGHBORHOODS.map((n) => `<a href="/lawn-care/${n.slug}">${n.name.replace(/^the /, "")}</a>`).join(" · ")}</p>

        <h2>Leaf Removal Questions</h2>
        <dl>${LEAF_REMOVAL_FAQ.map(([q, a]) => `<dt>${q}</dt><dd>${a}</dd>`).join("")}</dl>

        <p><a href="/">Mow Pro GA home</a> · <a href="/fall-cleanup">Fall Yard Cleanup</a> · <a href="/about">About Mow Pro GA</a></p>
        <address>Mow Pro GA · Mow Pro Lawn Care LLC · 1695 Hampton Pass, Douglasville, GA 30134</address>
      </main>
    `,
  };
}

const PAGES = {
  "/fall-cleanup": {
    ...FALL_CLEANUP_SEO,
    content: `
      <main>
        <h1>Fall Yard Cleanup in Douglasville, GA</h1>
        <p>Leaves piling up faster than you can rake them? We handle fall yard cleanup — leaf removal, bed cleanout, and debris haul-away — for homeowners throughout Douglasville and Douglas County, so your lawn goes into winter looking as good as it did in spring.</p>
        <p>Call or text <a href="tel:4046696945">404-669-6945</a>, or request a free instant fall cleanup quote online.</p>

        <h2>Leaf Removal &amp; Fall Yard Cleanup</h2>
        <p>Fall service covers everything a Douglasville-area yard needs before winter: clearing fallen leaves off the lawn and beds, a final mow and edge, and blowing off driveways and walkways. Leaves are blown into a pile at the wood line or a spot you choose at no extra charge by default, or bagged and hauled away if you'd rather have them gone completely.</p>
        <ul>
          <li><strong>Leaf Removal</strong> — Full-yard leaf clearing from the lawn, beds, and hardscapes.</li>
          <li><strong>Fall Mow &amp; Edge</strong> — One last clean cut and edge before the grass goes dormant.</li>
          <li><strong>Bed Cleanout</strong> — Leaves and debris cleared out of flower beds and borders.</li>
          <li><strong>Bag &amp; Haul Away</strong> — Leaves bagged and removed from the property instead of piled on-site — $5–8/bag.</li>
        </ul>

        ${jobPhotosHtml(FALL_PAGE_PHOTOS)}

        <h2>Fall Cleanup Pricing</h2>
        <p>Leaf removal is priced by yard size, same as our other services:</p>
        <ul>
          <li>Small yard (under 5,000 sq ft): $130+</li>
          <li>Medium yard (5,000–10,000 sq ft): $260+</li>
          <li>Large yard (10,000–20,000 sq ft): $400+</li>
          <li>Extra large / acreage (over 20,000 sq ft): custom quote</li>
          <li>Bag &amp; haul away (optional add-on, default is piled on-site): $5–8/bag</li>
        </ul>
        <p>We confirm the exact price once we see the property in person.</p>

        <h2>Fall Cleanup Service Areas</h2>
        <p>Proudly serving Douglasville and Douglas County, GA, including Douglasville, Villa Rica, Lithia Springs, and Powder Springs.</p>

        <h2>Fall Cleanup Questions</h2>
        <dl>
          <dt>How much does fall yard cleanup cost in Douglasville, GA?</dt>
          <dd>Fall cleanup is priced by yard size, same as leaf removal: small yards start at $130, medium at $260, large at $400, and extra-large or acreage properties get a custom quote. We confirm the exact price once we see the property in person.</dd>
          <dt>Do you bag and haul away the leaves, or leave them on the property?</dt>
          <dd>By default, leaves are blown off the lawn, beds, and hard surfaces and piled at the wood line or a spot you choose, at no extra charge. If you'd rather have them bagged and hauled off the property completely, that's an optional add-on at $5-8 per bag, confirmed once we see the volume.</dd>
          <dt>When should I schedule fall cleanup in Douglasville?</dt>
          <dd>Most yards need it once leaves start dropping heavily, typically October through December in the Douglasville area. There's no contract, so you can book a one-time cleanup whenever your yard needs it.</dd>
          <dt>Does fall cleanup include flower bed and border cleanout?</dt>
          <dd>Yes - a fall cleanup covers leaf removal from the lawn and beds, a final mow and edge, and clearing debris out of flower beds and borders, with driveways and walkways blown off clean.</dd>
        </dl>

        <p>Just need the leaves cleared? See our <a href="/leaf-removal">leaf removal service</a>.</p>
        <p><a href="/">Mow Pro GA home</a> · <a href="/about">About Mow Pro GA</a></p>
        <address>Mow Pro GA · Mow Pro Lawn Care LLC · 1695 Hampton Pass, Douglasville, GA 30134</address>
      </main>
    `,
  },
  "/about": {
    title: "About Mow Pro GA | Family-Run Lawn Care in Douglasville, GA",
    description: "Meet the family behind Mow Pro GA — a family-run lawn care crew serving Douglasville, GA. No franchise, no call center, just a local team that shows up. Get a free instant quote.",
    url: "https://mowproga.com/about",
    image: "https://mowproga.com/images/our-story.webp",
    content: `
      <main>
        <h1>Built one yard — and one door hanger — at a time.</h1>
        <p>Mow Pro Lawn Care LLC didn't start with a business plan. It started with a truck, a mower, and a decision to build something real for my family in Douglasville.</p>
        <p>My son's been part of that from early on. Most weekends, he's out with me hanging door hangers around the neighborhood — not because he has to, but because he wanted to help. It's hot, thankless work, especially in a Georgia July. Some folks stopped him mid-hang just to say they already had a lawn guy. I think even he was starting to wonder if any of it was actually doing anything.</p>
        <p>Then one afternoon, right after he hung our 97th door hanger of the day, my phone rang. A new customer, calling because of the hanger he'd just placed. Before the day was out, five more calls came in from that same neighborhood.</p>
        <p>I watched it click for him — the hours in that heat weren't wasted, they were working. That's not a lesson you can just tell a kid. He had to feel it for himself.</p>
        <p>That's what Mow Pro GA actually is. Not a franchise, not a call center, not a crew of strangers rotating through your yard. It's a family building something real, one lawn and one door hanger at a time — and hopefully, something my kids will be proud to say they helped build from the ground up.</p>
        <p>When you book with us, that's what you're getting: a family business that shows up, stands behind its work, and has a very good reason to make sure it's done right every single time.</p>
        <p><a href="/">Mow Pro GA home</a> · <a href="tel:4046696945">404-669-6945</a></p>
        <address>Mow Pro GA · Mow Pro Lawn Care LLC · Douglasville, GA</address>
      </main>
    `,
  },
  // Built for paid ad clicks (Nextdoor, etc.), not organic search — it's a
  // deliberately stripped-down duplicate of content that already lives on
  // the homepage and /fall-cleanup for SEO purposes. noindex keeps it out of
  // search results so it doesn't compete with or dilute those pages; "follow"
  // still lets crawlers pass through it normally.
  "/quote": {
    title: "Get a Free Lawn Care Quote | Mow Pro GA — Douglasville",
    description: "Fast, free quotes for lawn mowing, fall cleanup, and hedge trimming in Douglasville, GA. 5-star rated, no contracts. Get your price in under a minute.",
    url: "https://mowproga.com/quote",
    image: "https://mowproga.com/images/after-lawn.webp",
    robots: "noindex, follow",
    content: `
      <main>
        <h1>Get a Free Lawn Care Quote in Douglasville, GA</h1>
        <p>Fast, free quotes for lawn mowing, fall cleanup, and hedge trimming in Douglasville, GA. 5-star rated, no contracts. Call or text <a href="tel:4046696945">404-669-6945</a>, or request your price online — most quotes confirmed same day.</p>
        <address>Mow Pro GA · Mow Pro Lawn Care LLC · 1695 Hampton Pass, Douglasville, GA 30134</address>
      </main>
    `,
  },
};

for (const n of NEIGHBORHOODS) {
  PAGES[`/lawn-care/${n.slug}`] = neighborhoodPage(n);
}
PAGES["/leaf-removal"] = leafRemovalPage();

const FALL_CLEANUP_FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does fall yard cleanup cost in Douglasville, GA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Fall cleanup is priced by yard size, same as leaf removal: small yards start at $130, medium at $260, large at $400, and extra-large or acreage properties get a custom quote. We confirm the exact price once we see the property in person.",
      },
    },
    {
      "@type": "Question",
      name: "Do you bag and haul away the leaves, or leave them on the property?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "By default, leaves are blown off the lawn, beds, and hard surfaces and piled at the wood line or a spot you choose, at no extra charge. If you'd rather have them bagged and hauled off the property completely, that's an optional add-on at $5-8 per bag, confirmed once we see the volume.",
      },
    },
    {
      "@type": "Question",
      name: "When should I schedule fall cleanup in Douglasville?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Most yards need it once leaves start dropping heavily, typically October through December in the Douglasville area. There's no contract, so you can book a one-time cleanup whenever your yard needs it.",
      },
    },
    {
      "@type": "Question",
      name: "Does fall cleanup include flower bed and border cleanout?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes - a fall cleanup covers leaf removal from the lawn and beds, a final mow and edge, and clearing debris out of flower beds and borders, with driveways and walkways blown off clean.",
      },
    },
  ],
};

const FALL_CLEANUP_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Fall Yard Cleanup",
  name: "Fall Yard Cleanup",
  url: PAGES["/fall-cleanup"].url,
  description: "Fall yard cleanup service including leaf removal, flower bed cleanout, and debris haul-away for residential properties in Douglasville and Douglas County, GA.",
  areaServed: [
    { "@type": "City", name: "Douglasville, GA" },
    { "@type": "City", name: "Villa Rica, GA" },
    { "@type": "City", name: "Lithia Springs, GA" },
    { "@type": "City", name: "Powder Springs, GA" },
    { "@type": "AdministrativeArea", name: "Douglas County, GA" },
  ],
  priceRange: "$130+",
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    priceSpecification: { "@type": "PriceSpecification", minPrice: 130, priceCurrency: "USD" },
    description: "Leaf removal starts at $130 for small yards ($260 medium, $400 large). Bagging and haul-away adds $5-8 per bag.",
  },
  provider: { "@id": "https://mowproga.com/#business" },
};

// Lightweight and honest rather than fabricated: this page is a founder
// story, not a service listing, so it just marks itself as the LocalBusiness's
// About page instead of inventing Service/FAQ schema that isn't there.
const ABOUT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  url: PAGES["/about"].url,
  name: PAGES["/about"].title,
  description: PAGES["/about"].description,
  mainEntity: { "@id": "https://mowproga.com/#business" },
};

function neighborhoodJsonLd(n) {
  const page = PAGES[`/lawn-care/${n.slug}`];
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    serviceType: "Residential Lawn Mowing & Edging",
    name: `Lawn Care in ${n.name}`,
    url: page.url,
    description: page.description,
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

const LEAF_REMOVAL_JSON_LD = {
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

const LEAF_REMOVAL_FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: LEAF_REMOVAL_FAQ.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
};

const JSON_LD_BY_PATH = {
  "/fall-cleanup": [FALL_CLEANUP_JSON_LD, FALL_CLEANUP_FAQ_JSON_LD],
  "/leaf-removal": [LEAF_REMOVAL_JSON_LD, LEAF_REMOVAL_FAQ_JSON_LD],
  "/about": [ABOUT_JSON_LD],
};

for (const n of NEIGHBORHOODS) {
  JSON_LD_BY_PATH[`/lawn-care/${n.slug}`] = [neighborhoodJsonLd(n)];
}

// String.replace() treats "$" specially in a *string* replacement (e.g. "$$"
// becomes a literal "$", "$5" can be read as a capture-group reference) —
// several of our values contain a literal "$" (priceRange, phone-adjacent
// pricing). Passing a function instead makes the return value verbatim, with
// no special-pattern interpretation, however many "$" it contains.
function replaceLiteral(html, pattern, replacement) {
  return html.replace(pattern, () => replacement);
}

// The LocalBusiness node from the homepage's own JSON-LD in index.html.
function homepageBusiness(html) {
  try {
    const m = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/);
    if (!m) return null;
    const data = JSON.parse(m[1]);
    const list = Array.isArray(data) ? data : [data];
    return list.find((x) => x && x["@type"] === "LocalBusiness") || null;
  } catch {
    return null;
  }
}

export function rewriteHead(html, pathname) {
  const page = PAGES[pathname];
  if (!page) return html;
  const jsonLd = JSON_LD_BY_PATH[pathname] || [];
  let out = html;
  out = replaceLiteral(out, /<title>[^<]*<\/title>/, `<title>${page.title}</title>`);
  out = replaceLiteral(out, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${page.description}" />`);
  out = replaceLiteral(out, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${page.url}" />`);
  out = replaceLiteral(out, /<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="${page.robots || "index, follow"}" />`);
  out = replaceLiteral(out, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${page.title}" />`);
  out = replaceLiteral(out, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${page.description}" />`);
  out = replaceLiteral(out, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${page.url}" />`);
  out = replaceLiteral(out, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${page.image}" />`);
  out = replaceLiteral(out, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${page.title}" />`);
  out = replaceLiteral(out, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${page.description}" />`);
  out = replaceLiteral(out, /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${page.image}" />`);
  // Every page keeps the full business entity from index.html (its offer
  // catalog lists mowing, leaf removal, fall cleanup, hedges…) and adds its
  // own page-specific schema after it.
  const business = homepageBusiness(html);
  const pageLd = business ? [business, ...jsonLd] : jsonLd;
  out = replaceLiteral(out, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(pageLd)}</script>`);
  // Swaps out whatever's sitting in <div id="root"> — the homepage's own
  // static content, baked into index.html for home's benefit — for this
  // page's real content instead. React fully replaces this via
  // createRoot().render() the instant it mounts, so this only matters to
  // clients that never run that JS.
  // Keeps the same inline visibility:hidden the homepage ships with — real
  // visitors never see this content flash, since main.jsx un-hides #root the
  // instant React mounts on every route, not just the homepage.
  out = replaceLiteral(out, /<div id="root"[^>]*>[\s\S]*?<\/div>/, `<div id="root" style="visibility: hidden">${page.content}</div>`);
  return out;
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const res = await fetch(`${url.origin}/index.html`);
  const html = await res.text();
  return new Response(rewriteHead(html, url.pathname), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
