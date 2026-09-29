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
export const config = {
  matcher: [
    "/fall-cleanup",
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

// Non-gated residential neighborhoods within the actual service area —
// mirrored by hand in src/App.jsx's NEIGHBORHOODS constant, since middleware
// and the Vite/React bundle are built and run separately and can't share a
// module. Keep both in sync when adding or editing a neighborhood.
const NEIGHBORHOODS = [
  { slug: "stewarts-mill", name: "Stewarts Mill", city: "Douglasville", zip: "30134" },
  { slug: "shallowford-heights", name: "Shallowford Heights", city: "Douglasville", zip: "30134" },
  { slug: "springwood-village", name: "Springwood Village", city: "Douglasville", zip: "30135" },
  { slug: "big-a", name: "the Big A / Highway 166 area", city: "Douglasville", zip: "30134" },
  { slug: "lithia-springs", name: "Lithia Springs", city: "Lithia Springs", zip: "30122" },
  { slug: "villa-rica", name: "Villa Rica", city: "Villa Rica", zip: "30180" },
];

// Avoids the redundant "Villa Rica, Villa Rica GA" for the two entries where
// the neighborhood itself is the whole city, not a district within one.
function placeLabel(n) {
  return n.name === n.city ? `${n.name}, GA` : `${n.name}, ${n.city}, GA`;
}

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
      <li>Small yard (under 5,000 sq ft): $50</li>
      <li>Medium yard (5,000–10,000 sq ft): $60</li>
      <li>Large yard (10,000–20,000 sq ft): $80</li>
      <li>Extra large / acreage (over 20,000 sq ft): custom quote</li>
    </ul>
  `;
}

function neighborhoodPage(n) {
  const title = `Lawn Care in ${placeLabel(n)} | Mow Pro GA`;
  const description = `Biweekly lawn mowing, edging, and cleanup for homeowners in ${placeLabel(n)}. Local, family-run crew, same-day quotes, no contracts. Call 404-669-6945.`;
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
        <p>Mow Pro GA provides biweekly lawn mowing, edging, and yard cleanup to homeowners in ${n.name === n.city ? n.name : `${n.name}, a non-gated residential area of ${n.city}, Georgia`}. Local, family-run crew — Joseph quotes the job, shows up, and does the work himself. Same-day quotes, no contracts.</p>
        <p>Call or text <a href="tel:4046696945">404-669-6945</a>, or request a free instant quote online.</p>
        <p><a href="https://www.google.com/maps/search/?api=1&amp;query=Mow+Pro+Lawn+Care+LLC%2C+1695+Hampton+Pass%2C+Douglasville%2C+GA+30134" target="_blank" rel="noopener noreferrer">5 stars, 49 reviews on Google</a></p>

        <h2>See the Difference</h2>
        <p>A real Mow Pro GA yard, before and after:</p>
        <img src="${photos.before}" alt="Before a Mow Pro GA lawn service visit" width="${photos.w}" height="${photos.h}" loading="lazy" />
        <img src="${photos.after}" alt="After a Mow Pro GA lawn service visit" width="${photos.w}" height="${photos.h}" loading="lazy" />

        <h2>What's Included, Every Visit</h2>
        <ul>
          <li><strong>Mowing &amp; Edging</strong> — Clean, consistent cuts with sharp, well-maintained equipment.</li>
          <li><strong>Weed Eating</strong> — Fence lines, mailboxes, and obstacles — fully trimmed, every time.</li>
          <li><strong>Blow-Off Cleanup</strong> — Driveways and walkways left spotless when we're done.</li>
          <li><strong>Sidewalk &amp; Driveway Crack Spray</strong> — Available as an add-on, +$15.</li>
        </ul>

        <h2>${n.name} Lawn Care Pricing</h2>
        <p>Biweekly maintenance starting at $50 per visit, priced by yard size:</p>
        ${neighborhoodPricingList()}
        <p>No contracts — cancel anytime. Joseph confirms the exact price once he sees the property in person.</p>

        <h2>Also Serving Nearby</h2>
        <p>Mow Pro GA also serves ${NEIGHBORHOODS.filter((x) => x.slug !== n.slug).map((x) => x.name).join(", ")}, plus Douglasville and Douglas County, GA generally.</p>

        <p><a href="/">Mow Pro GA home</a> · <a href="/fall-cleanup">Fall Cleanup Services</a> · <a href="/about">About Mow Pro GA</a></p>
        <address>Mow Pro GA · Mow Pro Lawn Care LLC · 1695 Hampton Pass, Douglasville, GA 30134</address>
      </main>
    `,
  };
}

