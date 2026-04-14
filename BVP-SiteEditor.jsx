import { useState, useCallback, useRef, useEffect } from "react";

// ─── THEME ────────────────────────────────────────────────────────────────────
const T = {
  bg:"#0a0a0a", surface:"#111", surfaceAlt:"#181818", surfaceHover:"#1e1e1e",
  border:"#252525", borderHover:"#3a3a3a",
  accent:"#c8f135", accentDim:"#8fad1f", accentGlow:"rgba(200,241,53,0.10)",
  text:"#f0f0f0", muted:"#888", dim:"#444",
  success:"#22c55e", danger:"#ff4444", warn:"#f59e0b",
  copper:"#c87941",
};

// ─── PRESET THEMES ────────────────────────────────────────────────────────────
const THEMES = {
  "Acid Green (Current)": { accentColor:"#c8f135", bgColor:"#0a0a0a", textColor:"#f0f0f0", cardBg:"#181818" },
  "Burnt Copper":         { accentColor:"#c87941", bgColor:"#0a0808", textColor:"#f0ece8", cardBg:"#1a1410" },
  "Neon Amber":           { accentColor:"#ffb300", bgColor:"#0a0900", textColor:"#f5f0e0", cardBg:"#181600" },
  "Electric Cyan":        { accentColor:"#00e5ff", bgColor:"#010a0d", textColor:"#e0f8ff", cardBg:"#041015" },
  "Hot Magenta":          { accentColor:"#ff2d78", bgColor:"#0d0008", textColor:"#f5e8ee", cardBg:"#180010" },
  "Pure White (Light)":   { accentColor:"#111111", bgColor:"#f8f8f8", textColor:"#111111", cardBg:"#ffffff" },
};

