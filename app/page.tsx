"use client";
import { useState, useEffect, useRef } from "react";

const CSS = `
.bvp-page {
  --bg-base: #06060f;
  --bg-surface: #0d0d1f;
  --bg-card: #11112a;
  --bg-card-hover: #16163a;
  --border: rgba(255,255,255,0.08);
  --border-glow: rgba(0,180,255,0.25);
  --blue: #00b4ff;
  --blue-bright: #00d4ff;
  --purple: #7b2fff;
  --purple-bright: #9b5fff;
  --pink: #ff2d7f;
  --text-primary: #f0f0ff;
  --text-secondary: #8888aa;
  --text-muted: #555577;
  --gradient: linear-gradient(135deg,#00d4ff 0%,#9b5fff 100%);
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 20px;
  --shadow-glow: 0 0 40px rgba(0,180,255,0.15);
  --shadow-card: 0 4px 24px rgba(0,0,0,0.4);
  --transition: 0.2s ease;
  --transition-slow: 0.4s ease;
  --orange: #ff6b00;
  --orange-glow: rgba(255,107,0,0.25);
  --orange-dim: rgba(255,107,0,0.12);
  --font-body: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: 'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  font-family: var(--font-body);
  background-color: var(--bg-base);
  color: var(--text-primary);
  line-height: 1.65;
  overflow-x: hidden;
  -webkit-font-smoothing: antialiased;
}
.bvp-page *,
.bvp-page *::before,
.bvp-page *::after { box-sizing: border-box; margin: 0; padding: 0; }
.bvp-page img { max-width: 100%; display: block; }
.bvp-page a { color: inherit; text-decoration: none; }
.bvp-page ul { list-style: none; }
.bvp-page button { cursor: pointer; border: none; background: none; font-family: inherit; }
.bvp-page input, .bvp-page select, .bvp-page textarea { font-family: inherit; }
.bvp-page h1,.bvp-page h2,.bvp-page h3,.bvp-page h4,.bvp-page h5 {
  font-family: var(--font-display); font-weight: 700; line-height: 1.15;
}
.bvp-page .container {
  width: 100%; max-width: 1200px; margin: 0 auto; padding: 0 24px;
}
.bvp-page .section-pad { padding: 100px 0; }
.bvp-page .gradient-text {
  background: var(--gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.bvp-page .accent { color: var(--blue-bright); }

/* BUTTONS */
.bvp-page .btn {
  display: inline-flex; align-items: center; gap: 8px;
  padding: 12px 24px; border-radius: 999px; font-weight: 600;
  font-size: 0.95rem; transition: var(--transition); white-space: nowrap;
}
.bvp-page .btn-primary {
  background: var(--gradient); color: #fff;
  box-shadow: 0 4px 20px rgba(0,180,255,0.3);
}
.bvp-page .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(0,180,255,0.45); }
.bvp-page .btn-ghost {
  background: rgba(255,255,255,0.07); color: var(--text-primary);
  border: 1px solid var(--border);
}
.bvp-page .btn-ghost:hover { background: rgba(255,255,255,0.12); border-color: rgba(255,255,255,0.15); }
.bvp-page .btn-lg { padding: 15px 30px; font-size: 1rem; }
.bvp-page .btn-sm { padding: 8px 18px; font-size: 0.85rem; }
.bvp-page .btn-block { width: 100%; justify-content: center; }

/* CARD */
.bvp-page .card-glass {
  background: rgba(17,17,42,0.7);
  border: 1px solid var(--border);
  border-radius: var(--radius-lg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

/* SECTION HEADER */
.bvp-page .section-header { text-align: center; max-width: 680px; margin: 0 auto 60px; }
.bvp-page .section-header h2 { font-size: clamp(2rem,4vw,2.75rem); margin-bottom: 16px; }
.bvp-page .section-header p { color: var(--text-secondary); font-size: 1.1rem; }
.bvp-page .section-tag {
  display: inline-block; padding: 6px 16px;
  background: rgba(0,180,255,0.1); border: 1px solid rgba(0,180,255,0.25);
  border-radius: 999px; font-size: 0.8rem; font-weight: 600;
  letter-spacing: 0.08em; text-transform: uppercase;
  color: var(--blue-bright); margin-bottom: 20px;
}

/* NAV */
.bvp-page .nav {
  position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
  padding: 16px 0; transition: var(--transition-slow);
}
.bvp-page .nav.scrolled {
  background: rgba(6,6,15,0.9);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border);
  padding: 12px 0;
}
.bvp-page .nav-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 24px;
  display: flex; align-items: center; justify-content: space-between; gap: 24px;
}
.bvp-page .logo {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-display); font-size: 1.3rem; font-weight: 700;
}
.bvp-page .logo-icon { font-size: 1.5rem; color: var(--blue-bright); filter: drop-shadow(0 0 8px var(--blue)); }
.bvp-page .nav-links { display: flex; align-items: center; gap: 8px; }
.bvp-page .nav-links a {
  padding: 8px 16px; border-radius: 999px; font-size: 0.9rem;
  font-weight: 500; color: var(--text-secondary); transition: var(--transition);
}
.bvp-page .nav-links a:hover { color: var(--text-primary); background: rgba(255,255,255,0.06); }
.bvp-page .nav-cta {
  background: var(--gradient) !important; color: #fff !important;
  font-weight: 600 !important; box-shadow: 0 4px 16px rgba(0,180,255,0.3);
}
.bvp-page .nav-cta:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(0,180,255,0.45) !important; }
.bvp-page .nav-toggle { display: none; flex-direction: column; gap: 5px; padding: 8px; }
.bvp-page .nav-toggle span {
  display: block; width: 22px; height: 2px;
  background: var(--text-primary); border-radius: 2px; transition: var(--transition);
}

/* HERO */
.bvp-page .hero {
  position: relative; min-height: 100vh;
  display: flex; align-items: center; padding: 120px 0 80px; overflow: hidden;
}
.bvp-page .hero-bg { position: absolute; inset: 0; z-index: 0; }
.bvp-page .grid-overlay {
  position: absolute; inset: 0;
  background-image: linear-gradient(rgba(0,180,255,0.05) 1px,transparent 1px),
    linear-gradient(90deg,rgba(0,180,255,0.05) 1px,transparent 1px);
  background-size: 50px 50px;
  mask-image: radial-gradient(ellipse at center,black 30%,transparent 75%);
}
.bvp-page .orb { position: absolute; border-radius: 50%; filter: blur(80px); pointer-events: none; }
.bvp-page .orb-1 { width: 600px; height: 600px; background: rgba(0,180,255,0.12); top: -200px; right: -100px; }
.bvp-page .orb-2 { width: 500px; height: 500px; background: rgba(123,47,255,0.12); bottom: -150px; left: -100px; }
.bvp-page .orb-3 { width: 300px; height: 300px; background: rgba(255,45,127,0.08); top: 40%; left: 50%; transform: translate(-50%,-50%); }
.bvp-page .hero-content { position: relative; z-index: 1; text-align: center; max-width: 860px; margin: 0 auto; }
.bvp-page .hero-badge {
  display: inline-flex; align-items: center; gap: 8px; padding: 8px 20px;
  background: rgba(0,180,255,0.1); border: 1px solid rgba(0,180,255,0.2);
  border-radius: 999px; font-size: 0.85rem; font-weight: 500;
  color: var(--blue-bright); margin-bottom: 32px;
}
.bvp-page .badge-dot {
  width: 8px; height: 8px; background: var(--blue-bright);
  border-radius: 50%; animation: bvp-pulse 2s infinite;
}
@keyframes bvp-pulse {
  0%,100% { opacity:1; transform:scale(1); }
  50% { opacity:0.5; transform:scale(1.4); }
}
.bvp-page .hero-headline {
  font-size: clamp(2.5rem,6vw,4.5rem); font-weight: 900;
  line-height: 1.08; margin-bottom: 24px; letter-spacing: -0.02em;
}
.bvp-page .hero-sub {
  font-size: clamp(1rem,2vw,1.2rem); color: var(--text-secondary);
  max-width: 620px; margin: 0 auto 40px; line-height: 1.7;
}
.bvp-page .hero-actions {
  display: flex; gap: 16px; justify-content: center; flex-wrap: wrap; margin-bottom: 60px;
}
.bvp-page .hero-stats {
  display: flex; align-items: center; justify-content: center; gap: 32px; flex-wrap: wrap;
}
.bvp-page .stat { text-align: center; }
.bvp-page .stat-num {
  display: block; font-size: 2.2rem; font-weight: 800; font-family: var(--font-display);
  background: var(--gradient); -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; background-clip: text;
}
.bvp-page .stat-label { font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.06em; font-weight: 500; }
.bvp-page .stat-divider { width: 1px; height: 40px; background: var(--border); }
.bvp-page .hero-scroll-indicator {
  position: absolute; bottom: 32px; left: 50%; transform: translateX(-50%);
  display: flex; flex-direction: column; align-items: center; gap: 8px;
  font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase;
  letter-spacing: 0.08em;
}
.bvp-page .scroll-arrow {
  width: 24px; height: 24px; border-right: 2px solid var(--text-muted);
  border-bottom: 2px solid var(--text-muted); transform: rotate(45deg);
  animation: bvp-scrollBounce 1.5s ease infinite; margin-top: -4px;
}
@keyframes bvp-scrollBounce {
  0%,100% { transform:rotate(45deg) translateY(0); }
  50% { transform:rotate(45deg) translateY(5px); }
}

/* HOW IT WORKS */
.bvp-page .how-it-works { background: var(--bg-surface); }
.bvp-page .steps-grid { display: flex; align-items: center; flex-wrap: wrap; justify-content: center; }
.bvp-page .step-card {
  flex: 1; min-width: 200px; max-width: 260px; padding: 32px 24px;
  text-align: center; background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-lg); transition: var(--transition); position: relative;
}
.bvp-page .step-card:hover { border-color: var(--border-glow); transform: translateY(-4px); box-shadow: var(--shadow-glow); }
.bvp-page .step-num {
  font-size: 3rem; font-weight: 900; font-family: var(--font-display);
  background: var(--gradient); -webkit-background-clip: text;
  -webkit-text-fill-color: transparent; background-clip: text;
  opacity: 0.4; line-height: 1; margin-bottom: 8px;
}
.bvp-page .step-icon { font-size: 2rem; margin-bottom: 12px; }
.bvp-page .step-card h3 { font-size: 1.15rem; margin-bottom: 10px; }
.bvp-page .step-card p { color: var(--text-secondary); font-size: 0.9rem; }
.bvp-page .step-connector {
  width: 60px; height: 2px;
  background: linear-gradient(90deg,var(--blue),var(--purple));
  opacity: 0.3; flex-shrink: 0;
}

/* INDUSTRIES */
.bvp-page .industries { background: var(--bg-surface); }
.bvp-page .industries-grid { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; }
.bvp-page .industry-pill {
  padding: 12px 22px; background: var(--bg-card); border: 1px solid var(--border);
  border-radius: 999px; font-size: 0.9rem; font-weight: 500;
  color: var(--text-secondary); transition: var(--transition); cursor: default;
}
.bvp-page .industry-pill:hover {
  border-color: var(--border-glow); color: var(--text-primary);
  background: rgba(0,180,255,0.07); transform: translateY(-2px);
}

/* BENEFITS */
.bvp-page .benefits { background: var(--bg-base); }
.bvp-page .benefits-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 80px; align-items: center; }
.bvp-page .benefits-left h2 { font-size: clamp(1.8rem,3.5vw,2.5rem); margin-bottom: 20px; }
.bvp-page .benefits-desc { color: var(--text-secondary); margin-bottom: 32px; line-height: 1.7; }
.bvp-page .benefit-item {
  display: flex; gap: 20px; align-items: flex-start;
  padding: 24px 0; border-bottom: 1px solid var(--border); transition: var(--transition);
}
.bvp-page .benefit-item:last-child { border-bottom: none; }
.bvp-page .benefit-item:hover { padding-left: 8px; }
.bvp-page .benefit-icon {
  font-size: 1.5rem; width: 48px; height: 48px;
  background: rgba(0,180,255,0.08); border: 1px solid rgba(0,180,255,0.15);
  border-radius: var(--radius-sm); display: flex; align-items: center;
  justify-content: center; flex-shrink: 0;
}
.bvp-page .benefit-text h4 { font-size: 1rem; margin-bottom: 6px; }
.bvp-page .benefit-text p { font-size: 0.9rem; color: var(--text-secondary); }

/* PRODUCTS SECTION */
.bvp-page .products-grid {
  display: grid; grid-template-columns: repeat(3,1fr); gap: 1.5rem; margin-top: 3rem;
}
.bvp-page .product-card {
  background: var(--bg-card); border: 1px solid var(--border);
  border-radius: var(--radius-md); overflow: hidden; display: flex;
  flex-direction: column; transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  position: relative;
}
.bvp-page .product-card::before {
  content: ''; display: block; height: 3px; background: var(--orange);
  width: 100%; flex-shrink: 0;
}
.bvp-page .product-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 16px 48px var(--orange-glow), 0 4px 24px rgba(0,0,0,0.5);
  border-color: rgba(255,107,0,0.35);
}
.bvp-page .product-card-body { padding: 1.5rem; display: flex; flex-direction: column; flex: 1; }
.bvp-page .product-cat-badge {
  display: inline-block; font-size: 0.7rem; font-weight: 700;
  letter-spacing: 0.08em; text-transform: uppercase; color: var(--orange);
  background: var(--orange-dim); border: 1px solid rgba(255,107,0,0.25);
  border-radius: 4px; padding: 3px 8px; margin-bottom: 0.75rem; width: fit-content;
}
.bvp-page .product-card h3 {
  font-family: var(--font-display); font-size: 1.05rem; font-weight: 700;
  color: var(--text-primary); margin-bottom: 0.6rem; line-height: 1.3;
}
.bvp-page .product-card p { font-size: 0.875rem; color: var(--text-secondary); line-height: 1.6; flex: 1; }
.bvp-page .product-card-footer {
  padding: 1rem 1.5rem 1.5rem; display: flex;
  align-items: center; justify-content: space-between; gap: 1rem;
}
.bvp-page .product-price { font-size: 0.875rem; font-weight: 700; color: var(--orange); }
.bvp-page .btn-orange {
  display: inline-flex; align-items: center; gap: 6px;
  background: var(--orange); color: #fff; font-size: 0.8rem; font-weight: 700;
  letter-spacing: 0.03em; padding: 8px 16px; border-radius: var(--radius-sm);
  border: none; cursor: pointer; text-decoration: none;
  transition: background 0.15s ease, transform 0.15s ease, box-shadow 0.15s ease;
  white-space: nowrap;
}
.bvp-page .btn-orange:hover { background: #ff8533; transform: translateY(-1px); box-shadow: 0 4px 16px var(--orange-glow); }
.bvp-page .products-cta-wrap { text-align: center; margin-top: 2.5rem; }
.bvp-page .btn-outline-orange {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: var(--orange); font-size: 0.9rem; font-weight: 700;
  letter-spacing: 0.03em; padding: 12px 28px; border-radius: var(--radius-sm);
  border: 2px solid var(--orange); cursor: pointer; text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
}
.bvp-page .btn-outline-orange:hover {
  background: var(--orange); color: #fff;
  transform: translateY(-2px); box-shadow: 0 8px 24px var(--orange-glow);
}
.bvp-page .product-card-featured {
  border-color: rgba(255,107,0,0.4);
  box-shadow: 0 0 0 1px rgba(255,107,0,0.15), inset 0 0 40px rgba(255,107,0,0.04);
}
.bvp-page .product-card-featured::before { background: linear-gradient(90deg,var(--orange),#ffaa44); }
.bvp-page .product-live-badge {
  display: inline-flex; align-items: center; gap: 5px; font-size: 0.65rem;
  font-weight: 800; letter-spacing: 0.1em; text-transform: uppercase;
  color: #22c55e; background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.3);
  border-radius: 4px; padding: 2px 7px; margin-bottom: 0.6rem; width: fit-content;
}
.bvp-page .live-dot {
  width: 5px; height: 5px; border-radius: 50%; background: #22c55e;
  animation: bvp-pulseDot 1.5s ease-in-out infinite; flex-shrink: 0;
}
@keyframes bvp-pulseDot {
  0%,100% { opacity:1; transform:scale(1); }
  50% { opacity:0.4; transform:scale(1.6); }
}

/* PIPELINE / KANBAN */
.bvp-page .pipeline-section { background: var(--bg-surface); padding: 6rem 0; }
.bvp-page .pipeline-kanban-wrap { overflow-x: auto; padding-bottom: 1rem; margin-top: 2rem; }
.bvp-page .pipeline-kanban-wrap::-webkit-scrollbar { height: 4px; }
.bvp-page .pipeline-kanban-wrap::-webkit-scrollbar-track { background: var(--bg-card); border-radius: 2px; }
.bvp-page .pipeline-kanban-wrap::-webkit-scrollbar-thumb { background: #2a2a4a; border-radius: 2px; }
.bvp-page .pipeline-kanban { display: flex; gap: 14px; min-width: max-content; }
.bvp-page .kb-col { width: 240px; flex-shrink: 0; }
.bvp-page .kb-col-hdr {
  display: flex; align-items: center; gap: 8px; padding: 10px 14px;
  background: var(--bg-card); border: 1px solid var(--border);
  border-top: 3px solid var(--col-accent,#444); border-bottom: none;
  border-radius: 8px 8px 0 0;
}
.bvp-page .kb-col-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--col-accent,#444); flex-shrink: 0; }
.bvp-page .kb-col-dot.glow { box-shadow: 0 0 8px #22c55e; }
.bvp-page .kb-col-title {
  font-family: var(--font-display); font-size: 0.72rem; font-weight: 700;
  letter-spacing: 0.1em; text-transform: uppercase; color: var(--col-accent,#888); flex: 1;
}
.bvp-page .kb-col-count {
  font-size: 0.65rem; font-weight: 700; color: var(--text-muted);
  background: rgba(255,255,255,0.05); border: 1px solid var(--border);
  padding: 1px 7px; border-radius: 20px;
}
.bvp-page .kb-col-body {
  background: var(--bg-card); border: 1px solid var(--border); border-top: none;
  border-radius: 0 0 8px 8px; padding: 8px; display: flex;
  flex-direction: column; gap: 7px; min-height: 120px;
}
.bvp-page .kb-card {
  background: var(--bg-base); border: 1px solid var(--border);
  border-radius: 6px; padding: 10px; transition: border-color 0.15s, transform 0.15s;
}
.bvp-page .kb-card:hover { border-color: #2a2a4a; transform: translateY(-1px); }
.bvp-page .kb-cat { display: flex; align-items: center; gap: 4px; font-size: 0.65rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 5px; }
.bvp-page .kb-cat-dot { width: 5px; height: 5px; border-radius: 50%; flex-shrink: 0; }
.bvp-page .kb-name { font-family: var(--font-display); font-size: 0.82rem; font-weight: 700; color: var(--text-primary); line-height: 1.25; margin-bottom: 3px; }
.bvp-page .kb-desc { font-size: 0.72rem; color: var(--text-muted); line-height: 1.4; margin-bottom: 7px; }
.bvp-page .kb-footer { display: flex; align-items: center; justify-content: space-between; }
.bvp-page .kb-price { font-family: var(--font-display); font-size: 0.8rem; font-weight: 700; color: #00b4ff; }
.bvp-page .kb-live-badge {
  display: inline-flex; align-items: center; gap: 3px; font-size: 0.6rem; font-weight: 800;
  letter-spacing: 0.08em; text-transform: uppercase; color: #22c55e;
  background: rgba(34,197,94,0.1); border: 1px solid rgba(34,197,94,0.25);
  padding: 2px 6px; border-radius: 20px;
}
.bvp-page .kb-live-dot { width: 4px; height: 4px; border-radius: 50%; background: #22c55e; animation: bvp-pulseDot 1.5s ease-in-out infinite; }
.bvp-page .pipeline-view-cta { text-align: center; margin-top: 2rem; }

/* WISHLIST */
.bvp-page .wishlist { background: var(--bg-surface); }
.bvp-page .wishlist-layout { display: grid; grid-template-columns: 1.3fr 1fr; gap: 32px; align-items: start; }
.bvp-page .wishlist-form, .bvp-page .waitlist-form { padding: 40px; }
.bvp-page .wishlist-form h3, .bvp-page .waitlist-form h3 { font-size: 1.5rem; margin-bottom: 8px; }
.bvp-page .form-sub { color: var(--text-secondary); font-size: 0.9rem; margin-bottom: 28px; }
.bvp-page .form-group { display: flex; flex-direction: column; gap: 8px; margin-bottom: 20px; }
.bvp-page label { font-size: 0.85rem; font-weight: 600; color: var(--text-secondary); letter-spacing: 0.02em; }
.bvp-page .req { color: var(--pink); }
.bvp-page input[type="text"],
.bvp-page input[type="email"],
.bvp-page select,
.bvp-page textarea {
  width: 100%; background: rgba(255,255,255,0.04); border: 1px solid var(--border);
  border-radius: var(--radius-sm); color: var(--text-primary);
  padding: 12px 16px; font-size: 0.95rem; transition: var(--transition); outline: none;
}
.bvp-page input[type="text"]:focus,
.bvp-page input[type="email"]:focus,
.bvp-page select:focus,
.bvp-page textarea:focus {
  border-color: var(--blue); background: rgba(0,180,255,0.05);
  box-shadow: 0 0 0 3px rgba(0,180,255,0.1);
}
.bvp-page input::placeholder, .bvp-page textarea::placeholder { color: var(--text-muted); }
.bvp-page select option { background: var(--bg-card); color: var(--text-primary); }
.bvp-page textarea { resize: vertical; min-height: 100px; }
.bvp-page .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
.bvp-page .priority-options { display: flex; gap: 10px; flex-wrap: wrap; }
.bvp-page .priority-opt {
  display: flex; align-items: center; gap: 8px; padding: 10px 18px;
  background: rgba(255,255,255,0.04); border: 1px solid var(--border);
  border-radius: 999px; cursor: pointer; transition: var(--transition);
  font-size: 0.85rem; font-weight: 500; color: var(--text-secondary);
}
.bvp-page .priority-opt.selected { background: rgba(0,180,255,0.1); border-color: var(--blue); color: var(--blue-bright); }
.bvp-page .priority-opt:hover { border-color: rgba(0,180,255,0.4); color: var(--text-primary); }
.bvp-page .checkbox-label {
  display: flex; gap: 12px; align-items: flex-start; cursor: pointer;
  color: var(--text-secondary); font-size: 0.85rem; font-weight: 400;
}
.bvp-page .form-disclaimer { text-align: center; font-size: 0.78rem; color: var(--text-muted); margin-top: 12px; }
.bvp-page .form-success { text-align: center; padding: 32px 16px; animation: bvp-fadeIn 0.4s ease; }
.bvp-page .success-icon { font-size: 3rem; margin-bottom: 12px; }
.bvp-page .form-success h4 { font-size: 1.3rem; margin-bottom: 10px; color: var(--blue-bright); }
.bvp-page .form-success p { color: var(--text-secondary); }
.bvp-page .success-number { margin-top: 16px; font-size: 0.9rem; color: var(--text-muted); font-style: italic; }
@keyframes bvp-fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
.bvp-page .wishlist-sidebar { display: flex; flex-direction: column; gap: 20px; position: sticky; top: 90px; }
.bvp-page .top-wishes { padding: 28px; }
.bvp-page .top-wishes h4 { font-size: 1.1rem; margin-bottom: 6px; }
.bvp-page .wishes-sub { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 20px; }
.bvp-page .wish-list { display: flex; flex-direction: column; }
.bvp-page .wish-item { display: flex; gap: 14px; align-items: center; padding: 12px 0; border-bottom: 1px solid var(--border); }
.bvp-page .wish-item:last-child { border-bottom: none; }
.bvp-page .wish-votes { display: flex; flex-direction: column; align-items: center; gap: 2px; min-width: 36px; }
.bvp-page .vote-btn { font-size: 0.7rem; color: var(--text-muted); padding: 2px 6px; border-radius: 4px; transition: var(--transition); line-height: 1; }
.bvp-page .vote-btn:hover, .bvp-page .vote-btn.voted { color: var(--blue-bright); background: rgba(0,180,255,0.1); }
.bvp-page .vote-count { font-size: 0.85rem; font-weight: 700; color: var(--text-secondary); }
.bvp-page .vote-count.voted-count { color: var(--blue-bright); }
.bvp-page .wish-details { display: flex; flex-direction: column; gap: 3px; flex: 1; }
.bvp-page .wish-title { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
.bvp-page .wish-industry {
  font-size: 0.75rem; color: var(--blue-bright); background: rgba(0,180,255,0.1);
  padding: 2px 8px; border-radius: 999px; display: inline-block; width: fit-content;
}
.bvp-page .wishlist-tip { padding: 24px; }
.bvp-page .tip-icon { font-size: 1.5rem; margin-bottom: 10px; }
.bvp-page .wishlist-tip h4 { font-size: 1rem; margin-bottom: 12px; }
.bvp-page .wishlist-tip ul { display: flex; flex-direction: column; gap: 8px; }
.bvp-page .wishlist-tip li { font-size: 0.85rem; color: var(--text-secondary); padding-left: 16px; position: relative; }
.bvp-page .wishlist-tip li::before { content: '✓'; position: absolute; left: 0; color: var(--blue-bright); font-weight: 700; }

/* WAITLIST */
.bvp-page .waitlist { background: var(--bg-base); position: relative; overflow: hidden; }
.bvp-page .waitlist::before {
  content: ''; position: absolute; top: -200px; left: 50%; transform: translateX(-50%);
  width: 800px; height: 800px;
  background: radial-gradient(circle,rgba(0,180,255,0.06) 0%,transparent 65%);
  pointer-events: none;
}
.bvp-page .waitlist-inner { display: grid; grid-template-columns: 1fr 1.1fr; gap: 80px; align-items: start; }
.bvp-page .waitlist-left h2 { font-size: clamp(2rem,4vw,2.8rem); margin-bottom: 20px; }
.bvp-page .waitlist-left > p { color: var(--text-secondary); line-height: 1.7; margin-bottom: 36px; }
.bvp-page .waitlist-perks { display: flex; flex-direction: column; gap: 12px; margin-bottom: 36px; }
.bvp-page .perk { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; color: var(--text-secondary); }
.bvp-page .perk-icon { font-size: 1.2rem; width: 24px; text-align: center; }
.bvp-page .waitlist-social-proof { display: flex; align-items: center; gap: 12px; font-size: 0.9rem; color: var(--text-secondary); }
.bvp-page .waitlist-social-proof strong { color: var(--text-primary); }
.bvp-page .avatars { display: flex; align-items: center; }
.bvp-page .avatar {
  width: 32px; height: 32px; border-radius: 50%; border: 2px solid var(--bg-base);
  background: var(--gradient); display: flex; align-items: center;
  justify-content: center; font-size: 0.65rem; font-weight: 700;
  margin-left: -8px; flex-shrink: 0;
}
.bvp-page .avatar:first-child { margin-left: 0; }

/* FAQ */
.bvp-page .faq { background: var(--bg-surface); }
.bvp-page .faq-grid { max-width: 800px; margin: 0 auto; display: flex; flex-direction: column; }
.bvp-page .faq-item { border-bottom: 1px solid var(--border); }
.bvp-page .faq-item:first-child { border-top: 1px solid var(--border); }
.bvp-page .faq-question {
  width: 100%; display: flex; justify-content: space-between; align-items: center;
  gap: 16px; padding: 22px 0; text-align: left; font-size: 1rem; font-weight: 600;
  color: var(--text-primary); transition: var(--transition);
}
.bvp-page .faq-question:hover { color: var(--blue-bright); }
.bvp-page .faq-icon { transition: var(--transition); flex-shrink: 0; color: var(--text-muted); }
.bvp-page .faq-icon.open { transform: rotate(180deg); }
.bvp-page .faq-answer { max-height: 0; overflow: hidden; transition: max-height 0.35s ease, padding 0.35s ease; }
.bvp-page .faq-answer.open { max-height: 300px; padding-bottom: 22px; }
.bvp-page .faq-answer p { color: var(--text-secondary); line-height: 1.7; }

/* FOOTER */
.bvp-page .footer { background: var(--bg-surface); border-top: 1px solid var(--border); padding: 64px 0 32px; }
.bvp-page .footer-top { display: grid; grid-template-columns: 1.4fr 2fr; gap: 60px; margin-bottom: 48px; }
.bvp-page .footer-brand .logo { margin-bottom: 16px; }
.bvp-page .footer-brand > p { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.65; max-width: 300px; margin-bottom: 20px; }
.bvp-page .footer-social { display: flex; gap: 10px; }
.bvp-page .social-link {
  width: 36px; height: 36px; border-radius: 50%; background: rgba(255,255,255,0.06);
  border: 1px solid var(--border); display: flex; align-items: center;
  justify-content: center; font-size: 0.85rem; font-weight: 700;
  color: var(--text-secondary); transition: var(--transition);
}
.bvp-page .social-link:hover { background: rgba(0,180,255,0.1); border-color: var(--border-glow); color: var(--blue-bright); }
.bvp-page .footer-links { display: grid; grid-template-columns: repeat(3,1fr); gap: 32px; }
.bvp-page .footer-col h5 { font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: var(--text-primary); margin-bottom: 16px; }
.bvp-page .footer-col ul { display: flex; flex-direction: column; gap: 10px; }
.bvp-page .footer-col a { font-size: 0.9rem; color: var(--text-muted); transition: var(--transition); }
.bvp-page .footer-col a:hover { color: var(--text-primary); }
.bvp-page .footer-bottom { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; padding-top: 24px; border-top: 1px solid var(--border); }
.bvp-page .footer-bottom p { font-size: 0.8rem; color: var(--text-muted); }
.bvp-page .footer-legal { display: flex; gap: 20px; }
.bvp-page .footer-legal a { font-size: 0.8rem; color: var(--text-muted); transition: var(--transition); }
.bvp-page .footer-legal a:hover { color: var(--text-secondary); }

/* ANIMATE */
.bvp-page .fade-in-up { opacity: 0; transform: translateY(30px); transition: opacity 0.6s ease, transform 0.6s ease; }
.bvp-page .fade-in-up.visible { opacity: 1; transform: translateY(0); }

/* RESPONSIVE */
@media (max-width: 1024px) {
  .bvp-page .benefits-layout { grid-template-columns: 1fr; gap: 48px; }
  .bvp-page .wishlist-layout { grid-template-columns: 1fr; }
  .bvp-page .wishlist-sidebar { position: static; display: grid; grid-template-columns: 1fr 1fr; }
  .bvp-page .waitlist-inner { grid-template-columns: 1fr; gap: 48px; }
  .bvp-page .footer-top { grid-template-columns: 1fr; gap: 40px; }
  .bvp-page .products-grid { grid-template-columns: repeat(2,1fr); }
}
@media (max-width: 768px) {
  .bvp-page .section-pad { padding: 70px 0; }
  .bvp-page .nav-links {
    display: none; flex-direction: column; position: fixed;
    top: 72px; left: 0; right: 0; background: rgba(6,6,15,0.97);
    padding: 20px 24px 28px; border-bottom: 1px solid var(--border);
    backdrop-filter: blur(20px);
  }
  .bvp-page .nav-links.open { display: flex; }
  .bvp-page .nav-links li { width: 100%; }
  .bvp-page .nav-links a { display: block; width: 100%; text-align: center; padding: 12px 24px; border-radius: var(--radius-sm); }
  .bvp-page .nav-toggle { display: flex; }
  .bvp-page .steps-grid { flex-direction: column; align-items: stretch; gap: 16px; }
  .bvp-page .step-connector { display: none; }
  .bvp-page .step-card { max-width: 100%; }
  .bvp-page .wishlist-form, .bvp-page .waitlist-form { padding: 28px 20px; }
  .bvp-page .wishlist-sidebar { grid-template-columns: 1fr; }
  .bvp-page .form-row { grid-template-columns: 1fr; }
  .bvp-page .footer-links { grid-template-columns: 1fr 1fr; }
  .bvp-page .footer-bottom { flex-direction: column; text-align: center; }
  .bvp-page .hero-stats { gap: 20px; }
  .bvp-page .stat-divider { display: none; }
  .bvp-page .products-grid { grid-template-columns: 1fr; }
}
@media (max-width: 480px) {
  .bvp-page .hero-headline { font-size: 2.2rem; }
  .bvp-page .hero-actions { flex-direction: column; align-items: center; }
  .bvp-page .hero-actions .btn { width: 100%; justify-content: center; }
  .bvp-page .footer-links { grid-template-columns: 1fr; }
}
`;

