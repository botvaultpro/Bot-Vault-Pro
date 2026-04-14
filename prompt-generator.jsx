import { useState, useRef } from "react";

const OUTPUT_TYPES = [
  { id: "text", label: "Written Content", icon: "✍️" },
  { id: "image", label: "Image / Art", icon: "🖼️" },
  { id: "code", label: "Code / App", icon: "💻" },
  { id: "video", label: "Video / Script", icon: "🎬" },
  { id: "strategy", label: "Strategy / Plan", icon: "🎯" },
  { id: "analysis", label: "Research / Analysis", icon: "🔬" },
];

const AI_TARGETS = [
  { id: "claude", label: "Claude" },
  { id: "chatgpt", label: "ChatGPT / GPT-4" },
  { id: "midjourney", label: "Midjourney" },
  { id: "dalle", label: "DALL·E" },
  { id: "stable", label: "Stable Diffusion" },
  { id: "gemini", label: "Gemini" },
  { id: "general", label: "Any AI" },
];

const TONES = ["Professional", "Creative", "Technical", "Casual", "Authoritative", "Persuasive"];

export default function PromptGenerator() {
  const [idea, setIdea] = useState("");
  const [outputType, setOutputType] = useState("text");
  const [aiTarget, setAiTarget] = useState("claude");
  const [tone, setTone] = useState("Professional");
  const [context, setContext] = useState("");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");
  const [charCount, setCharCount] = useState(0);
  const outputRef = useRef(null);

  const generate = async () => {
    if (!idea.trim()) { setError("Add your idea first."); return; }
    setError("");
    setLoading(true);
    setGeneratedPrompt("");

    const fullPrompt = `You are an elite prompt engineer. Transform the raw idea below into a masterfully structured, ready-to-use prompt optimized for ${aiTarget}, output type: ${outputType}, tone: ${tone}.

Rules:
- Be specific, detailed, unambiguous
- Include role-setting, context, constraints, format instructions, output expectations
- For image AIs: add style descriptors, lighting, composition, camera details, quality tags
- For text AIs: add role definitions, chain-of-thought cues, structured output formatting  
- For code: add tech stack assumptions, edge cases, error handling expectations
- Output ONLY the final ready-to-use prompt. No preamble, no explanation, no meta-commentary.

RAW IDEA: ${idea}${context ? `\nADDITIONAL CONTEXT: ${context}` : ""}`;

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: fullPrompt }],
        }),
      });
      const data = await res.json();
      const text = data?.content?.[0]?.text;
      if (text) {
        setGeneratedPrompt(text);
        setTimeout(() => outputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      } else {
        setError("No output: " + JSON.stringify(data).slice(0, 200));
      }
    } catch (e) {
      setError("Error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const copy = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => { setGeneratedPrompt(""); setIdea(""); setContext(""); setCharCount(0); setError(""); };

  return (
    <div style={{ minHeight: "100vh", background: "#080b12", fontFamily: "'DM Mono','Courier New',monospace", color: "#e8e6f0", overflowX: "hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        .grid-bg{position:fixed;inset:0;z-index:0;background-image:linear-gradient(rgba(0,255,180,.03) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,180,.03) 1px,transparent 1px);background-size:48px 48px;pointer-events:none}
        .glow{position:fixed;width:600px;height:600px;background:radial-gradient(circle,rgba(0,255,140,.06) 0%,transparent 70%);border-radius:50%;top:-200px;right:-100px;pointer-events:none;z-index:0}
        .wrap{position:relative;z-index:1;max-width:860px;margin:0 auto;padding:60px 24px 80px}
        .badge{display:inline-block;background:rgba(0,255,140,.08);border:1px solid rgba(0,255,140,.2);color:#00ff8c;font-size:11px;letter-spacing:.15em;text-transform:uppercase;padding:6px 14px;border-radius:2px;margin-bottom:20px}
        h1{font-family:'Syne',sans-serif;font-size:clamp(32px,6vw,60px);font-weight:800;line-height:1;letter-spacing:-.02em;color:#fff;margin-bottom:16px}
        h1 span{color:#00ff8c}
        .sub{color:rgba(232,230,240,.4);font-size:14px;line-height:1.7;max-width:480px;font-style:italic;margin-bottom:48px}
        .lbl{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:rgba(0,255,140,.6);margin-bottom:12px}
        .card{background:rgba(255,255,255,.025);border:1px solid rgba(255,255,255,.06);border-radius:4px;padding:24px;margin-bottom:18px;transition:border-color .2s}
        .card:focus-within{border-color:rgba(0,255,140,.25)}
        textarea{width:100%;background:transparent;border:none;outline:none;color:#e8e6f0;font-family:'DM Mono',monospace;font-size:14px;line-height:1.7;resize:none}
        textarea::placeholder{color:rgba(232,230,240,.2);font-style:italic}
        .chips{display:flex;flex-wrap:wrap;gap:8px}
        .chip{padding:7px 14px;border-radius:2px;font-size:12px;letter-spacing:.05em;cursor:pointer;border:1px solid rgba(255,255,255,.08);background:transparent;color:rgba(232,230,240,.5);transition:all .15s;font-family:'DM Mono',monospace}
        .chip:hover{border-color:rgba(0,255,140,.3);color:#e8e6f0}
        .chip.on{background:rgba(0,255,140,.1);border-color:rgba(0,255,140,.4);color:#00ff8c}
        .cc{text-align:right;font-size:11px;color:rgba(232,230,240,.2);margin-top:8px}
        .row2{display:flex;gap:20px;flex-wrap:wrap;margin-bottom:18px}
        .col{flex:1;min-width:160px}
        .sel-wrap{position:relative}
        select{width:100%;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.08);border-radius:2px;color:#e8e6f0;font-family:'DM Mono',monospace;font-size:12px;padding:9px 12px;outline:none;cursor:pointer;appearance:none}
        select:focus{border-color:rgba(0,255,140,.3)}
        .arr{position:absolute;right:10px;top:50%;transform:translateY(-50%);color:rgba(0,255,140,.5);pointer-events:none;font-size:10px}
        .btn{width:100%;padding:18px;background:#00ff8c;border:none;border-radius:3px;color:#080b12;font-family:'Syne',sans-serif;font-size:15px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;transition:all .2s;position:relative;overflow:hidden;margin-top:8px}
        .btn:hover:not(:disabled){background:#33ffaa;transform:translateY(-1px);box-shadow:0 8px 32px rgba(0,255,140,.25)}
        .btn:disabled{opacity:.5;cursor:not-allowed;transform:none}
        .bar{position:absolute;bottom:0;left:0;height:2px;background:rgba(8,11,18,.4);animation:lb 1.4s ease-in-out infinite}
        @keyframes lb{0%{width:0%;left:0}50%{width:70%;left:15%}100%{width:0%;left:100%}}
        .err{color:#ff4d6d;font-size:12px;margin-top:10px;word-break:break-word}
        .out{background:rgba(0,255,140,.03);border:1px solid rgba(0,255,140,.15);border-radius:4px;padding:28px;margin-top:32px;animation:fu .4s ease}
        @keyframes fu{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        .out-hdr{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
        .out-lbl{font-size:10px;letter-spacing:.2em;text-transform:uppercase;color:#00ff8c}
        .btns{display:flex;gap:10px}
        .bg{padding:7px 16px;border:1px solid rgba(255,255,255,.1);background:transparent;color:rgba(232,230,240,.6);font-family:'DM Mono',monospace;font-size:11px;border-radius:2px;cursor:pointer;transition:all .15s}
        .bg:hover{border-color:rgba(0,255,140,.3);color:#00ff8c}
        .bc{padding:7px 16px;border:1px solid rgba(0,255,140,.3);background:rgba(0,255,140,.08);color:#00ff8c;font-family:'DM Mono',monospace;font-size:11px;border-radius:2px;cursor:pointer;transition:all .15s}
        .bc:hover{background:rgba(0,255,140,.15)}
        .div{height:1px;background:rgba(255,255,255,.05);margin:20px 0}
        .out-txt{font-size:13px;line-height:1.8;color:#e8e6f0;white-space:pre-wrap;word-break:break-word}
      `}</style>

      <div className="grid-bg" />
      <div className="glow" />

      <div className="wrap">
        <div className="badge">// Prompt Engine v1.0</div>
        <h1>Turn any idea into<br />a <span>perfect prompt</span></h1>
        <p className="sub">Drop a rough thought. Get a precision-engineered prompt that makes AI perform at its ceiling.</p>

        <div className="card">
          <div className="lbl">Your Raw Idea</div>
          <textarea rows={4} placeholder="e.g. I want a landing page for my AI automation SaaS that converts visitors to a waitlist..."
            value={idea} onChange={e => { setIdea(e.target.value); setCharCount(e.target.value.length); }} />
          <div className="cc">{charCount} chars</div>
        </div>

        <div className="card">
          <div className="lbl">What Are You Creating?</div>
          <div className="chips">
            {OUTPUT_TYPES.map(t => (
              <button key={t.id} className={`chip ${outputType === t.id ? "on" : ""}`} onClick={() => setOutputType(t.id)}>
                {t.icon} {t.label}
              </button>
            ))}
          </div>
        </div>

        <div className="row2">
          <div className="col">
            <div className="lbl" style={{ marginBottom: 10 }}>Target AI</div>
            <div className="sel-wrap">
              <select value={aiTarget} onChange={e => setAiTarget(e.target.value)}>
                {AI_TARGETS.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              </select>
              <div className="arr">▾</div>
            </div>
          </div>
          <div className="col">
            <div className="lbl" style={{ marginBottom: 10 }}>Tone</div>
            <div className="sel-wrap">
              <select value={tone} onChange={e => setTone(e.target.value)}>
                {TONES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <div className="arr">▾</div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="lbl">Additional Context <span style={{ color: "rgba(232,230,240,.2)", textTransform: "none", letterSpacing: 0 }}>(optional)</span></div>
          <textarea rows={2} placeholder="Target audience, constraints, style references, competitors, specific requirements..."
            value={context} onChange={e => setContext(e.target.value)} />
        </div>

        <button className="btn" onClick={generate} disabled={loading}>
          {loading ? <>Engineering Your Prompt...<div className="bar" /></> : "Generate Prompt →"}
        </button>

        {error && <div className="err">⚠ {error}</div>}

        {generatedPrompt && (
          <div className="out" ref={outputRef}>
            <div className="out-hdr">
              <div className="out-lbl">// Optimized Prompt Ready</div>
              <div className="btns">
                <button className="bg" onClick={reset}>Reset</button>
                <button className="bc" onClick={copy}>{copied ? "✓ Copied!" : "Copy Prompt"}</button>
              </div>
            </div>
            <div className="div" />
            <div className="out-txt">{generatedPrompt}</div>
          </div>
        )}
      </div>
    </div>
  );
}
