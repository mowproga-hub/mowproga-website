# UmmiYard — Lawn Care Website Template Collection

**Design branch:** `site-templates`  
**Scope:** `templates/` only — no production integration, no merges or pull requests.  
**Collection:** 10 standalone home designs + **80 independently written town pages** (eight per design).  
**Status:** Mockups using fictional businesses. Do not deploy them as real businesses.

## Choose a template

| ID | Design | Visual direction | Best fit | Demo business and region | Eight individual service-area pages |
|---|---|---|---|---|---|
| [01 — Nightfall Premium](./01-nightfall-premium/index.html) | Dark premium | Forest-green surfaces and large editorial headings | Established residential crews | Everpine Grounds · Denver, CO | Lakewood, Littleton, Arvada, Centennial, Englewood, Wheat Ridge, Aurora, Golden |
| [02 — Fresh Start](./02-fresh-start/index.html) | Bright clean | White cards, open green spacing | Solo lawn operators | BrightSprig Lawn Co. · Raleigh, NC | Cary, Apex, Morrisville, Garner, Wake Forest, Knightdale, Holly Springs, Fuquay-Varina |
| [03 — Earth & Oak](./03-earth-and-oak/index.html) | Earthy rustic | Clay, warm neutrals and garden-focused type | Garden-aware mowing services | Cedar & Clay Yardworks · Portland, OR | Beaverton, Tigard, Lake Oswego, Hillsboro, Tualatin, Milwaukie, Gresham, Oregon City |
| [04 — Turf Performance](./04-turf-performance/index.html) | Bold athletic | Yellow accent, sharp contrasts | Detail-focused mowing teams | Cutline Turf Team · Kansas City, KS | Overland Park, Lenexa, Olathe, Shawnee, Prairie Village, Merriam, Leawood, Bonner Springs |
| [05 — Quiet Lines](./05-quiet-lines/index.html) | Minimal editorial | Restrained typography and white space | Boutique yard services | Stillwater Lawn Studio · Seattle, WA | Bellevue, Redmond, Kirkland, Shoreline, Burien, Renton, Bothell, Mountlake Terrace |
| [06 — Porchlight Neighbors](./06-porchlight-neighbors/index.html) | Warm neighborly | Rounded approachable cards and cozy colors | Family and neighborhood businesses | Porchside Lawn Care · Nashville, TN | Franklin, Brentwood, Nolensville, Mount Juliet, Hendersonville, Goodlettsville, La Vergne, Smyrna |
| [07 — Clearview Glass](./07-clearview-glass/index.html) | Light glass | Cool glass-like layers and light surfaces | Modern phone-first operators | Glassleaf Lawn Works · Austin, TX | Round Rock, Cedar Park, Pflugerville, Georgetown, Leander, Buda, Kyle, Bee Cave |
| [08 — Heritage Standard](./08-heritage-standard/index.html) | Classic trustworthy | Orderly blue and conventional service hierarchy | Long-running local companies | Oakmark Lawn & Grounds · Minneapolis, MN | Bloomington, Edina, Richfield, St. Louis Park, Golden Valley, Hopkins, Minnetonka, Brooklyn Center |
| [09 — Field Manual](./09-field-manual/index.html) | High-contrast utility | Strong high-impact field-crew language | Route-efficient operators | RouteReady Lawn Co. · Atlanta, GA | Smyrna, Marietta, Kennesaw, Sandy Springs, Decatur, Brookhaven, Chamblee, Dunwoody |
| [10 — Canopy Photo](./10-canopy-photo/index.html) | Photo-led | Outdoor photography with foliage and warm gold | Image-forward lawn and landscape brands | Canopy & Cut Lawn Care · Tampa, FL | Brandon, Valrico, Riverview, Temple Terrace, Plant City, Oldsmar, Safety Harbor, Pinellas Park |

## File structure

Every design has its own directory:

```text
templates/
  README.md
  01-nightfall-premium/
    index.html
    lawn-care-lakewood.html
    lawn-care-littleton.html
    ... 6 more town pages
  02-fresh-start/
    index.html
    ... 8 individual town pages
  ...
  10-canopy-photo/
    index.html
    ... 8 individual town pages
```