const PAGES = {
  "/fall-cleanup": {
    title: "Fall Yard Cleanup Douglasville GA | Leaf Removal & Debris Removal | Mow Pro Lawn Care",
    description: "Fall yard cleanup in Douglasville, GA — leaf removal, bed cleanout, and debris haul-away. Call 404-669-6945 or request a free fall cleanup quote today.",
    url: "https://mowproga.com/fall-cleanup",
    image: "https://mowproga.com/images/after-fall.webp",
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

        <h2>Fall Cleanup Pricing</h2>
        <p>Leaf removal is priced by yard size, same as our other services:</p>
        <ul>
          <li>Small yard (under 5,000 sq ft): $90+</li>
          <li>Medium yard (5,000–10,000 sq ft): $150+</li>
          <li>Large yard (10,000–20,000 sq ft): $225+</li>
          <li>Extra large / acreage (over 20,000 sq ft): custom quote</li>
          <li>Bag &amp; haul away (optional add-on, default is piled on-site): $5–8/bag</li>
        </ul>
        <p>Joseph confirms the exact price once he sees the property in person.</p>

        <h2>Fall Cleanup Service Areas</h2>
        <p>Proudly serving Douglasville and Douglas County, GA, including Douglasville, Villa Rica, Lithia Springs, and Powder Springs.</p>

        <h2>Fall Cleanup Questions</h2>
        <dl>
          <dt>How much does fall yard cleanup cost in Douglasville, GA?</dt>
          <dd>Fall cleanup is priced by yard size, same as leaf removal: small yards start at $90, medium at $150, large at $225, and extra-large or acreage properties get a custom quote. Joseph confirms the exact price once he sees the property in person.</dd>
          <dt>Do you bag and haul away the leaves, or leave them on the property?</dt>
          <dd>By default, leaves are blown off the lawn, beds, and hard surfaces and piled at the wood line or a spot you choose, at no extra charge. If you'd rather have them bagged and hauled off the property completely, that's an optional add-on at $5-8 per bag, confirmed once Joseph sees the volume.</dd>
          <dt>When should I schedule fall cleanup in Douglasville?</dt>
          <dd>Most yards need it once leaves start dropping heavily, typically October through December in the Douglasville area. There's no contract, so you can book a one-time cleanup whenever your yard needs it.</dd>
          <dt>Does fall cleanup include flower bed and border cleanout?</dt>
          <dd>Yes - a fall cleanup covers leaf removal from the lawn and beds, a final mow and edge, and clearing debris out of flower beds and borders, with driveways and walkways blown off clean.</dd>
        </dl>

        <p><a href="/">Mow Pro GA home</a> · <a href="/about">About Mow Pro GA</a></p>
        <address>Mow Pro GA · Mow Pro Lawn Care LLC · 1695 Hampton Pass, Douglasville, GA 30134</address>
      </main>
    `,
  },
  "/about": {
    title: "About Mow Pro GA | Family-Run Lawn Care in Douglasville, GA",
    description: "Meet the family behind Mow Pro GA — a family-run lawn care crew serving Douglasville, GA. No franchise, no call center, just Joseph and his crew. Get a free instant quote.",
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
        <p>When you book with us, that's what you're getting: someone who shows up, does the work himself, and has a very good reason to make sure it's done right every single time.</p>
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
    description: "Fast, free quotes for lawn mowing and fall cleanup in Douglasville, GA. 5-star rated, no contracts. Get your price in under a minute.",
    url: "https://mowproga.com/quote",
    image: "https://mowproga.com/images/after-lawn.webp",
    robots: "noindex, follow",
    content: `
      <main>
        <h1>Get a Free Lawn Care Quote in Douglasville, GA</h1>
        <p>Fast, free quotes for lawn mowing and fall cleanup in Douglasville, GA. 5-star rated, no contracts. Call or text <a href="tel:4046696945">404-669-6945</a>, or request your price online — most quotes confirmed same day.</p>
        <address>Mow Pro GA · Mow Pro Lawn Care LLC · 1695 Hampton Pass, Douglasville, GA 30134</address>
      </main>
    `,
  },
};

for (const n of NEIGHBORHOODS) {
  PAGES[`/lawn-care/${n.slug}`] = neighborhoodPage(n);
}

const FALL_CLEANUP_FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does fall yard cleanup cost in Douglasville, GA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Fall cleanup is priced by yard size, same as leaf removal: small yards start at $90, medium at $150, large at $225, and extra-large or acreage properties get a custom quote. Joseph confirms the exact price once he sees the property in person.",
      },
    },
    {
      "@type": "Question",
      name: "Do you bag and haul away the leaves, or leave them on the property?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "By default, leaves are blown off the lawn, beds, and hard surfaces and piled at the wood line or a spot you choose, at no extra charge. If you'd rather have them bagged and hauled off the property completely, that's an optional add-on at $5-8 per bag, confirmed once Joseph sees the volume.",
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
  priceRange: "$5-$8 per bag",
  provider: {
    "@type": "LocalBusiness",
    "@id": "https://mowproga.com/#business",
    name: "Mow Pro Lawn Care LLC",
    telephone: "+14046696945",
    url: PAGES["/fall-cleanup"].url,
    image: PAGES["/fall-cleanup"].image,
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
    areaServed: { "@type": n.slug === "lithia-springs" || n.slug === "villa-rica" ? "City" : "Neighborhood", name: placeLabel(n) },
    provider: {
      "@type": "LocalBusiness",
      "@id": "https://mowproga.com/#business",
      name: "Mow Pro Lawn Care LLC",
      telephone: "+14046696945",
      url: page.url,
      image: page.image,
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

const JSON_LD_BY_PATH = {
  "/fall-cleanup": [FALL_CLEANUP_JSON_LD, FALL_CLEANUP_FAQ_JSON_LD],
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
  out = replaceLiteral(out, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);
  // Swaps out whatever's sitting in <div id="root"> — the homepage's own
  // static content, baked into index.html for home's benefit — for this
  // page's real content instead. React fully replaces this via
  // createRoot().render() the instant it mounts, so this only matters to
  // clients that never run that JS.
  out = replaceLiteral(out, /<div id="root">[\s\S]*?<\/div>/, `<div id="root">${page.content}</div>`);
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
