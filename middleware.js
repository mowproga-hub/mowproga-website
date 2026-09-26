// Serves genuinely unique <head> tags (title, description, canonical, OG,
// Twitter, JSON-LD) for routes that vercel.json rewrites straight to the raw
// index.html. The React app also patches these client-side on SPA
// navigation (see applyPageSEO in src/App.jsx), but that alone isn't enough:
// Google's own guidance is that it may not pick up a canonical link injected
// only via JavaScript, and crawlers that don't execute JS at all (GPTBot,
// ClaudeBot, PerplexityBot) would otherwise see the homepage's title,
// description, and JSON-LD on every one of these pages instead of their own.
// This runs before any JS executes, so crawlers, curl, and "view source" all
// see the real per-page values.
export const config = {
  matcher: ["/fall-cleanup", "/about"],
};

const PAGES = {
  "/fall-cleanup": {
    title: "Fall Yard Cleanup Douglasville GA | Leaf Removal & Debris Removal | Mow Pro Lawn Care",
    description: "Fall yard cleanup in Douglasville, GA — leaf removal, bed cleanout, and debris haul-away. Call 404-669-6945 or request a free fall cleanup quote today.",
    url: "https://mowproga.com/fall-cleanup",
    image: "https://mowproga.com/images/after-fall.webp",
  },
  "/about": {
    title: "About Mow Pro GA | Family-Run Lawn Care in Douglasville, GA",
    description: "Meet the family behind Mow Pro GA — a family-run lawn care crew serving Douglasville, GA. No franchise, no call center, just Joseph and his crew. Get a free instant quote.",
    url: "https://mowproga.com/about",
    image: "https://mowproga.com/images/our-story.webp",
  },
};

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

const JSON_LD_BY_PATH = {
  "/fall-cleanup": [FALL_CLEANUP_JSON_LD, FALL_CLEANUP_FAQ_JSON_LD],
  "/about": [ABOUT_JSON_LD],
};

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
  out = replaceLiteral(out, /<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="index, follow" />`);
  out = replaceLiteral(out, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${page.title}" />`);
  out = replaceLiteral(out, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${page.description}" />`);
  out = replaceLiteral(out, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${page.url}" />`);
  out = replaceLiteral(out, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${page.image}" />`);
  out = replaceLiteral(out, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${page.title}" />`);
  out = replaceLiteral(out, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${page.description}" />`);
  out = replaceLiteral(out, /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${page.image}" />`);
  out = replaceLiteral(out, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`);
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
