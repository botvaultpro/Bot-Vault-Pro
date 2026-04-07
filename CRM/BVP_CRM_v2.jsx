import { useState, useEffect, useRef } from "react";

// ─────────────────────────────────────────────
// INDUSTRY CONFIGS
// ─────────────────────────────────────────────
const INDUSTRIES = {
  hvac: {
    label: "HVAC", icon: "❄️", color: "#00d4ff", colorDim: "rgba(0,212,255,0.12)",
    clientWord: "Customer", projectWord: "Job",
    jobTypes: ["AC Installation","Furnace Repair","Duct Cleaning","Tune-Up","Heat Pump Install","Emergency Service","Commercial HVAC","Indoor Air Quality"],
    stages: ["New Lead","Estimate Sent","Scheduled","In Progress","Completed","Invoice Sent","Paid","Follow-Up"],
    customFields: [{ key:"equipmentType", label:"Equipment Type" },{ key:"unitAge", label:"Unit Age (yrs)" },{ key:"serviceArea", label:"Service Area" },{ key:"lastService", label:"Last Service" }],
    aiContext: "HVAC contractor",
  },
  electrical: {
    label: "Electrical", icon: "⚡", color: "#ffc107", colorDim: "rgba(255,193,7,0.12)",
    clientWord: "Customer", projectWord: "Job",
    jobTypes: ["Panel Upgrade","EV Charger Install","Rewire","Outlet/Switch Repair","Generator Install","Lighting","Commercial Wiring","Code Inspection"],
    stages: ["New Lead","Estimate Sent","Permit Filed","Scheduled","In Progress","Inspection","Completed","Invoice Sent","Paid"],
    customFields: [{ key:"panelSize", label:"Panel Size (A)" },{ key:"permitRequired", label:"Permit Required?" },{ key:"propertyType", label:"Property Type" },{ key:"sqft", label:"Sq Footage" }],
    aiContext: "electrical contractor",
  },
  plumbing: {
    label: "Plumbing", icon: "🔧", color: "#00b4d8", colorDim: "rgba(0,180,216,0.12)",
    clientWord: "Customer", projectWord: "Job",
    jobTypes: ["Drain Cleaning","Water Heater Install","Pipe Repair","Fixture Install","Sewer Line","Leak Detection","Remodel Plumbing","Emergency"],
    stages: ["New Lead","Estimate Sent","Parts Ordered","Scheduled","In Progress","Completed","Invoice Sent","Paid"],
    customFields: [{ key:"homeAge", label:"Home Age (yrs)" },{ key:"waterSource", label:"Well or City?" },{ key:"lastSnaked", label:"Last Drain Service" },{ key:"accessNotes", label:"Access Notes" }],
    aiContext: "plumbing contractor",
  },
  roofing: {
    label: "Roofing", icon: "🏠", color: "#ff6b00", colorDim: "rgba(255,107,0,0.12)",
    clientWord: "Customer", projectWord: "Job",
    jobTypes: ["Full Replacement","Repair/Patch","Gutter Install","Inspection","Storm Damage","Flat Roof","Metal Roof","Insurance Claim"],
    stages: ["New Lead","Inspection Done","Estimate Sent","Insurance Filed","Signed","Scheduled","In Progress","Completed","Invoice Sent","Paid"],
    customFields: [{ key:"roofAge", label:"Roof Age (yrs)" },{ key:"roofMaterial", label:"Material" },{ key:"sqftRoof", label:"Sq Footage" },{ key:"insuranceClaim", label:"Insurance Claim?" }],
    aiContext: "roofing contractor",
  },
  realestate: {
    label: "Real Estate", icon: "🏡", color: "#a78bfa", colorDim: "rgba(167,139,250,0.12)",
    clientWord: "Client", projectWord: "Listing",
    jobTypes: ["Buyer Representation","Seller Listing","Investment Property","Commercial","Rental","Relocation","New Construction","Land Sale"],
    stages: ["New Lead","Consultation","Active","Under Contract","Due Diligence","Closing","Closed","Post-Close Follow-Up"],
    customFields: [{ key:"budget", label:"Budget / Price Range" },{ key:"preApproved", label:"Pre-Approved?" },{ key:"timeline", label:"Timeline" },{ key:"referralSource", label:"Referral Source" }],
    aiContext: "real estate agent",
  },
  barbersalon: {
    label: "Barber / Salon", icon: "✂️", color: "#f472b6", colorDim: "rgba(244,114,182,0.12)",
    clientWord: "Client", projectWord: "Appointment",
    jobTypes: ["Haircut","Color Treatment","Highlights","Keratin Treatment","Men's Cut","Kids Cut","Beard Trim","Blowout","Bridal"],
    stages: ["New Client","Booked","Confirmed","Completed","Rebooking","VIP","Lapsed"],
    customFields: [{ key:"hairType", label:"Hair Type" },{ key:"colorFormula", label:"Color Formula" },{ key:"frequency", label:"Visit Frequency" },{ key:"stylist", label:"Preferred Stylist" }],
    aiContext: "barber shop / hair salon",
  },
  photography: {
    label: "Photography", icon: "📷", color: "#34d399", colorDim: "rgba(52,211,153,0.12)",
    clientWord: "Client", projectWord: "Shoot",
    jobTypes: ["Wedding","Portrait","Newborn","Real Estate","Commercial","Event","Headshots","Family","Boudoir","Brand"],
    stages: ["Inquiry","Proposal Sent","Booked","Deposit Paid","Shoot Done","Editing","Gallery Delivered","Final Payment","Completed"],
    customFields: [{ key:"shootDate", label:"Shoot Date" },{ key:"location", label:"Location" },{ key:"packageType", label:"Package" },{ key:"deliverables", label:"Deliverables" }],
    aiContext: "professional photographer",
  },
  freelancer: {
    label: "Freelancer", icon: "💻", color: "#60a5fa", colorDim: "rgba(96,165,250,0.12)",
    clientWord: "Client", projectWord: "Project",
    jobTypes: ["Web Design","Copywriting","Graphic Design","Video Editing","Social Media","SEO","Consulting","Branding","App Development","Content Creation"],
    stages: ["Inquiry","Proposal Sent","Contract Signed","Deposit Paid","In Progress","Review/Revisions","Final Delivery","Invoice Sent","Paid","Ongoing Retainer"],
    customFields: [{ key:"platform", label:"Platform/Source" },{ key:"projectScope", label:"Project Scope" },{ key:"deadline", label:"Deadline" },{ key:"revisions", label:"Revisions Included" }],
    aiContext: "freelance creative professional",
  },
  restaurant: {
    label: "Restaurant", icon: "🍽️", color: "#fb923c", colorDim: "rgba(251,146,60,0.12)",
    clientWord: "Guest", projectWord: "Reservation",
    jobTypes: ["Dine-In Reservation","Private Event","Catering","Corporate Lunch","Wedding Reception","Birthday Party","Take-Out Order","Delivery"],
    stages: ["Inquiry","Quoted","Deposit Paid","Confirmed","Completed","Follow-Up","Repeat Guest"],
    customFields: [{ key:"partySize", label:"Party Size" },{ key:"eventDate", label:"Event Date" },{ key:"dietaryNeeds", label:"Dietary Needs" },{ key:"budget", label:"Budget" }],
    aiContext: "restaurant owner / event coordinator",
  },
  generalcontractor: {
    label: "General Contractor", icon: "🏗️", color: "#ff6b00", colorDim: "rgba(255,107,0,0.12)",
    clientWord: "Client", projectWord: "Project",
    jobTypes: ["Kitchen Remodel","Bath Remodel","Addition/ADU","Deck/Patio","Flooring","Drywall","Full Renovation","Basement Finish","New Build"],
    stages: ["New Lead","Consultation","Estimate Sent","Contract Signed","Permit Filed","In Progress","Punch List","Completed","Invoice Sent","Paid"],
    customFields: [{ key:"projectValue", label:"Project Value ($)" },{ key:"timelineWeeks", label:"Timeline (wks)" },{ key:"permitNeeded", label:"Permit Needed?" },{ key:"subcontractors", label:"Subs Involved" }],
    aiContext: "general contractor",
  },
  landscaping: {
    label: "Landscaping", icon: "🌿", color: "#4ade80", colorDim: "rgba(74,222,128,0.12)",
    clientWord: "Customer", projectWord: "Job",
    jobTypes: ["Lawn Maintenance","Landscape Design","Irrigation","Tree Service","Hardscape/Pavers","Sod Install","Seasonal Cleanup","Snow Removal"],
    stages: ["New Lead","Site Visit","Estimate Sent","Scheduled","In Progress","Completed","Invoice Sent","Paid","Recurring"],
    customFields: [{ key:"lotSize", label:"Lot Size (sqft)" },{ key:"irrigation", label:"Irrigation System?" },{ key:"contractType", label:"One-Time/Recurring" },{ key:"season", label:"Primary Season" }],
    aiContext: "landscaping company",
  },
  lawfirm: {
    label: "Law Firm", icon: "⚖️", color: "#c4b5fd", colorDim: "rgba(196,181,253,0.12)",
    clientWord: "Client", projectWord: "Case",
    jobTypes: ["Personal Injury","Business Law","Real Estate Law","Family Law","Estate Planning","Criminal Defense","Immigration","Contract Review","Consultation"],
    stages: ["Inquiry","Consultation","Retained","Discovery","Active","Negotiation","Settlement","Closed","Follow-Up"],
    customFields: [{ key:"caseType", label:"Case Type" },{ key:"retainerAmt", label:"Retainer ($)" },{ key:"opposingParty", label:"Opposing Party" },{ key:"courtDate", label:"Court Date" }],
    aiContext: "law firm / attorney",
  },
};

