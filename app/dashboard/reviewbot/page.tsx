"use client";
import { useEffect, useState } from "react";
import { Star, RefreshCw, Check, Edit2, Loader2, Lock, AlertCircle } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

type Review = {
  id: string;
  google_review_id: string;
  reviewer_name: string;
  rating: number;
  review_text: string;
  review_date: string;
  ai_reply: string | null;
  status: "pending" | "approved" | "published";
};

type Config = {
  placeId: string;
  businessName: string;
  tone: string;
};

const TONES = ["Professional", "Friendly", "Grateful"];

export default function ReviewBotPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [config, setConfig] = useState<Config>({ placeId: "", businessName: "", tone: "Professional" });
  const [configSaved, setConfigSaved] = useState(false);
  const [mockMode, setMockMode] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [generatingFor, setGeneratingFor] = useState<string | null>(null);
  const [editingReply, setEditingReply] = useState<{ id: string; text: string } | null>(null);
  const [filterRating, setFilterRating] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  useEffect(() => { loadReviews(); }, []);

  async function loadReviews() {
    setLoading(true);
    try {
      const res = await fetch("/api/bots/reviewbot");
      const data = await res.json();
      if (res.status === 403) { setBlocked(true); return; }
      setReviews(data.reviews ?? []);
      setMockMode(data.mockMode ?? false);
    } catch {}
    setLoading(false);
  }

  async function saveConfig() {
    await fetch("/api/bots/reviewbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "save_config", ...config }),
    });
    setConfigSaved(true);
    setTimeout(() => setConfigSaved(false), 2000);
  }

  async function generateReply(review: Review) {
    setGeneratingFor(review.id);
    try {
      const res = await fetch("/api/bots/reviewbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_reply",
          reviewerName: review.reviewer_name,
          rating: review.rating,
          reviewText: review.review_text,
          businessName: config.businessName,
          tone: config.tone,
        }),
      });
      const data = await res.json();
      if (data.reply) {
        setReviews((rs) => rs.map((r) => r.id === review.id ? { ...r, ai_reply: data.reply } : r));
      }
    } catch {}
    setGeneratingFor(null);
  }

  async function approveReply(reviewId: string, reply: string) {
    if (mockMode) {
      setReviews((rs) => rs.map((r) => r.id === reviewId ? { ...r, status: "approved", ai_reply: reply } : r));
      return;
    }
    await fetch("/api/bots/reviewbot", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve_reply", reviewId, reply }),
    });
    setReviews((rs) => rs.map((r) => r.id === reviewId ? { ...r, status: "approved" } : r));
  }

  const filteredReviews = reviews.filter((r) => {
    if (filterRating && r.rating !== filterRating) return false;
    if (filterStatus !== "all" && r.status !== filterStatus) return false;
    return true;
  });

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const replyRate = reviews.length > 0 ? Math.round((reviews.filter((r) => r.ai_reply).length / reviews.length) * 100) : 0;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="font-display text-3xl font-bold flex items-center gap-3">
          <Star className="w-7 h-7 text-yellow-400" />
          ReviewBot
        </h1>
        <p className="text-vault-text-dim mt-1">Monitor Google reviews and reply with AI.</p>
      </div>

      {blocked && (
        <div className="rounded-xl border border-yellow-400/30 bg-yellow-400/5 px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Lock className="w-6 h-6 text-yellow-400 shrink-0" />
          <div>
            <p className="font-semibold text-vault-text">ReviewBot requires an active subscription.</p>
            <p className="text-sm text-vault-text-dim">No free trial for ReviewBot — requires Google Business API connection.</p>
          </div>
          <Link href="/dashboard/billing" className="sm:ml-auto bg-yellow-400 text-gray-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-yellow-400/90 transition-colors whitespace-nowrap">
            Subscribe Now
          </Link>
        </div>
      )}

      {mockMode && (
        <div className="rounded-xl border border-vault-accent/30 bg-vault-accent/5 px-4 py-3 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-vault-accent shrink-0 mt-0.5" />
          <p className="text-sm text-vault-accent">
            <strong>Google Business API pending</strong> — live reviews will appear here once connected. Showing 5 sample reviews.
          </p>
        </div>
      )}

      {/* Config */}
      <div className="card-surface rounded-2xl p-6 space-y-4">
        <h2 className="font-display font-bold text-lg">Setup</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-vault-text mb-2">
              Google Place ID
              <a href="https://developers.google.com/maps/documentation/places/web-service/place-id" target="_blank" rel="noreferrer" className="ml-2 text-xs text-vault-accent hover:underline">How to find it</a>
            </label>
            <input type="text" value={config.placeId} onChange={(e) => setConfig((c) => ({ ...c, placeId: e.target.value }))}
              placeholder="ChIJ..." className="w-full bg-vault-bg border border-vault-border rounded-xl px-3 py-2 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-vault-text mb-2">Business Name</label>
            <input type="text" value={config.businessName} onChange={(e) => setConfig((c) => ({ ...c, businessName: e.target.value }))}
              placeholder="Your Business Name" className="w-full bg-vault-bg border border-vault-border rounded-xl px-3 py-2 text-sm text-vault-text placeholder:text-vault-text-dim focus:outline-none focus:border-vault-accent" />
          </div>
          <div>
            <label className="block text-sm font-medium text-vault-text mb-2">Reply Tone</label>
            <select value={config.tone} onChange={(e) => setConfig((c) => ({ ...c, tone: e.target.value }))}
              className="w-full bg-vault-bg border border-vault-border rounded-xl px-3 py-2 text-sm text-vault-text focus:outline-none focus:border-vault-accent">
              {TONES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button onClick={saveConfig} className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-yellow-400/90 transition-colors">
          {configSaved ? <Check className="w-4 h-4" /> : null}
          {configSaved ? "Saved!" : "Save Config"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Reviews", value: reviews.length },
          { label: "Avg Rating", value: `${avgRating} ★` },
          { label: "Reply Rate", value: `${replyRate}%` },
          { label: "Pending", value: pendingCount },
        ].map(({ label, value }) => (
          <div key={label} className="card-surface rounded-xl p-4">
            <p className="text-xs text-vault-text-dim mb-1">{label}</p>
            <p className="font-display text-2xl font-bold text-vault-text">{value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-vault-text-dim">Filter:</span>
        <button onClick={() => setFilterRating(null)} className={clsx("px-3 py-1.5 rounded-lg text-xs", !filterRating ? "bg-vault-accent text-vault-bg" : "border border-vault-border text-vault-text-dim")}>All Stars</button>
        {[5, 4, 3, 2, 1].map((r) => (
          <button key={r} onClick={() => setFilterRating(filterRating === r ? null : r)}
            className={clsx("px-3 py-1.5 rounded-lg text-xs", filterRating === r ? "bg-yellow-400 text-gray-900" : "border border-vault-border text-vault-text-dim")}>
            {r}★
          </button>
        ))}
        <div className="h-4 w-px bg-vault-border" />
        {["all", "pending", "approved", "published"].map((s) => (
          <button key={s} onClick={() => setFilterStatus(s)}
            className={clsx("px-3 py-1.5 rounded-lg text-xs capitalize", filterStatus === s ? "bg-vault-accent text-vault-bg" : "border border-vault-border text-vault-text-dim")}>
            {s}
          </button>
        ))}
        <button onClick={loadReviews} className="ml-auto flex items-center gap-1 text-xs text-vault-text-dim hover:text-vault-text border border-vault-border px-3 py-1.5 rounded-lg">
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Reviews */}
      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-vault-accent" /></div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div key={review.id} className="card-surface rounded-2xl p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-vault-text">{review.reviewer_name}</span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={clsx("w-3.5 h-3.5", i < review.rating ? "text-yellow-400 fill-yellow-400" : "text-vault-border")} />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-vault-text-dim">{new Date(review.review_date).toLocaleDateString()}</p>
                </div>
                <span className={clsx(
                  "text-xs font-semibold px-2 py-1 rounded-full border capitalize",
                  review.status === "approved" ? "bg-vault-green/10 text-vault-green border-vault-green/20"
                  : review.status === "published" ? "bg-blue-400/10 text-blue-400 border-blue-400/20"
                  : "bg-vault-border text-vault-text-dim"
                )}>{review.status}</span>
              </div>

              <p className="text-sm text-vault-text-dim mb-4 leading-relaxed">{review.review_text}</p>

              {review.ai_reply ? (
                <div className="bg-vault-bg/50 rounded-xl p-4 border border-vault-border">
                  <p className="text-xs font-mono text-vault-accent mb-2">AI Reply Draft</p>
                  {editingReply?.id === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingReply.text}
                        onChange={(e) => setEditingReply({ id: review.id, text: e.target.value })}
                        rows={3}
                        className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-sm text-vault-text focus:outline-none focus:border-vault-accent resize-none"
                      />
                      <div className="flex gap-2">
                        <button onClick={() => { approveReply(review.id, editingReply.text); setEditingReply(null); }}
                          className="flex items-center gap-1 text-xs bg-vault-green text-white px-3 py-1.5 rounded-lg hover:bg-vault-green/90">
                          <Check className="w-3 h-3" /> Approve & Save
                        </button>
                        <button onClick={() => setEditingReply(null)} className="text-xs text-vault-text-dim hover:text-vault-text px-3 py-1.5 rounded-lg border border-vault-border">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm text-vault-text-dim leading-relaxed mb-3">{review.ai_reply}</p>
                      <div className="flex gap-2">
                        {review.status === "pending" && (
                          <button onClick={() => approveReply(review.id, review.ai_reply!)}
                            className="flex items-center gap-1 text-xs bg-vault-green text-white px-3 py-1.5 rounded-lg hover:bg-vault-green/90">
                            <Check className="w-3 h-3" /> Approve & Publish
                          </button>
                        )}
                        <button onClick={() => setEditingReply({ id: review.id, text: review.ai_reply! })}
                          className="flex items-center gap-1 text-xs border border-vault-border text-vault-text-dim px-3 py-1.5 rounded-lg hover:border-vault-accent hover:text-vault-accent">
                          <Edit2 className="w-3 h-3" /> Edit Reply
                        </button>
                        <button onClick={() => generateReply(review)} disabled={generatingFor === review.id}
                          className="flex items-center gap-1 text-xs border border-vault-border text-vault-text-dim px-3 py-1.5 rounded-lg hover:border-vault-accent hover:text-vault-accent disabled:opacity-50">
                          {generatingFor === review.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                          Regenerate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button onClick={() => generateReply(review)} disabled={generatingFor === review.id}
                  className="flex items-center gap-2 bg-yellow-400 text-gray-900 px-4 py-2 rounded-xl text-sm font-bold hover:bg-yellow-400/90 transition-colors disabled:opacity-50">
                  {generatingFor === review.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Star className="w-4 h-4" />}
                  {generatingFor === review.id ? "Generating..." : "Generate AI Reply"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