The homepage service-area chips link directly to its eight local HTML files. Every town page links to the homepage and **three other town pages** in that template.

## Editorial and content requirements

- The **80 town articles** have town-specific leads, service details, seasonal considerations, cost explanations, section headings, and four town-specific FAQ questions/answers. They are not automated town-name replacements.
- The articles describe broad regional turf and property conditions and reference recognizable local roads or landmarks. They **do not claim any fictional company has completed a local job** or invent changing municipal yard-waste rules.
- Each page presents a single H1 (`Lawn Care in [Town], [ST]`), local H2 sections, starting prices for small/medium/large yards, working Quote and Call link surfaces for the mockup, and 2–3 nearby-town links (three in this collection).
- Each town page includes a distinct `<title>`, meta description, canonical URL, `LocalBusiness` structured data with `areaServed`, and `FAQPage` structured data.
- Exactly **one small “Demo site — sample business”** label appears on every page. Homepage feedback cards retain **“Sample review”** labels. No chatbot, messaging widget, or third-party chat script is included.

## Similarity and structural QA performed

In this revision, all 80 town files were read back from GitHub. Checks confirmed:

- **8 town files** per template; each homepage's sample data references all eight.
- **1 H1, 1 demo label, 4 FAQ disclosures, and 3 other-town links** per local page.
- No unresolved template interpolation text or identical repeated full paragraphs detected.
- **Maximum same-template four-word-shingle Jaccard overlap: 6.3%** after normalizing town names and excluding repeated link labels from the comparison. This is one defined phrase-similarity measure, not a guarantee about every possible word-overlap metric or Google search ranking.

| Template | Highest within-template 4-word phrase overlap |
|---|---:|
| 01 | 5.1% |
| 02 | 5.0% |
| 03 | 5.0% |
| 04 | 5.5% |
| 05 | 5.6% |
| 06 | 5.6% |
| 07 | 5.5% |
| 08 | 5.8% |
| 09 | 6.3% |
| 10 | 6.1% |

## Before a real customer publishes a site

1. **Replace fictional data.** The example names, 555-01xx phone numbers, `.example` emails, prices, biographies, and image references are mockup data. Populate verified operator details in UmmiYard. Check service reach before enabling area pages.
2. **Use real reviews and proof.** Demo review content is visibly marked “Sample review” and is not genuine customer feedback. Homepages currently display a single labeled sample lawn photo, **not genuine job proof**. Replace it with authentic authorized customer reviews and real before/after photographs from the same property and camera angle.
3. **Wire a real quote form.** Homepages use a sample quote anchor and the local-page email actions are placeholders. Connect quote requests to the intended operator's actual lead capture.
4. **Pre-render search metadata.** The current files include the mockup `noindex,nofollow` tag, `example.com` canonicals and tenant sample values. For a real deployment, generate real titles, descriptions, canonical URLs, local schema, and body copy in the HTML delivered to crawlers; remove `noindex` only after checking all facts and routes.
5. **Check local content and search policies.** Each town page should correspond to a genuinely served place and deliver meaningful customer information. Review changing local regulations using authoritative sources. Avoid publishing dozens of interchangeable pages purely to capture location keywords.
6. **Retest visual and technical quality after branding.** Recheck 44px+ tap targets, color contrast, responsive overflow, keyboard interactions, alt text, performance, mobile rendering, local schema validation, and all external photo URLs. This revision's checks were content/source validations, not a complete browser-based cross-device QA run.

## Helpful references