const STAGE_COLORS = {
  "New Lead":"#00d4ff","Inquiry":"#00d4ff","New Client":"#00d4ff",
  "Estimate Sent":"#ffc107","Proposal Sent":"#ffc107","Quoted":"#ffc107",
  "In Progress":"#ff6b00","Active":"#ff6b00","Editing":"#ff6b00",
  "Completed":"#4ade80","Paid":"#4ade80","Closed":"#4ade80","Delivered":"#4ade80","Final Payment":"#4ade80",
  "Invoice Sent":"#fbbf24","Follow-Up":"#94a3b8","Lapsed":"#ef4444",
  "Scheduled":"#a78bfa","Booked":"#a78bfa","Confirmed":"#a78bfa","Contract Signed":"#a78bfa",
  "Deposit Paid":"#34d399","Retained":"#34d399",
};

const getStageColor = (stage) => STAGE_COLORS[stage] || "#71717a";

// ─────────────────────────────────────────────
// PERSISTENT STORAGE
// ─────────────────────────────────────────────
const STORAGE_KEY = "bvp_crm_v2";
const loadData = () => {
  try {
    const raw = window.localStorage?.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};
const saveData = (data) => {
  try { window.localStorage?.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {}
};

// ─────────────────────────────────────────────
// SAMPLE DATA
// ─────────────────────────────────────────────
const makeSamples = (industryKey) => {
  const cfg = INDUSTRIES[industryKey];
  return [
    { id: 1, name: "Jordan Mitchell", phone: "555-201-4488", email: "jmitchell@gmail.com", address: "412 Crestview Ln", jobType: cfg.jobTypes[0], stage: cfg.stages[1], value: 3200, notes: `First contact via website. Interested in ${cfg.jobTypes[0]}. Prefers morning appointments.`, tags: ["new"], history: [], created: "2024-03-10", ...cfg.customFields.reduce((a,f)=>({...a,[f.key]:""}),{}) },
    { id: 2, name: "Rivera & Sons LLC", phone: "555-847-9920", email: "ops@riverasons.com", address: "Commercial District, Suite 4", jobType: cfg.jobTypes[2] || cfg.jobTypes[0], stage: cfg.stages[4] || cfg.stages[2], value: 8500, notes: `Repeat ${cfg.clientWord.toLowerCase()}. Always pays on time. Referred 2 others.`, tags: ["vip","repeat"], history: [{ date:"2023-11-05", desc:`Completed ${cfg.jobTypes[0]}`, amount:4200 }], created: "2023-10-01", ...cfg.customFields.reduce((a,f)=>({...a,[f.key]:""}),{}) },
    { id: 3, name: "Sarah Thornton", phone: "555-312-7741", email: "sarah.t@outlook.com", address: "88 Maple Grove Dr", jobType: cfg.jobTypes[1] || cfg.jobTypes[0], stage: cfg.stages[cfg.stages.length-2], value: 1100, notes: `${cfg.projectWord} completed. Waiting on final payment. Happy with work.`, tags: ["pending-payment"], history: [], created: "2024-02-20", ...cfg.customFields.reduce((a,f)=>({...a,[f.key]:""}),{}) },
  ];
};

// ─────────────────────────────────────────────
// AI GENERATION
// ─────────────────────────────────────────────
async function streamAI(systemPrompt, userPrompt, onChunk, onDone) {
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 800,
        stream: true,
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop();
      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        try {
          const d = JSON.parse(line.slice(6));
          if (d.type === "content_block_delta" && d.delta?.text) onChunk(d.delta.text);
        } catch {}
      }
    }
    onDone?.();
  } catch(e) {
    onChunk("\n[Generation failed — check your connection and try again]");
    onDone?.();
  }
}

