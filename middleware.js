// Serves genuinely unique <head> tags (title, description, canonical, OG,
// Twitter, JSON-LD) for /fall-cleanup at the raw-HTML level. The React app
// also patches these client-side on SPA navigation (see applyPageSEO in
// src/App.jsx), but that alone isn't enough for indexing: Google's own
// guidance is that it may not pick up a canonical link injected only via
// JavaScript. This runs before any JS executes, so crawlers, curl, and
// "view source" all see the real per-page values, not the homepage's.
export const config = {
  matcher: "/fall-cleanup",
};

const PAGE = {
  title: "Fall Yard Cleanup Douglasville GA | Leaf Removal & Debris Removal | Mow Pro Lawn Care",
  description: "Fall yard cleanup in Douglasville, GA — leaf removal, bed cleanout, and debris haul-away. Call 404-669-6945 or request a free fall cleanup quote today.",
  url: "https://mowproga.com/fall-cleanup",
  image: "https://mowproga.com/images/after-fall.webp",
};

const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How much does fall yard cleanup cost in Douglasville, GA?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Fall cleanup is priced by yard size, same as leaf removal: small yards start at $75, medium at $125, large at $200, and extra-large or acreage properties get a custom quote. Joseph confirms the exact price once he sees the property in person.",
      },
    },
    {
      "@type": "Question",
      name: "Do you bag and haul away the leaves, or mulch them into the lawn?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Mulching leaves into the lawn is included at no extra charge. If you'd rather have them bagged and hauled off the property completely, that's an optional add-on at $5-8 per bag, confirmed once Joseph sees the volume.",
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

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Service",
  serviceType: "Fall Yard Cleanup",
  name: "Fall Yard Cleanup",
  url: PAGE.url,
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
    url: PAGE.url,
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

// String.replace() treats "$" specially in a *string* replacement (e.g. "$$"
// becomes a literal "$", "$5" can be read as a capture-group reference) —
// several of our values contain a literal "$" (priceRange, phone-adjacent
// pricing). Passing a function instead makes the return value verbatim, with
// no special-pattern interpretation, however many "$" it contains.
function replaceLiteral(html, pattern, replacement) {
  return html.replace(pattern, () => replacement);
}

export function rewriteHead(html) {
  let out = html;
  out = replaceLiteral(out, /<title>[^<]*<\/title>/, `<title>${PAGE.title}</title>`);
  out = replaceLiteral(out, /<meta name="description" content="[^"]*" \/>/, `<meta name="description" content="${PAGE.description}" />`);
  out = replaceLiteral(out, /<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${PAGE.url}" />`);
  out = replaceLiteral(out, /<meta name="robots" content="[^"]*" \/>/, `<meta name="robots" content="index, follow" />`);
  out = replaceLiteral(out, /<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${PAGE.title}" />`);
  out = replaceLiteral(out, /<meta property="og:description" content="[^"]*" \/>/, `<meta property="og:description" content="${PAGE.description}" />`);
  out = replaceLiteral(out, /<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${PAGE.url}" />`);
  out = replaceLiteral(out, /<meta property="og:image" content="[^"]*" \/>/, `<meta property="og:image" content="${PAGE.image}" />`);
  out = replaceLiteral(out, /<meta name="twitter:title" content="[^"]*" \/>/, `<meta name="twitter:title" content="${PAGE.title}" />`);
  out = replaceLiteral(out, /<meta name="twitter:description" content="[^"]*" \/>/, `<meta name="twitter:description" content="${PAGE.description}" />`);
  out = replaceLiteral(out, /<meta name="twitter:image" content="[^"]*" \/>/, `<meta name="twitter:image" content="${PAGE.image}" />`);
  out = replaceLiteral(out, /<script type="application\/ld\+json">[\s\S]*?<\/script>/, `<script type="application/ld+json">${JSON.stringify([JSON_LD, FAQ_JSON_LD])}</script>`);
  return out;
}

export default async function middleware(request) {
  const origin = new URL(request.url).origin;
  const res = await fetch(`${origin}/index.html`);
  const html = await res.text();
  return new Response(rewriteHead(html), {
    status: 200,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