// ─── SITE DATA ────────────────────────────────────────────────────────────────
const INITIAL_DATA = {
  navbar:{label:"Navigation Bar",fields:{logo:"BotVaultPro",nav1:"Products",nav2:"Pipeline",nav3:"Wishlist",cta:"Join Waitlist",banner:"Now accepting founding member applications"},style:{bgColor:"#0a0a0a",textColor:"#f0f0f0",accentColor:"#c8f135"}},
  hero:{label:"Hero Section",fields:{headline:"Unlock the Power of Intelligent Automation for Your Business",subheadline:"Bot Vault Pro engineers custom automation bots that eliminate repetitive work, supercharge revenue, and scale operations across any industry — so your team can focus on what matters most.",cta1:"Join the Waitlist",cta2:"See Our Products",stat1Value:"10+",stat1Label:"Bot Categories",stat2Value:"15+",stat2Label:"Industries Served",stat3Value:"∞",stat3Label:"Hours Saved"},style:{bgColor:"#0a0a0a",textColor:"#f0f0f0",accentColor:"#c8f135"}},
  howItWorks:{label:"How It Works",fields:{sectionLabel:"How It Works",headline:"Automation made simple",subheadline:"From consultation to deployment, we handle everything.",step1Title:"Discover",step1Body:"We audit your workflows to identify the highest-impact automation opportunities.",step2Title:"Build",step2Body:"Our engineers craft precision bots tailored to your exact business needs.",step3Title:"Deploy",step3Body:"Your bots go live and start saving time and money from day one.",step4Title:"Scale",step4Body:"We monitor, optimize, and expand your automation suite as you grow."},style:{bgColor:"#0f0f0f",textColor:"#f0f0f0",accentColor:"#c8f135"}},
  vault:{label:"The Vault (Products)",fields:{sectionLabel:"The Vault",headline:"THE VAULT",subheadline:"Tools built to recover money you're already losing — and save hours you can't get back. Every product ships instantly. Start using it today.",gumroadUrl:"https://botvaultpro.gumroad.com",p1Badge:"Assessment Tool",p1Name:"BVP AI Readiness Assessment",p1Desc:"Find out exactly where your business stands with AI — and what to implement first.",p1Price:"Starting at $27",p2Badge:"Profit Tool",p2Name:"BVP Profit Leak Audit",p2Desc:"The average trades business loses $40K–$120K per year to invisible profit leaks.",p2Price:"Starting at $27",p3Badge:"Sales Tool",p3Name:"BVP Estimating & Sales Audit",p3Desc:"Stop leaving money on the table. Audit your estimating process and close rate.",p3Price:"Starting at $27",p4Badge:"Business Tool",p4Name:"BVP Business Health Scorecard",p4Desc:"A comprehensive scorecard that grades your business across operations and cash flow.",p4Price:"Starting at $27",p5Badge:"Setup Guide",p5Name:"BVP AI Setup Guide",p5Desc:"Step-by-step guide to setting up your first AI agent for your trades business.",p5Price:"Starting at $47",p6Badge:"Advanced Guide",p6Name:"BVP AI Agent Factory",p6Desc:"Build a fleet of AI agents that run your back office.",p6Price:"Starting at $97",viewAllLabel:"View All Products on Gumroad →"},style:{bgColor:"#111111",textColor:"#f0f0f0",accentColor:"#c8f135",cardBg:"#181818"}},
  industries:{label:"Industries Section",fields:{headline:"Built for every industry",subheadline:"No matter your sector, Bot Vault Pro has automation solutions ready to deploy.",i1:"Retail",i2:"Healthcare",i3:"Finance & Banking",i4:"Real Estate",i5:"Education",i6:"Manufacturing",i7:"Restaurants & Food",i8:"Logistics & Supply Chain",i9:"Legal",i10:"Construction",i11:"SaaS & Tech",i12:"Marketing Agencies",i13:"Hospitality",i14:"Professional Services",i15:"Insurance",i16:"+ Many More"},style:{bgColor:"#0a0a0a",textColor:"#f0f0f0",accentColor:"#c8f135"}},
  whyBVP:{label:"Why Bot Vault Pro",fields:{headline:"Your unfair competitive advantage",subheadline:"While your competitors are stuck in repetitive manual processes, your business runs 24/7 on intelligent automation.",ctaLabel:"Get Early Access",f1Title:"Lightning Fast Deployment",f1Body:"Most bots are live within days, not months. No lengthy enterprise sales cycles.",f2Title:"Custom-Built, Not Cookie-Cutter",f2Body:"Every bot is engineered for your specific workflows, tools, and business rules.",f3Title:"Enterprise-Grade Security",f3Body:"Your data stays yours. SOC 2 compliant infrastructure with end-to-end encryption.",f4Title:"Measurable ROI",f4Body:"Real-time dashboards show exactly how much time and money your bots are saving.",f5Title:"Continuous Optimization",f5Body:"We proactively monitor and improve your bots as your business evolves."},style:{bgColor:"#111111",textColor:"#f0f0f0",accentColor:"#c8f135",cardBg:"#181818"}},
  wishlist:{label:"Bot Wishlist",fields:{sectionLabel:"Bot Wishlist",headline:"Tell us what to build next",subheadline:"Got a business process that's eating your time? Submit it here. The most-requested ideas get built first.",formHeadline:"Submit Your Bot Idea",submitLabel:"Submit My Bot Idea",topRequestsHeadline:"Top Requested Bots",vote1:"Auto-Payroll Processing Bot",vote1Category:"Finance",vote1Count:"47",vote2:"Social Media Reply Bot",vote2Category:"Marketing",vote2Count:"39",vote3:"Restaurant Reservation Manager Bot",vote3Category:"Hospitality",vote3Count:"31",vote4:"Legal Document Review Bot",vote4Category:"Legal",vote4Count:"28",vote5:"Construction Job Scheduling Bot",vote5Category:"Construction",vote5Count:"22",perksHeadline:"Founding Member Perks",perk1:"Priority access to new bots",perk2:"Discounted launch pricing",perk3:"Vote on bot roadmap",perk4:"Direct line to our engineering team",perksCtaLabel:"Secure Your Spot →"},style:{bgColor:"#0a0a0a",textColor:"#f0f0f0",accentColor:"#c8f135"}},
  pipeline:{label:"Production Line",fields:{sectionLabel:"Production Line",headline:"BVP PRODUCTION LINE",subheadline:"We build in public. Every product we're working on — from idea to live.",viewAllUrl:"https://www.botvaultpro.com/bvp-production-line.html",pl1Name:"Real Estate Prompt Pack",pl1Badge:"Prompt Pack",pl1Price:"$49",pl1Status:"Planned",pl1Desc:"Close faster and communicate better. AI prompts for listings, client comms, and deal management.",pl2Name:"Law Firm Prompt Pack",pl2Badge:"Prompt Pack",pl2Price:"$69",pl2Status:"Planned",pl2Desc:"AI prompts for small law firms. Client intake, case summaries, billing, and professional comms.",pl3Name:"Business Operations AI",pl3Badge:"AI Tool",pl3Price:"$49/mo",pl3Status:"Planned",pl3Desc:"Industry-agnostic AI tool for operations, scheduling, and customer management.",d1Name:"Trades AI Tool — Pro",d1Badge:"AI Tool",d1Price:"$99/mo",d1Status:"In Development",d1Desc:"Full automation suite. Estimates, follow-ups, collections, scheduling — all running on autopilot.",d2Name:"Restaurant Prompt Pack",d2Badge:"Prompt Pack",d2Price:"$49",d2Status:"In Development",d2Desc:"AI prompts for restaurant owners. Menu copy, review responses, staff comms.",d3Name:"Trades Bot",d3Badge:"Bot",d3Price:"$149/mo",d3Status:"In Development",d3Desc:"The flagship. Fully autonomous AI that estimates, invoices, follows up, and collects.",t1Name:"Trades AI Tool — Starter",t1Badge:"AI Tool",t1Price:"$49/mo",t1Status:"Testing",t1Desc:"AI-powered assistant for job estimates, invoices, and customer messaging.",t2Name:"ChatGPT & Claude Setup Guide",t2Badge:"Playbook",t2Price:"$49",t2Status:"Testing",t2Desc:"Step-by-step guide to setting up AI tools for your trades business.",cs1Name:"Trades Pro Prompt Pack",cs1Badge:"Prompt Pack",cs1Price:"$49",cs1Status:"Coming Soon",cs1Desc:"150+ AI prompts for contractors. Estimates, proposals, invoices, collections.",cs2Name:"Trades Starter Kit Bundle",cs2Badge:"Bundle",cs2Price:"$129",cs2Status:"Coming Soon",cs2Desc:"Prompt Pack + Profit Playbook + bonus templates.",lv1Name:"Trades Profit Playbook",lv1Badge:"Playbook",lv1Price:"$99",lv1Status:"Live",lv1Desc:"11-chapter guide to recovering lost revenue.",lv2Name:"Operations Toolkit",lv2Badge:"Toolkit",lv2Price:"$49",lv2Status:"Live",lv2Desc:"Complete spreadsheet system: job tracker, estimating calculator, invoice log."},style:{bgColor:"#111111",textColor:"#f0f0f0",accentColor:"#c8f135",cardBg:"#181818"}},
  waitlist:{label:"Waitlist Section",fields:{headline:"Be First. Get More.",subheadline:"Join the BVP waitlist to get early access to new products, launch pricing, and first-look previews.",perk1:"Founding Member Badge",perk2:"Up to 40% launch discount",perk3:"Priority bot deployment",perk4:"Shape our product roadmap",perk5:"Free automation strategy call",socialProof:"1,247",socialProofLabel:"businesses already on the waitlist",formHeadline:"Reserve Your Spot",ctaLabel:"Join the Waitlist — It's Free",disclaimer:"No spam. Unsubscribe anytime. Early access pricing is locked for waitlist members."},style:{bgColor:"#0a0a0a",textColor:"#f0f0f0",accentColor:"#c8f135"}},
  faq:{label:"FAQ Section",fields:{headline:"Common questions",q1:"Do I need technical knowledge to use Bot Vault Pro bots?",a1:"Not at all. Our bots are fully managed — we handle all the setup, configuration, and maintenance.",q2:"How long does it take to deploy a bot?",a2:"Most standard bots are deployed within 3–7 business days. Complex custom bots may take 2–4 weeks.",q3:"What systems and tools do your bots integrate with?",a3:"Our bots integrate with 200+ business tools including Salesforce, HubSpot, Shopify, QuickBooks, Slack, Gmail, and many more.",q4:"How is Bot Vault Pro priced?",a4:"Pricing is based on the bots you deploy and usage volume. Founding members receive special discounted pricing.",q5:"Is my business data safe?",a5:"Absolutely. All data is encrypted in transit and at rest. We operate on SOC 2 compliant infrastructure.",q6:"What if I want a bot that's not in your current catalog?",a6:"Submit it to our Wishlist! Highly-requested ideas get prioritized on our roadmap."},style:{bgColor:"#0f0f0f",textColor:"#f0f0f0",accentColor:"#c8f135"}},
  seo:{label:"SEO & Meta Tags",fields:{pageTitle:"Bot Vault Pro — AI Business Automation",metaDescription:"Bot Vault Pro engineers custom AI automation bots that eliminate repetitive work, supercharge revenue, and scale operations across any industry.",ogTitle:"Bot Vault Pro — AI Business Automation",ogDescription:"Custom AI automation bots for every industry. Deploy in days, not months.",ogImageUrl:"https://www.botvaultpro.com/og-image.png",canonicalUrl:"https://www.botvaultpro.com",twitterCard:"summary_large_image",twitterSite:"@botvaultpro",robots:"index, follow",keywords:"AI automation, business bots, AI bots, workflow automation, Bot Vault Pro"},style:null},
  footer:{label:"Footer",fields:{logo:"BotVaultPro",tagline:"Automating the work that slows businesses down — so you can focus on the work that moves them forward.",copyright:"© 2026 Bot Vault Pro. All rights reserved.",email:"botvaultpro@outlook.com",socialX:"#",socialLinkedIn:"#",socialIG:"#",col2Headline:"Products",col2l1:"BVP AI Readiness Assessment",col2l2:"BVP Profit Leak Audit",col2l3:"BVP Estimating & Sales Audit",col2l4:"BVP Business Health Scorecard",col2l5:"BVP AI Setup Guide",col2l6:"BVP AI Agent Factory",col3Headline:"Coming Soon",col3l1:"BVP Trades Bot",col3l2:"BVP Operations Toolkit",col3l3:"BVP Automation Playbook",col3l4:"BVP Restaurant Bot",col3l5:"BVP AI Marketplace",col4Headline:"Get Started",col4l1:"Join Waitlist",col4l2:"Bot Wishlist",col4l3:"View Pipeline",col4l4:"Contact Us",privacyUrl:"https://www.botvaultpro.com/privacy",termsUrl:"https://www.botvaultpro.com/terms"},style:{bgColor:"#080808",textColor:"#888888",accentColor:"#c8f135"}},
};

