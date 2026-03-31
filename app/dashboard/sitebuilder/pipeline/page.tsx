"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  GitBranch, Plus, X, Save, Globe, ArrowLeft,
  ChevronDown, ChevronUp, Phone, Mail, ExternalLink,
} from "lucide-react";
import Link from "next/link";

type Stage =
  | "new_lead"
  | "site_generated"
  | "proposal_sent"
  | "follow_up"
  | "closed_won"
  | "closed_lost";

interface Lead {
  id: string;
  business_name: string;
  business_type: string | null;
  location: string | null;
  current_website: string | null;
  contact_name: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  stage: Stage;
  notes: string | null;
  site_preview_id: string | null;
  proposal_id: string | null;
  created_at: string;
  updated_at: string;
}

interface Column {
  id: Stage;
  label: string;
  dotColor: string;
  borderColor: string;
}

const COLUMNS: Column[] = [
  { id: "new_lead",       label: "New Lead",       dotColor: "var(--text-tertiary)",  borderColor: "var(--border)" },
  { id: "site_generated", label: "Site Generated",  dotColor: "var(--accent-green)",   borderColor: "rgba(16,185,129,0.3)" },
  { id: "proposal_sent",  label: "Proposal Sent",   dotColor: "var(--accent-blue)",    borderColor: "rgba(59,130,246,0.3)" },
  { id: "follow_up",      label: "Follow Up",       dotColor: "var(--accent-amber)",   borderColor: "rgba(245,158,11,0.3)" },
  { id: "closed_won",     label: "Closed Won",      dotColor: "#34d399",               borderColor: "rgba(52,211,153,0.3)" },
  { id: "closed_lost",    label: "Closed Lost",     dotColor: "var(--accent-red)",     borderColor: "rgba(239,68,68,0.3)" },
];

