function escapeHTML(s){return String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}

function stripHTML(s){return String(s??"").replace(/<[^>]*>/g,"").replace(/&amp;/g,"&").replace(/&#39;|&apos;/g,"'").replace(/&quot;/g,'"').replace(/&lt;/g,"<").replace(/&gt;/g,">").replace(/\s+/g," ").trim()}

function extractedFacts(old){
 const segments=[...old.matchAll(/<section class="section"><div class="wrap prose">([\s\S]*?)<\/section>/g)].map(x=>x[1]);
 const paras=s=>[...String(s||"").matchAll(/<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/g)].map(x=>stripHTML(x[1]));
 const hero=old.match(/<section class="hero">([\s\S]*?)<\/section>/)?.[1]||"";
 const p0=paras(segments[0]),p1=paras(segments[1]);
 const season=paras(hero)[1];
 if(!p0?.[1]||!p0?.[2]||!p1?.[1]||!season)throw Error("Could not extract 4 source facts");
 return {lawn:p0[1],focus:p0[2],season,access:p1[1]};
}

function newTownArticle(old,site,town,idx){
 const e=escapeHTML, strip=stripHTML, facts=extractedFacts(old), name=town.name, st=site.STATE;
 const p=[site.PRICE_SMALL,site.PRICE_MEDIUM,site.PRICE_LARGE];
 const neighbors=[1,2,3].map(k=>site.AREAS[(idx+k)%8]);
 const base=`https://example.com/lawn-care-${town.slug}.html`;
 const desc=`${town.meta} Lawn mowing and edging in ${name}, ${st}. Starting at ${p[0]} per visit.`;
 const faq=town.qa.map(([question,answer])=>({q:question,a:answer}));
 const localBusiness={"@context":"https://schema.org","@type":"LocalBusiness","@id":"https://example.com/#lawn-business",name:site.BUSINESS_NAME,url:"https://example.com/",telephone:site.PHONE_DIAL,email:site.EMAIL,areaServed:[{"@type":"City",name,address:{"@type":"PostalAddress",addressRegion:st,addressCountry:"US"}}],hasOfferCatalog:{"@type":"OfferCatalog",name:`${name} lawn care`,itemListElement:[{"@type":"Offer",itemOffered:{"@type":"Service",serviceType:"Lawn mowing and edging",areaServed:name}}]}};
 const faqSchema={"@context":"https://schema.org","@type":"FAQPage",mainEntity:faq.map(x=>({"@type":"Question",name:x.q,acceptedAnswer:{"@type":"Answer",text:x.a}}))};
 const priceCards=p.map((v,i)=>`<article class="price"><span>${["Small","Medium","Large"][i]} yard</span><strong>${e(v)}<small>+ / visit</small></strong><p>Starting at · ${["under 5,000","5,000–10,000","10,000–20,000"][i]} sq ft</p><a href="#quote" class="btn primary">Get My Free Instant Quote</a></article>`).join("");
 const nav=neighbors.map(x=>`<a href="${e(x.url)}">${e(x.name)} lawn care</a>`).join("");
 const qaHTML=faq.map(x=>`<details><summary>${e(x.q)} <span aria-hidden="true">+</span></summary><p>${e(x.a)}</p></details>`).join("");
 const baseStyles=`:root{--brand:${town.brand};--dark:${town.dark};--ink:${town.ink};--tone:${town.accent};--heading:${town.font}}*{box-sizing:border-box}html{scroll-behavior:smooth;scroll-padding-top:68px}body{margin:0;background:#F6F8F4;color:#1C2C20;font:16px/1.7 system-ui,-apple-system,"Segoe UI",sans-serif;padding-bottom:80px}a{color:inherit}a:focus-visible,summary:focus-visible{outline:3px solid #B1842E;outline-offset:3px}.wrap{max-width:1090px;margin:auto;padding:0 22px}.demo-label{padding:5px 12px;text-align:center;background:#F6E7B6;color:#273220;font:700 11px/1.35 system-ui,sans-serif}.nav{background:var(--dark);color:white}.nav .wrap{min-height:68px;display:flex;align-items:center;justify-content:space-between;gap:16px}.nav a{min-height:44px;display:inline-flex;align-items:center;text-decoration:none;font-weight:800}.hero{padding:64px 0 77px;background:linear-gradient(90deg,#081B11F0,#0D3022B9),url("${site.HERO_PHOTO}") center/cover;color:white}.hero__intro{font-weight:750;color:#F2DBAB;letter-spacing:.09em;text-transform:uppercase;font-size:12px}.hero h1{font:800 clamp(41px,6.8vw,76px)/1.06 var(--heading),Georgia,serif;letter-spacing:-.045em;margin:17px 0 18px;max-width:910px}.hero p{font-size:17px;max-width:720px;line-height:1.7}.buttons{display:flex;flex-wrap:wrap;gap:11px;margin-top:27px}.btn{display:inline-flex;min-height:48px;align-items:center;justify-content:center;text-align:center;border:2px solid var(--brand);border-radius:9px;text-decoration:none;padding:10px 19px;font-weight:800}.btn.primary{background:var(--brand);color:var(--ink)}.btn.outline{background:transparent;border-color:currentColor;color:inherit}.section{padding:74px 0}.alt{background:#E8EFE7}.section .eyebrow{color:#386447;font-size:12px;text-transform:uppercase;letter-spacing:.13em;font-weight:820}.section article{max-width:820px}.section article p{margin:0 0 17px}h2{font:800 clamp(31px,4.3vw,46px)/1.13 var(--heading),Georgia,serif;letter-spacing:-.025em;margin:13px 0 21px}h3{margin:10px 0 15px;font-size:21px}.prices{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:17px;margin:26px 0}.price{background:white;border:1px solid #CBD9CE;padding:26px;border-radius:12px}.price strong{font-size:48px;display:block;letter-spacing:-.04em}.price strong small{font-size:13px;font-weight:650;letter-spacing:0}.price>span{font-size:13px;font-weight:850;color:#2E5940}.price p{font-size:13px;line-height:1.4;margin:0 0 17px}.price .btn{width:100%;font-size:13px}.faq{max-width:860px}.faq details{border-bottom:1px solid #B8CABB}.faq summary{min-height:54px;display:flex;justify-content:space-between;align-items:center;gap:20px;padding:13px 5px;cursor:pointer;font-weight:760;list-style:none}.faq summary::-webkit-details-marker{display:none}.faq details p{margin:0 0 19px;padding:0 25px 0 5px}.neighbors{display:flex;flex-wrap:wrap;gap:11px}.neighbors a{border:1px solid #8CA891;border-radius:32px;display:inline-flex;align-items:center;min-height:44px;text-decoration:none;font-size:14px;font-weight:720;padding:8px 16px}footer{background:var(--dark);color:white;padding:48px 0 36px}footer a{color:white}footer p{margin:8px 0}.sticky{position:fixed;bottom:0;left:0;right:0;z-index:40;display:grid;grid-template-columns:98px 1fr;gap:9px;padding:10px 12px calc(10px + env(safe-area-inset-bottom));background:white;border-top:1px solid #B8C9BA}.sticky .btn{font-size:12px;padding:8px 5px}.sticky .outline{color:#1A3525}
@media(max-width:680px){.hero{padding:44px 0}.hero p{font-size:15px}.section{padding:51px 0}.prices{grid-template-columns:1fr}.buttons{display:grid}.buttons .btn{width:100%}}
`;
 // Two section arrangements for each template, based on content priority. Every article has
 // individually authored framing and four individually authored FAQ answers.
 const secs=[
 {h:town.h1,k:town.k1,p:[town.lead,facts.lawn],alt:false},
 {h:town.h2,k:town.k2,p:[facts.season,town.seasonNote],alt:true},
 {h:town.h3,k:town.k3,p:[town.siteNote,facts.access],alt:false}
 ];
 const order=town.order||[0,1,2];
 const articleSections=order.map((z,i)=>{const block=secs[z];return `<section class="section ${i%2===1?"alt":""}"><div class="wrap"><article><span class="eyebrow">${e(block.k)}</span><h2>${e(block.h)}</h2>${block.p.map(y=>`<p>${e(y)}</p>`).join("")}</article></div></section>`}).join("");
 const designClass=`edition-${idx%5}`;
 const page=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Lawn Care in ${e(name)}, ${e(st)} | ${e(site.BUSINESS_NAME)}</title>
<meta name="description" content="${e(desc)}"><meta name="robots" content="noindex,nofollow">
<link rel="canonical" href="${base}">
<meta property="og:title" content="Lawn Care in ${e(name)}, ${e(st)} | ${e(site.BUSINESS_NAME)}"><meta property="og:description" content="${e(desc)}"><meta property="og:image" content="${e(site.HERO_PHOTO)}">
<script type="application/ld+json">${JSON.stringify(localBusiness)}</script>
<script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
<style>${baseStyles}</style></head><body class="${designClass}">
<div class="demo-label">Demo site — sample business</div>
<header class="nav"><div class="wrap"><a href="./index.html">${e(site.BUSINESS_NAME)}</a><a href="./index.html">Home</a></div></header>
<main>
<section class="hero"><div class="wrap"><div class="hero__intro">${e(town.landmark)}</div><h1>Lawn Care in ${e(name)}, ${e(st)}</h1><p>${e(town.deck)}</p><div class="buttons"><a class="btn primary" href="#quote">Get My Free Instant Quote</a><a class="btn outline" href="tel:${site.PHONE_DIAL}">Call ${e(site.PHONE)}</a></div></div></section>
${articleSections}
<section class="section alt" id="pricing"><div class="wrap"><article><span class="eyebrow">${e(town.pk)}</span><h2>${e(town.priceTitle)}</h2><p>${e(town.priceIntro)}</p></article><div class="prices">${priceCards}</div><article><p>${e(town.priceNote)}</p></article></div></section>
<section class="section"><div class="wrap faq"><span class="eyebrow">${e(town.fk)}</span><h2>${e(town.faqTitle)}</h2>${qaHTML}</div></section>
<section class="section alt" id="quote"><div class="wrap"><article><span class="eyebrow">${e(town.ck)}</span><h2>${e(town.ctaTitle)}</h2><p>${e(town.ctaText)}</p><div class="buttons"><a class="btn primary" href="mailto:${site.EMAIL}?subject=${encodeURIComponent(name+" lawn care estimate")}">Get My Free Instant Quote</a><a class="btn outline" href="tel:${site.PHONE_DIAL}">Call ${e(site.PHONE)}</a></div></article></div></section>
<section class="section"><div class="wrap"><h2>${e(town.linksTitle)}</h2><nav class="neighbors" aria-label="Other local service areas"><a href="./index.html">All service areas</a>${nav}</nav></div></section>
</main><footer><div class="wrap"><strong>${e(site.BUSINESS_NAME)}</strong><p>${e(site.CITY)}, ${e(st)} · ${e(site.HOURS)}</p><a href="tel:${site.PHONE_DIAL}">${e(site.PHONE)}</a> · <a href="mailto:${site.EMAIL}">${e(site.EMAIL)}</a> · <a href="./index.html">Home</a></div></footer>
<div class="sticky"><a class="btn outline" href="tel:${site.PHONE_DIAL}">Call</a><a class="btn primary" href="#quote">Get My Free Instant Quote</a></div></body></html>`;
 if((page.match(/<h1\b/g)||[]).length!==1)throw Error("H1 error "+name);
 for(const b of ["${name}","a Arvada","a Apex","A Arvada"])if(page.includes(b))throw Error("bad literal "+b);
 const visible=strip(page.replace(/<style>[\s\S]*?<\/style>/g,"").replace(/<script[^>]*>[\s\S]*?<\/script>/g,""));
 if((visible.match(/Demo site — sample business/g)||[]).length!==1)throw Error("notice count incorrect "+name);
 return page;
}