const SNAPSHOTS_KEY = "bvp_editor_snapshots";
const TEXTAREA_KEYS = new Set(["subheadline","tagline","disclaimer","a1","a2","a3","a4","a5","a6","p1Desc","p2Desc","p3Desc","p4Desc","p5Desc","p6Desc","step1Body","step2Body","step3Body","step4Body","f1Body","f2Body","f3Body","f4Body","f5Body","pl1Desc","pl2Desc","pl3Desc","d1Desc","d2Desc","d3Desc","t1Desc","t2Desc","cs1Desc","cs2Desc","lv1Desc","lv2Desc","metaDescription","ogDescription"]);
const COLOR_KEYS = new Set(["bgColor","textColor","accentColor","cardBg"]);

function fieldLabel(k){const m={logo:"Logo",nav1:"Nav 1",nav2:"Nav 2",nav3:"Nav 3",cta:"CTA Btn",banner:"Top Banner",headline:"Headline",subheadline:"Subheadline",cta1:"Primary CTA",cta2:"Secondary CTA",stat1Value:"Stat 1 #",stat1Label:"Stat 1 Label",stat2Value:"Stat 2 #",stat2Label:"Stat 2 Label",stat3Value:"Stat 3 #",stat3Label:"Stat 3 Label",sectionLabel:"Section Label",gumroadUrl:"Gumroad URL",viewAllLabel:"View All Label",viewAllUrl:"View All URL",ctaLabel:"CTA Label",formHeadline:"Form Headline",submitLabel:"Submit Btn",topRequestsHeadline:"Top Requests Title",perksHeadline:"Perks Title",perksCtaLabel:"Perks CTA",socialProof:"Social # ",socialProofLabel:"Social Label",disclaimer:"Disclaimer",tagline:"Tagline",copyright:"Copyright",email:"Email",socialX:"X URL",socialLinkedIn:"LinkedIn",socialIG:"Instagram",privacyUrl:"Privacy URL",termsUrl:"Terms URL",col2Headline:"Col 2 Title",col3Headline:"Col 3 Title",col4Headline:"Col 4 Title",pageTitle:"Page Title",metaDescription:"Meta Description",ogTitle:"OG Title",ogDescription:"OG Description",ogImageUrl:"OG Image URL",canonicalUrl:"Canonical URL",twitterCard:"Twitter Card",twitterSite:"Twitter Handle",robots:"Robots",keywords:"Keywords",bgColor:"Background",textColor:"Text",accentColor:"Accent",cardBg:"Card BG"};if(m[k])return m[k];const r=k.match(/^([a-z]+)(\d+)([A-Za-z]*)$/);if(r){const p={p:"Product",i:"Industry",f:"Feature",vote:"Vote",perk:"Perk",step:"Step",pl:"Planned",d:"In Dev",t:"Testing",cs:"Soon",lv:"Live",col2:"Col2",col3:"Col3",col4:"Col4",q:"Q",a:"A"};return`${p[r[1]]||r[1]} ${r[2]} ${r[3]}`.trim();}return k.replace(/([A-Z])/g," $1").replace(/^./,s=>s.toUpperCase());}

function generateCode(data){return`// botvaultpro.com — Site Config\n// Generated: ${new Date().toLocaleDateString("en-US",{year:"numeric",month:"long",day:"numeric"})}\n// Paste into Claude Code: "Update my site using this config"\n\nexport const siteConfig = ${JSON.stringify(data,null,2)};\n`;}

// ─── AI REWRITE ───────────────────────────────────────────────────────────────
async function aiRewrite(fieldLabel, currentValue, instruction){
  const res = await fetch("https://api.anthropic.com/v1/messages",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify({
      model:"claude-sonnet-4-20250514",
      max_tokens:1000,
      system:`You are a world-class copywriter for Bot Vault Pro — a premium AI automation SaaS that sells custom AI bots to businesses. Brand voice: bold, direct, results-obsessed, zero fluff. Never use generic AI marketing language. Always be specific and benefit-driven. Respond with ONLY the rewritten text — no explanation, no quotes, no preamble.`,
      messages:[{role:"user",content:`Rewrite this "${fieldLabel}" field for the Bot Vault Pro website.\n\nCurrent text: "${currentValue}"\n\nInstruction: ${instruction}\n\nReturn only the rewritten text.`}]
    })
  });
  const d = await res.json();
  return d.content?.[0]?.text?.trim() || currentValue;
}

// ─── VERCEL DEPLOY ────────────────────────────────────────────────────────────
async function triggerVercelDeploy(token, projectId){
  const res = await fetch(`https://api.vercel.com/v13/deployments`,{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":`Bearer ${token}`},
    body:JSON.stringify({name:projectId||"bot-vault-pro",target:"production",source:"api"})
  });
  return res.json();
}