const BUSINESS_TYPES = [
  "Restaurant / Café", "Retail Store", "Law Firm", "Medical / Dental",
  "Real Estate", "Construction / Contractor", "Salon / Spa", "Auto Shop",
  "Gym / Fitness", "Accounting / Finance", "Consulting", "E-commerce",
  "Nonprofit", "Photography", "Landscaping", "Cleaning Service",
  "Plumbing / HVAC", "Marketing Agency", "Insurance", "Other",
];

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--bg-input)",
  border: "1px solid var(--border)",
  borderRadius: "8px",
  padding: "10px 14px",
  color: "var(--text-primary)",
  fontSize: "13px",
  outline: "none",
  fontFamily: "var(--font-body)",
};

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [dragLeadId, setDragLeadId] = useState<string | null>(null);

  const fetchLeads = useCallback(async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("pipeline_leads").select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const total = leads.length;
  const proposalsSent = leads.filter((l) => ["proposal_sent", "follow_up", "closed_won"].includes(l.stage)).length;
  const closedWon = leads.filter((l) => l.stage === "closed_won").length;
  const convRate = total > 0 ? Math.round((closedWon / total) * 100) : 0;

  function handleDragStart(leadId: string) { setDragLeadId(leadId); }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); }

  async function handleDrop(e: React.DragEvent, targetStage: Stage) {
    e.preventDefault();
    if (!dragLeadId) return;
    const supabase = createClient();
    await supabase.from("pipeline_leads")
      .update({ stage: targetStage, updated_at: new Date().toISOString() })
      .eq("id", dragLeadId);
    setLeads((prev) => prev.map((l) => (l.id === dragLeadId ? { ...l, stage: targetStage } : l)));
    setDragLeadId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64" style={{ color: "var(--text-secondary)" }}>
        Loading pipeline…
      </div>
    );
  }

  return (
    <div className="space-y-8 page-enter">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/bots/sitebuilder"
          className="transition-colors"
          style={{ color: "var(--text-tertiary)" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)" }}
        >
          <GitBranch className="w-5 h-5" style={{ color: "var(--accent-green)" }} />
        </div>
        <div>
          <h1
            className="font-display font-extrabold text-3xl"
            style={{ color: "var(--text-primary)", letterSpacing: "-0.02em" }}
          >
            Client Pipeline
          </h1>
          <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
            Drag cards between stages to track every prospect.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all hover:-translate-y-px"
          style={{ background: "var(--accent-green)", color: "#0A0F1A" }}
        >
          <Plus className="w-4 h-4" /> Add Lead
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads",      value: total,         color: "var(--text-primary)" },
          { label: "Proposals Sent",   value: proposalsSent, color: "var(--accent-blue)" },
          { label: "Closed Won",       value: closedWon,     color: "#34d399" },
          { label: "Conversion Rate",  value: `${convRate}%`, color: closedWon > 0 ? "#34d399" : "var(--text-tertiary)" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-5"
            style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "12px" }}
          >
            <p
              className="text-xs font-mono uppercase tracking-wider mb-1"
              style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
            >
              {s.label}
            </p>
            <p
              className="font-display text-2xl font-bold"
              style={{ color: s.color, fontFamily: "var(--font-mono)" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4" style={{ minWidth: "max-content" }}>
          {COLUMNS.map((col) => {
            const colLeads = leads.filter((l) => l.stage === col.id);
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className="flex flex-col rounded-xl w-64"
                style={{
                  background: "var(--bg-surface)",
                  border: `1px solid ${col.borderColor}`,
                  borderRadius: "12px",
                }}
              >
                {/* Column header */}
                <div
                  className="flex items-center gap-2 px-4 py-3"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <span
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ background: col.dotColor }}
                  />
                  <span className="font-display font-semibold text-sm" style={{ color: "var(--text-primary)" }}>
                    {col.label}
                  </span>
                  <span
                    className="ml-auto text-xs px-2 py-0.5 rounded-full"
                    style={{
                      background: "var(--bg-elevated)",
                      color: "var(--text-tertiary)",
                      fontFamily: "var(--font-mono)",
                    }}
                  >
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2" style={{ minHeight: "200px" }}>
                  {colLeads.map((lead) => (
                    <LeadCard
                      key={lead.id}
                      lead={lead}
                      onClick={() => setSelectedLead(lead)}
                      onDragStart={() => handleDragStart(lead.id)}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detail modal */}
      {selectedLead && (
        <LeadDetailModal
          lead={selectedLead}
          onClose={() => setSelectedLead(null)}
          onSave={async (updated) => {
            const supabase = createClient();
            await supabase.from("pipeline_leads")
              .update({
                contact_name: updated.contact_name,
                contact_email: updated.contact_email,
                contact_phone: updated.contact_phone,
                notes: updated.notes,
                stage: updated.stage,
                updated_at: new Date().toISOString(),
              })
              .eq("id", updated.id);
            setLeads((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
            setSelectedLead(null);
          }}
        />
      )}

      {/* Add modal */}
      {showAddModal && (
        <AddLeadModal
          onClose={() => setShowAddModal(false)}
          onAdd={async (newLead) => {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;
            const { data } = await supabase
              .from("pipeline_leads")
              .insert({ ...newLead, user_id: user.id, stage: "new_lead" })
              .select().single();
            if (data) setLeads((prev) => [data as Lead, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── Lead card ─────────────────────────────────────────────────────────
function LeadCard({ lead, onClick, onDragStart }: {
  lead: Lead;
  onClick: () => void;
  onDragStart: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="rounded-xl p-3 cursor-grab active:cursor-grabbing select-none transition-all"
      style={{
        background: "var(--bg-elevated)",
        border: "1px solid var(--border)",
        borderRadius: "10px",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--border)"; e.currentTarget.style.transform = "none"; }}
    >
      <p className="font-semibold text-sm truncate" style={{ color: "var(--text-primary)" }}>
        {lead.business_name}
      </p>
      {lead.business_type && (
        <p className="text-xs mt-0.5" style={{ color: "var(--accent-blue)" }}>{lead.business_type}</p>
      )}
      {lead.location && (
        <p className="text-xs mt-1 truncate" style={{ color: "var(--text-tertiary)" }}>📍 {lead.location}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
          {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <div className="flex gap-1">
          {lead.site_preview_id && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent-green)", border: "1px solid rgba(16,185,129,0.2)" }}
            >
              Site
            </span>
          )}
          {lead.proposal_id && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{ background: "rgba(59,130,246,0.1)", color: "var(--accent-blue)", border: "1px solid rgba(59,130,246,0.2)" }}
            >
              Prop
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Lead detail modal ─────────────────────────────────────────────────
function LeadDetailModal({ lead, onClose, onSave }: {
  lead: Lead;
  onClose: () => void;
  onSave: (updated: Lead) => void;
}) {
  const [edited, setEdited] = useState<Lead>({ ...lead });
  const [showNotes, setShowNotes] = useState(false);

  const inp: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "var(--text-primary)",
    fontSize: "13px",
    outline: "none",
    fontFamily: "var(--font-body)",
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>
            {lead.business_name}
          </h2>
          <button
            onClick={onClose}
            className="transition-colors"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Info grid */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {lead.business_type && (
              <div>
                <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>Type</p>
                <p style={{ color: "var(--text-primary)" }}>{lead.business_type}</p>
              </div>
            )}
            {lead.location && (
              <div>
                <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>Location</p>
                <p style={{ color: "var(--text-primary)" }}>{lead.location}</p>
              </div>
            )}
            {lead.current_website && (
              <div className="col-span-2">
                <p className="text-xs font-mono uppercase tracking-widest mb-1" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>Current Site</p>
                <a
                  href={lead.current_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-xs hover:underline"
                  style={{ color: "var(--accent-blue)" }}
                >
                  <ExternalLink className="w-3 h-3" />
                  {lead.current_website}
                </a>
              </div>
            )}
          </div>

          {/* Stage */}
          <div>
            <label className="block text-xs font-mono uppercase tracking-widest mb-2" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
              Stage
            </label>
            <select
              value={edited.stage}
              onChange={(e) => setEdited({ ...edited, stage: e.target.value as Stage })}
              style={{ ...inp, cursor: "pointer" }}
            >
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-xs font-mono uppercase tracking-widest" style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}>
              Contact Info
            </p>
            <input
              value={edited.contact_name ?? ""}
              onChange={(e) => setEdited({ ...edited, contact_name: e.target.value })}
              placeholder="Contact name"
              style={inp}
              onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} />
                <input
                  value={edited.contact_email ?? ""}
                  onChange={(e) => setEdited({ ...edited, contact_email: e.target.value })}
                  placeholder="Email"
                  style={{ ...inp, paddingLeft: "32px" }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} />
                <input
                  value={edited.contact_phone ?? ""}
                  onChange={(e) => setEdited({ ...edited, contact_phone: e.target.value })}
                  placeholder="Phone"
                  style={{ ...inp, paddingLeft: "32px" }}
                  onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
                  onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest transition-colors"
              style={{ color: "var(--text-tertiary)", fontFamily: "var(--font-mono)" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
            >
              Notes
              {showNotes ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
            {showNotes && (
              <textarea
                value={edited.notes ?? ""}
                onChange={(e) => setEdited({ ...edited, notes: e.target.value })}
                rows={4}
                placeholder="Add notes about this lead…"
                style={{ ...inp, marginTop: "8px", resize: "none", padding: "12px 14px" }}
                onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              />
            )}
          </div>

          {/* Assets */}
          <div className="flex gap-2 items-center">
            {lead.site_preview_id && (
              <Link
                href="/dashboard/bots/sitebuilder"
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all"
                style={{ background: "rgba(16,185,129,0.1)", color: "var(--accent-green)", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                <Globe className="w-3.5 h-3.5" /> View Site
              </Link>
            )}
            <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>
              Added {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {/* Save */}
          <button
            onClick={() => onSave(edited)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium text-sm transition-all hover:-translate-y-px"
            style={{ background: "var(--accent-blue)", color: "#0A0F1A", borderRadius: "8px" }}
          >
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add lead modal ────────────────────────────────────────────────────
function AddLeadModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (lead: Partial<Lead>) => void;
}) {
  const [form, setForm] = useState({
    business_name: "", business_type: "", location: "",
    current_website: "", contact_name: "", contact_email: "", contact_phone: "",
  });

  const inp: React.CSSProperties = {
    width: "100%",
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: "8px",
    padding: "10px 14px",
    color: "var(--text-primary)",
    fontSize: "13px",
    outline: "none",
    fontFamily: "var(--font-body)",
  };

  function handleSubmit(e: React.FormEvent) { e.preventDefault(); onAdd(form); }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl"
        style={{ background: "var(--bg-surface)", border: "1px solid var(--border)", borderRadius: "16px" }}
      >
        <div
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border)" }}
        >
          <h2 className="font-display font-bold text-lg" style={{ color: "var(--text-primary)" }}>Add Lead</h2>
          <button onClick={onClose} style={{ color: "var(--text-tertiary)" }}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Business Name <span style={{ color: "var(--accent-red)" }}>*</span>
            </label>
            <input
              required
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              placeholder="Joe's Plumbing"
              style={inp}
              onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Business Type</label>
              <select
                value={form.business_type}
                onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                style={{ ...inp, cursor: "pointer" }}
              >
                <option value="">Select…</option>
                {BUSINESS_TYPES.map((bt) => <option key={bt} value={bt}>{bt}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Austin, TX"
                style={inp}
                onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Current Website</label>
            <input
              value={form.current_website}
              onChange={(e) => setForm({ ...form, current_website: e.target.value })}
              placeholder="https://example.com"
              style={inp}
              onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
              onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Contact Email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                placeholder="owner@biz.com"
                style={inp}
                onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "var(--text-secondary)" }}>Contact Phone</label>
              <input
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                placeholder="(512) 000-0000"
                style={inp}
                onFocus={(e) => { e.target.style.borderColor = "var(--border-active)"; }}
                onBlur={(e) => { e.target.style.borderColor = "var(--border)"; }}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all"
              style={{ background: "var(--bg-elevated)", color: "var(--text-secondary)", border: "1px solid var(--border)" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-all hover:-translate-y-px"
              style={{ background: "var(--accent-blue)", color: "#0A0F1A" }}
            >
              Add to Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