const INITIAL_VOTES: Record<string, number> = { "1": 47, "2": 39, "3": 31, "4": 28, "5": 22 };
const WISH_ITEMS = [
  { id: "1", title: "Auto-Payroll Processing Bot", industry: "Finance" },
  { id: "2", title: "Social Media Reply Bot", industry: "Marketing" },
  { id: "3", title: "Restaurant Reservation Manager Bot", industry: "Hospitality" },
  { id: "4", title: "Legal Document Review Bot", industry: "Legal" },
  { id: "5", title: "Construction Job Scheduling Bot", industry: "Construction" },
];
const FAQ_ITEMS = [
  { q: "Do I need technical knowledge to use Bot Vault Pro bots?", a: "Not at all. Our bots are fully managed — we handle all the setup, configuration, and maintenance. You simply tell us what you need automated, and we build and run it for you." },
  { q: "How long does it take to deploy a bot?", a: "Most standard bots are deployed within 3–7 business days. Complex custom bots with deep integrations may take 2–4 weeks. Either way, it's dramatically faster than building in-house." },
  { q: "What systems and tools do your bots integrate with?", a: "Our bots integrate with 200+ business tools including Salesforce, HubSpot, Shopify, QuickBooks, Xero, Slack, Gmail, Outlook, Google Sheets, Zapier, and many more. If you use it, we can connect to it." },
  { q: "How is Bot Vault Pro priced?", a: "Pricing is based on the bots you deploy and usage volume. We offer monthly subscription plans with no long-term contracts. Founding members from our waitlist receive special discounted pricing. Full pricing will be announced at launch." },
  { q: "Is my business data safe?", a: "Absolutely. Security is foundational to everything we build. All data is encrypted in transit and at rest, we operate on SOC 2 compliant infrastructure, and we never share or sell your data to third parties." },
  { q: "What if I want a bot that's not in your current catalog?", a: "Submit it to our Wishlist! We take custom requests seriously. Highly-requested ideas get prioritized on our roadmap, and we also offer custom bot development for specific business needs." },
];

