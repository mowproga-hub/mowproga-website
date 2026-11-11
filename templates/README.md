# UmmiYard Plug-and-Play Lawn Care Website Templates

**Branch:** `site-templates`  
**Status:** Fictional, **noindex** design examples — **NOT production websites**  
**Structure:** Ten self-contained homepage designs, each with three distinct, locally informed service-area pages.

## Template catalog

| # | Folder / homepage | Style and visual direction | Recommended operator | Fictional demo business | Service-area pages |
|---|---|---|---|---|---|
| 01 | [Nightfall Premium](./01-nightfall-premium/index.html) | Dark forest, oversized editorial typography, lawn imagery | Established operators targeting higher-value homes | Everpine Grounds — Denver, CO | Lakewood, Littleton, Arvada |
| 02 | [Fresh Start](./02-fresh-start/index.html) | Bright white, friendly green accents, clean service cards | Solo lawn-care operators and new businesses | BrightSprig Lawn Co. — Raleigh, NC | Cary, Apex, Morrisville |
| 03 | [Earth & Oak](./03-earth-and-oak/index.html) | Rustic neutrals, warm textures, botanical character | Garden-forward mowing and tidy-up crews | Cedar & Clay Yardworks — Portland, OR | Beaverton, Tigard, Lake Oswego |
| 04 | [Turf Performance](./04-turf-performance/index.html) | Athletic type, sharp shapes, decisive contrast | Precision-mowing and detail-focused operators | Cutline Turf Team — Kansas City, KS | Overland Park, Lenexa, Olathe |
| 05 | [Quiet Lines](./05-quiet-lines/index.html) | Minimal editorial grids, restrained palette and type | Boutique residential yard services | Stillwater Lawn Studio — Seattle, WA | Bellevue, Redmond, Kirkland |
| 06 | [Porchlight Neighbors](./06-porchlight-neighbors/index.html) | Soft rounded cards, warm palette, friendly emphasis | Neighborhood- and family-oriented crews | Porchside Lawn Care — Nashville, TN | Franklin, Brentwood, Nolensville |
| 07 | [Clearview Glass](./07-clearview-glass/index.html) | Frosted light surfaces, cool clean palette | Tech-friendly modern operators | Glassleaf Lawn Works — Austin, TX | Round Rock, Cedar Park, Pflugerville |
| 08 | [Heritage Standard](./08-heritage-standard/index.html) | Classic blue, orderly typography and sturdy composition | Long-running local companies and property managers | Oakmark Lawn & Grounds — Minneapolis, MN | Bloomington, Edina, Richfield |
| 09 | [Field Manual](./09-field-manual/index.html) | High-contrast field-crew graphics, strong headings | Fast-route, efficiency-minded solo operators | RouteReady Lawn Co. — Atlanta, GA | Smyrna, Marietta, Kennesaw |
| 10 | [Canopy Photo](./10-canopy-photo/index.html) | Rich photography, dark foliage, warm gold | Visual-first lawn and landscape-care brands | Canopy & Cut Lawn Care — Tampa, FL | Brandon, Valrico, Riverview |

## Files

Each directory contains:

```
templates/NN-template-name/
  index.html
  lawn-care-town-one.html
  lawn-care-town-two.html
  lawn-care-town-three.html
```

Every homepage is one standalone HTML file with inline CSS and JavaScript, and demo content in `window.UMMIYARD_SAMPLE_DATA` near the beginning. Fonts and imagery load from external services. Service-area pages are standalone HTML files with their own headings, seasonal/local context, FAQ, SEO markup, and links to the homepage and the other two local pages.

## Required production setup

1. **Do not publish the fictional demos as business listings.** Replace the company identity, `555-01xx` demo phone, `.example` email, owner copy, city, areas, price list, and service qualifications with the operator's actual details. Every template includes a prominent fictional-demo notice and a `noindex,nofollow` robots tag.
2. **Connect a real quote flow.** Homepages currently use `QUOTE_URL: "#quote"` to point at the ending call-to-action. Service-area page quote controls use sample email links. UmmiYard must wire these to its production quote form and ensure working lead delivery.
3. **Use verified reviews only.** Homepages display cards explicitly labeled **Sample review**, not fabricated customer testimonials. Never mark up made-up reviews as authentic. Replace them with the actual operator's authorized Google review content, or hide the section if unavailable. The sample rating must not be published as real.
4. **Replace illustrative imagery.** Photos are hotlinked from Unsplash-hosted examples. They illustrate the aesthetic, not work performed by the fictional company. **The “Before/After” slider combines two independent photos and is not evidence of a single completed lawn job.** For a real business use genuine paired work images and operator-owned owner/team photos. Optimize, serve responsive images, maintain attribution/license records as appropriate, and test all image URLs in the deployment environment.
5. **Pre-render SEO for the actual operator.** Client-side demo token substitution is not a robust publishing pipeline. Generate real `<title>`, meta description, canonical URL, Open Graph fields, visible text, LocalBusiness schema, and FAQ data in the HTML delivered to crawlers. Replace the demo canonical `https://example.com` and remove `noindex` **only after** the page is accurate, useful, and available to customers.
6. **Check local substance before publishing.** Each area page provides a different, cautious local-service example with identifiable places, regional turf/seasonal considerations, an individual FAQ, and neighbor-page links. Some local guidance should be confirmed against up-to-date local authorities and the operator's actual work. Never claim the operator serves a town without checking service coverage; do not manufacture exact leaf-pickup schedules or local reviews.
7. **Avoid doorway pages.** Do not mass-create town pages by simply swapping the town name. Use meaningful original local information and genuine service differentiation, consolidate locations with insufficient substance, and keep pages navigable from the main site.
8. **Keep accessibility and performance checks in CI.** Confirm color contrast ≥4.5:1 for ordinary text, 44px+ targets, meaningful alternative text, label and keyboard support for photo sliders, single H1 per page, accessible FAQ disclosure elements, image loading, mobile overflow and reasonable font/image sizes for the final operator palette. Changing CSS variables can break contrast, so recheck when customers customize branding.

**No chatbot or chat widget is included.**

## Licenses and external references

- [Unsplash License](https://unsplash.com/license) — source photographs used as design examples; licensing does not establish they represent any actual job.
- [Google Search spam policies: doorway abuse](https://developers.google.com/search/docs/essentials/spam-policies) — each published local page should offer unique value, not merely reroute visitors to the same generic content.
- [Google LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business) — publish structured data that accurately represents the real business; structured data does not guarantee rich results.
- [Google review snippet structured data](https://developers.google.com/search/docs/appearance/structured-data/review-snippet) — avoid self-serving or ineligible aggregate ratings.

## Preview caveats

- Preview data and brand variables in each HTML file are intended for design evaluation.
- Demo pages have `noindex` and `example.com` canonicals by design.
- Ratings, review counts, fictional owners, prices, and job comparisons are illustrative only.
- Unsplash image availability was grounded in photo source pages; **live per-image HTTP and cross-device visual QA still need to be performed** before shipping.
- Local-area copy is a starting editorial draft to verify against the operator's real service reach and updated regional rules.