- [Google Search Essentials and spam policies](https://developers.google.com/search/docs/essentials/spam-policies)
- [LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Review snippet policies](https://developers.google.com/search/docs/appearance/structured-data/review-snippet)
- [Unsplash license](https://unsplash.com/license)

**Isolation rule:** Work on these files is confined to the `site-templates` branch and the `templates/` directory. There is no change to the live `mowproga.com` deployment from this template collection.


## November 11, 2026 — 390px mobile refinement

All changes in this pass were made **on `site-templates`, inside `templates/` only**. No production branch, source app, deployment, pull request or merge was changed.

- Each of the **ten homepages** retains its hero, trust row, services, optional work, comparison slider, reviews, pricing, owner story, eight linked local areas, FAQ, closing quote action and contact footer.
- At screen widths up to 640px: section gaps are approximately 35px; the three service cards use two columns; the three prices become short vertical rows (with the concluding Quote CTA retained); review cards scroll horizontally; the owner image is cropped to approximately 155px high; and the footer is reorganized into a two-column contact/navigation layout.
- All **80 town pages** received a corresponding mobile-only CSS pass: approximately 29px section spacing, shorter hero, compact pricing rows, preserved four-FAQ disclosure section and preserved quote/call controls and nearby links.
- On the five formerly low-contrast themes (03, 05, 06, 07 and 08), footer, town-introduction and CTA text now uses light foregrounds on specified dark surfaces. For example, `#f8fff8` on `#11291c` is approximately 15.2:1 contrast; `#f8fff8` on `#123524` is approximately 13.2:1.
- Facebook and Instagram icons use explicit visible SVG stroke colors. With no connected social profile, the icon remains visible but its anchor is disabled rather than linking to the current page. Connected real URLs remain usable.
- Template 09 has a zero-stroke, no-shadow heading override. Repeated “Starting at” copy was eliminated from 01, 09 and 10.
- Template 04's owner-photo slot uses a residential-lawn mower scene rather than stadium groundskeeping sponsorship. Template 10's owner photo was changed to avoid repeating another template's image.
- In this **earlier mobile refinement pass**, all ten comparison sliders used distinct but **unmatched** Pexels images. The follow-up below supersedes that implementation; it no longer appears on the homepages.
- In the earlier pass, source validation confirmed 40 distinct homepage image URLs, 8 areas and 4 FAQs per homepage, all home-page scripts syntactically valid, one top demo label per homepage, and no repeated “Starting at” on an individual price card. The image count changed in the follow-up below.
- A Playwright browser check at 390px, using the corresponding locally available pre-revision Nightfall and Fresh Start HTML plus the compact CSS rules, yielded approximately **5,415px** and **5,558px** page heights respectively (previously approximately 9,265px and 9,185px). This is a representative layout test, **not a full rendered-height measurement of all ten updated GitHub homepages**.
- Pexels image pages were checked for photo subject and free-use licensing. The current execution environment cannot fetch the binary CDN image URLs or render the newest GitHub branch files directly in a browser; verify the image loads and exact mobile height in the target preview before customer deployment.

Relevant photo information: [Pexels License](https://www.pexels.com/license/).

## November 11, 2026 — proof imagery integrity follow-up (current)

- All ten homepages now use a **single clean Pexels lawn photo** in their `#results` section, instead of a misleading slider between unrelated properties. The ten images have distinct Pexels photo IDs (one per design); the old comparison controls, labels, image bindings and comparison initialization were removed from the homepage code.
- Every sample image is labeled **“Recent work · Sample photo”** and the caption reads **“Your own before-and-after photos go here”**. It is not presented as a completed job by the fictional demo business.
- Each image remains a tenant-configurable sample value at `RECENT_WORK_PHOTO`. Publishing a real customer's before/after slider requires authentic matched, authorized photos of the same job and angle.
- Template 01's review action now has the same **“Read more on Google”** text and `GOOGLE_REVIEWS_URL` binding as other templates. The demo URL is a placeholder, not a real fictional-company Google profile.
- All ten updated homepages were fetched back from the `site-templates` branch; checks found exactly one sample photo and caption per homepage, valid sample data, ten unique Pexels photo IDs, and no remaining comparison slider markup or activation script. Each home page has its own commit.
- **External image availability remains unverified at runtime:** the current tools could not download/render Pexels CDN images or run a live browser preview. Open all ten previews and check image loading and mobile layout before any customer deployment. Link shape and distinct IDs are verified; HTTP/image decoding success is not.
- No town pages, production pages, branch merges or pull requests were changed during this follow-up.
