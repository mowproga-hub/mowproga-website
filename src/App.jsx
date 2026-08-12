import { useState, useEffect, useRef } from "react";
import { Star, CheckCircle2, Phone, MapPin, ArrowRight, Scissors, Sprout, Wind, Upload, X, Plus, Trash2, MessageCircle, Send } from "lucide-react";

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

const DEFAULT_CONTENT = {
  headline: "Your Yard, Handled — Without Lifting a Finger.",
  subheading: "Reliable mowing, edging, and cleanup from a local, family-run crew. Same-day quotes. Fast response. No contracts.",
  phone: "4046696945",
  serviceArea: "SERVING DOUGLASVILLE & SURROUNDING AREAS",
  price: "60",
  ratingLine: "11 five-star reviews on Google",
  reviews: [
    { name: "Lisa Banks", stars: 5, screenshot: "/images/lisa-banks.png" },
    { name: "Dolly Johnson (Marlene)", stars: 5, screenshot: "/images/dolly-johnson.png" },
    { name: "Ninti Chance", stars: 5, screenshot: "/images/ninti-chance.png" },
    { name: "Toni Vasser", stars: 5, screenshot: "/images/toni-vasser.png" },
    { name: "Jtillthebeast (Jimmy)", stars: 5, screenshot: "/images/jimmy-t.png" },
    { name: "Tamekia Davis", stars: 5, screenshot: "/images/tamekia-davis.png" },
  ],
  beforeAfterPairs: [
    { before: "/images/before-lawn.jpg", after: "/images/after-lawn.jpg" },
    { before: "/images/before-2.jpg", after: "/images/after-2.jpg" },
  ],
  introVideo: "",
  equipmentPhoto: "/images/equipment.png",
};

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
  { key: "small", label: "Small yard", sub: "Under 5,000 sq ft", addOn: -10 },
  { key: "medium", label: "Medium yard", sub: "5,000 – 10,000 sq ft", addOn: 0 },
  { key: "large", label: "Large yard", sub: "10,000 – 20,000 sq ft", addOn: 20 },
  { key: "xl", label: "Extra large / acreage", sub: "Over 20,000 sq ft", addOn: null },
];

// Leaf removal starting prices by the same size tiers, based on Atlanta-area
// market research (Angi/HomeGuide/LawnStarter). Shown as a "+" starting price
// since actual cost depends heavily on tree coverage and volume.
const LEAF_PRICES = { small: 75, medium: 125, large: 200, xl: null };
const HEAVY_TREE_FEE = 75;

