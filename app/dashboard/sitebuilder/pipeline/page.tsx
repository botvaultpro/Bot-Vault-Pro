"use client";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  GitBranch, Plus, X, Save, Globe, ArrowLeft,
  ChevronDown, ChevronUp, Phone, Mail, ExternalLink,
} from "lucide-react";
import Link from "next/link";

// ── Types ──────────────────────────────────────────────────────────────
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
  color: string;
  dotColor: string;
}

const COLUMNS: Column[] = [
  { id: "new_lead",       label: "New Lead",       color: "border-gray-500/30",  dotColor: "bg-gray-400" },
  { id: "site_generated", label: "Site Generated",  color: "border-vault-green/30", dotColor: "bg-vault-green" },
  { id: "proposal_sent",  label: "Proposal Sent",   color: "border-vault-accent/30", dotColor: "bg-vault-accent" },
  { id: "follow_up",      label: "Follow Up",       color: "border-yellow-500/30", dotColor: "bg-yellow-400" },
  { id: "closed_won",     label: "Closed Won",      color: "border-emerald-500/30", dotColor: "bg-emerald-400" },
  { id: "closed_lost",    label: "Closed Lost",     color: "border-red-500/30",  dotColor: "bg-red-400" },
];

const BUSINESS_TYPES = [
  "Restaurant / Café", "Retail Store", "Law Firm", "Medical / Dental",
  "Real Estate", "Construction / Contractor", "Salon / Spa", "Auto Shop",
  "Gym / Fitness", "Accounting / Finance", "Consulting", "E-commerce",
  "Nonprofit", "Photography", "Landscaping", "Cleaning Service",
  "Plumbing / HVAC", "Marketing Agency", "Insurance", "Other",
];

// ── Main component ────────────────────────────────────────────────────
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
      .from("pipeline_leads")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setLeads((data as Lead[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // ── Summary stats ──
  const total = leads.length;
  const proposalsSent = leads.filter((l) => ["proposal_sent", "follow_up", "closed_won"].includes(l.stage)).length;
  const closedWon = leads.filter((l) => l.stage === "closed_won").length;
  const convRate = total > 0 ? Math.round((closedWon / total) * 100) : 0;

  // ── Drag & drop ──
  function handleDragStart(leadId: string) { setDragLeadId(leadId); }
  function handleDragOver(e: React.DragEvent) { e.preventDefault(); }

  async function handleDrop(e: React.DragEvent, targetStage: Stage) {
    e.preventDefault();
    if (!dragLeadId) return;
    const supabase = createClient();
    await supabase
      .from("pipeline_leads")
      .update({ stage: targetStage, updated_at: new Date().toISOString() })
      .eq("id", dragLeadId);
    setLeads((prev) =>
      prev.map((l) => (l.id === dragLeadId ? { ...l, stage: targetStage } : l))
    );
    setDragLeadId(null);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-vault-text-dim">
        Loading pipeline…
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/bots/sitebuilder" className="text-vault-text-dim hover:text-vault-text transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-vault-green/20 bg-vault-green/5">
          <GitBranch className="w-5 h-5 text-vault-green" />
        </div>
        <div>
          <h1 className="font-display text-2xl font-bold">Client Pipeline</h1>
          <p className="text-vault-text-dim text-sm">Drag cards between stages to track every prospect.</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="ml-auto flex items-center gap-2 bg-vault-green text-vault-bg font-bold px-4 py-2.5 rounded-xl text-sm hover:opacity-90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Lead
        </button>
      </div>

      {/* Summary bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Leads", value: total, color: "text-vault-text" },
          { label: "Proposals Sent", value: proposalsSent, color: "text-vault-accent" },
          { label: "Closed Won", value: closedWon, color: "text-emerald-400" },
          { label: "Conversion Rate", value: `${convRate}%`, color: closedWon > 0 ? "text-emerald-400" : "text-vault-text-dim" },
        ].map((s) => (
          <div key={s.label} className="card-surface rounded-xl p-4">
            <p className="text-xs text-vault-text-dim font-mono uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {COLUMNS.map((col) => {
            const colLeads = leads.filter((l) => l.stage === col.id);
            return (
              <div
                key={col.id}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col w-64 rounded-2xl border bg-vault-surface/50 ${col.color}`}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-vault-border">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${col.dotColor}`} />
                  <span className="font-display font-semibold text-sm">{col.label}</span>
                  <span className="ml-auto text-xs text-vault-text-dim bg-vault-border px-2 py-0.5 rounded-full">
                    {colLeads.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="flex-1 p-2 space-y-2 min-h-[200px]">
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
            await supabase
              .from("pipeline_leads")
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

      {/* Add lead modal */}
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
              .select()
              .single();
            if (data) setLeads((prev) => [data as Lead, ...prev]);
            setShowAddModal(false);
          }}
        />
      )}
    </div>
  );
}