export default function HomePage() {
  const [navScrolled, setNavScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [votes, setVotes] = useState<Record<string, number>>(INITIAL_VOTES);
  const [voted, setVoted] = useState<Set<string>>(new Set());
  const [wishPriority, setWishPriority] = useState("important");
  const [wishSubmitted, setWishSubmitted] = useState(false);
  const [wlSubmitted, setWlSubmitted] = useState(false);
  const [wlCount, setWlCount] = useState(1247);
  const [wlPosition, setWlPosition] = useState(0);
  const [wishSubmitting, setWishSubmitting] = useState(false);
  const [wlSubmitting, setWlSubmitting] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  // Load Google Fonts
  useEffect(() => {
    if (document.getElementById("bvp-fonts")) return;
    const link = document.createElement("link");
    link.id = "bvp-fonts";
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&display=swap";
    document.head.appendChild(link);
  }, []);

  // Nav scroll
  useEffect(() => {
    const handler = () => setNavScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Scroll reveal
  useEffect(() => {
    const root = pageRef.current;
    if (!root) return;
    const els = root.querySelectorAll(".fade-in-up");
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            setTimeout(() => entry.target.classList.add("visible"), (i % 6) * 60);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Load saved votes
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("bvp_voted") || "[]");
      setVoted(new Set(saved));
    } catch {}
  }, []);

  function handleVote(id: string) {
    if (voted.has(id)) return;
    const next = new Set(voted);
    next.add(id);
    setVoted(next);
    localStorage.setItem("bvp_voted", JSON.stringify(Array.from(next)));
    setVotes((v) => ({ ...v, [id]: (v[id] || 0) + 1 }));
  }

  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    }
    setMenuOpen(false);
  }

  function handleWishlistSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setWishSubmitting(true);
    setTimeout(() => { setWishSubmitting(false); setWishSubmitted(true); }, 800);
  }

  function handleWaitlistSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setWlSubmitting(true);
    const newCount = wlCount + 1;
    setTimeout(() => {
      setWlSubmitting(false);
      setWlSubmitted(true);
      setWlCount(newCount);
      setWlPosition(newCount);
      localStorage.setItem("bvp_wl_count", String(newCount));
    }, 800);
  }

  const sortedWishes = [...WISH_ITEMS].sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0));

  return (
    <div className="bvp-page" ref={pageRef}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      {/* NAV */}
      <nav className={`nav${navScrolled ? " scrolled" : ""}`} id="nav">
        <div className="nav-inner">
          <button className="logo" onClick={() => scrollTo("hero")} style={{ background: "none", border: "none" }}>
            <span className="logo-icon">⬡</span>
            <span className="logo-text">Bot<span className="accent">Vault</span>Pro</span>
          </button>
          <ul className={`nav-links${menuOpen ? " open" : ""}`}>
            <li><button onClick={() => scrollTo("products")} style={{ background: "none", border: "none", padding: "8px 16px", borderRadius: "999px", fontSize: "0.9rem", fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer", transition: "var(--transition)", fontFamily: "inherit" }}>Products</button></li>
            <li><button onClick={() => scrollTo("pipeline")} style={{ background: "none", border: "none", padding: "8px 16px", borderRadius: "999px", fontSize: "0.9rem", fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer", transition: "var(--transition)", fontFamily: "inherit" }}>Pipeline</button></li>
            <li><button onClick={() => scrollTo("wishlist")} style={{ background: "none", border: "none", padding: "8px 16px", borderRadius: "999px", fontSize: "0.9rem", fontWeight: 500, color: "var(--text-secondary)", cursor: "pointer", transition: "var(--transition)", fontFamily: "inherit" }}>Wishlist</button></li>
            <li><button onClick={() => scrollTo("waitlist")} className="nav-cta" style={{ padding: "8px 16px", borderRadius: "999px", fontSize: "0.9rem", cursor: "pointer", fontFamily: "inherit" }}>Join Waitlist</button></li>
          </ul>
          <button
            className={`nav-toggle${menuOpen ? " open" : ""}`}
            onClick={() => setMenuOpen((m) => !m)}
            aria-label="Toggle menu"
          >
            <span /><span /><span />
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-bg">
          <div className="grid-overlay" />
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
        </div>
        <div className="container hero-content">
          <div className="hero-badge">
            <span className="badge-dot" />
            Now accepting founding member applications
          </div>
          <h1 className="hero-headline">
            Unlock the Power of<br />
            <span className="gradient-text">Intelligent Automation</span><br />
            for Your Business
          </h1>
          <p className="hero-sub">
            Bot Vault Pro engineers custom automation bots that eliminate repetitive work,
            supercharge revenue, and scale operations across any industry — so your team
            can focus on what matters most.
          </p>
          <div className="hero-actions">
            <button className="btn btn-primary btn-lg" onClick={() => scrollTo("waitlist")}>
              <span>Join the Waitlist</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </button>
            <button className="btn btn-ghost btn-lg" onClick={() => scrollTo("products")}>See Our Products</button>
          </div>
          <div className="hero-stats">
            <div className="stat"><span className="stat-num">10+</span><span className="stat-label">Bot Categories</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">15+</span><span className="stat-label">Industries Served</span></div>
            <div className="stat-divider" />
            <div className="stat"><span className="stat-num">∞</span><span className="stat-label">Hours Saved</span></div>
          </div>
        </div>
        <div className="hero-scroll-indicator">
          <span>Scroll to explore</span>
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="how-it-works section-pad" id="how">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">How It Works</div>
            <h2>Automation made <span className="gradient-text">simple</span></h2>
            <p>From consultation to deployment, we handle everything.</p>
          </div>
          <div className="steps-grid">
            {[
              { n: "01", icon: "🔍", title: "Discover", desc: "We audit your workflows to identify the highest-impact automation opportunities." },
              { n: "02", icon: "⚙️", title: "Build", desc: "Our engineers craft precision bots tailored to your exact business needs." },
              { n: "03", icon: "🚀", title: "Deploy", desc: "Your bots go live and start saving time and money from day one." },
              { n: "04", icon: "📈", title: "Scale", desc: "We monitor, optimize, and expand your automation suite as you grow." },
            ].map((step, i) => (
              <>
                <div className="step-card fade-in-up" key={step.n}>
                  <div className="step-num">{step.n}</div>
                  <div className="step-icon">{step.icon}</div>
                  <h3>{step.title}</h3>
                  <p>{step.desc}</p>
                </div>
                {i < 3 && <div className="step-connector" key={`conn-${i}`} />}
              </>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="section-pad" id="products">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">The Vault</div>
            <h2>THE <span className="gradient-text">VAULT</span></h2>
            <p>Tools built to recover money you&apos;re already losing — and save hours you can&apos;t get back. Every product ships instantly. Start using it today.</p>
          </div>
          <div className="products-grid">
            {[
              { featured: true, live: true, badge: "Assessment Tool", title: "BVP AI Readiness Assessment", desc: "Find out exactly where your business stands with AI — and what to implement first. A structured audit that scores your operations across 5 key areas and gives you a prioritized action plan.", price: "Starting at $27" },
              { featured: true, live: true, badge: "Profit Tool", title: "BVP Profit Leak Audit", desc: "The average trades business loses $40K–$120K per year to invisible profit leaks. This audit identifies every leak in your pricing, collections, follow-up, and scheduling — and shows you how to plug them.", price: "Starting at $27" },
              { featured: false, live: false, badge: "Sales Tool", title: "BVP Estimating & Sales Audit", desc: "Stop leaving money on the table. Audit your estimating process, close rate, and sales approach to find where you're losing jobs you should be winning — and fix it fast.", price: "Starting at $27" },
              { featured: true, live: true, badge: "Business Tool", title: "BVP Business Health Scorecard", desc: "A comprehensive scorecard that grades your business across operations, cash flow, customer experience, and growth — with specific recommendations to move from surviving to scaling.", price: "Starting at $27" },
              { featured: false, live: false, badge: "Setup Guide", title: "BVP AI Setup Guide", desc: "Step-by-step guide to setting up your first AI agent for your trades business. No tech experience required. Get your AI running in an afternoon and start saving hours every week.", price: "Starting at $47" },
              { featured: false, live: false, badge: "Advanced Guide", title: "BVP AI Agent Factory", desc: "Build a fleet of AI agents that run your back office. This advanced guide walks you through creating, configuring, and deploying multiple AI agents for estimating, follow-up, invoicing, and more.", price: "Starting at $97" },
            ].map((p) => (
              <div className={`product-card${p.featured ? " product-card-featured" : ""} fade-in-up`} key={p.title}>
                <div className="product-card-body">
                  {p.live && <div className="product-live-badge"><span className="live-dot" /> Live on Gumroad</div>}
                  <div className="product-cat-badge">{p.badge}</div>
                  <h3>{p.title}</h3>
                  <p>{p.desc}</p>
                </div>
                <div className="product-card-footer">
                  <span className="product-price">{p.price}</span>
                  <a href="https://botvaultpro.gumroad.com" target="_blank" rel="noopener noreferrer" className="btn-orange">Buy Now →</a>
                </div>
              </div>
            ))}
          </div>
          <div className="products-cta-wrap">
            <a href="https://botvaultpro.gumroad.com" target="_blank" rel="noopener noreferrer" className="btn-outline-orange">View All Products on Gumroad →</a>
          </div>
        </div>
      </section>

      {/* INDUSTRIES */}
      <section className="industries section-pad" id="industries">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Industries</div>
            <h2>Built for every <span className="gradient-text">industry</span></h2>
            <p>No matter your sector, Bot Vault Pro has automation solutions ready to deploy.</p>
          </div>
          <div className="industries-grid">
            {["🏪 Retail","🏥 Healthcare","🏦 Finance & Banking","🏠 Real Estate","🎓 Education","🏭 Manufacturing","🍕 Restaurants & Food","🚚 Logistics & Supply Chain","⚖️ Legal","🏗️ Construction","🌐 SaaS & Tech","🎯 Marketing Agencies","🏨 Hospitality","💼 Professional Services","🛡️ Insurance","+ Many More"].map((pill) => (
              <div className="industry-pill fade-in-up" key={pill}>{pill}</div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits section-pad" id="benefits">
        <div className="container">
          <div className="benefits-layout">
            <div className="benefits-left">
              <div className="section-tag">Why Bot Vault Pro</div>
              <h2>Your unfair <span className="gradient-text">competitive advantage</span></h2>
              <p className="benefits-desc">While your competitors are stuck in repetitive manual processes, your business runs 24/7 on intelligent automation. Bot Vault Pro isn&apos;t just software — it&apos;s your strategic edge.</p>
              <button className="btn btn-primary" onClick={() => scrollTo("waitlist")}>Get Early Access</button>
            </div>
            <div className="benefits-right">
              {[
                { icon: "⚡", title: "Lightning Fast Deployment", desc: "Most bots are live within days, not months. No lengthy enterprise sales cycles." },
                { icon: "🔧", title: "Custom-Built, Not Cookie-Cutter", desc: "Every bot is engineered for your specific workflows, tools, and business rules." },
                { icon: "🛡️", title: "Enterprise-Grade Security", desc: "Your data stays yours. SOC 2 compliant infrastructure with end-to-end encryption." },
                { icon: "📊", title: "Measurable ROI", desc: "Real-time dashboards show exactly how much time and money your bots are saving." },
                { icon: "🔄", title: "Continuous Optimization", desc: "We proactively monitor and improve your bots as your business evolves." },
              ].map((b) => (
                <div className="benefit-item fade-in-up" key={b.title}>
                  <div className="benefit-icon">{b.icon}</div>
                  <div className="benefit-text"><h4>{b.title}</h4><p>{b.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* WISHLIST */}
      <section className="wishlist section-pad" id="wishlist">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Bot Wishlist</div>
            <h2>Tell us what to <span className="gradient-text">build next</span></h2>
            <p>Got a business process that&apos;s eating your time? Submit it here. The most-requested ideas get built first — founding members get priority access.</p>
          </div>
          <div className="wishlist-layout">
            <div className="wishlist-form-wrap">
              <form className="wishlist-form card-glass" onSubmit={handleWishlistSubmit} noValidate>
                {wishSubmitted ? (
                  <div className="form-success">
                    <div className="success-icon">🎉</div>
                    <h4>Idea submitted!</h4>
                    <p>Thank you! Your bot idea is now in the vault. We review every submission and prioritize based on demand. We&apos;ll reach out when we start building yours.</p>
                  </div>
                ) : (
                  <>
                    <h3>Submit Your Bot Idea</h3>
                    <p className="form-sub">Describe the automation you wish existed for your business.</p>
                    <div className="form-group">
                      <label>Your Name</label>
                      <input type="text" name="wishName" placeholder="Jane Smith" autoComplete="name" />
                    </div>
                    <div className="form-group">
                      <label>Email Address <span className="req">*</span></label>
                      <input type="email" name="wishEmail" placeholder="jane@company.com" required autoComplete="email" />
                    </div>
                    <div className="form-group">
                      <label>Your Industry <span className="req">*</span></label>
                      <select name="wishIndustry" required>
                        <option value="">Select your industry...</option>
                        {["Retail","Healthcare","Finance & Banking","Real Estate","Education","Manufacturing","Restaurants & Food","Logistics & Supply Chain","Legal","Construction","SaaS & Technology","Marketing / Agency","Hospitality","Professional Services","Insurance","Other"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Bot Idea Name <span className="req">*</span></label>
                      <input type="text" name="wishBotName" placeholder="e.g. Auto-Scheduling Bot" required />
                    </div>
                    <div className="form-group">
                      <label>Describe the Problem / Automation <span className="req">*</span></label>
                      <textarea name="wishDescription" rows={4} placeholder="What repetitive task or process would you like automated? What would this bot do?" required />
                    </div>
                    <div className="form-group">
                      <label>Expected Business Impact</label>
                      <input type="text" name="wishImpact" placeholder="e.g. Save 20 hrs/week, increase revenue by 15%" />
                    </div>
                    <div className="form-group">
                      <label>Priority Level</label>
                      <div className="priority-options">
                        {[["nice-to-have","Nice to Have"],["important","Important"],["critical","Critical Need"]].map(([val, label]) => (
                          <button type="button" key={val} className={`priority-opt${wishPriority === val ? " selected" : ""}`} onClick={() => setWishPriority(val)}>{label}</button>
                        ))}
                      </div>
                    </div>
                    <button type="submit" className="btn btn-primary btn-block" disabled={wishSubmitting}>
                      {wishSubmitting ? <span>Submitting...</span> : <><span>Submit My Bot Idea</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
                    </button>
                  </>
                )}
              </form>
            </div>
            <div className="wishlist-sidebar">
              <div className="top-wishes card-glass">
                <h4>🔥 Top Requested Bots</h4>
                <p className="wishes-sub">Upvote ideas or see what the community wants built.</p>
                <ul className="wish-list">
                  {sortedWishes.map((item) => (
                    <li className="wish-item" key={item.id}>
                      <div className="wish-votes">
                        <button className={`vote-btn${voted.has(item.id) ? " voted" : ""}`} onClick={() => handleVote(item.id)} aria-label="Upvote">▲</button>
                        <span className={`vote-count${voted.has(item.id) ? " voted-count" : ""}`}>{votes[item.id]}</span>
                      </div>
                      <div className="wish-details">
                        <span className="wish-title">{item.title}</span>
                        <span className="wish-industry">{item.industry}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="wishlist-tip card-glass">
                <div className="tip-icon">💡</div>
                <h4>Founding Member Perks</h4>
                <ul>
                  <li>Priority access to new bots</li>
                  <li>Discounted launch pricing</li>
                  <li>Vote on bot roadmap</li>
                  <li>Direct line to our engineering team</li>
                </ul>
                <button className="btn btn-primary btn-sm btn-block" onClick={() => scrollTo("waitlist")} style={{ marginTop: "16px" }}>Secure Your Spot →</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="pipeline-section" id="pipeline">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">Production Line</div>
            <h2>BVP <span className="gradient-text">PRODUCTION LINE</span></h2>
            <p>We build in public. Every product we&apos;re working on — from idea to live. Drop your email on anything coming soon to get notified first.</p>
          </div>
          <div className="pipeline-kanban-wrap">
            <div className="pipeline-kanban">

              {/* PLANNED */}
              <div className="kb-col">
                <div className="kb-col-hdr" style={{ "--col-accent": "#3d4659" } as React.CSSProperties}>
                  <div className="kb-col-dot" style={{ background: "#3d4659" }} />
                  <div className="kb-col-title" style={{ color: "#8899bb" }}>Planned</div>
                  <div className="kb-col-count">5</div>
                </div>
                <div className="kb-col-body">
                  {[
                    { cat: "#00a8ff", catLabel: "Prompt Pack", name: "Real Estate Prompt Pack", desc: "Close faster and communicate better. AI prompts for listings, client comms, and deal management.", price: "$49" },
                    { cat: "#00a8ff", catLabel: "Prompt Pack", name: "Law Firm Prompt Pack", desc: "AI prompts for small law firms. Client intake, case summaries, billing, and professional comms.", price: "$69" },
                    { cat: "#7c4dff", catLabel: "AI Tool", name: "Business Operations AI", desc: "Industry-agnostic AI tool for operations, scheduling, and customer management.", price: "$49/mo" },
                    { cat: "#7c4dff", catLabel: "AI Tool", name: "Marketing AI Tool", desc: "Blogs, social content, email campaigns, ad copy — all generated on-brand in seconds.", price: "$69/mo" },
                    { cat: "#00e676", catLabel: "Bundle", name: "Full Prompt Pack Bundle", desc: "All 6 prompt packs at 40% off. Massive value for multi-industry businesses or resellers.", price: "$179" },
                  ].map((c) => (
                    <div className="kb-card" key={c.name}>
                      <div className="kb-cat"><div className="kb-cat-dot" style={{ background: c.cat }} /><span style={{ color: c.cat }}>{c.catLabel}</span></div>
                      <div className="kb-name">{c.name}</div>
                      <div className="kb-desc">{c.desc}</div>
                      <div className="kb-footer"><div className="kb-price">{c.price}</div></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* IN DEVELOPMENT */}
              <div className="kb-col">
                <div className="kb-col-hdr" style={{ "--col-accent": "#00a8ff" } as React.CSSProperties}>
                  <div className="kb-col-dot" style={{ background: "#00a8ff" }} />
                  <div className="kb-col-title" style={{ color: "#00a8ff" }}>In Development</div>
                  <div className="kb-col-count">3</div>
                </div>
                <div className="kb-col-body">
                  {[
                    { cat: "#7c4dff", catLabel: "AI Tool", name: "Trades AI Tool — Pro", desc: "Full automation suite. Estimates, follow-ups, collections, scheduling — all running on autopilot.", price: "$99/mo" },
                    { cat: "#00a8ff", catLabel: "Prompt Pack", name: "Restaurant Prompt Pack", desc: "AI prompts for restaurant owners. Menu copy, review responses, staff comms, supplier negotiations.", price: "$49" },
                    { cat: "#e040fb", catLabel: "Bot", name: "Trades Bot", desc: "The flagship. Fully autonomous AI that estimates, invoices, follows up, and collects — 24/7.", price: "$149/mo" },
                  ].map((c) => (
                    <div className="kb-card" key={c.name}>
                      <div className="kb-cat"><div className="kb-cat-dot" style={{ background: c.cat }} /><span style={{ color: c.cat }}>{c.catLabel}</span></div>
                      <div className="kb-name">{c.name}</div>
                      <div className="kb-desc">{c.desc}</div>
                      <div className="kb-footer"><div className="kb-price">{c.price}</div></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* TESTING */}
              <div className="kb-col">
                <div className="kb-col-hdr" style={{ "--col-accent": "#ffd740" } as React.CSSProperties}>
                  <div className="kb-col-dot" style={{ background: "#ffd740" }} />
                  <div className="kb-col-title" style={{ color: "#ffd740" }}>Testing</div>
                  <div className="kb-col-count">2</div>
                </div>
                <div className="kb-col-body">
                  {[
                    { cat: "#7c4dff", catLabel: "AI Tool", name: "Trades AI Tool — Starter", desc: "AI-powered assistant for job estimates, invoices, and customer messaging. Built for contractors.", price: "$49/mo" },
                    { cat: "#ffd740", catLabel: "Playbook", name: "ChatGPT & Claude Setup Guide", desc: "Step-by-step guide to setting up AI tools for your trades business. No tech background needed.", price: "$49" },
                  ].map((c) => (
                    <div className="kb-card" key={c.name}>
                      <div className="kb-cat"><div className="kb-cat-dot" style={{ background: c.cat }} /><span style={{ color: c.cat }}>{c.catLabel}</span></div>
                      <div className="kb-name">{c.name}</div>
                      <div className="kb-desc">{c.desc}</div>
                      <div className="kb-footer"><div className="kb-price">{c.price}</div></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* COMING SOON */}
              <div className="kb-col">
                <div className="kb-col-hdr" style={{ "--col-accent": "#e040fb" } as React.CSSProperties}>
                  <div className="kb-col-dot" style={{ background: "#e040fb" }} />
                  <div className="kb-col-title" style={{ color: "#e040fb" }}>Coming Soon</div>
                  <div className="kb-col-count">2</div>
                </div>
                <div className="kb-col-body">
                  {[
                    { cat: "#00a8ff", catLabel: "Prompt Pack", name: "Trades Pro Prompt Pack", desc: "150+ AI prompts for contractors. Estimates, proposals, invoices, collections, and customer comms.", price: "$49" },
                    { cat: "#00e676", catLabel: "Bundle", name: "Trades Starter Kit Bundle", desc: "Prompt Pack + Profit Playbook + bonus templates. Biggest savings, best starting point.", price: "$129" },
                  ].map((c) => (
                    <div className="kb-card" key={c.name}>
                      <div className="kb-cat"><div className="kb-cat-dot" style={{ background: c.cat }} /><span style={{ color: c.cat }}>{c.catLabel}</span></div>
                      <div className="kb-name">{c.name}</div>
                      <div className="kb-desc">{c.desc}</div>
                      <div className="kb-footer"><div className="kb-price">{c.price}</div></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* LIVE */}
              <div className="kb-col">
                <div className="kb-col-hdr" style={{ "--col-accent": "#00e676" } as React.CSSProperties}>
                  <div className="kb-col-dot glow" style={{ background: "#00e676" }} />
                  <div className="kb-col-title" style={{ color: "#00e676" }}>Live Now</div>
                  <div className="kb-col-count">2</div>
                </div>
                <div className="kb-col-body">
                  <div className="kb-card">
                    <div className="kb-cat"><div className="kb-cat-dot" style={{ background: "#ffd740" }} /><span style={{ color: "#ffd740" }}>Playbook</span></div>
                    <div className="kb-name">Trades Profit Playbook</div>
                    <div className="kb-desc">11-chapter guide to recovering lost revenue. Revenue Leak Audit, profit-first estimating, follow-up sequences, and more.</div>
                    <div className="kb-footer"><div className="kb-price">$99</div><div className="kb-live-badge"><div className="kb-live-dot" /> Live</div></div>
                  </div>
                  <div className="kb-card">
                    <div className="kb-cat"><div className="kb-cat-dot" style={{ background: "#ff6e6e" }} /><span style={{ color: "#ff6e6e" }}>Toolkit</span></div>
                    <div className="kb-name">Operations Toolkit</div>
                    <div className="kb-desc">Complete spreadsheet system: job tracker, estimating calculator, invoice log, and profit dashboard.</div>
                    <div className="kb-footer"><div className="kb-price">$49</div><div className="kb-live-badge"><div className="kb-live-dot" /> Live</div></div>
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div className="pipeline-view-cta">
            <a href="/bvp-production-line.html" className="btn-outline-orange" target="_blank" rel="noopener noreferrer">View Full Production Line →</a>
          </div>
        </div>
      </section>

      {/* WAITLIST */}
      <section className="waitlist section-pad" id="waitlist">
        <div className="container">
          <div className="waitlist-inner">
            <div className="waitlist-left">
              <div className="section-tag">Join the Waitlist</div>
              <h2>Be First. <span className="gradient-text">Get More.</span></h2>
              <p>Join the BVP waitlist to get early access to new products, launch pricing, and first-look previews before anything goes public.</p>
              <div className="waitlist-perks">
                {[["🏆","Founding Member Badge"],["💸","Up to 40% launch discount"],["🎯","Priority bot deployment"],["🗺️","Shape our product roadmap"],["📞","Free automation strategy call"]].map(([icon, text]) => (
                  <div className="perk" key={text}><span className="perk-icon">{icon}</span><span>{text}</span></div>
                ))}
              </div>
              <div className="waitlist-social-proof">
                <div className="avatars">
                  {["JT","MR","SK","AL","+"].map((a) => <div className="avatar" key={a}>{a}</div>)}
                </div>
                <span><strong>{wlCount.toLocaleString()}</strong> businesses already on the waitlist</span>
              </div>
            </div>
            <div className="waitlist-right">
              <form className="waitlist-form card-glass" onSubmit={handleWaitlistSubmit} noValidate>
                {wlSubmitted ? (
                  <div className="form-success">
                    <div className="success-icon">🚀</div>
                    <h4>You&apos;re on the list!</h4>
                    <p>Welcome to the vault! We&apos;ll reach out with your early access invitation as we get closer to launch. Keep an eye on your inbox.</p>
                    {wlPosition > 0 && <div className="success-number">You are founding member #{wlPosition.toLocaleString()}</div>}
                  </div>
                ) : (
                  <>
                    <h3>Reserve Your Spot</h3>
                    <p className="form-sub">Join free. No credit card required.</p>
                    <div className="form-row">
                      <div className="form-group"><label>First Name <span className="req">*</span></label><input type="text" name="wlFirstName" placeholder="Jane" required autoComplete="given-name" /></div>
                      <div className="form-group"><label>Last Name <span className="req">*</span></label><input type="text" name="wlLastName" placeholder="Smith" required autoComplete="family-name" /></div>
                    </div>
                    <div className="form-group"><label>Work Email <span className="req">*</span></label><input type="email" name="wlEmail" placeholder="jane@company.com" required autoComplete="email" /></div>
                    <div className="form-group"><label>Company Name</label><input type="text" name="wlCompany" placeholder="Acme Corp" autoComplete="organization" /></div>
                    <div className="form-group">
                      <label>Your Role</label>
                      <select name="wlRole">
                        <option value="">Select your role...</option>
                        {["Founder / CEO","COO / Operations","CTO / Technology","Marketing / Growth","Sales","Finance","HR","IT / Systems","Other"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Industry <span className="req">*</span></label>
                      <select name="wlIndustry" required>
                        <option value="">Select your industry...</option>
                        {["Retail","Healthcare","Finance & Banking","Real Estate","Education","Manufacturing","Restaurants & Food","Logistics & Supply Chain","Legal","Construction","SaaS & Technology","Marketing / Agency","Hospitality","Professional Services","Insurance","Other"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Company Size</label>
                      <select name="wlSize">
                        <option value="">Select company size...</option>
                        {["Solo / Freelancer","2–10 employees","11–50 employees","51–200 employees","201–1000 employees","1000+ employees"].map(o => <option key={o}>{o}</option>)}
                      </select>
                    </div>
                    <div className="form-group"><label>Biggest automation pain point?</label><textarea name="wlBiggestPain" rows={3} placeholder="What's the one manual process that's costing you the most time or money right now?" /></div>
                    <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={wlSubmitting}>
                      {wlSubmitting ? <span>Securing your spot...</span> : <><span>Join the Waitlist — It&apos;s Free</span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></>}
                    </button>
                    <p className="form-disclaimer">No spam. Unsubscribe anytime. Early access pricing is locked for waitlist members.</p>
                  </>
                )}
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq section-pad" id="faq">
        <div className="container">
          <div className="section-header">
            <div className="section-tag">FAQ</div>
            <h2>Common <span className="gradient-text">questions</span></h2>
          </div>
          <div className="faq-grid">
            {FAQ_ITEMS.map((item, i) => (
              <div className="faq-item" key={i}>
                <button className="faq-question" onClick={() => setOpenFaq(openFaq === i ? null : i)} aria-expanded={openFaq === i}>
                  <span>{item.q}</span>
                  <svg className={`faq-icon${openFaq === i ? " open" : ""}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M6 9l6 6 6-6"/></svg>
                </button>
                <div className={`faq-answer${openFaq === i ? " open" : ""}`}><p>{item.a}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-top">
            <div className="footer-brand">
              <button className="logo" onClick={() => scrollTo("hero")} style={{ background: "none", border: "none" }}>
                <span className="logo-icon">⬡</span>
                <span className="logo-text">Bot<span className="accent">Vault</span>Pro</span>
              </button>
              <p>Automating the work that slows businesses down — so you can focus on the work that moves them forward.</p>
              <div className="footer-social">
                <a href="#" aria-label="Twitter/X" className="social-link">𝕏</a>
                <a href="#" aria-label="LinkedIn" className="social-link">in</a>
                <a href="#" aria-label="Instagram" className="social-link">ig</a>
              </div>
            </div>
            <div className="footer-links">
              <div className="footer-col">
                <h5>Products</h5>
                <ul>
                  {["BVP AI Readiness Assessment","BVP Profit Leak Audit","BVP Estimating & Sales Audit","BVP Business Health Scorecard","BVP AI Setup Guide","BVP AI Agent Factory"].map(p => (
                    <li key={p}><a href="https://botvaultpro.gumroad.com" target="_blank" rel="noopener noreferrer">{p}</a></li>
                  ))}
                </ul>
              </div>
              <div className="footer-col">
                <h5>Coming Soon</h5>
                <ul>
                  {["BVP Trades Bot","BVP Operations Toolkit","BVP Automation Playbook","BVP Restaurant Bot","BVP AI Marketplace"].map(p => (
                    <li key={p}><button onClick={() => scrollTo("pipeline")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit", padding: 0 }}>{p}</button></li>
                  ))}
                </ul>
              </div>
              <div className="footer-col">
                <h5>Get Started</h5>
                <ul>
                  <li><button onClick={() => scrollTo("waitlist")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit", padding: 0 }}>Join Waitlist</button></li>
                  <li><button onClick={() => scrollTo("wishlist")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit", padding: 0 }}>Bot Wishlist</button></li>
                  <li><button onClick={() => scrollTo("pipeline")} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: "0.9rem", fontFamily: "inherit", padding: 0 }}>View Pipeline</button></li>
                  <li><a href="mailto:botvaultpro@outlook.com">Contact Us</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 Bot Vault Pro. All rights reserved. | <a href="mailto:botvaultpro@outlook.com">botvaultpro@outlook.com</a></p>
            <div className="footer-legal">
              <a href="/privacy">Privacy Policy</a>
              <a href="/terms">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