function QuoteModal({ open, onClose, basePrice }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ address: "", size: "medium", name: "", phone: "", crackSpray: false, overgrownLevel: "none", edgeRestore: false, serviceType: "mowing", heavyTrees: false, bagHaul: false });
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  if (!open) return null;

  const CRACK_SPRAY_PRICE = 15;
  const EDGE_RESTORE_PRICE = 25;
  const isLeaf = form.serviceType === "leaf";
  const selectedOption = SIZE_OPTIONS.find((s) => s.key === form.size);
  const isCustomQuote = isLeaf ? LEAF_PRICES[form.size] === null : selectedOption?.addOn === null;
  const needsCustomQuote = isCustomQuote || (!isLeaf && form.overgrownLevel === "severe") || (isLeaf && form.heavyTrees);
  const normalCutPrice = parseInt(basePrice, 10) + (selectedOption?.addOn || 0);
  const price = needsCustomQuote
    ? null
    : isLeaf
    ? LEAF_PRICES[form.size]
    : (form.overgrownLevel === "mild" ? normalCutPrice * 2 : normalCutPrice) + (form.crackSpray ? CRACK_SPRAY_PRICE : 0) + (form.edgeRestore ? EDGE_RESTORE_PRICE : 0);

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
          size: selectedOption?.label || "",
          service: isLeaf ? "Leaf removal" : "Mowing",
          crackSpray: form.crackSpray,
          overgrown: form.overgrownLevel,
          edgeRestore: form.edgeRestore,
          heavyTrees: form.heavyTrees,
          bagHaul: form.bagHaul,
          price: needsCustomQuote ? "Custom quote needed" : `$${price}`,
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
    setTimeout(() => { setStep(1); setDone(false); setForm({ address: "", size: "medium", name: "", phone: "", crackSpray: false, overgrownLevel: "none", edgeRestore: false, serviceType: "mowing", heavyTrees: false, bagHaul: false }); }, 300);
  };

  return (
    <div onClick={close} style={{ position: "fixed", inset: 0, background: "rgba(6,10,7,0.75)", zIndex: 300, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, overflowY: "auto" }}>
      <div onClick={(e) => e.stopPropagation()} style={{ background: "#152016", border: "1px solid #24331F", borderRadius: 18, padding: 26, width: "100%", maxWidth: 420, color: "#F5F3EE", position: "relative", maxHeight: "calc(100vh - 32px)", overflowY: "auto", WebkitOverflowScrolling: "touch", margin: "auto" }}>
        <button onClick={close} style={{ position: "absolute", top: 14, right: 14, background: "none", border: "none", color: "#7C8A78", cursor: "pointer" }}><X size={20} /></button>

        {done ? (
          <div style={{ textAlign: "center", padding: "20px 0" }}>
            <CheckCircle2 size={40} color="#8FBC6A" style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 19, fontWeight: 800, marginBottom: 6 }}>Quote request sent!</div>
            <div style={{ fontSize: 14, color: "#B9C4B2" }}>
              Joseph will text or call you shortly
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
                <div style={{ fontSize: 13, color: "#B9C4B2", marginBottom: 14 }}>Enter your address and yard size for an estimated price.</div>

                <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                  {[{ key: "mowing", label: "Mowing" }, { key: "leaf", label: "Leaf Removal" }].map((s) => (
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
                <input style={miniInput} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street, City, GA" />
                <label style={{ ...miniLabel, marginTop: 12 }}>Yard size</label>
                {SIZE_OPTIONS.map((opt) => (
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

                {!isCustomQuote && !isLeaf && (
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

                {!isCustomQuote && !isLeaf && (
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

                {!isCustomQuote && !isLeaf && (
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
                          <div style={{ fontSize: 11.5, color: "#7C8A78" }}>Leaves bagged and removed from property (default is mulched into the lawn)</div>
                        </div>
                      </div>
                      <div style={{ fontWeight: 800, color: "#8FBC6A", fontSize: 13.5 }}>$5–8/bag</div>
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
                      <div style={{ fontSize: 11.5, color: "#7C8A78", textTransform: "uppercase" }}>Property size</div>
                      <div style={{ fontSize: 17, fontWeight: 800, color: "#8FBC6A", lineHeight: 1.4 }}>Custom Quote Needed</div>
                      <div style={{ fontSize: 12, color: "#B9C4B2", marginTop: 4 }}>Joseph will assess your property and follow up with pricing</div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 11.5, color: "#7C8A78", textTransform: "uppercase" }}>Estimated price</div>
                      <div style={{ fontSize: 30, fontWeight: 800, color: "#8FBC6A" }}>${price}{(isLeaf || form.overgrownLevel === "mild" || form.edgeRestore) && "+"}</div>
                      {(isLeaf || form.overgrownLevel === "mild" || form.edgeRestore) && (
                        <div style={{ fontSize: 11.5, color: "#B9C4B2", marginTop: 2 }}>Final price confirmed once Joseph sees the property</div>
                      )}
                    </>
                  )}
                </div>

                <div style={{ fontSize: 13, color: "#B9C4B2", margin: "18px 0 12px" }}>Where should Joseph send the confirmation?</div>
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

const BUSINESS_CONTEXT = `You are the friendly virtual assistant for Mow Pro Lawn Care LLC, a locally owned lawn care company in Douglasville, Georgia, run by Joseph. Answer visitor questions helpfully and naturally, then work toward collecting their name, phone number, address, and what service they need so Joseph can follow up with a real quote.

SERVICES & PRICING:
- Biweekly maintenance (mowing, edging, weed eating, debris blow-off): Small yard (under 5,000 sq ft) $50, Medium yard (5,000-10,000 sq ft) $60, Large yard (10,000-20,000 sq ft) $80, Extra large/acreage (over 20,000 sq ft): custom quote after Joseph assesses it in person
- First-cut/overgrown fee: if it's been a few weeks since it was last cut, the price doubles the normal cut price for that yard size (e.g. a Medium yard's normal $60 cut becomes $120 for the first overgrown cut). That covers the first 2 hours on-site; if the job runs longer than that, it's $45/hr for each additional hour. If the grass is over 12 inches tall, that needs a custom quote — Joseph has to see it in person before pricing it, don't guess a number for that case
- Edge restoration (grass grown fully over sidewalk/driveway edge): $25+
- Sidewalk & driveway crack weed spraying: $15
- Leaf removal (separate service from mowing): Small yard $75+, Medium yard $125+, Large yard $200+, Extra large: custom quote. Default is mulching leaves into the lawn at no extra charge; bagging and hauling them away instead is $5-8 per bag depending on actual volume, confirmed once Joseph sees the property. Heavy tree coverage needs a custom quote in person.
- No contracts, cancel anytime
- Service area: Douglasville and surrounding Douglas County, GA

GIVING QUOTE ESTIMATES: If someone gives you their address and wants a quote, you cannot look up the property automatically. Instead, ask them a quick question to estimate size — e.g. "Is your yard small (like a townhome-sized lot), medium (typical suburban yard), or large (over a quarter acre)?" or ask for an approximate square footage if they know it. Once you have a rough size, give them the matching price from the tiers above, and ask if the yard needs the first-cut fee, edge restoration, or crack spraying too, adding those if relevant. ALWAYS clearly state that this is only an ESTIMATE and that Joseph will confirm the final price once he actually sees the property in person — never present a number as final or guaranteed. Say something like: "Based on what you've described, that would run about $X — but that's just an estimate. Joseph will confirm the exact price once he sees the yard in person."

TONE: Warm, direct, no corporate jargon. Keep answers short (2-4 sentences). If asked something you don't know (e.g. availability for a specific date, whether Joseph does a service not listed above), say Joseph will confirm that personally, and ask for their contact info so he can follow up.

Once you have their name AND at least a phone number or address, use the submit_lead tool right away to actually send their information to Joseph — don't just say you will, actually call the tool. You can keep chatting naturally after that if they have more questions.`;

const CHAT_TOOLS = [
  {
    name: "submit_lead",
    description: "Send a visitor's contact info and quote details to Joseph so he can follow up. Call this as soon as you have a name plus a phone number or address — don't wait until the end of the conversation.",
    input_schema: {
      type: "object",
      properties: {
        name: { type: "string", description: "Visitor's name" },
        phone: { type: "string", description: "Phone number, if given" },
        address: { type: "string", description: "Property address, if given" },
        service: { type: "string", description: "What they're asking about, e.g. 'biweekly mowing, medium yard, overgrown'" },
        estimated_price: { type: "string", description: "The estimate you gave them, if any, e.g. '$80+' or 'custom quote needed'" },
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
            toolResults.push({ type: "tool_result", tool_use_id: tu.id, content: "Lead sent to Joseph." });
          }
          conversation = [...conversation, { role: "user", content: toolResults }];
        } else {
          keepGoing = false;
        }
      }
      trackEvent("chat_widget_message", {});
    } catch (err) {
      setMessages((prev) => [...prev, { role: "assistant", content: "Something went wrong — feel free to text or call Joseph directly at (404) 669-6945." }]);
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
            <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "#7C8A78", cursor: "pointer" }}><X size={18} /></button>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 18, background: "none", border: "none", color: "#F5F3EE", cursor: "pointer", padding: 0 }}>
          <img src="/images/logo.png" alt="Mow Pro GA logo" style={{ width: 40, height: 40, borderRadius: "50%", display: "block" }} />
          Mow Pro GA
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
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
        <button onClick={() => navigate("/")} style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "none", border: "none", color: "#8FBC6A", fontWeight: 700, fontSize: 13.5, cursor: "pointer", padding: 0 }}>
          ← Back to home
        </button>
      </div>

      {/* STORY */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "24px 24px 70px" }}>
        <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8FBC6A", marginBottom: 12 }}>Our Story</div>
        <h1 style={{ fontSize: "clamp(26px, 5vw, 38px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 24px" }}>
          Built one yard — and one door hanger — at a time.
        </h1>

        <div style={{ width: "100%", maxHeight: 420, overflow: "hidden", borderRadius: 16, marginBottom: 30, boxShadow: "0 16px 40px -18px rgba(0,0,0,0.5)" }}>
          <img src="/images/our-story.jpg" alt="Joseph on the Mow Pro GA mower" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
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
            When you book with us, that's what you're getting: someone who shows up, does the work himself, and has a very good reason to make sure it's done right every single time.
          </p>
        </div>

        <div style={{ marginTop: 44, textAlign: "center" }}>
          <button onClick={() => setShowQuote(true)} style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 10, padding: "16px 32px", fontSize: 16, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}>
            Get My Free Instant Quote <ArrowRight size={18} />
          </button>
        </div>
      </div>

      <QuoteModal open={showQuote} onClose={() => setShowQuote(false)} basePrice={content.price} />

      <div style={{ textAlign: "center", padding: 20, fontSize: 12.5, color: "#7C8A78" }}>
        Mow Pro GA · Mow Pro Lawn Care LLC · Douglasville, GA
      </div>
    </div>
  );
}