// ── Lead card ────────────────────────────────────────────────────────
function LeadCard({
  lead,
  onClick,
  onDragStart,
}: {
  lead: Lead;
  onClick: () => void;
  onDragStart: () => void;
}) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className="bg-vault-surface border border-vault-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-vault-accent/30 transition-all select-none"
    >
      <p className="font-semibold text-sm text-vault-text truncate">{lead.business_name}</p>
      {lead.business_type && (
        <p className="text-xs text-vault-accent mt-0.5">{lead.business_type}</p>
      )}
      {lead.location && (
        <p className="text-xs text-vault-text-dim mt-1 truncate">📍 {lead.location}</p>
      )}
      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-vault-muted">
          {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </span>
        <div className="flex gap-1">
          {lead.site_preview_id && (
            <span className="text-xs bg-vault-green/10 text-vault-green border border-vault-green/20 px-1.5 py-0.5 rounded-full">
              Site
            </span>
          )}
          {lead.proposal_id && (
            <span className="text-xs bg-vault-accent/10 text-vault-accent border border-vault-accent/20 px-1.5 py-0.5 rounded-full">
              Prop
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Lead detail modal ────────────────────────────────────────────────
function LeadDetailModal({
  lead,
  onClose,
  onSave,
}: {
  lead: Lead;
  onClose: () => void;
  onSave: (updated: Lead) => void;
}) {
  const [edited, setEdited] = useState<Lead>({ ...lead });
  const [showNotes, setShowNotes] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-vault-surface border border-vault-border rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-vault-border">
          <h2 className="font-display font-bold text-lg">{lead.business_name}</h2>
          <button onClick={onClose} className="text-vault-text-dim hover:text-vault-text transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            {lead.business_type && (
              <div>
                <p className="text-vault-text-dim text-xs uppercase tracking-widest font-mono mb-1">Type</p>
                <p className="text-vault-text">{lead.business_type}</p>
              </div>
            )}
            {lead.location && (
              <div>
                <p className="text-vault-text-dim text-xs uppercase tracking-widest font-mono mb-1">Location</p>
                <p className="text-vault-text">{lead.location}</p>
              </div>
            )}
            {lead.current_website && (
              <div className="col-span-2">
                <p className="text-vault-text-dim text-xs uppercase tracking-widest font-mono mb-1">Current Site</p>
                <a href={lead.current_website} target="_blank" rel="noopener noreferrer"
                  className="text-vault-accent flex items-center gap-1 text-xs hover:underline">
                  <ExternalLink className="w-3 h-3" />
                  {lead.current_website}
                </a>
              </div>
            )}
          </div>

          {/* Stage */}
          <div>
            <label className="block text-xs text-vault-text-dim uppercase tracking-widest font-mono mb-2">Stage</label>
            <select
              value={edited.stage}
              onChange={(e) => setEdited({ ...edited, stage: e.target.value as Stage })}
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-vault-text text-sm focus:outline-none focus:border-vault-accent"
            >
              {COLUMNS.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <p className="text-xs text-vault-text-dim uppercase tracking-widest font-mono">Contact Info</p>
            <input
              value={edited.contact_name ?? ""}
              onChange={(e) => setEdited({ ...edited, contact_name: e.target.value })}
              placeholder="Contact name"
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-vault-text placeholder-vault-muted text-sm focus:outline-none focus:border-vault-accent"
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vault-muted" />
                <input
                  value={edited.contact_email ?? ""}
                  onChange={(e) => setEdited({ ...edited, contact_email: e.target.value })}
                  placeholder="Email"
                  className="w-full bg-vault-bg border border-vault-border rounded-lg pl-8 pr-3 py-2 text-vault-text placeholder-vault-muted text-sm focus:outline-none focus:border-vault-accent"
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-vault-muted" />
                <input
                  value={edited.contact_phone ?? ""}
                  onChange={(e) => setEdited({ ...edited, contact_phone: e.target.value })}
                  placeholder="Phone"
                  className="w-full bg-vault-bg border border-vault-border rounded-lg pl-8 pr-3 py-2 text-vault-text placeholder-vault-muted text-sm focus:outline-none focus:border-vault-accent"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <button
              onClick={() => setShowNotes(!showNotes)}
              className="flex items-center gap-2 text-xs text-vault-text-dim uppercase tracking-widest font-mono hover:text-vault-text transition-colors"
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
                className="mt-2 w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2 text-vault-text placeholder-vault-muted text-sm focus:outline-none focus:border-vault-accent resize-none"
              />
            )}
          </div>

          {/* Assets */}
          <div className="flex gap-2">
            {lead.site_preview_id && (
              <Link
                href="/dashboard/bots/sitebuilder"
                className="flex items-center gap-1.5 text-xs bg-vault-green/10 text-vault-green border border-vault-green/20 px-3 py-2 rounded-lg hover:bg-vault-green/20 transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
                View Site
              </Link>
            )}
            <p className="text-xs text-vault-muted self-center">
              Added {new Date(lead.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
          </div>

          {/* Save */}
          <button
            onClick={() => onSave(edited)}
            className="w-full flex items-center justify-center gap-2 bg-vault-accent text-vault-bg font-bold py-3 rounded-xl hover:bg-vault-accent-dim transition-colors text-sm"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Add lead modal ────────────────────────────────────────────────────
function AddLeadModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (lead: Partial<Lead>) => void;
}) {
  const [form, setForm] = useState({
    business_name: "",
    business_type: "",
    location: "",
    current_website: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onAdd(form);
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
      <div className="bg-vault-surface border border-vault-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-vault-border">
          <h2 className="font-display font-bold text-lg">Add Lead</h2>
          <button onClick={onClose} className="text-vault-text-dim hover:text-vault-text">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs text-vault-text-dim mb-1.5">Business Name <span className="text-red-400">*</span></label>
            <input
              required
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              placeholder="Joe's Plumbing"
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-vault-text placeholder-vault-muted text-sm focus:outline-none focus:border-vault-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-vault-text-dim mb-1.5">Business Type</label>
              <select
                value={form.business_type}
                onChange={(e) => setForm({ ...form, business_type: e.target.value })}
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-vault-text text-sm focus:outline-none focus:border-vault-accent"
              >
                <option value="">Select…</option>
                {BUSINESS_TYPES.map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-vault-text-dim mb-1.5">Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Austin, TX"
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-vault-text placeholder-vault-muted text-sm focus:outline-none focus:border-vault-accent"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-vault-text-dim mb-1.5">Current Website</label>
            <input
              value={form.current_website}
              onChange={(e) => setForm({ ...form, current_website: e.target.value })}
              placeholder="https://example.com"
              className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-vault-text placeholder-vault-muted text-sm focus:outline-none focus:border-vault-accent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-vault-text-dim mb-1.5">Contact Email</label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                placeholder="owner@biz.com"
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-vault-text placeholder-vault-muted text-sm focus:outline-none focus:border-vault-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-vault-text-dim mb-1.5">Contact Phone</label>
              <input
                value={form.contact_phone}
                onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                placeholder="(512) 000-0000"
                className="w-full bg-vault-bg border border-vault-border rounded-lg px-3 py-2.5 text-vault-text placeholder-vault-muted text-sm focus:outline-none focus:border-vault-accent"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 border border-vault-border text-vault-text-dim py-2.5 rounded-xl text-sm hover:border-vault-accent hover:text-vault-accent transition-colors">
              Cancel
            </button>
            <button type="submit"
              className="flex-1 bg-vault-accent text-vault-bg font-bold py-2.5 rounded-xl text-sm hover:bg-vault-accent-dim transition-colors">
              Add to Pipeline
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
