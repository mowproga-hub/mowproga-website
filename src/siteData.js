// Plain data shared by the React app (src/App.jsx) AND the edge middleware
// (middleware.js), so page titles, descriptions, copy and schema can't drift
// apart between what crawlers get and what visitors see. No JSX, no imports.

// Non-gated residential areas we actually serve. `rules` picks which local
// leaf-disposal rules apply (see LEAF_RULES). `intro` is optional page-specific
// copy; only add facts that are true for that place.
export const NEIGHBORHOODS = [
  { slug: "winston", name: "Winston", city: "Douglasville", zip: "30134", rules: "county",
    intro: "Mow Pro is based right here in the Winston area of northwest Douglas County, so Winston yards are the closest ones on our route. It's a wooded part of Douglasville, with pines and hardwoods and plenty of homes on half-acre to multi-acre lots, which means leaves and debris pile up fast once fall hits." },
  { slug: "stewarts-mill", name: "Stewarts Mill", city: "Douglasville", zip: "30134", rules: "douglasville" },
  { slug: "shallowford-heights", name: "Shallowford Heights", city: "Douglasville", zip: "30134", rules: "douglasville" },
  { slug: "springwood-village", name: "Springwood Village", city: "Douglasville", zip: "30135", rules: "douglasville" },
  { slug: "big-a", name: "the Big A / Highway 166 area", short: "Big A / Hwy 166", city: "Douglasville", zip: "30134", rules: "douglasville" },
  { slug: "lithia-springs", name: "Lithia Springs", city: "Lithia Springs", zip: "30122", rules: "county" },
  { slug: "villa-rica", name: "Villa Rica", city: "Villa Rica", zip: "30180", rules: "villaRica" },
];

export const getNeighborhood = (slug) => NEIGHBORHOODS.find((n) => n.slug === slug) || null;

// "Villa Rica, GA" instead of "Villa Rica, Villa Rica, GA".
export const placeLabel = (n) => (n.name === n.city ? `${n.name}, GA` : `${n.name}, ${n.city}, GA`);
// Short form for <title> (keeps titles under ~60 characters).
export const titleLabel = (n) => {
  const name = n.short || n.name;
  return n.name === n.city ? `${name}, GA` : `${name}, ${n.city} GA`;
};

export const neighborhoodTitle = (n) => `Lawn Care in ${titleLabel(n)} | Mow Pro`;
export const neighborhoodDescription = (n) =>
  `Lawn mowing, edging, leaf removal, and fall cleanup for homes in ${placeLabel(n)}. Local, family-run crew, same-day quotes, no contracts. Call 404-669-6945.`;

export const LEAF_PRICE_ROWS = [
  ["Small yard (under 5,000 sq ft)", "$130+"],
  ["Medium yard (5,000–10,000 sq ft)", "$260+"],
  ["Large yard (10,000–20,000 sq ft)", "$400+"],
  ["Extra large / acreage (over 20,000 sq ft)", "Custom quote"],
];

// Real local rules (checked October 2026):
//  - City of Douglasville, Residential Waste Service page
//  - City of Villa Rica, Solid Waste / Curbside Pickup page
//  - Douglas County, Landfill / Solid Waste / Recycling page
export const LEAF_RULES = {
  douglasville: (n) =>
    `If your ${n.name === n.city ? "" : `${n.name.replace(/^the /, "")} `}home is inside Douglasville city limits, the City picks up yard waste weekly on your sanitation day, but bagged leaves have to be in biodegradable or compostable bags (no plastic) and under 50 pounds each. Outside city limits, leaf pickup depends on your trash hauler. Either way, our default is to blow leaves into a pile at your wood line or a spot you choose, so there are no bags to buy and nothing to drag to the curb.`,
  county: (n) =>
    `${n.name} is in unincorporated Douglas County, outside any city's leaf pickup, so what happens to your leaves depends on your trash hauler. The county's Cedar Mountain landfill on County Services Road takes clean, unbagged yard waste at $80 a ton, but most homeowners would rather not haul it themselves. Our default is to blow leaves into a pile at your wood line or a spot you choose, or we bag and haul them away for you.`,
  villaRica: () =>
    `Villa Rica's city crews collect bagged leaves at the curb, but not yard waste that a contractor removed. So when we clear your leaves, we either pile them on your property (wood line or a spot you choose) at no charge, or bag and haul them off ourselves. You won't be left with bags the city won't take.`,
};

export const leafRuleText = (n) => (LEAF_RULES[n.rules] || LEAF_RULES.douglasville)(n);
export const leafServiceText = (n) =>
  `We clear leaves off lawns, flower beds, driveways, and walkways in ${n.name}, as a one-time service or every visit through leaf season. Pricing starts at $130 for small yards. Leaves are piled on-site at no extra charge, or bagged and hauled away for $5–8 a bag.`;

// ── Leaf Removal service page ──────────────────────────────────────────────
export const LEAF_REMOVAL_SEO = {
  title: "Leaf Removal Service in Douglasville, GA | Mow Pro",
  description: "Leaf removal in Douglasville, GA: leaves cleared off your lawn, beds, and driveway, piled on-site or bagged and hauled away. From $130. Call 404-669-6945.",
  url: "https://mowproga.com/leaf-removal",
  image: "https://mowproga.com/images/leaf-cleanup-ba.webp",
};