export default function MowProLanding() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const editing = false; // Public site — editing happens by updating the code directly, not in-browser.
  const [showQuote, setShowQuote] = useState(false);
  const [route, setRoute] = useState(() => (typeof window !== "undefined" && window.location.pathname === "/about" ? "about" : "home"));

  useEffect(() => {
    loadGoogleAnalytics();
  }, []);

  useEffect(() => {
    const onPop = () => setRoute(window.location.pathname === "/about" ? "about" : "home");
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, "", path);
    setRoute(path === "/about" ? "about" : "home");
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

  return (
    <div style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#0F1A10", color: "#F5F3EE" }}>
      {/* NAV */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontWeight: 800, fontSize: 18 }}>
          <img src="/images/logo.png" alt="Mow Pro GA logo" style={{ width: 40, height: 40, borderRadius: "50%", display: "block" }} />
          Mow Pro GA
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a href={`tel:${content.phone}`} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "#F5F3EE", textDecoration: "none" }}>
            <Phone size={14} color="#8FBC6A" />
            <EditableText editing={editing} value={content.phone} onChange={(v) => update("phone", v)} style={{ fontSize: 13, color: "#F5F3EE", maxWidth: 140 }} />
          </a>
          <button onClick={() => { trackEvent("quote_opened", { location: "nav" }); setShowQuote(true); }} style={{ background: "#8FBC6A", color: "#0F1A10", border: "none", borderRadius: 8, padding: "8px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}>
            Get Quote
          </button>
        </div>
      </div>

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
          <EditableText editing={editing} value={content.ratingLine} onChange={(v) => update("ratingLine", v)} style={{ marginLeft: 6, fontSize: 13.5, color: "#B9C4B2" }} />
        </div>

        {content.equipmentPhoto && (
          <div style={{ marginTop: 32, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
            <img src={content.equipmentPhoto} alt="Mow Pro Lawn Care equipment" loading="lazy" style={{ width: "100%", borderRadius: 14, border: "1px solid #24331F", display: "block" }} />
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {content.reviews.map((r, i) => (
              <div key={i} style={{ background: "#0F1A10", border: "1px solid #24331F", borderRadius: 14, overflow: "hidden", position: "relative" }}>
                {r.screenshot ? (
                  <img src={r.screenshot} alt={`Review from ${r.name}`} loading="lazy" style={{ width: "100%", display: "block" }} />
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
                  <button onClick={() => removeReview(i)} style={{ position: "absolute", top: 10, right: 10, background: "rgba(15,26,16,0.85)", border: "none", borderRadius: 6, color: "#B3441E", cursor: "pointer", padding: 5 }}>
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
          <EditableText editing={editing} value={content.price} onChange={(v) => update("price", v)} style={{ fontSize: 56, fontWeight: 800, color: "#8FBC6A", width: 90 }} />
        </div>
        <div style={{ color: "#B9C4B2", fontSize: 14, marginBottom: 30 }}>per visit</div>
        <div style={{ display: "inline-flex", flexDirection: "column", gap: 10, textAlign: "left", marginBottom: 34 }}>
          {["Mowing, edging & weed eating", "Debris blown off walkways & driveway", "No contracts — cancel anytime", "First-cut & edge-restoration fees apply if overgrown — see quote form for details"].map((f) => (
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
          <div style={{ fontSize: 12.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#8FBC6A", marginBottom: 10 }}>Who's Behind It</div>
          <p style={{ fontSize: 15, color: "#D8DED2", lineHeight: 1.7, margin: 0 }}>
            Mow Pro GA is run by Joseph — a Douglasville local who quotes the job, shows up, and does the work himself. No subcontractors, no rotating crews. This isn't a side project — his son helps hand out door hangers around the neighborhood, and gets to watch the results land in real time. One afternoon, right after hanger number 97, a client called. When you book with Mow Pro, you're not booking a call center; you're booking a family that's building something real, one yard at a time.
          </p>
          <button onClick={() => navigate("/about")} style={{ background: "none", border: "none", color: "#8FBC6A", fontWeight: 700, fontSize: 14, marginTop: 14, cursor: "pointer", padding: 0, display: "inline-flex", alignItems: "center", gap: 5 }}>
            Read our full story <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* FAQ */}
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "10px 24px 60px" }}>
        <h2 style={{ fontSize: 26, fontWeight: 800, textAlign: "center", margin: "0 0 30px" }}>Before You Reach Out</h2>
        {[
          { q: "Do I need to be home for service?", a: "No — as long as the yard is accessible, you don't need to be there. We'll take care of it and you'll see the difference when you're back." },
          { q: "What if it rains on my scheduled day?", a: "We'll reach out to reschedule for the next dry day — no need to call and check, we'll handle it." },
          { q: "Is there a contract?", a: "No. Biweekly service, cancel anytime — no long-term commitment required." },
          { q: "How accurate is the instant quote?", a: "It's a real starting estimate based on your yard size and what you tell us — Joseph confirms the final price once he sees the property in person, so there are no surprises." },
        ].map((item, i) => (
          <div key={i} style={{ borderBottom: "1px solid #24331F", padding: "18px 0" }}>
            <div style={{ fontWeight: 700, fontSize: 15.5, color: "#F5F3EE", marginBottom: 6 }}>{item.q}</div>
            <div style={{ fontSize: 14, color: "#B9C4B2", lineHeight: 1.6 }}>{item.a}</div>
          </div>
        ))}
      </div>

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