// ─── PREVIEWS ─────────────────────────────────────────────────────────────────
function Preview({id,data}){
  const f=data.fields,s=data.style||{},accent=s.accentColor||T.accent;
  const base={background:s.bgColor||"#111",color:s.textColor||"#f0f0f0",padding:"18px",borderRadius:"8px",border:`1px solid ${T.border}`,fontFamily:"'IBM Plex Mono',monospace",fontSize:"12px"};
  if(id==="seo")return(<div style={base}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"8px"}}>{Object.entries(f).map(([k,v])=>(<div key={k} style={{background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:"5px",padding:"8px"}}><div style={{fontSize:"9px",color:accent,fontWeight:"700",marginBottom:"2px",textTransform:"uppercase"}}>{fieldLabel(k)}</div><div style={{fontSize:"10px",color:T.muted,lineHeight:1.4,wordBreak:"break-all"}}>{v||<span style={{color:T.dim}}>empty</span>}</div></div>))}</div></div>);
  if(id==="navbar")return(<div style={{...base,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:"8px"}}><span style={{background:accent,color:"#000",fontWeight:"900",fontSize:"10px",padding:"2px 6px",borderRadius:"4px"}}>⬡</span><span style={{fontWeight:"800"}}>{f.logo}</span></div><div style={{display:"flex",gap:"14px",alignItems:"center"}}>{[f.nav1,f.nav2,f.nav3].map((n,i)=><span key={i} style={{color:T.muted,fontSize:"11px"}}>{n}</span>)}<span style={{background:accent,color:"#000",padding:"5px 12px",borderRadius:"5px",fontWeight:"700",fontSize:"11px"}}>{f.cta}</span></div></div>);
  if(id==="hero")return(<div style={{...base,textAlign:"center"}}><h1 style={{fontSize:"20px",fontWeight:"900",lineHeight:1.2,margin:"0 0 8px"}}>{f.headline}</h1><p style={{fontSize:"11px",color:T.muted,margin:"0 0 14px",maxWidth:"460px",display:"inline-block",lineHeight:1.6}}>{f.subheadline}</p><div style={{display:"flex",gap:"8px",justifyContent:"center",marginBottom:"16px"}}><span style={{background:accent,color:"#000",padding:"7px 16px",borderRadius:"5px",fontWeight:"700",fontSize:"11px"}}>{f.cta1}</span><span style={{border:`1px solid ${T.border}`,padding:"7px 16px",borderRadius:"5px",fontSize:"11px"}}>{f.cta2}</span></div><div style={{display:"flex",gap:"28px",justifyContent:"center"}}>{[{v:f.stat1Value,l:f.stat1Label},{v:f.stat2Value,l:f.stat2Label},{v:f.stat3Value,l:f.stat3Label}].map((st,i)=>(<div key={i}><div style={{fontSize:"18px",fontWeight:"900",color:accent}}>{st.v}</div><div style={{fontSize:"10px",color:T.muted}}>{st.l}</div></div>))}</div></div>);
  if(id==="howItWorks")return(<div style={base}><div style={{fontSize:"10px",color:accent,fontWeight:"700",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>{f.sectionLabel}</div><h2 style={{fontSize:"14px",fontWeight:"800",margin:"0 0 4px"}}>{f.headline}</h2><p style={{fontSize:"11px",color:T.muted,margin:"0 0 10px"}}>{f.subheadline}</p><div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:"8px"}}>{[1,2,3,4].map(i=>(<div key={i} style={{background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:"6px",padding:"10px"}}><div style={{fontSize:"10px",color:accent,fontWeight:"700",marginBottom:"3px"}}>0{i}</div><div style={{fontSize:"11px",fontWeight:"700",marginBottom:"3px"}}>{f[`step${i}Title`]}</div><div style={{fontSize:"10px",color:T.muted,lineHeight:1.5}}>{f[`step${i}Body`]}</div></div>))}</div></div>);
  if(id==="vault")return(<div style={base}><div style={{fontSize:"10px",color:accent,fontWeight:"700",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>{f.sectionLabel}</div><h2 style={{fontSize:"14px",fontWeight:"900",margin:"0 0 4px"}}>{f.headline}</h2><p style={{fontSize:"11px",color:T.muted,margin:"0 0 10px",lineHeight:1.5}}>{f.subheadline}</p><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}}>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{background:s.cardBg||"#181818",border:`1px solid ${T.border}`,borderRadius:"6px",padding:"10px"}}><div style={{fontSize:"9px",color:accent,fontWeight:"700",marginBottom:"3px",textTransform:"uppercase"}}>{f[`p${i}Badge`]}</div><div style={{fontSize:"11px",fontWeight:"700",marginBottom:"3px"}}>{f[`p${i}Name`]}</div><div style={{fontSize:"12px",fontWeight:"800",color:accent}}>{f[`p${i}Price`]}</div></div>))}</div></div>);
  if(id==="industries")return(<div style={base}><h2 style={{fontSize:"14px",fontWeight:"800",margin:"0 0 4px"}}>{f.headline}</h2><p style={{fontSize:"11px",color:T.muted,margin:"0 0 10px"}}>{f.subheadline}</p><div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{Array.from({length:16},(_,i)=>f[`i${i+1}`]).filter(Boolean).map((ind,i)=>(<span key={i} style={{background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:"100px",padding:"3px 10px",fontSize:"10px",color:T.muted}}>{ind}</span>))}</div></div>);
  if(id==="whyBVP")return(<div style={base}><h2 style={{fontSize:"14px",fontWeight:"800",margin:"0 0 4px"}}>{f.headline}</h2><p style={{fontSize:"11px",color:T.muted,margin:"0 0 10px",lineHeight:1.5}}>{f.subheadline}</p><div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:"8px"}}>{[1,2,3,4,5].map(i=>(<div key={i} style={{background:s.cardBg||"#181818",border:`1px solid ${T.border}`,borderRadius:"6px",padding:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",marginBottom:"3px"}}>{f[`f${i}Title`]}</div><div style={{fontSize:"10px",color:T.muted,lineHeight:1.5}}>{f[`f${i}Body`]}</div></div>))}</div></div>);
  if(id==="wishlist")return(<div style={base}><div style={{fontSize:"10px",color:accent,fontWeight:"700",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>{f.sectionLabel}</div><h2 style={{fontSize:"14px",fontWeight:"800",margin:"0 0 10px"}}>{f.headline}</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}><div style={{background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:"6px",padding:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",marginBottom:"8px"}}>🔥 {f.topRequestsHeadline}</div>{[1,2,3,4,5].map(i=>(<div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:"4px",fontSize:"10px"}}><span style={{color:T.muted}}>▲{f[`vote${i}Count`]} {f[`vote${i}`]}</span><span style={{color:accent,fontSize:"9px"}}>{f[`vote${i}Category`]}</span></div>))}</div><div style={{background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:"6px",padding:"10px"}}><div style={{fontSize:"11px",fontWeight:"700",marginBottom:"8px"}}>{f.perksHeadline}</div>{[1,2,3,4].map(i=>f[`perk${i}`]&&<div key={i} style={{fontSize:"10px",color:T.muted,marginBottom:"3px"}}>✓ {f[`perk${i}`]}</div>)}<div style={{marginTop:"8px",background:accent,color:"#000",padding:"5px 10px",borderRadius:"5px",fontSize:"10px",fontWeight:"700",display:"inline-block"}}>{f.perksCtaLabel}</div></div></div></div>);
  if(id==="pipeline")return(<div style={base}><div style={{fontSize:"10px",color:accent,fontWeight:"700",letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:"4px"}}>{f.sectionLabel}</div><h2 style={{fontSize:"14px",fontWeight:"900",margin:"0 0 10px"}}>{f.headline}</h2><div style={{display:"flex",flexWrap:"wrap",gap:"6px"}}>{[{n:f.pl1Name,p:f.pl1Price,st:"Planned"},{n:f.pl2Name,p:f.pl2Price,st:"Planned"},{n:f.pl3Name,p:f.pl3Price,st:"Planned"},{n:f.d1Name,p:f.d1Price,st:"In Dev"},{n:f.d2Name,p:f.d2Price,st:"In Dev"},{n:f.d3Name,p:f.d3Price,st:"In Dev"},{n:f.t1Name,p:f.t1Price,st:"Testing"},{n:f.t2Name,p:f.t2Price,st:"Testing"},{n:f.cs1Name,p:f.cs1Price,st:"Soon"},{n:f.cs2Name,p:f.cs2Price,st:"Soon"},{n:f.lv1Name,p:f.lv1Price,st:"Live"},{n:f.lv2Name,p:f.lv2Price,st:"Live"}].map((item,i)=>(<div key={i} style={{background:item.st==="Live"?`${accent}18`:T.surfaceAlt,border:`1px solid ${item.st==="Live"?accent:T.border}`,borderRadius:"6px",padding:"7px 10px",minWidth:"100px"}}><div style={{fontSize:"9px",color:item.st==="Live"?accent:T.dim,marginBottom:"2px"}}>{item.st}</div><div style={{fontSize:"10px",fontWeight:"700"}}>{item.n}</div><div style={{fontSize:"11px",color:accent,fontWeight:"800"}}>{item.p}</div></div>))}</div></div>);
  if(id==="waitlist")return(<div style={base}><h2 style={{fontSize:"14px",fontWeight:"800",margin:"0 0 10px"}}>{f.headline}</h2><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px"}}><div>{[1,2,3,4,5].map(i=>f[`perk${i}`]&&<div key={i} style={{fontSize:"10px",color:T.muted,marginBottom:"4px"}}>🏆 {f[`perk${i}`]}</div>)}<div style={{marginTop:"10px",fontSize:"14px",fontWeight:"900",color:accent}}>{f.socialProof} <span style={{fontSize:"10px",color:T.muted,fontWeight:"400"}}>{f.socialProofLabel}</span></div></div><div style={{background:T.surfaceAlt,border:`1px solid ${T.border}`,borderRadius:"6px",padding:"12px"}}><div style={{fontSize:"11px",fontWeight:"700",marginBottom:"8px"}}>{f.formHeadline}</div><div style={{background:accent,color:"#000",padding:"8px",borderRadius:"5px",textAlign:"center",fontSize:"11px",fontWeight:"700"}}>{f.ctaLabel}</div><div style={{fontSize:"10px",color:T.dim,marginTop:"6px",lineHeight:1.4}}>{f.disclaimer}</div></div></div></div>);
  if(id==="faq")return(<div style={base}><h2 style={{fontSize:"14px",fontWeight:"800",margin:"0 0 12px"}}>{f.headline}</h2>{[1,2,3,4,5,6].map(i=>(<div key={i} style={{borderBottom:`1px solid ${T.border}`,paddingBottom:"8px",marginBottom:"8px"}}><div style={{fontSize:"11px",fontWeight:"700",marginBottom:"3px",color:accent}}>{f[`q${i}`]}</div><div style={{fontSize:"10px",color:T.muted,lineHeight:1.6}}>{f[`a${i}`]}</div></div>))}</div>);
  if(id==="footer")return(<div style={base}><div style={{display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"16px",marginBottom:"12px"}}><div style={{maxWidth:"180px"}}><div style={{display:"flex",alignItems:"center",gap:"6px",marginBottom:"5px"}}><span style={{background:accent,color:"#000",fontWeight:"900",fontSize:"10px",padding:"2px 6px",borderRadius:"4px"}}>⬡</span><span style={{fontWeight:"800",fontSize:"12px"}}>{f.logo}</span></div><div style={{fontSize:"10px",color:T.muted,lineHeight:1.6}}>{f.tagline}</div></div>{["col2","col3","col4"].map(col=>(<div key={col}><div style={{fontSize:"11px",fontWeight:"700",marginBottom:"5px"}}>{f[`${col}Headline`]}</div>{[1,2,3,4,5,6].map(i=>f[`${col}l${i}`]&&<div key={i} style={{fontSize:"10px",color:T.dim,marginBottom:"2px"}}>{f[`${col}l${i}`]}</div>)}</div>))}</div><div style={{borderTop:`1px solid ${T.border}`,paddingTop:"8px",display:"flex",justifyContent:"space-between",flexWrap:"wrap",gap:"4px"}}><div style={{fontSize:"10px",color:T.dim}}>{f.copyright}</div><div style={{fontSize:"10px",color:T.dim}}>{f.email}</div></div></div>);
  return <div style={{...base,color:T.dim}}>No preview available.</div>;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function BVPSiteEditor() {
  const [data, setData] = useState(INITIAL_DATA);
  const [activeSec, setActiveSec] = useState(null);
  const [tab, setTab] = useState("content"); // content | style | seo (handled via section)
  const [view, setView] = useState("editor"); // editor | code | snapshots | diff
  const [snapshots, setSnapshots] = useState([]);
  const [showThemes, setShowThemes] = useState(false);
  const [showVercel, setShowVercel] = useState(false);
  const [vercelToken, setVercelToken] = useState("");
  const [vercelProject, setVercelProject] = useState("bot-vault-pro");
  const [deployStatus, setDeployStatus] = useState(null); // null | loading | success | error
  const [deployMsg, setDeployMsg] = useState("");
  const [aiField, setAiField] = useState(null); // {secId, key, label, value}
  const [aiInstruction, setAiInstruction] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addProductOpen, setAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({name:"",badge:"",price:"",status:"Planned",desc:""});

  const sec = activeSec ? data[activeSec] : null;

  // Load snapshots from sessionStorage
  useEffect(()=>{
    try{ const s=sessionStorage.getItem(SNAPSHOTS_KEY); if(s) setSnapshots(JSON.parse(s)); }catch(e){}
  },[]);

  const saveSnapshot = useCallback(()=>{
    const snap = { ts: new Date().toLocaleString(), label:`Snapshot ${new Date().toLocaleTimeString()}`, data: JSON.parse(JSON.stringify(data)) };
    setSnapshots(prev=>{const n=[snap,...prev].slice(0,20); try{sessionStorage.setItem(SNAPSHOTS_KEY,JSON.stringify(n));}catch(e){} return n;});
  },[data]);

  const restoreSnapshot = (snap) => { setData(snap.data); setView("editor"); };

  const updateField = useCallback((id,k,v)=>setData(p=>({...p,[id]:{...p[id],fields:{...p[id].fields,[k]:v}}})),[]);
  const updateStyle = useCallback((id,k,v)=>setData(p=>({...p,[id]:{...p[id],style:{...p[id].style,[k]:v}}})),[]);

  // Apply theme to all sections
  const applyTheme = (theme) => {
    setData(prev=>{
      const next={...prev};
      Object.keys(next).forEach(id=>{
        if(next[id].style){
          const s={...next[id].style};
          if(s.bgColor!==undefined) s.bgColor=theme.bgColor;
          if(s.textColor!==undefined) s.textColor=theme.textColor;
          if(s.accentColor!==undefined) s.accentColor=theme.accentColor;
          if(s.cardBg!==undefined) s.cardBg=theme.cardBg;
          next[id]={...next[id],style:s};
        }
      });
      return next;
    });
    setShowThemes(false);
  };

  // AI rewrite
  const handleAiRewrite = async () => {
    if(!aiField||!aiInstruction.trim()) return;
    setAiLoading(true);
    try {
      const result = await aiRewrite(aiField.label, aiField.value, aiInstruction);
      updateField(aiField.secId, aiField.key, result);
      setAiField(null); setAiInstruction("");
    } catch(e){ alert("AI rewrite failed. Check your connection."); }
    setAiLoading(false);
  };

  // Vercel deploy
  const handleDeploy = async () => {
    if(!vercelToken.trim()){ setDeployMsg("Enter your Vercel token first."); return; }
    setDeployStatus("loading"); setDeployMsg("Triggering deploy...");
    try {
      const res = await triggerVercelDeploy(vercelToken, vercelProject);
      if(res.id || res.uid){
        setDeployStatus("success");
        setDeployMsg(`Deploy triggered! ID: ${res.id||res.uid}. Check Vercel dashboard.`);
        saveSnapshot();
      } else {
        setDeployStatus("error");
        setDeployMsg(res.error?.message || "Deploy failed — check your token and project name.");
      }
    } catch(e){ setDeployStatus("error"); setDeployMsg("Network error. Try again."); }
  };

  // Add product to vault
  const handleAddProduct = () => {
    if(!newProduct.name) return;
    const vaultFields = {...data.vault.fields};
    const count = [1,2,3,4,5,6,7,8].find(n=>!vaultFields[`p${n}Name`]) || 7;
    vaultFields[`p${count}Name`]=newProduct.name;
    vaultFields[`p${count}Badge`]=newProduct.badge;
    vaultFields[`p${count}Price`]=newProduct.price;
    vaultFields[`p${count}Desc`]=newProduct.desc;
    setData(p=>({...p,vault:{...p.vault,fields:vaultFields}}));
    setNewProduct({name:"",badge:"",price:"",status:"Planned",desc:""});
    setAddProductOpen(false);
    setActiveSec("vault");
  };

  // Add pipeline item
  const [addPipelineOpen, setAddPipelineOpen] = useState(false);
  const [newPipeline, setNewPipeline] = useState({name:"",badge:"",price:"",status:"Planned",desc:""});
  const handleAddPipeline = () => {
    if(!newPipeline.name) return;
    const pfx = {Planned:"pl",InDevelopment:"d",Testing:"t","ComingSoon":"cs",Live:"lv"};
    const key = pfx[newPipeline.status.replace(/\s/g,"")] || "pl";
    const fields = {...data.pipeline.fields};
    const count = [1,2,3,4,5].find(n=>!fields[`${key}${n}Name`]) || 4;
    fields[`${key}${count}Name`]=newPipeline.name;
    fields[`${key}${count}Badge`]=newPipeline.badge;
    fields[`${key}${count}Price`]=newPipeline.price;
    fields[`${key}${count}Desc`]=newPipeline.desc;
    fields[`${key}${count}Status`]=newPipeline.status;
    setData(p=>({...p,pipeline:{...p.pipeline,fields}}));
    setNewPipeline({name:"",badge:"",price:"",status:"Planned",desc:""});
    setAddPipelineOpen(false);
    setActiveSec("pipeline");
  };

  const handleCopy = () => { navigator.clipboard.writeText(generateCode(data)).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2000);}); };
  const handleDownload = () => { const b=new Blob([generateCode(data)],{type:"text/javascript"}); const u=URL.createObjectURL(b); const a=document.createElement("a"); a.href=u; a.download="botvaultpro-config.js"; a.click(); URL.revokeObjectURL(u); saveSnapshot(); };

  const inp = {width:"100%",background:"#0d0d0d",border:`1px solid ${T.border}`,borderRadius:"6px",color:T.text,padding:"7px 10px",fontSize:"12px",fontFamily:"'IBM Plex Mono',monospace",outline:"none",boxSizing:"border-box"};
  const btn = (active,danger)=>({background:active?T.accentGlow:T.surfaceAlt,border:`1px solid ${active?T.accent:danger?T.danger:T.border}`,color:active?T.accent:danger?T.danger:T.muted,padding:"6px 12px",borderRadius:"5px",fontSize:"11px",fontFamily:"inherit",cursor:"pointer",fontWeight:"600",transition:"all 0.1s"});

  return (
    <div style={{display:"flex",height:"100vh",background:T.bg,color:T.text,fontFamily:"'IBM Plex Mono',monospace",fontSize:"13px",overflow:"hidden"}}>

      {/* ── SIDEBAR ─────────────────────────────────────────────────────── */}
      <div style={{width:"210px",minWidth:"210px",background:T.surface,borderRight:`1px solid ${T.border}`,display:"flex",flexDirection:"column",overflow:"hidden"}}>
        {/* Logo */}
        <div style={{padding:"14px 14px 12px",borderBottom:`1px solid ${T.border}`}}>
          <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
            <span style={{background:T.accent,color:"#000",fontWeight:"900",fontSize:"10px",padding:"2px 6px",borderRadius:"4px"}}>BVP</span>
            <span style={{fontWeight:"700",fontSize:"12px"}}>Site Editor</span>
          </div>
          <div style={{fontSize:"10px",color:T.dim,marginTop:"2px"}}>botvaultpro.com · 2026</div>
        </div>

        {/* View Tabs */}
        <div style={{padding:"8px",borderBottom:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:"3px"}}>
          {[["editor","◈ Editor"],["code","{ } Export"],["snapshots",`⧗ History (${snapshots.length})`]].map(([v,l])=>(
            <button key={v} onClick={()=>setView(v)} style={{...btn(view===v),width:"100%",textAlign:"left",padding:"6px 10px"}}>
              {l}
            </button>
          ))}
        </div>

        {/* Sections */}
        <div style={{flex:1,overflowY:"auto",padding:"8px"}}>
          <div style={{fontSize:"10px",color:T.dim,marginBottom:"6px",letterSpacing:"0.08em",textTransform:"uppercase",padding:"0 4px"}}>Sections</div>
          {Object.entries(data).map(([id,s])=>(
            <button key={id} onClick={()=>{setActiveSec(id);setView("editor");}} style={{
              display:"block",width:"100%",textAlign:"left",
              background:activeSec===id&&view==="editor"?T.accentGlow:"transparent",
              border:`1px solid ${activeSec===id&&view==="editor"?T.accent:"transparent"}`,
              borderRadius:"5px",color:activeSec===id&&view==="editor"?T.accent:T.muted,
              padding:"6px 10px",fontSize:"11px",fontFamily:"inherit",cursor:"pointer",marginBottom:"2px",transition:"all 0.1s",
            }}>{s.label}</button>
          ))}
        </div>

        {/* Bottom actions */}
        <div style={{padding:"8px",borderTop:`1px solid ${T.border}`,display:"flex",flexDirection:"column",gap:"4px"}}>
          <button onClick={()=>setShowThemes(!showThemes)} style={{...btn(showThemes),width:"100%",textAlign:"left",padding:"6px 10px"}}>
            ◉ Preset Themes
          </button>
          <button onClick={()=>{setAddProductOpen(true);}} style={{...btn(addProductOpen),width:"100%",textAlign:"left",padding:"6px 10px"}}>
            + Add Product
          </button>
          <button onClick={()=>{setAddPipelineOpen(true);}} style={{...btn(addPipelineOpen),width:"100%",textAlign:"left",padding:"6px 10px"}}>
            + Add Pipeline Item
          </button>
          <button onClick={()=>setShowVercel(!showVercel)} style={{...btn(false),width:"100%",textAlign:"left",padding:"6px 10px",borderColor:T.accent,color:T.accent,background:T.accentGlow}}>
            ▲ Deploy to Vercel
          </button>
        </div>
      </div>

      {/* ── MAIN ────────────────────────────────────────────────────────── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>

        {/* Topbar */}
        <div style={{height:"44px",background:T.surface,borderBottom:`1px solid ${T.border}`,display:"flex",alignItems:"center",padding:"0 14px",gap:"8px",flexShrink:0}}>
          <span style={{fontSize:"11px",color:T.muted}}>botvaultpro.com</span>
          {activeSec&&view==="editor"&&<><span style={{color:T.dim}}>›</span><span style={{fontSize:"11px",color:T.text}}>{sec?.label}</span></>}
          <div style={{flex:1}}/>
          {view==="editor"&&sec&&<>
            {["content","style"].map(t=>(<button key={t} onClick={()=>setTab(t)} style={{...btn(tab===t),textTransform:"capitalize"}}>{t}</button>))}
          </>}
          {view==="code"&&<>
            <button onClick={handleCopy} style={btn(copied)}>{copied?"✓ Copied":"Copy Code"}</button>
            <button onClick={handleDownload} style={btn(false)}>↓ Download</button>
            <button onClick={saveSnapshot} style={btn(false)}>⧗ Save Snapshot</button>
          </>}
        </div>

        {/* ── THEME PANEL ── */}
        {showThemes&&(
          <div style={{background:T.surfaceAlt,borderBottom:`1px solid ${T.border}`,padding:"12px 14px"}}>
            <div style={{fontSize:"11px",color:T.accent,fontWeight:"700",marginBottom:"10px"}}>PRESET THEMES — applies to entire site instantly</div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}>
              {Object.entries(THEMES).map(([name,theme])=>(
                <button key={name} onClick={()=>applyTheme(theme)} style={{display:"flex",alignItems:"center",gap:"8px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:"6px",padding:"8px 12px",cursor:"pointer",fontFamily:"inherit",color:T.text,fontSize:"11px",transition:"all 0.1s"}}>
                  <span style={{width:"14px",height:"14px",borderRadius:"50%",background:theme.accentColor,border:`2px solid ${theme.bgColor}`,display:"inline-block",flexShrink:0}}/>
                  <span style={{background:theme.bgColor,color:theme.accentColor,padding:"1px 6px",borderRadius:"3px",fontSize:"10px",fontWeight:"700"}}>{name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── VERCEL PANEL ── */}
        {showVercel&&(
          <div style={{background:"#0a0d00",borderBottom:`1px solid ${T.accent}`,padding:"14px 16px"}}>
            <div style={{fontSize:"11px",color:T.accent,fontWeight:"700",marginBottom:"10px"}}>▲ DEPLOY TO VERCEL — pushes config export + triggers production deploy</div>
            <div style={{display:"flex",gap:"10px",alignItems:"flex-end",flexWrap:"wrap"}}>
              <div style={{flex:2,minWidth:"220px"}}>
                <div style={{fontSize:"10px",color:T.muted,marginBottom:"4px"}}>VERCEL TOKEN <span style={{color:T.dim}}>(Settings → Tokens → Create)</span></div>
                <input type="password" placeholder="paste your Vercel token..." value={vercelToken} onChange={e=>setVercelToken(e.target.value)} style={{...inp,borderColor:T.accentDim}}/>
              </div>
              <div style={{flex:1,minWidth:"150px"}}>
                <div style={{fontSize:"10px",color:T.muted,marginBottom:"4px"}}>PROJECT NAME</div>
                <input type="text" value={vercelProject} onChange={e=>setVercelProject(e.target.value)} style={{...inp,borderColor:T.accentDim}}/>
              </div>
              <button onClick={handleDeploy} disabled={deployStatus==="loading"} style={{background:T.accent,color:"#000",border:"none",padding:"8px 18px",borderRadius:"6px",fontSize:"12px",fontWeight:"900",cursor:"pointer",fontFamily:"inherit",opacity:deployStatus==="loading"?0.6:1}}>
                {deployStatus==="loading"?"Deploying...":"▲ Deploy Now"}
              </button>
            </div>
            {deployMsg&&(
              <div style={{marginTop:"8px",padding:"8px 10px",borderRadius:"5px",background:deployStatus==="success"?"#22c55e18":deployStatus==="error"?"#ff444418":"#ffffff10",border:`1px solid ${deployStatus==="success"?T.success:deployStatus==="error"?T.danger:T.border}`,fontSize:"11px",color:deployStatus==="success"?T.success:deployStatus==="error"?T.danger:T.muted}}>
                {deployMsg}
              </div>
            )}
            <div style={{marginTop:"8px",fontSize:"10px",color:T.dim}}>
              Note: For full site updates, export config → update your codebase via Claude Code → then deploy. This button triggers a redeploy of your existing Vercel build.
            </div>
          </div>
        )}

        {/* ── ADD PRODUCT MODAL ── */}
        {addProductOpen&&(
          <div style={{background:T.surfaceAlt,borderBottom:`1px solid ${T.border}`,padding:"14px 16px"}}>
            <div style={{fontSize:"11px",color:T.accent,fontWeight:"700",marginBottom:"10px"}}>+ NEW PRODUCT — adds to The Vault section</div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"flex-end"}}>
              {[["name","Product Name",2],["badge","Badge",1],["price","Price",1],["desc","Description",2]].map(([k,l,flex])=>(
                <div key={k} style={{flex:flex,minWidth:"120px"}}>
                  <div style={{fontSize:"10px",color:T.muted,marginBottom:"3px",textTransform:"uppercase"}}>{l}</div>
                  {k==="desc"?<textarea rows={2} placeholder={l} value={newProduct[k]} onChange={e=>setNewProduct(p=>({...p,[k]:e.target.value}))} style={{...inp,resize:"none"}}/>:<input type="text" placeholder={l} value={newProduct[k]} onChange={e=>setNewProduct(p=>({...p,[k]:e.target.value}))} style={inp}/>}
                </div>
              ))}
              <div style={{display:"flex",gap:"6px"}}>
                <button onClick={handleAddProduct} style={{background:T.accent,color:"#000",border:"none",padding:"8px 14px",borderRadius:"5px",fontSize:"11px",fontWeight:"800",cursor:"pointer",fontFamily:"inherit"}}>Add</button>
                <button onClick={()=>setAddProductOpen(false)} style={{...btn(false),padding:"8px 12px"}}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── ADD PIPELINE MODAL ── */}
        {addPipelineOpen&&(
          <div style={{background:T.surfaceAlt,borderBottom:`1px solid ${T.border}`,padding:"14px 16px"}}>
            <div style={{fontSize:"11px",color:T.accent,fontWeight:"700",marginBottom:"10px"}}>+ NEW PIPELINE ITEM</div>
            <div style={{display:"flex",gap:"8px",flexWrap:"wrap",alignItems:"flex-end"}}>
              {[["name","Name",2],["badge","Type",1],["price","Price",1]].map(([k,l,flex])=>(
                <div key={k} style={{flex:flex,minWidth:"110px"}}>
                  <div style={{fontSize:"10px",color:T.muted,marginBottom:"3px",textTransform:"uppercase"}}>{l}</div>
                  <input type="text" placeholder={l} value={newPipeline[k]} onChange={e=>setNewPipeline(p=>({...p,[k]:e.target.value}))} style={inp}/>
                </div>
              ))}
              <div style={{flex:1,minWidth:"120px"}}>
                <div style={{fontSize:"10px",color:T.muted,marginBottom:"3px",textTransform:"uppercase"}}>Status</div>
                <select value={newPipeline.status} onChange={e=>setNewPipeline(p=>({...p,status:e.target.value}))} style={{...inp}}>
                  {["Planned","In Development","Testing","Coming Soon","Live"].map(s=><option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div style={{display:"flex",gap:"6px"}}>
                <button onClick={handleAddPipeline} style={{background:T.accent,color:"#000",border:"none",padding:"8px 14px",borderRadius:"5px",fontSize:"11px",fontWeight:"800",cursor:"pointer",fontFamily:"inherit"}}>Add</button>
                <button onClick={()=>setAddPipelineOpen(false)} style={{...btn(false),padding:"8px 12px"}}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {/* ── AI REWRITE MODAL ── */}
        {aiField&&(
          <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",background:T.surfaceAlt,border:`1px solid ${T.accent}`,borderRadius:"10px",padding:"20px",width:"440px",zIndex:100,boxShadow:"0 20px 60px rgba(0,0,0,0.8)"}}>
            <div style={{fontSize:"12px",color:T.accent,fontWeight:"700",marginBottom:"10px"}}>AI COPYWRITER — {aiField.label}</div>
            <div style={{fontSize:"11px",color:T.muted,marginBottom:"6px"}}>Current:</div>
            <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:"5px",padding:"8px",fontSize:"11px",color:T.dim,marginBottom:"12px",lineHeight:1.5,maxHeight:"80px",overflow:"auto"}}>{aiField.value}</div>
            <div style={{fontSize:"11px",color:T.muted,marginBottom:"6px"}}>Instruction:</div>
            <input type="text" placeholder='e.g. "more aggressive", "shorter", "focus on trades industry"' value={aiInstruction} onChange={e=>setAiInstruction(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleAiRewrite()} style={{...inp,marginBottom:"12px"}} autoFocus/>
            <div style={{display:"flex",gap:"8px",justifyContent:"flex-end"}}>
              <button onClick={()=>{setAiField(null);setAiInstruction("");}} style={{...btn(false),padding:"7px 14px"}}>Cancel</button>
              <button onClick={handleAiRewrite} disabled={aiLoading||!aiInstruction.trim()} style={{background:T.accent,color:"#000",border:"none",padding:"7px 16px",borderRadius:"5px",fontSize:"11px",fontWeight:"800",cursor:"pointer",fontFamily:"inherit",opacity:aiLoading?0.6:1}}>
                {aiLoading?"Rewriting...":"✦ Rewrite"}
              </button>
            </div>
          </div>
        )}
        {aiField&&<div style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",zIndex:99}} onClick={()=>setAiField(null)}/>}

        {/* ── VIEWS ─────────────────────────────────────────────────────── */}

        {/* CODE VIEW */}
        {view==="code"&&(
          <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
            <div style={{padding:"10px 14px",borderBottom:`1px solid ${T.border}`,fontSize:"11px",color:T.muted}}>
              Export this config → Open Claude Code → paste → say <em style={{color:T.accent}}>"Update my site using this config"</em>
            </div>
            <pre style={{flex:1,overflow:"auto",padding:"16px",margin:0,background:"#070707",color:T.accent,fontSize:"11px",lineHeight:"1.7",fontFamily:"'IBM Plex Mono',monospace"}}>
              {generateCode(data)}
            </pre>
          </div>
        )}

        {/* SNAPSHOTS VIEW */}
        {view==="snapshots"&&(
          <div style={{flex:1,overflowY:"auto",padding:"16px"}}>
            <div style={{fontSize:"11px",color:T.accent,fontWeight:"700",marginBottom:"14px"}}>VERSION HISTORY — last 20 snapshots (session only)</div>
            {snapshots.length===0&&<div style={{fontSize:"11px",color:T.dim}}>No snapshots yet. Export code or download to auto-save.</div>}
            {snapshots.map((snap,i)=>(
              <div key={i} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:"7px",padding:"12px 14px",marginBottom:"8px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <div>
                  <div style={{fontSize:"12px",fontWeight:"700"}}>{snap.label}</div>
                  <div style={{fontSize:"10px",color:T.muted,marginTop:"2px"}}>{snap.ts}</div>
                </div>
                <button onClick={()=>restoreSnapshot(snap)} style={{...btn(false),color:T.accent,borderColor:T.accent}}>Restore</button>
              </div>
            ))}
          </div>
        )}

        {/* EDITOR VIEW */}
        {view==="editor"&&(
          <div style={{flex:1,display:"flex",overflow:"hidden"}}>

            {/* Edit Panel */}
            {sec&&(
              <div style={{width:"310px",minWidth:"310px",background:T.surfaceAlt,borderRight:`1px solid ${T.border}`,overflowY:"auto",padding:"12px"}}>
                <div style={{fontSize:"10px",color:T.accent,fontWeight:"700",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"10px"}}>
                  {tab==="content"?"Content Fields":"Style / Colors"}
                </div>

                {tab==="content"&&Object.entries(sec.fields).map(([k,v])=>(
                  <div key={k} style={{marginBottom:"10px"}}>
                    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"3px"}}>
                      <label style={{fontSize:"10px",color:T.muted,letterSpacing:"0.04em",textTransform:"uppercase"}}>{fieldLabel(k)}</label>
                      <button
                        onClick={()=>{setAiField({secId:activeSec,key:k,label:fieldLabel(k),value:v});setAiInstruction("");}}
                        title="Rewrite with AI"
                        style={{background:"transparent",border:`1px solid ${T.border}`,color:T.dim,padding:"1px 6px",borderRadius:"3px",fontSize:"9px",fontFamily:"inherit",cursor:"pointer",letterSpacing:"0.03em"}}
                      >✦ AI</button>
                    </div>
                    {TEXTAREA_KEYS.has(k)
                      ?<textarea rows={3} value={v} onChange={e=>updateField(activeSec,k,e.target.value)} style={{...inp,resize:"vertical",lineHeight:"1.5"}}/>
                      :<input type="text" value={v} onChange={e=>updateField(activeSec,k,e.target.value)} style={inp}/>
                    }
                  </div>
                ))}

                {tab==="style"&&sec.style&&Object.entries(sec.style).map(([k,v])=>(
                  <div key={k} style={{marginBottom:"10px"}}>
                    <label style={{display:"block",fontSize:"10px",color:T.muted,marginBottom:"3px",letterSpacing:"0.04em",textTransform:"uppercase"}}>{fieldLabel(k)}</label>
                    {COLOR_KEYS.has(k)?(
                      <div style={{display:"flex",gap:"8px",alignItems:"center"}}>
                        <input type="color" value={v||"#000000"} onChange={e=>updateStyle(activeSec,k,e.target.value)} style={{width:"34px",height:"34px",border:`1px solid ${T.border}`,borderRadius:"5px",background:"none",cursor:"pointer",padding:"2px"}}/>
                        <input type="text" value={v||""} onChange={e=>updateStyle(activeSec,k,e.target.value)} style={{...inp,flex:1}}/>
                      </div>
                    ):(
                      <input type="text" value={v||""} onChange={e=>updateStyle(activeSec,k,e.target.value)} style={inp}/>
                    )}
                  </div>
                ))}

                {tab==="style"&&!sec.style&&(
                  <p style={{fontSize:"11px",color:T.dim}}>This section has no style settings.</p>
                )}
              </div>
            )}

            {/* Preview Panel */}
            <div style={{flex:1,overflowY:"auto",padding:"16px",background:"#080808"}}>
              {!sec?(
                <div>
                  <div style={{fontSize:"11px",color:T.dim,marginBottom:"12px"}}>Click any section in the sidebar to edit — or scroll to see full overview</div>
                  <div style={{display:"flex",flexDirection:"column",gap:"10px"}}>
                    {Object.entries(data).map(([id,s])=>(
                      <div key={id} onClick={()=>setActiveSec(id)} style={{cursor:"pointer"}}>
                        <div style={{fontSize:"10px",color:T.dim,marginBottom:"4px",letterSpacing:"0.05em",textTransform:"uppercase"}}>{s.label}</div>
                        <Preview id={id} data={s}/>
                      </div>
                    ))}
                  </div>
                </div>
              ):(
                <div>
                  <div style={{fontSize:"11px",color:T.dim,marginBottom:"8px"}}>Live Preview · {sec.label}</div>
                  <Preview id={activeSec} data={sec}/>
                  <div style={{marginTop:"12px",padding:"12px 14px",background:T.surface,borderRadius:"7px",border:`1px solid ${T.border}`}}>
                    <div style={{fontSize:"10px",color:T.dim,marginBottom:"6px",letterSpacing:"0.05em",textTransform:"uppercase"}}>Push this live</div>
                    <div style={{display:"flex",gap:"16px",flexWrap:"wrap"}}>
                      <div style={{fontSize:"10px",color:T.muted,lineHeight:2}}>
                        <span style={{color:T.accent}}>Option A (Quick):</span> Edit → Export Code → Claude Code<br/>
                        <span style={{color:T.accent}}>Option B (Direct):</span> Edit → ▲ Deploy to Vercel button
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