export const LEAF_REMOVAL_INTRO =
  "Douglas County yards are full of oaks, sweetgums, and pines, and once the leaves start falling they don't stop for weeks. We clear them off your lawn, flower beds, driveway, and walkways so the grass underneath gets sunlight again, as a one-time job or every visit through leaf season.";

export const LEAF_REMOVAL_WHY =
  "A thick layer of leaves left sitting on the lawn holds moisture against the grass and blocks the light it needs, which can leave thin, patchy spots by spring. Clearing them every week or two during the heaviest drop keeps them from matting down.";

export const LEAF_REMOVAL_OPTIONS = [
  ["One-time leaf removal", "We clear the whole yard once: lawn, beds, driveway, and walkways. Good for a single heavy drop or before company comes."],
  ["Every visit, all season", "For our mowing customers: leaves are cleared on each regular cut while they're falling, billed by the time it takes, and your price goes back to normal once they stop."],
  ["Piled or hauled away", "By default we blow leaves into a pile at your wood line or a spot you choose, at no extra charge. Want them gone? We bag and haul them away for $5–8 a bag."],
];

export const LEAF_LOCAL_RULES = [
  ["Inside Douglasville city limits", "The City picks up yard waste weekly on your sanitation day. Bagged leaves must be in biodegradable or compostable bags (no plastic), 50 pounds or less per bag."],
  ["Unincorporated Douglas County (Winston, Lithia Springs, and other areas outside city limits)", "No city leaf pickup, so it depends on your trash hauler. The county's Cedar Mountain landfill on County Services Road takes clean, unbagged yard waste at $80 a ton."],
  ["Villa Rica", "City crews collect bagged leaves, but not yard waste removed by a contractor, so we pile leaves on your property or haul them off ourselves."],
];

export const LEAF_REMOVAL_FAQ = [
  ["How much does leaf removal cost in Douglasville, GA?", "Leaf removal is priced by yard size: small yards start at $130, medium at $260, and large at $400. Extra-large lots and acreage get a custom quote. Regular mowing customers get a discounted leaf rate. We confirm the exact price once we see the property."],
  ["What's the difference between leaf removal and a fall cleanup?", "Leaf removal is just the leaves: cleared off the lawn, beds, and hard surfaces, once or every visit during leaf season. A fall cleanup is the full end-of-season package: leaf removal plus flower bed cleanout and a final mow and edge before winter."],
  ["Can you clear the leaves every time you mow?", "Yes. For our mowing customers, leaves are cleared on every visit while they're falling, billed by the time it takes on top of your regular cut, only when leaves are actually down. Once they stop falling, your price goes back to normal."],
  ["Will the City of Douglasville pick up leaves in plastic bags?", "No. Inside city limits, bagged leaves have to be in biodegradable or compostable bags, 50 pounds or less each. That's one reason our default is piling leaves at your wood line instead of bagging them."],
  ["How often should leaves be removed?", "During the heaviest drop, usually late October into early December around Douglasville, clearing them every one to two weeks keeps leaves from matting down and smothering the grass."],
];

// ── Fall Cleanup page (title no longer leads with "Leaf Removal", so it and
// /leaf-removal don't compete for the same searches) ──────────────────────
export const FALL_CLEANUP_SEO = {
  title: "Fall Yard Cleanup in Douglasville, GA | Mow Pro",
  description: "Fall yard cleanup in Douglasville, GA: leaves cleared, flower beds cleaned out, a final mow and edge, and debris hauled away. From $130. Call 404-669-6945.",
  url: "https://mowproga.com/fall-cleanup",
  image: "https://mowproga.com/images/leaf-cleanup-ba.webp",
};

// Real Mow Pro job photos (before & after combined in one image).
export const JOB_PHOTOS = {
  leafLawn: { src: "/images/leaf-cleanup-ba.webp", w: 900, h: 900, alt: "Before and after a fall leaf cleanup in Douglasville, GA: lawn covered in leaves, then cleared and mowed", caption: "Fall leaf cleanup, Douglasville" },
  leafDriveway: { src: "/images/leaf-driveway-ba.webp", w: 900, h: 675, alt: "Before and after leaf removal along a driveway: leaves covering the lawn edge, then a clean, edged lawn", caption: "Leaves cleared along the driveway" },
  overgrown: { src: "/images/yard-cleanup-ba.webp", w: 900, h: 672, alt: "Before and after an overgrown front yard cleanup in Douglasville, GA: vines and weeds cut back, leaves cleared", caption: "Overgrown front yard cleanup" },
};
export const LEAF_PAGE_PHOTOS = [JOB_PHOTOS.leafLawn, JOB_PHOTOS.overgrown];
export const FALL_PAGE_PHOTOS = [JOB_PHOTOS.overgrown, JOB_PHOTOS.leafLawn];
export const jobPhotosHtml = (list) =>
  `<h2>More Real Mow Pro Jobs</h2>${list.map((p) => `<figure><img src="${p.src}" alt="${p.alt}" width="${p.w}" height="${p.h}" loading="lazy" /><figcaption>${p.caption}</figcaption></figure>`).join("")}`;
