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

function StatusBadge({ status }: { status: Review["status"] }) {
  const styles = {
    approved:  { bg: "rgba(16,185,129,0.1)",  border: "rgba(16,185,129,0.25)",  color: "var(--accent-green)" },
    published: { bg: "rgba(59,130,246,0.1)",  border: "rgba(59,130,246,0.25)",  color: "var(--accent-blue)" },
    pending:   { bg: "var(--bg-elevated)",     border: "var(--border)",           color: "var(--text-tertiary)" },
  };
  const s = styles[status] ?? styles.pending;
  return (
    <span
      className="text-xs font-medium px-2.5 py-1 rounded-full capitalize"
      style={{ background: s.bg, border: `1px solid ${s.border}`, color: s.color }}
    >
      {status}
    </span>
  );
}

export default function ReviewBotPage() {
  const [reviews, setReviews]           = useState<Review[]>([]);
  const [config, setConfig]             = useState<Config>({ placeId: "", businessName: "", tone: "Professional" });
  const [configSaved, setConfigSaved]   = useState(false);
  const [mockMode, setMockMode]         = useState(false);
  const [blocked, setBlocked]           = useState(false);
  const [loading, setLoading]           = useState(true);
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

  const avgRating  = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : "—";
  const replyRate  = reviews.length > 0
    ? Math.round((reviews.filter((r) => r.ai_reply).length / reviews.length) * 100) : 0;
  const pendingCount = reviews.filter((r) => r.status === "pending").length;

  const STATS = [
    { label: "Total Reviews", value: reviews.length },
    { label: "Replied",       value: reviews.filter((r) => r.ai_reply).length },
    { label: "Pending",       value: pendingCount },
    { label: "Avg Rating",    value: `${avgRating} ★` },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-8 page-enter">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.2)" }}
        >
          <Star className="w-5 h-5" style={{ color: "var(--accent-amber)" }} />
        </div>
        <div>
          <h1
            className="font-display font-extrabold text-3xl"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            ReviewBot
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Monitor Google reviews and reply with AI.
          </p>
        </div>
      </div>

      {/* Blocked */}
      {blocked && (
        <div
          className="rounded-xl px-5 py-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.25)",
            borderRadius: "12px",
          }}
        >
          <Lock className="w-5 h-5 shrink-0" style={{ color: "var(--accent-amber)" }} />
          <div>
            <p className="font-semibold" style={{ color: "var(--text-primary)" }}>ReviewBot requires an active subscription.</p>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>No free trial — requires Google Business API connection.</p>
          </div>
          <Link
            href="/dashboard/billing"
            className="sm:ml-auto px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all hover:-translate-y-px"
            style={{ background: "var(--accent-amber)", color: "#0A0F1A" }}
          >
            Subscribe Now
          </Link>
        </div>
      )}

      {/* Mock mode banner */}
      {mockMode && (
        <div
          className="rounded-xl px-4 py-3 flex items-start gap-3"
          style={{
            background: "rgba(245,158,11,0.06)",
            border: "1px solid rgba(245,158,11,0.2)",
            borderRadius: "12px",
          }}
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "var(--accent-amber)" }} />
          <p className="text-sm" style={{ color: "var(--accent-amber)" }}>
            <strong>Running in demo mode.</strong> Connect your Google Business Profile to go live. Showing sample reviews.
          </p>
        </div>
      )}

      {/* Setup */}
      <div
        className="rounded-xl p-6 space-y-4"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
      >
        <h2 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
          Setup
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { key: "placeId",      label: "Google Place ID",  placeholder: "ChIJ...", hint: true },
            { key: "businessName", label: "Business Name",    placeholder: "Your Business Name" },
          ].map((field) => (
            <div key={field.key}>
              <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
                {field.label}
                {field.hint && (
                  <a
                    href="https://developers.google.com/maps/documentation/places/web-service/place-id"
                    target="_blank"
                    rel="noreferrer"
                    className="ml-2 text-xs"
                    style={{ color: "var(--accent-blue)" }}
                  >
                    How to find it
                  </a>
                )}
              </label>
              <input
                type="text"
                value={config[field.key as keyof Config]}
                onChange={(e) => setConfig((c) => ({ ...c, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={{
                  width: "100%",
                  background: "var(--bg-input)",
                  border: "1px solid var(--border)",
                  borderRadius: "8px",
                  padding: "10px 14px",
                  color: "var(--text-primary)",
                  fontSize: "14px",
                  outline: "none",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "var(--border-active)";
                  e.target.style.boxShadow = "0 0 0 3px var(--accent-blue-glow)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "var(--border)";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>
          ))}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: "var(--text-secondary)" }}>
              Reply Tone
            </label>
            <select
              value={config.tone}
              onChange={(e) => setConfig((c) => ({ ...c, tone: e.target.value }))}
              style={{
                width: "100%",
                background: "var(--bg-input)",
                border: "1px solid var(--border)",
                borderRadius: "8px",
                padding: "10px 14px",
                color: "var(--text-primary)",
                fontSize: "14px",
                outline: "none",
              }}
            >
              {TONES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <button
          onClick={saveConfig}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-px"
          style={{ background: "var(--accent-amber)", color: "#0A0F1A" }}
        >
          {configSaved ? <Check className="w-4 h-4" /> : null}
          {configSaved ? "Saved!" : "Save Config"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STATS.map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <p className="text-xs font-mono uppercase tracking-wider mb-1" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
              {label}
            </p>
            <p className="font-display font-extrabold text-2xl" style={{ color: "var(--text-primary)" }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs" style={{ color: "var(--text-tertiary)" }}>Filter:</span>
        {[null, 5, 4, 3, 2, 1].map((r) => (
          <button
            key={String(r)}
            onClick={() => setFilterRating(filterRating === r ? null : r)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={
              filterRating === r
                ? { background: "var(--accent-amber)", color: "#0A0F1A" }
                : { background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
            }
          >
            {r === null ? "All ★" : `${r}★`}
          </button>
        ))}
        <div className="h-4 w-px mx-1" style={{ background: "var(--border)" }} />
        {["all", "pending", "approved", "published"].map((s) => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
            style={
              filterStatus === s
                ? { background: "var(--accent-blue)", color: "#0A0F1A" }
                : { background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }
            }
          >
            {s}
          </button>
        ))}
        <button
          onClick={loadReviews}
          className="ml-auto flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all"
          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
        >
          <RefreshCw className="w-3 h-3" /> Refresh
        </button>
      </div>

      {/* Reviews */}
      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="w-6 h-6 animate-spin" style={{ color: "var(--accent-blue)" }} />
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl p-6"
              style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold" style={{ color: "var(--text-primary)" }}>
                      {review.reviewer_name}
                    </span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className="w-3.5 h-3.5"
                          style={{
                            color: i < review.rating ? "var(--accent-amber)" : "var(--border)",
                            fill: i < review.rating ? "var(--accent-amber)" : "transparent",
                          }}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
                    {new Date(review.review_date).toLocaleDateString()}
                  </p>
                </div>
                <StatusBadge status={review.status} />
              </div>

              <p className="text-sm leading-relaxed mb-4" style={{ color: "var(--text-secondary)" }}>
                {review.review_text}
              </p>

              {review.ai_reply ? (
                <div
                  className="rounded-xl p-4"
                  style={{ background: "var(--bg-input)", border: "1px solid var(--border)" }}
                >
                  <p className="text-xs font-mono mb-2" style={{ color: "var(--accent-blue)", fontFamily: "var(--font-mono)" }}>
                    AI Reply Draft
                  </p>
                  {editingReply?.id === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingReply.text}
                        onChange={(e) => setEditingReply({ id: review.id, text: e.target.value })}
                        rows={3}
                        className="w-full text-sm resize-none"
                        style={{
                          background: "var(--bg-primary)",
                          border: "1px solid var(--border)",
                          borderRadius: "8px",
                          padding: "10px 14px",
                          color: "var(--text-primary)",
                          outline: "none",
                        }}
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => { approveReply(review.id, editingReply.text); setEditingReply(null); }}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all hover:-translate-y-px"
                          style={{ background: "var(--accent-green)", color: "white" }}
                        >
                          <Check className="w-3 h-3" /> Approve & Save
                        </button>
                        <button
                          onClick={() => setEditingReply(null)}
                          className="text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <p className="text-sm leading-relaxed mb-3" style={{ color: "var(--text-secondary)" }}>
                        {review.ai_reply}
                      </p>
                      <div className="flex gap-2">
                        {review.status === "pending" && (
                          <button
                            onClick={() => approveReply(review.id, review.ai_reply!)}
                            className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all hover:-translate-y-px"
                            style={{ background: "var(--accent-green)", color: "white" }}
                          >
                            <Check className="w-3 h-3" /> Approve
                          </button>
                        )}
                        <button
                          onClick={() => setEditingReply({ id: review.id, text: review.ai_reply! })}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all"
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                        >
                          <Edit2 className="w-3 h-3" /> Edit
                        </button>
                        <button
                          onClick={() => generateReply(review)}
                          disabled={generatingFor === review.id}
                          className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
                          style={{ background: "var(--bg-elevated)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
                        >
                          {generatingFor === review.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3 h-3" />
                          )}
                          Regenerate
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => generateReply(review)}
                  disabled={generatingFor === review.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all hover:-translate-y-px disabled:opacity-50"
                  style={{ background: "var(--accent-amber)", color: "#0A0F1A" }}
                >
                  {generatingFor === review.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Star className="w-4 h-4" />
                  )}
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
