function esc(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function townPage(site,t,j){
const e=esc,name=t.name,st=site.state,p=site.prices,neighbors=[site.towns[(j+1)%8],site.towns[(j+2)%8],site.towns[(j+3)%8]];
const notes=[
 ["The mowable portion is more useful than the full lot acreage.","A compact plot may require extra time where garden beds meet the turf."],
 ["Long curb runs and narrow strips change the amount of finishing work.","An estimate must account for both green space and the edges surrounding it."],
 ["Aerial measurements cannot show every obstacle or tight side passage.","Walkable entrances and mower access should be considered before the first cut."],
 ["A level front yard and a steep back section may need two different approaches.","The quote should describe the safe equipment route rather than just total area."],
 ["Retaining walls and planted corners can make an otherwise simple lawn more involved.","Routine upkeep and an overgrown first visit are distinct scopes."],
 ["Open lawn is one part of the job; the fence and planting edges are another.","We separate delicate detail work from the broad mowing passes."],
 ["Shade and sun on the same property can change both height and frequency.","A price for regular mowing should not silently include large debris cleanup."],
 ["Narrow gates and mature landscaping affect which equipment can enter.","First-visit preparation is discussed before a recurring price is confirmed."]
][j];
const faqs=[
 {q:`How do lawns near ${t.landmark} in ${name} affect the cut?`,a:`${t.lawn} ${t.focus} Those ${name} details guide our cut instead of forcing the same method onto every lawn.`},
 {q:`When does the growing season change service in ${name}?`,a:`${t.season} ${t.seasonExtra} Our ${name} schedule follows these conditions rather than a rigid calendar.`},
 {q:`Which access details should a ${name} homeowner share?`,a:`${t.access} ${t.detail} Together these ${name} access details tell us whether standard equipment fits the job.`},
 {q:`Why can a ${name} quote differ from the starting cards?`,a:`${notes[1]} The ${name} size bands begin at ${p[0]}, ${p[1]}, and ${p[2]}; ${t.priceCondition.toLowerCase()}.`}
];
const schema={"@context":"https://schema.org","@type":"LocalBusiness","@id":`https://example.com/#${site.slug}`,name:site.business,url:"https://example.com/",telephone:site.phoneDial,email:site.email,areaServed:{"@type":"City",name,address:{"@type":"PostalAddress",addressRegion:st,addressCountry:"US"}},hasOfferCatalog:{"@type":"OfferCatalog",name:`Lawn care in ${name}`,itemListElement:[{"@type":"Offer",itemOffered:{"@type":"Service",serviceType:"Lawn mowing and edging",areaServed:{"@type":"City",name}}}]}};
const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faqs.map(f=>({"@type":"Question",name:f.q,acceptedAnswer:{"@type":"Answer",text:f.a}}))};
const title=`Lawn Care in ${name}, ${st} | ${site.business}`;
const desc=`${site.business}: ${name}, ${st} lawn mowing and edging near ${t.landmark}. ${t.shortFeature}. Prices from ${p[0]}.`;
const rateLabels=[`Compact lawns around ${name}`,`Everyday ${name} properties`,`Larger ${name} lots`];
const priceCards=p.map((amount,k)=>`<article class="price-card"><small>${e(rateLabels[k])}</small><h3>${["Small","Medium","Large"][k]} yard</h3><div class="amount">${e(amount)}<span>+ / visit</span></div><p>${["Below 5,000 sq ft in ${name}","5,000–10,000 sq ft in ${name}","10,000–20,000 sq ft in ${name}"][k]} · Starting at</p><a href="#quote" class="btn primary">Get My Free Instant Quote</a></article>`).join("\n");
const nearLinks=neighbors.map(n=>`<a href="./lawn-care-${n.slug}.html" class="chip">${e(n.name)} lawn care</a>`).join("");
return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${e(title)}</title><meta name="description" content="${e(desc)}"><meta name="robots" content="noindex,nofollow">
<link rel="canonical" href="https://example.com/lawn-care-${t.slug}.html">
<meta property="og:title" content="${e(title)}"><meta property="og:description" content="${e(desc)}"><meta property="og:image" content="${e(site.photo)}">
<script type="application/ld+json">${JSON.stringify(schema)}</script><script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<style>
:root{--brand:${site.color};--dark:${site.dark};--ink:${site.ink};--bg:#F6F8F4;--line:#CCDCCF}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:75px}body{margin:0;background:var(--bg);color:#1A2E22;font:16px/1.7 system-ui,-apple-system,"Segoe UI",sans-serif;padding-bottom:80px}a{color:inherit}a:focus-visible,summary:focus-visible{outline:3px solid #94762B;outline-offset:4px}
.wrap{max-width:1080px;margin:auto;padding:0 21px}.demo{padding:5px 13px;text-align:center;background:#F6E9B3;color:#343A24;font:700 11px/1.4 system-ui,sans-serif}.nav{background:var(--dark);color:#fff}.nav .wrap{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:13px}.nav a{text-decoration:none;font-weight:800;min-height:44px;display:inline-flex;align-items:center}
.hero{color:#fff;background:linear-gradient(100deg,#0C2C1AEF,#113E289C),url("${site.photo}") center/cover;padding:68px 0 74px}.hero .eyebrow{font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:#F7DBAD;font-weight:850}
h1{font-size:clamp(41px,6vw,74px);line-height:1.06;letter-spacing:-.04em;margin:15px 0 20px}h2{font-size:clamp(29px,4.3vw,44px);line-height:1.14;letter-spacing:-.035em;margin:0 0 19px}h3{font-size:20px;margin:9px 0}.hero p{max-width:730px;font-size:17px}
.section{padding:69px 0}.section.alt{background:#E9F0E8}.prose{max-width:790px}.prose p{margin:0 0 20px}.kicker{color:#346345;font-size:12px;text-transform:uppercase;font-weight:850;letter-spacing:.13em}
.actions{display:flex;flex-wrap:wrap;gap:12px;margin-top:24px}.btn{display:inline-flex;align-items:center;justify-content:center;min-height:48px;padding:10px 18px;border:2px solid var(--brand);border-radius:9px;text-align:center;text-decoration:none;font-weight:800}.primary{color:var(--ink);background:var(--brand)}.outline{background:transparent;color:inherit;border-color:currentColor}
.prices{display:grid;grid-template-columns:repeat(3,1fr);gap:17px;margin-top:23px}.price-card{background:white;border:1px solid var(--line);padding:26px 22px;border-radius:13px}.price-card small{font-weight:800;color:#41634A}.amount{font-size:48px;letter-spacing:-.055em;font-weight:850}.amount span{font-size:14px;font-weight:650;letter-spacing:0;color:#43604D}.price-card p{font-size:13px;line-height:1.45}.price-card .btn{width:100%;font-size:13px;margin-top:9px}.note{max-width:850px;font-size:14px}
.faq{max-width:830px}.faq details{border-bottom:1px solid #B9CABD}.faq summary{min-height:54px;padding:16px 4px;display:flex;justify-content:space-between;gap:20px;cursor:pointer;font-weight:760;list-style:none}.faq summary::-webkit-details-marker{display:none}.faq details p{margin:0 0 20px;padding:0 25px 0 4px}
.chips{display:flex;flex-wrap:wrap;gap:10px}.chip{border:1px solid #88A892;text-decoration:none;padding:9px 15px;min-height:44px;display:inline-flex;align-items:center;border-radius:50px;font-size:14px;font-weight:730}
footer{background:var(--dark);color:white;padding:43px 0}footer a{color:white}footer p{margin:7px 0}.stick{position:fixed;inset:auto 0 0;z-index:40;display:grid;grid-template-columns:95px 1fr;gap:9px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:#fff;border-top:1px solid #B8CEBB}.stick .btn{font-size:12px;padding:8px 5px}.stick .outline{color:#1A3424}
@media(max-width:650px){.hero{padding:45px 0}.hero p{font-size:15px}.section{padding:50px 0}.prices{grid-template-columns:1fr}.actions{display:grid}.actions .btn{width:100%}}
</style></head><body><div class="demo">Demo site — sample business</div>
<header class="nav"><div class="wrap"><a href="./index.html">${e(site.business)}</a><a href="./index.html">Home</a></div></header>
<main>
<section class="hero"><div class="wrap"><span class="eyebrow">${e(t.landmark)} · ${e(name)}</span><h1>Lawn Care in ${e(name)}, ${st}</h1><p>${e(t.hero)}</p><p>${e(t.season)}</p>
<div class="actions"><a class="btn primary" href="#quote">Get My Free Instant Quote</a><a class="btn outline" href="tel:${site.phoneDial}">Call ${site.phone}</a></div></div></section>
<section class="section"><div class="wrap prose"><p class="kicker">${e(t.shortFeature)}</p><h2>${e(t.titleA)}</h2><p>${e(t.lawn)}</p><p>${e(t.focus)}</p></div></section>
<section class="section alt"><div class="wrap prose"><p class="kicker">${e(t.seasonLabel)}</p><h2>${e(t.titleB)}</h2><p>${e(t.seasonExtra)}</p><p>${e(t.climateDetail)}</p></div></section>
<section class="section"><div class="wrap prose"><p class="kicker">${e(t.issueLabel)}</p><h2>${e(t.titleC)}</h2><p>${e(t.access)}</p><p>${e(t.detail)}</p></div></section>
<section class="section alt" id="pricing"><div class="wrap"><h2>${e(t.priceHeading)}</h2><p>${e(t.priceIntro)}</p><div class="prices">${priceCards}</div><p class="note">${e(notes[0])} ${e(t.priceCondition)} ${e(notes[1])}</p></div></section>
<section class="section"><div class="wrap faq"><h2>${e(t.faqHeading)}</h2>${faqs.map(f=>`<details><summary>${e(f.q)}<span aria-hidden="true">+</span></summary><p>${e(f.a)}</p></details>`).join("")}</div></section>
<section class="section alt" id="quote"><div class="wrap prose"><h2>${e(t.quoteHeading)}</h2><p>${e(t.quote)} ${e(t.access)}</p><div class="actions"><a class="btn primary" href="mailto:${site.email}?subject=${encodeURIComponent(name+" lawn care quote")}">Get My Free Instant Quote</a><a class="btn outline" href="tel:${site.phoneDial}">Call ${site.phone}</a></div></div></section>
<section class="section"><div class="wrap"><h2>${e(t.neighborHeading)}</h2><nav class="chips" aria-label="Nearby lawn-care service areas"><a class="chip" href="./index.html">All service areas</a>${nearLinks}</nav></div></section>
</main><footer><div class="wrap"><strong>${e(site.business)}</strong><p>${e(site.city)}, ${st} · ${e(site.hours)}</p><p><a href="tel:${site.phoneDial}">${site.phone}</a> · <a href="mailto:${site.email}">${site.email}</a></p><a href="./index.html">Back to the homepage</a></div></footer>
<div class="stick"><a class="btn outline" href="tel:${site.phoneDial}">Call</a><a class="btn primary" href="#quote">Get My Free Instant Quote</a></div>
</body></html>`;
}

function homeUpdate(html,site){
const top="Demo site — sample business";
html=html.replace(/(<div class="demo-notice"[^>]*>)[\s\S]*?(<\/div>)/,`$1${top}$2`);
const re=/window\.UMMIYARD_SAMPLE_DATA = (\{[\s\S]*?\});<\/script>/,m=html.match(re);
if(!m)throw Error("Missing homepage sample-data object");
const d=JSON.parse(m[1]);d.AREAS=site.towns.map(t=>({name:t.name,url:`./lawn-care-${t.slug}.html`}));
d.OWNER_STORY=site.ownerStory;d.PRICE_NOTE=site.priceNote;d.PRICING_FREQUENCY=site.frequency;
d.REVIEWS_VERIFIED=false;d.GOOGLE_REVIEWS_URL="#reviews";d.DEMO_MODE=true;
d.REVIEWS=site.reviews.map((text,i)=>({name:["Homeowner A","Homeowner B","Homeowner C"][i],text}));
d.FAQS=(d.FAQS||[]).map((q,i)=>({q:q.q,a:site.faqs[i%site.faqs.length]}));
html=html.replace(re,`window.UMMIYARD_SAMPLE_DATA = ${JSON.stringify(d,null,2)};</script>`);
html=html.replaceAll("Only actual Google review screenshots from this business are shown.","Customer feedback belongs here once the business is connected.");
html=html.replaceAll("Only real Google reviews are shown.","Customer feedback belongs here once the business is connected.");
html=html.replaceAll("Actual job photography.","A closer look at the finishing work.");
html=html.replaceAll("The photo shown here is illustrative, not a portrait of me.","");
html=html.replaceAll("Read all reviews on Google","See our reviews");
html=html.replaceAll("Real yards, real results","Well-finished outdoor spaces");
const start=html.indexOf("<script>\n(()=>{document.addEventListener(");
if(start<0)throw Error("Can't locate review preview script");
const end=html.indexOf("</script>",start);if(end<0)throw Error("Malformed review script");
const js=`<script>
(()=>{document.addEventListener('DOMContentLoaded',()=>{
 const data=window.UMMIYARD_SAMPLE_DATA||{};
 document.querySelectorAll('[data-google-badge]').forEach(el=>{
   el.textContent=data.RATING+' / 5 · '+data.REVIEW_COUNT+' sample reviews';
   el.removeAttribute('href');el.removeAttribute('target');
 });
 document.querySelectorAll('[data-repeat="REVIEWS"]').forEach(root=>{
   root.replaceChildren();
   for(const r of data.REVIEWS||[]){
    const card=document.createElement('article');card.className='sample-review review-card';
    const tag=document.createElement('span');tag.className='sample-tag';tag.textContent='Sample review';
    const p=document.createElement('p');p.textContent=r.text;
    const by=document.createElement('strong');by.textContent=r.name;
    card.append(tag,p,by);root.append(card);
   }
 });
});})();
</script>`;
html=html.slice(0,start)+js+html.slice(end+9);
return html;
}