// ─────────────────────────────────────────────
// SETUP SCREEN
// ─────────────────────────────────────────────
function SetupScreen({ onComplete }) {
  const [step, setStep] = useState(1);
  const [industry, setIndustry] = useState("");
  const [bizName, setBizName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [city, setCity] = useState("");

  const cfg = industry ? INDUSTRIES[industry] : null;
  const canNext1 = !!industry;
  const canFinish = bizName && ownerName && city;

  return (
    <div style={{ minHeight:"100vh", background:"#09090a", display:"flex", alignItems:"center", justifyContent:"center", padding:20, fontFamily:"'DM Sans', 'Helvetica Neue', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:#111; } ::-webkit-scrollbar-thumb { background:#333; border-radius:3px; }
        input, select, textarea { font-family: inherit; }
        .ind-card:hover { border-color: var(--c) !important; background: var(--cd) !important; transform: translateY(-1px); }
        .ind-card { transition: all 0.15s; }
        .setup-btn:hover { opacity: 0.9; transform: translateY(-1px); }
      `}</style>

      <div style={{ width:"100%", maxWidth:560 }}>
        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22, color:"#ff6b00", letterSpacing:"0.1em", marginBottom:8 }}>BOT VAULT PRO</div>
          <div style={{ width:40, height:2, background:"#ff6b00", margin:"0 auto 16px" }} />
          {step === 1 && <>
            <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:38, color:"#fff", margin:"0 0 8px", lineHeight:1.1 }}>CHOOSE YOUR<br/><span style={{ color:"#ff6b00" }}>INDUSTRY</span></h1>
            <p style={{ color:"#71717a", fontSize:14, margin:0 }}>The entire CRM configures itself to match your business.</p>
          </>}
          {step === 2 && <>
            <div style={{ fontSize:32, marginBottom:8 }}>{cfg.icon}</div>
            <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:36, color:"#fff", margin:"0 0 8px" }}>YOUR <span style={{ color:cfg.color }}>{cfg.label.toUpperCase()}</span> CRM</h1>
            <p style={{ color:"#71717a", fontSize:14, margin:0 }}>Almost there — tell us about your business.</p>
          </>}
        </div>

        {/* Step 1 — Industry Grid */}
        {step === 1 && (
          <div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:10, marginBottom:20 }}>
              {Object.entries(INDUSTRIES).map(([key, cfg]) => (
                <div key={key} className="ind-card"
                  onClick={() => setIndustry(key)}
                  style={{ "--c":cfg.color, "--cd":cfg.colorDim, background: industry===key ? cfg.colorDim : "#111113", border:`1.5px solid ${industry===key ? cfg.color : "#27272a"}`, borderRadius:10, padding:"16px 12px", cursor:"pointer", textAlign:"center" }}>
                  <div style={{ fontSize:26, marginBottom:6 }}>{cfg.icon}</div>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:13, color: industry===key ? cfg.color : "#a1a1aa", textTransform:"uppercase", letterSpacing:"0.05em" }}>{cfg.label}</div>
                </div>
              ))}
            </div>
            <button className="setup-btn" disabled={!canNext1} onClick={() => setStep(2)}
              style={{ width:"100%", background: canNext1 ? "#ff6b00" : "#27272a", color: canNext1 ? "#fff" : "#52525b", border:"none", borderRadius:10, padding:"14px", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:16, letterSpacing:"0.08em", cursor: canNext1 ? "pointer" : "not-allowed", transition:"all 0.15s" }}>
              CONTINUE →
            </button>
          </div>
        )}

        {/* Step 2 — Business Info */}
        {step === 2 && (
          <div style={{ background:"#111113", border:`1px solid #27272a`, borderRadius:12, padding:24 }}>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              <div>
                <label style={{ fontSize:11, fontWeight:600, color:"#71717a", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>Business Name *</label>
                <input value={bizName} onChange={e=>setBizName(e.target.value)} placeholder="e.g. Apex HVAC Services" style={{ width:"100%", background:"#18181b", border:"1px solid #27272a", borderRadius:8, padding:"11px 14px", color:"#fff", fontSize:14, outline:"none" }} />
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"#71717a", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>Your Name *</label>
                  <input value={ownerName} onChange={e=>setOwnerName(e.target.value)} placeholder="Owner / Manager" style={{ width:"100%", background:"#18181b", border:"1px solid #27272a", borderRadius:8, padding:"11px 14px", color:"#fff", fontSize:14, outline:"none" }} />
                </div>
                <div>
                  <label style={{ fontSize:11, fontWeight:600, color:"#71717a", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:6 }}>City / Market *</label>
                  <input value={city} onChange={e=>setCity(e.target.value)} placeholder="e.g. Phoenix, AZ" style={{ width:"100%", background:"#18181b", border:"1px solid #27272a", borderRadius:8, padding:"11px 14px", color:"#fff", fontSize:14, outline:"none" }} />
                </div>
              </div>
              <div style={{ display:"flex", gap:10, marginTop:4 }}>
                <button onClick={() => setStep(1)} style={{ flex:"0 0 auto", background:"transparent", border:"1px solid #27272a", borderRadius:8, padding:"11px 16px", color:"#71717a", fontSize:13, cursor:"pointer" }}>← Back</button>
                <button className="setup-btn" disabled={!canFinish} onClick={() => onComplete({ industry, bizName, ownerName, city })}
                  style={{ flex:1, background: canFinish ? cfg.color : "#27272a", color: canFinish ? "#fff" : "#52525b", border:"none", borderRadius:8, padding:"11px", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:16, letterSpacing:"0.08em", cursor: canFinish ? "pointer" : "not-allowed", transition:"all 0.15s" }}>
                  LAUNCH MY CRM →
                </button>
              </div>
            </div>
          </div>
        )}

        <p style={{ textAlign:"center", color:"#3f3f46", fontSize:11, marginTop:16 }}>Bot Vault Pro · botvaultpro.com · Your data stays on your device</p>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// AI PANEL
// ─────────────────────────────────────────────
function AIPanel({ client, cfg, biz, onClose }) {
  const [activeType, setActiveType] = useState("followup");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const outputRef = useRef(null);

  const types = [
    { key:"followup", label:"Follow-Up", icon:"✉️" },
    { key:"payment",  label:"Payment Reminder", icon:"💰" },
    { key:"estimate", label:"Estimate / Proposal", icon:"📋" },
    { key:"review",   label:"Review Request", icon:"⭐" },
  ];

  const buildPrompt = (type) => {
    const base = `Business: ${biz.bizName} (${cfg.aiContext}) in ${biz.city}. Owner: ${biz.ownerName}.
${cfg.clientWord}: ${client.name} | ${client.phone} | ${client.email}
${cfg.projectWord} Type: ${client.jobType} | Stage: ${client.stage} | Value: $${Number(client.value||0).toLocaleString()}
${client.address ? `Address: ${client.address}` : ""}
${cfg.customFields.map(f => client[f.key] ? `${f.label}: ${client[f.key]}` : "").filter(Boolean).join(" | ")}
Notes: ${client.notes || "None"}
${client.history?.length ? `Past work: ${client.history.map(h=>h.desc).join(", ")}` : ""}`;

    const prompts = {
      followup: `${base}\n\nWrite a short professional follow-up email (under 120 words). Include subject line. Warm but direct. Sign off as ${biz.ownerName}.`,
      payment: `${base}\n\nWrite a professional payment reminder email. Invoice amount: $${Number(client.value||0).toLocaleString()}. Include subject line. Firm but not aggressive. Tell them to reply or call directly to arrange payment. Sign off as ${biz.ownerName}.`,
      estimate: `${base}\n\nWrite a professional estimate/proposal email for the requested ${cfg.projectWord.toLowerCase()}. Include: scope summary, investment total ($${Number(client.value||0).toLocaleString()}), payment terms, validity (30 days), and clear call to action. Include subject line. Sign off as ${biz.ownerName}.`,
      review: `${base}\n\nWrite a short SMS review request (2-3 sentences max). Completed ${client.jobType}. Sound like a real person, not a robot. End with [Your Google Review Link]. Don't use the word "amazing" or "delighted".`,
    };
    return prompts[type];
  };

  const generate = async (type) => {
    setOutput(""); setLoading(true); setCopied(false);
    const system = `You are a professional business communication writer. Write concise, human-sounding content for a ${cfg.aiContext}. No corporate jargon. Sound like a real business owner who knows their trade. Be direct and professional.`;
    await streamAI(system, buildPrompt(type), (chunk) => {
      setOutput(p => p + chunk);
      if (outputRef.current) outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }, () => setLoading(false));
  };

  const switchType = (type) => { setActiveType(type); setOutput(""); setCopied(false); };

  const copy = () => {
    navigator.clipboard.writeText(output).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); });
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:200, display:"flex", alignItems:"flex-end", justifyContent:"flex-end", padding:16 }}>
      <div style={{ background:"#111113", border:`1px solid ${cfg.color}44`, borderRadius:14, width:"100%", maxWidth:500, maxHeight:"90vh", display:"flex", flexDirection:"column", overflow:"hidden" }}>
        {/* Header */}
        <div style={{ padding:"16px 20px", borderBottom:"1px solid #27272a", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
          <div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:18, color:"#fff" }}>AI Content Generator</div>
            <div style={{ fontSize:12, color:"#71717a", marginTop:2 }}>{client.name} · {client.jobType}</div>
          </div>
          <button onClick={onClose} style={{ background:"#18181b", border:"1px solid #27272a", borderRadius:6, width:32, height:32, cursor:"pointer", color:"#a1a1aa", fontSize:16, display:"flex", alignItems:"center", justifyContent:"center" }}>✕</button>
        </div>

        {/* Type Tabs */}
        <div style={{ display:"flex", borderBottom:"1px solid #27272a", flexShrink:0 }}>
          {types.map(t => (
            <button key={t.key} onClick={() => switchType(t.key)}
              style={{ flex:1, padding:"10px 4px", background:"transparent", border:"none", borderBottom: activeType===t.key ? `2px solid ${cfg.color}` : "2px solid transparent", color: activeType===t.key ? cfg.color : "#71717a", fontSize:11, fontWeight:600, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:3, transition:"all 0.15s" }}>
              <span style={{ fontSize:16 }}>{t.icon}</span>
              <span style={{ letterSpacing:"0.03em" }}>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Output */}
        <div ref={outputRef} style={{ flex:1, overflow:"auto", padding:16, background:"#0d0d0f", minHeight:200, fontFamily:"'DM Mono', monospace", fontSize:12.5, lineHeight:1.8, color:"#e4e4e7", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
          {!output && !loading && (
            <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", height:160, gap:12, color:"#3f3f46" }}>
              <span style={{ fontSize:32 }}>{types.find(t=>t.key===activeType)?.icon}</span>
              <span style={{ fontSize:13 }}>Click Generate to create content</span>
            </div>
          )}
          {!output && loading && (
            <div style={{ display:"flex", alignItems:"center", gap:10, color:"#71717a", padding:8 }}>
              <span style={{ display:"inline-block", width:8, height:8, background:cfg.color, borderRadius:"50%", animation:"blink 0.8s infinite" }} />
              Writing...
            </div>
          )}
          {output}
          {loading && output && <span style={{ color:cfg.color, animation:"blink 0.5s infinite" }}>▋</span>}
        </div>

        {/* Actions */}
        <div style={{ padding:14, borderTop:"1px solid #27272a", display:"flex", gap:8, flexShrink:0 }}>
          <button onClick={() => generate(activeType)} disabled={loading}
            style={{ flex:1, background: loading ? "#27272a" : cfg.color, color:"#fff", border:"none", borderRadius:8, padding:"11px", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:14, letterSpacing:"0.06em", cursor: loading ? "not-allowed" : "pointer", transition:"all 0.15s" }}>
            {loading ? "GENERATING..." : output ? "REGENERATE" : "GENERATE"}
          </button>
          {output && !loading && (
            <button onClick={copy}
              style={{ flex:1, background: copied ? "#064e3b" : "#18181b", color: copied ? "#4ade80" : "#fff", border:`1px solid ${copied ? "#4ade80" : "#27272a"}`, borderRadius:8, padding:"11px", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:14, letterSpacing:"0.06em", cursor:"pointer", transition:"all 0.2s" }}>
              {copied ? "✓ COPIED" : "COPY"}
            </button>
          )}
        </div>
        <div style={{ padding:"0 14px 12px", fontSize:11, color:"#3f3f46" }}>Review before sending. You send it — AI just drafted it.</div>
      </div>
      <style>{`@keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }`}</style>
    </div>
  );
}

// ─────────────────────────────────────────────
// CLIENT FORM MODAL
// ─────────────────────────────────────────────
function ClientForm({ client, cfg, onSave, onClose }) {
  const blank = { name:"", phone:"", email:"", address:"", jobType:cfg.jobTypes[0], stage:cfg.stages[0], value:"", notes:"", tags:[], history:[], created: new Date().toISOString().split("T")[0], ...cfg.customFields.reduce((a,f)=>({...a,[f.key]:""}),{}) };
  const [form, setForm] = useState(client ? { ...blank, ...client } : blank);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));

  const inputStyle = { width:"100%", background:"#18181b", border:"1px solid #27272a", borderRadius:8, padding:"10px 12px", color:"#fff", fontSize:13, outline:"none", fontFamily:"inherit" };
  const labelStyle = { fontSize:10, fontWeight:600, color:"#71717a", textTransform:"uppercase", letterSpacing:"0.08em", display:"block", marginBottom:5 };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.8)", zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:16 }}>
      <div style={{ background:"#111113", border:"1px solid #27272a", borderRadius:14, width:"100%", maxWidth:580, maxHeight:"92vh", overflow:"auto" }}>
        <div style={{ padding:"20px 24px", borderBottom:"1px solid #27272a", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"#111113", zIndex:1 }}>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:20, color:"#fff" }}>{client ? `Edit ${cfg.clientWord}` : `Add ${cfg.clientWord}`}</div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", color:"#71717a", fontSize:20, cursor:"pointer" }}>✕</button>
        </div>

        <div style={{ padding:24, display:"flex", flexDirection:"column", gap:16 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:14 }}>
            <div style={{ gridColumn:"span 2" }}>
              <label style={labelStyle}>Full Name *</label>
              <input style={inputStyle} value={form.name} onChange={e=>set("name",e.target.value)} placeholder={`${cfg.clientWord} name or company`} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={e=>set("phone",e.target.value)} placeholder="555-000-0000" />
            </div>
            <div>
              <label style={labelStyle}>Email</label>
              <input style={inputStyle} value={form.email} onChange={e=>set("email",e.target.value)} placeholder="email@example.com" />
            </div>
            <div style={{ gridColumn:"span 2" }}>
              <label style={labelStyle}>Address / Location</label>
              <input style={inputStyle} value={form.address} onChange={e=>set("address",e.target.value)} placeholder="Street address or area" />
            </div>
            <div>
              <label style={labelStyle}>{cfg.projectWord} Type</label>
              <select style={{ ...inputStyle, cursor:"pointer" }} value={form.jobType} onChange={e=>set("jobType",e.target.value)}>
                {cfg.jobTypes.map(j=><option key={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Stage</label>
              <select style={{ ...inputStyle, cursor:"pointer" }} value={form.stage} onChange={e=>set("stage",e.target.value)}>
                {cfg.stages.map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>{cfg.projectWord} Value ($)</label>
              <input style={inputStyle} type="number" value={form.value} onChange={e=>set("value",e.target.value)} placeholder="0" />
            </div>
            <div>
              <label style={labelStyle}>Date Added</label>
              <input style={inputStyle} type="date" value={form.created} onChange={e=>set("created",e.target.value)} />
            </div>
            {/* Industry custom fields */}
            {cfg.customFields.map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <input style={inputStyle} value={form[f.key]||""} onChange={e=>set(f.key,e.target.value)} />
              </div>
            ))}
            <div style={{ gridColumn:"span 2" }}>
              <label style={labelStyle}>Notes</label>
              <textarea style={{ ...inputStyle, height:80, resize:"vertical" }} value={form.notes} onChange={e=>set("notes",e.target.value)} placeholder={`Details about this ${cfg.clientWord.toLowerCase()}, preferences, or job specifics...`} />
            </div>
          </div>

          <div style={{ display:"flex", gap:10 }}>
            <button disabled={!form.name} onClick={() => onSave(form)}
              style={{ flex:1, background: form.name ? cfg.color : "#27272a", color: form.name ? "#fff":"#52525b", border:"none", borderRadius:8, padding:"12px", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, letterSpacing:"0.06em", cursor: form.name ? "pointer":"not-allowed" }}>
              {client ? `SAVE CHANGES` : `ADD ${cfg.clientWord.toUpperCase()}`}
            </button>
            <button onClick={onClose} style={{ background:"transparent", border:"1px solid #27272a", borderRadius:8, padding:"12px 20px", color:"#a1a1aa", fontSize:13, cursor:"pointer" }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// MAIN CRM
// ─────────────────────────────────────────────
function CRMApp({ biz }) {
  const cfg = INDUSTRIES[biz.industry];

  // Load or initialize data
  const [clients, setClients] = useState(() => {
    const saved = loadData();
    if (saved?.industry === biz.industry && saved?.clients) return saved.clients;
    return makeSamples(biz.industry);
  });
  const [view, setView] = useState("clients");
  const [selected, setSelected] = useState(null);
  const [aiOpen, setAiOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState("All");
  const [sortBy, setSortBy] = useState("created");

  // Persist on change
  useEffect(() => {
    saveData({ industry: biz.industry, clients, updated: Date.now() });
  }, [clients]);

  const saveClient = (form) => {
    if (form.id) {
      const updated = { ...form };
      setClients(cs => cs.map(c => c.id === form.id ? updated : c));
      setSelected(updated);
    } else {
      const newC = { ...form, id: Date.now(), history: [] };
      setClients(cs => [...cs, newC]);
    }
    setFormOpen(false); setEditTarget(null);
  };

  const deleteClient = (id) => {
    if (!confirm("Delete this record?")) return;
    setClients(cs => cs.filter(c => c.id !== id));
    setSelected(null);
  };

  const updateStage = (id, stage) => {
    setClients(cs => cs.map(c => c.id===id ? {...c, stage} : c));
    if (selected?.id === id) setSelected(s => ({...s, stage}));
  };

  const filtered = clients.filter(c => {
    const q = search.toLowerCase();
    const matchQ = !q || c.name.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.jobType?.toLowerCase().includes(q) || c.phone?.includes(q);
    const matchS = stageFilter==="All" || c.stage===stageFilter;
    return matchQ && matchS;
  }).sort((a,b) => {
    if (sortBy==="value") return Number(b.value||0)-Number(a.value||0);
    if (sortBy==="name") return a.name.localeCompare(b.name);
    return new Date(b.created||0) - new Date(a.created||0);
  });

  // Stats
  const totalPipeline = clients.reduce((s,c)=>s+Number(c.value||0),0);
  const activeCount = clients.filter(c=>["In Progress","Active","Scheduled","Booked","Confirmed"].includes(c.stage)).length;
  const paidCount = clients.filter(c=>["Paid","Closed","Completed","Final Payment"].includes(c.stage)).length;
  const pendingPayment = clients.filter(c=>["Invoice Sent","Completed","Gallery Delivered"].includes(c.stage));
  const needsFollowUp = clients.filter(c=>["Estimate Sent","Proposal Sent","Quoted","Follow-Up","New Lead","Inquiry"].includes(c.stage));

  const NAV = [
    { key:"dashboard", label:"Dashboard", icon:"◈" },
    { key:"clients", label:cfg.clientWord+"s", icon:"⊕" },
    { key:"pipeline", label:"Pipeline", icon:"▦" },
  ];

  const inputStyle = { background:"#111113", border:"1px solid #27272a", borderRadius:8, padding:"9px 12px", color:"#fff", fontSize:13, outline:"none", fontFamily:"inherit" };

  return (
    <div style={{ display:"flex", flexDirection:"column", height:"100vh", fontFamily:"'DM Sans','Helvetica Neue',sans-serif", background:"#09090a", color:"#fff", overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
        * { box-sizing:border-box; }
        ::-webkit-scrollbar{width:4px;height:4px} ::-webkit-scrollbar-track{background:#09090a} ::-webkit-scrollbar-thumb{background:#27272a;border-radius:4px}
        .row-hover:hover { background:#111113 !important; }
        .card-hover:hover { border-color:${cfg.color}66 !important; }
        .btn-hover:hover { opacity:0.85; }
        .nav-item:hover { color:#fff !important; }
        select option { background:#18181b; }
      `}</style>

      {/* ── Topbar ── */}
      <div style={{ height:52, background:"#0d0d0f", borderBottom:"1px solid #1f1f23", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"0 20px", flexShrink:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:17, color:"#ff6b00", letterSpacing:"0.08em" }}>BVP</span>
          <span style={{ width:1, height:18, background:"#27272a" }} />
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, color:cfg.color }}>{cfg.icon} {biz.bizName.toUpperCase()}</span>
        </div>
        <div style={{ display:"flex", gap:10, alignItems:"center" }}>
          <span style={{ background:cfg.colorDim, color:cfg.color, border:`1px solid ${cfg.color}44`, borderRadius:6, padding:"3px 10px", fontSize:11, fontWeight:700, letterSpacing:"0.06em" }}>{cfg.label.toUpperCase()}</span>
          <button onClick={() => { setEditTarget(null); setFormOpen(true); }} className="btn-hover"
            style={{ background:cfg.color, border:"none", borderRadius:8, padding:"7px 16px", color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:14, letterSpacing:"0.06em", cursor:"pointer" }}>
            + ADD {cfg.clientWord.toUpperCase()}
          </button>
        </div>
      </div>

      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        {/* ── Sidebar ── */}
        <div style={{ width:180, background:"#0d0d0f", borderRight:"1px solid #1f1f23", display:"flex", flexDirection:"column", flexShrink:0, padding:"12px 0" }}>
          {NAV.map(n => (
            <button key={n.key} className="nav-item" onClick={() => setView(n.key)}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 18px", background:view===n.key ? cfg.colorDim : "transparent", borderLeft:`2px solid ${view===n.key ? cfg.color : "transparent"}`, border:"none", color: view===n.key ? cfg.color : "#71717a", fontSize:13, fontWeight: view===n.key ? 600 : 400, cursor:"pointer", textAlign:"left", width:"100%", transition:"all 0.15s" }}>
              <span style={{ fontFamily:"monospace", fontSize:15 }}>{n.icon}</span>
              {n.label}
            </button>
          ))}

          <div style={{ margin:"12px 18px", height:1, background:"#1f1f23" }} />

          {/* Stats */}
          {[
            ["Total", clients.length, "#a1a1aa"],
            ["Active", activeCount, cfg.color],
            ["Pipeline", `$${totalPipeline >= 1000 ? (totalPipeline/1000).toFixed(1)+"k" : totalPipeline.toLocaleString()}`, "#4ade80"],
            ["Paid", paidCount, "#4ade80"],
          ].map(([l,v,c])=>(
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"4px 18px" }}>
              <span style={{ fontSize:11, color:"#52525b" }}>{l}</span>
              <span style={{ fontSize:11, fontWeight:700, color:c }}>{v}</span>
            </div>
          ))}

          <div style={{ flex:1 }} />

          <div style={{ padding:"12px 18px", borderTop:"1px solid #1f1f23" }}>
            <div style={{ fontSize:10, color:"#3f3f46", marginBottom:2 }}>Powered by</div>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:13, color:"#ff6b00" }}>BOT VAULT PRO</div>
            <div style={{ fontSize:10, color:"#3f3f46" }}>botvaultpro.com</div>
          </div>
        </div>

        {/* ── Main Content ── */}
        <div style={{ flex:1, overflow:"auto", padding:20, display:"flex", flexDirection:"column", gap:20 }}>

          {/* ═══ DASHBOARD ═══ */}
          {view==="dashboard" && (
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              <div>
                <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:26, margin:"0 0 2px", color:"#fff" }}>
                  Hey, {biz.ownerName} 👋
                </h2>
                <p style={{ color:"#71717a", margin:0, fontSize:13 }}>{biz.bizName} · {biz.city}</p>
              </div>

              {/* Stat cards */}
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:12 }}>
                {[
                  { label:`Total ${cfg.clientWord}s`, val:clients.length, color:cfg.color, sub:"in your CRM" },
                  { label:"Pipeline Value", val:`$${totalPipeline.toLocaleString()}`, color:"#4ade80", sub:"open + active" },
                  { label:"Active", val:activeCount, color:cfg.color, sub:`${cfg.projectWord}s in progress` },
                  { label:"Closed / Paid", val:paidCount, color:"#4ade80", sub:"completed" },
                ].map(({label,val,color,sub})=>(
                  <div key={label} className="card-hover" style={{ background:"#111113", border:"1px solid #1f1f23", borderRadius:10, padding:"16px 18px" }}>
                    <div style={{ fontSize:26, fontWeight:800, color, fontFamily:"'Barlow Condensed',sans-serif", marginBottom:2 }}>{val}</div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#e4e4e7" }}>{label}</div>
                    <div style={{ fontSize:11, color:"#52525b", marginTop:2 }}>{sub}</div>
                  </div>
                ))}
              </div>

              {/* Two-col */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:16 }}>
                <div style={{ background:"#111113", border:"1px solid #1f1f23", borderRadius:10, padding:18 }}>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, color:"#ffc107", marginBottom:14 }}>⚡ NEEDS FOLLOW-UP ({needsFollowUp.length})</div>
                  {needsFollowUp.length === 0 && <div style={{ color:"#52525b", fontSize:13 }}>All caught up 🎉</div>}
                  {needsFollowUp.slice(0,5).map(c => (
                    <div key={c.id} className="row-hover" onClick={() => { setSelected(c); setView("clients"); }} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 6px", borderBottom:"1px solid #1f1f23", cursor:"pointer" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
                        <div style={{ fontSize:11, color:"#71717a" }}>{c.jobType}</div>
                      </div>
                      <span style={{ background:`${getStageColor(c.stage)}18`, color:getStageColor(c.stage), border:`1px solid ${getStageColor(c.stage)}33`, borderRadius:5, padding:"2px 8px", fontSize:10, fontWeight:700 }}>{c.stage}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background:"#111113", border:"1px solid #1f1f23", borderRadius:10, padding:18 }}>
                  <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, color:"#f87171", marginBottom:14 }}>💰 AWAITING PAYMENT ({pendingPayment.length})</div>
                  {pendingPayment.length === 0 && <div style={{ color:"#52525b", fontSize:13 }}>No outstanding invoices</div>}
                  {pendingPayment.slice(0,5).map(c => (
                    <div key={c.id} className="row-hover" onClick={() => { setSelected(c); setView("clients"); }} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"8px 6px", borderBottom:"1px solid #1f1f23", cursor:"pointer" }}>
                      <div>
                        <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
                        <div style={{ fontSize:11, color:"#71717a" }}>{c.jobType}</div>
                      </div>
                      <span style={{ fontSize:13, fontWeight:700, color:"#4ade80" }}>${Number(c.value||0).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Stage breakdown */}
              <div style={{ background:"#111113", border:"1px solid #1f1f23", borderRadius:10, padding:18 }}>
                <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, color:"#a1a1aa", marginBottom:14 }}>PIPELINE BREAKDOWN</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                  {cfg.stages.map(stage => {
                    const count = clients.filter(c=>c.stage===stage).length;
                    const color = getStageColor(stage);
                    return (
                      <div key={stage} onClick={() => { setStageFilter(stage); setView("clients"); }} style={{ background:`${color}12`, border:`1px solid ${color}33`, borderRadius:8, padding:"8px 12px", cursor:"pointer", transition:"all 0.15s" }}>
                        <div style={{ fontSize:18, fontWeight:800, color, fontFamily:"'Barlow Condensed',sans-serif" }}>{count}</div>
                        <div style={{ fontSize:11, color:"#71717a" }}>{stage}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ═══ CLIENTS LIST ═══ */}
          {view==="clients" && (
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {/* Toolbar */}
              <div style={{ display:"flex", gap:10, flexWrap:"wrap", alignItems:"center" }}>
                <input value={search} onChange={e=>setSearch(e.target.value)} placeholder={`Search ${cfg.clientWord.toLowerCase()}s...`}
                  style={{ ...inputStyle, flex:"1 1 200px", minWidth:180 }} />
                <select value={stageFilter} onChange={e=>setStageFilter(e.target.value)} style={{ ...inputStyle, cursor:"pointer" }}>
                  <option value="All">All Stages</option>
                  {cfg.stages.map(s=><option key={s}>{s}</option>)}
                </select>
                <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ ...inputStyle, cursor:"pointer" }}>
                  <option value="created">Sort: Recent</option>
                  <option value="value">Sort: Value ↓</option>
                  <option value="name">Sort: Name A-Z</option>
                </select>
                <span style={{ fontSize:12, color:"#52525b", marginLeft:"auto" }}>{filtered.length} {cfg.clientWord.toLowerCase()}s</span>
              </div>

              {/* Table */}
              <div style={{ background:"#111113", border:"1px solid #1f1f23", borderRadius:10, overflow:"hidden" }}>
                {/* Header */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 120px 140px 90px 100px", padding:"10px 16px", borderBottom:"1px solid #1f1f23", background:"#0d0d0f" }}>
                  {[cfg.clientWord, cfg.projectWord+" Type", "Stage", "Value", "Actions"].map(h => (
                    <div key={h} style={{ fontSize:10, fontWeight:700, color:"#52525b", textTransform:"uppercase", letterSpacing:"0.08em" }}>{h}</div>
                  ))}
                </div>
                {filtered.length===0 && (
                  <div style={{ padding:"48px", textAlign:"center" }}>
                    <div style={{ fontSize:32, marginBottom:10 }}>{cfg.icon}</div>
                    <div style={{ fontWeight:600, marginBottom:6 }}>No {cfg.clientWord.toLowerCase()}s found</div>
                    <div style={{ color:"#71717a", fontSize:13, marginBottom:18 }}>{search ? "Try a different search" : `Add your first ${cfg.clientWord.toLowerCase()} to get started`}</div>
                    <button onClick={() => setFormOpen(true)} style={{ background:cfg.color, border:"none", borderRadius:8, padding:"10px 20px", color:"#fff", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:14, letterSpacing:"0.06em", cursor:"pointer" }}>+ ADD {cfg.clientWord.toUpperCase()}</button>
                  </div>
                )}
                {filtered.map((c,i) => {
                  const sc = getStageColor(c.stage);
                  return (
                    <div key={c.id} className="row-hover" style={{ display:"grid", gridTemplateColumns:"1fr 120px 140px 90px 100px", padding:"12px 16px", borderBottom: i<filtered.length-1 ? "1px solid #1a1a1e" : "none", alignItems:"center", cursor:"pointer", background: selected?.id===c.id ? "#141418" : "transparent", transition:"all 0.1s" }}
                      onClick={() => setSelected(selected?.id===c.id ? null : c)}>
                      <div>
                        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                          <div style={{ width:32, height:32, borderRadius:"50%", background:`${cfg.color}22`, display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:14, color:cfg.color, flexShrink:0 }}>
                            {c.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize:13, fontWeight:600 }}>{c.name}</div>
                            <div style={{ fontSize:11, color:"#71717a" }}>{c.phone || c.email || c.address}</div>
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize:12, color:"#a1a1aa" }}>{c.jobType}</div>
                      <div>
                        <span style={{ background:`${sc}18`, color:sc, border:`1px solid ${sc}33`, borderRadius:5, padding:"3px 8px", fontSize:10, fontWeight:700, letterSpacing:"0.04em" }}>{c.stage}</span>
                      </div>
                      <div style={{ fontSize:13, fontWeight:700, color:["Paid","Closed"].includes(c.stage) ? "#4ade80" : "#e4e4e7" }}>${Number(c.value||0).toLocaleString()}</div>
                      <div style={{ display:"flex", gap:6 }} onClick={e=>e.stopPropagation()}>
                        <button onClick={() => { setEditTarget(c); setFormOpen(true); }} title="Edit"
                          style={{ background:"#18181b", border:"1px solid #27272a", borderRadius:6, width:28, height:28, cursor:"pointer", color:"#a1a1aa", fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>✎</button>
                        <button onClick={() => { setSelected(c); setAiOpen(true); }} title="AI Actions"
                          style={{ background:cfg.colorDim, border:`1px solid ${cfg.color}44`, borderRadius:6, width:28, height:28, cursor:"pointer", color:cfg.color, fontSize:12, display:"flex", alignItems:"center", justifyContent:"center" }}>⚡</button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Expanded detail inline */}
              {selected && view==="clients" && (
                <div style={{ background:"#111113", border:`1px solid ${cfg.color}44`, borderRadius:12, padding:22 }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:18 }}>
                    <div>
                      <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:22, marginBottom:6 }}>{selected.name}</div>
                      <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                        <span style={{ background:`${getStageColor(selected.stage)}18`, color:getStageColor(selected.stage), border:`1px solid ${getStageColor(selected.stage)}33`, borderRadius:5, padding:"3px 9px", fontSize:11, fontWeight:700 }}>{selected.stage}</span>
                        <span style={{ background:cfg.colorDim, color:cfg.color, border:`1px solid ${cfg.color}33`, borderRadius:5, padding:"3px 9px", fontSize:11, fontWeight:700 }}>{selected.jobType}</span>
                        {selected.value > 0 && <span style={{ background:"rgba(74,222,128,0.1)", color:"#4ade80", border:"1px solid rgba(74,222,128,0.3)", borderRadius:5, padding:"3px 9px", fontSize:11, fontWeight:700 }}>${Number(selected.value).toLocaleString()}</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => { setEditTarget(selected); setFormOpen(true); }} style={{ background:"#18181b", border:"1px solid #27272a", borderRadius:7, padding:"7px 14px", color:"#a1a1aa", fontSize:12, cursor:"pointer" }}>Edit</button>
                      <button onClick={() => deleteClient(selected.id)} style={{ background:"rgba(255,68,68,0.1)", border:"1px solid rgba(255,68,68,0.3)", borderRadius:7, padding:"7px 14px", color:"#f87171", fontSize:12, cursor:"pointer" }}>Delete</button>
                      <button onClick={() => setSelected(null)} style={{ background:"transparent", border:"none", color:"#71717a", fontSize:18, cursor:"pointer", padding:"4px 8px" }}>✕</button>
                    </div>
                  </div>

                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:16, marginBottom:18 }}>
                    {/* Contact */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"#52525b", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Contact</div>
                      {[["📞",selected.phone],["✉️",selected.email],["📍",selected.address]].filter(([,v])=>v).map(([icon,val])=>(
                        <div key={val} style={{ display:"flex", gap:8, marginBottom:6 }}>
                          <span style={{ fontSize:12 }}>{icon}</span>
                          <span style={{ fontSize:12, color:"#a1a1aa" }}>{val}</span>
                        </div>
                      ))}
                    </div>
                    {/* Details */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"#52525b", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Details</div>
                      <div style={{ fontSize:12, color:"#a1a1aa", marginBottom:4 }}>Added: {selected.created}</div>
                      {cfg.customFields.filter(f=>selected[f.key]).map(f=>(
                        <div key={f.key} style={{ fontSize:12, color:"#a1a1aa", marginBottom:4 }}>{f.label}: <span style={{ color:"#e4e4e7" }}>{selected[f.key]}</span></div>
                      ))}
                    </div>
                    {/* Stage update */}
                    <div>
                      <div style={{ fontSize:10, fontWeight:700, color:"#52525b", textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:10 }}>Update Stage</div>
                      <select value={selected.stage} onChange={e=>updateStage(selected.id,e.target.value)}
                        style={{ width:"100%", background:"#18181b", border:"1px solid #27272a", borderRadius:7, padding:"9px 10px", color:"#fff", fontSize:13, outline:"none", cursor:"pointer", fontFamily:"inherit" }}>
                        {cfg.stages.map(s=><option key={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  {selected.notes && (
                    <div style={{ background:"#0d0d0f", borderRadius:8, padding:"12px 14px", fontSize:12, color:"#a1a1aa", lineHeight:1.7, marginBottom:18 }}>{selected.notes}</div>
                  )}

                  {/* AI Actions */}
                  <div style={{ background:cfg.colorDim, border:`1px solid ${cfg.color}33`, borderRadius:10, padding:16 }}>
                    <div style={{ fontSize:11, fontWeight:700, color:cfg.color, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:12 }}>⚡ AI Actions — Generate & Copy to Send</div>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:8 }}>
                      {[
                        { key:"followup", label:"Follow-Up Email", icon:"✉️" },
                        { key:"payment", label:"Payment Reminder", icon:"💰" },
                        { key:"estimate", label:"Estimate Email", icon:"📋" },
                        { key:"review", label:"Review Request", icon:"⭐" },
                      ].map(({key,label,icon}) => (
                        <button key={key} onClick={() => setAiOpen(true)}
                          style={{ background:"#111113", border:"1px solid #27272a", borderRadius:8, padding:"12px 8px", cursor:"pointer", color:"#fff", fontSize:11, fontWeight:600, display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"all 0.15s" }}>
                          <span style={{ fontSize:20 }}>{icon}</span>
                          <span style={{ color:"#a1a1aa", textAlign:"center", lineHeight:1.3 }}>{label}</span>
                        </button>
                      ))}
                    </div>
                    <p style={{ fontSize:11, color:"#52525b", margin:"10px 0 0" }}>AI writes it. You copy it. You send it. No automation stack required.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ PIPELINE ═══ */}
          {view==="pipeline" && (
            <div>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
                <div>
                  <h2 style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:24, margin:"0 0 2px" }}>Pipeline</h2>
                  <p style={{ color:"#71717a", margin:0, fontSize:13 }}>Total value: <span style={{ color:"#4ade80", fontWeight:700 }}>${totalPipeline.toLocaleString()}</span></p>
                </div>
              </div>
              <div style={{ display:"flex", gap:12, overflowX:"auto", paddingBottom:12 }}>
                {cfg.stages.map(stage => {
                  const col = clients.filter(c=>c.stage===stage);
                  const stageVal = col.reduce((s,c)=>s+Number(c.value||0),0);
                  const sc = getStageColor(stage);
                  return (
                    <div key={stage} style={{ minWidth:200, flexShrink:0 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:8 }}>
                        <div style={{ fontSize:11, fontWeight:700, color:sc, textTransform:"uppercase", letterSpacing:"0.06em" }}>{stage}</div>
                        <span style={{ background:`${sc}18`, color:sc, border:`1px solid ${sc}33`, borderRadius:4, padding:"1px 6px", fontSize:10, fontWeight:700 }}>{col.length}</span>
                      </div>
                      {stageVal > 0 && <div style={{ fontSize:11, color:"#52525b", marginBottom:8 }}>${stageVal.toLocaleString()}</div>}
                      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                        {col.map(c => (
                          <div key={c.id} onClick={() => { setSelected(c); setView("clients"); }} style={{ background:"#111113", border:`1px solid #1f1f23`, borderLeft:`3px solid ${sc}`, borderRadius:8, padding:"12px 14px", cursor:"pointer", transition:"border-color 0.15s" }}
                            onMouseEnter={e=>e.currentTarget.style.borderColor=sc} onMouseLeave={e=>e.currentTarget.style.borderColor="#1f1f23"}>
                            <div style={{ fontWeight:600, fontSize:13, marginBottom:3 }}>{c.name}</div>
                            <div style={{ fontSize:11, color:"#71717a", marginBottom: c.value ? 6 : 0 }}>{c.jobType}</div>
                            {c.value > 0 && <div style={{ fontSize:12, fontWeight:700, color:"#4ade80" }}>${Number(c.value).toLocaleString()}</div>}
                          </div>
                        ))}
                        {col.length===0 && <div style={{ color:"#3f3f46", fontSize:12, textAlign:"center", padding:"16px 0" }}>—</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Panel */}
      {aiOpen && selected && (
        <AIPanel client={selected} cfg={cfg} biz={biz} onClose={() => setAiOpen(false)} />
      )}

      {/* Form modal */}
      {formOpen && (
        <ClientForm client={editTarget} cfg={cfg} onSave={saveClient} onClose={() => { setFormOpen(false); setEditTarget(null); }} />
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
export default function App() {
  const [biz, setBiz] = useState(null);

  // Check if already configured
  useEffect(() => {
    const saved = loadData();
    // Don't auto-load — always let user configure for demo purposes
  }, []);

  if (!biz) return <SetupScreen onComplete={setBiz} />;
  return <CRMApp biz={biz} />;
}
