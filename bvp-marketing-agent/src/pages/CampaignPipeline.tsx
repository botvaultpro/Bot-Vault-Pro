import { useState, useRef } from 'react';
import { clsx } from 'clsx';
import { Plus, Pencil, Trash2, GripVertical, Calendar, Target, Users } from 'lucide-react';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Badge, goalBadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppContext, useCampaigns, generateId, nowISO } from '../context/AppContext';
import { formatShortDate, toISODate } from '../utils/dateHelpers';
import {
  PLATFORM_CONFIG,
  STAGE_CONFIG,
  PRIORITY_CONFIG,
  type Campaign,
  type CampaignStage,
  type ContentGoal,
  type Platform,
  type Priority,
} from '../types';

const STAGES: CampaignStage[] = ['ideation', 'creation', 'review', 'scheduled', 'published'];
const GOALS: ContentGoal[] = ['awareness', 'engagement', 'conversion', 'retention'];
const PLATFORMS: Platform[] = ['instagram', 'linkedin', 'blog', 'youtube', 'email', 'twitter', 'facebook'];
const PRIORITIES: Priority[] = ['high', 'medium', 'low'];

function buildBlankCampaign(): Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'> {
  const today = toISODate(new Date());
  return {
    name: '',
    description: '',
    platforms: ['instagram'],
    goal: 'awareness',
    targetAudience: '',
    startDate: today,
    endDate: today,
    stage: 'ideation',
    priority: 'medium',
    notes: '',
  };
}

export default function CampaignPipeline() {
  const { dispatch } = useAppContext();
  const campaigns = useCampaigns();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [form, setForm] = useState<Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>>(buildBlankCampaign());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Drag state
  const dragIdRef = useRef<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<CampaignStage | null>(null);

  function openAdd() {
    setEditingCampaign(null);
    setForm(buildBlankCampaign());
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(campaign: Campaign) {
    setEditingCampaign(campaign);
    setForm({
      name: campaign.name,
      description: campaign.description,
      platforms: campaign.platforms,
      goal: campaign.goal,
      targetAudience: campaign.targetAudience,
      budget: campaign.budget,
      startDate: campaign.startDate,
      endDate: campaign.endDate,
      stage: campaign.stage,
      priority: campaign.priority,
      notes: campaign.notes,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.name.trim()) errors.name = 'Campaign name is required';
    if (!form.startDate) errors.startDate = 'Start date is required';
    if (!form.endDate) errors.endDate = 'End date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const now = nowISO();
    if (editingCampaign) {
      dispatch({
        type: 'UPDATE_CAMPAIGN',
        payload: { ...editingCampaign, ...form, updatedAt: now },
      });
    } else {
      dispatch({
        type: 'ADD_CAMPAIGN',
        payload: { id: generateId(), ...form, createdAt: now, updatedAt: now },
      });
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_CAMPAIGN', payload: id });
    setDeleteId(null);
  }

  // Drag handlers
  function onDragStart(e: React.DragEvent, id: string) {
    dragIdRef.current = id;
    e.dataTransfer.effectAllowed = 'move';
  }

  function onDragOver(e: React.DragEvent, stage: CampaignStage) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverStage(stage);
  }

  function onDragLeave() {
    setDragOverStage(null);
  }

  function onDrop(e: React.DragEvent, stage: CampaignStage) {
    e.preventDefault();
    const id = dragIdRef.current;
    if (id) {
      dispatch({ type: 'MOVE_CAMPAIGN', payload: { id, stage } });
    }
    dragIdRef.current = null;
    setDragOverStage(null);
  }

  function onDragEnd() {
    dragIdRef.current = null;
    setDragOverStage(null);
  }

  function togglePlatform(p: Platform) {
    setForm((f) => ({
      ...f,
      platforms: f.platforms.includes(p)
        ? f.platforms.filter((x) => x !== p)
        : [...f.platforms, p],
    }));
  }

  return (
    <div className="p-5 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-heading font-bold text-[#F5F5F5] tracking-wide uppercase">
          Campaign Pipeline
        </h1>
        <Button size="sm" onClick={openAdd}>
          <Plus size={14} /> New Campaign
        </Button>
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-4 -mx-1 px-1">
        {STAGES.map((stage) => {
          const stageCampaigns = campaigns.filter((c) => c.stage === stage);
          const isDragTarget = dragOverStage === stage;
          return (
            <div
              key={stage}
              className={clsx(
                'flex-shrink-0 w-60 flex flex-col rounded-xl border transition-colors',
                isDragTarget
                  ? 'border-orange-500/40 bg-orange-500/5'
                  : 'border-[#2A2A2A] bg-[#111111]'
              )}
              onDragOver={(e) => onDragOver(e, stage)}
              onDragLeave={onDragLeave}
              onDrop={(e) => onDrop(e, stage)}
            >
              {/* Column header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#2A2A2A]">
                <h2 className="text-xs font-heading font-semibold text-[#F5F5F5] uppercase tracking-wide">
                  {STAGE_CONFIG[stage].label}
                </h2>
                <span className="text-xs text-[#6B6B6B] bg-[#1A1A1A] rounded-full px-2 py-0.5">
                  {stageCampaigns.length}
                </span>
              </div>

              {/* Cards */}
              <div className="flex-1 p-2 space-y-2 min-h-[120px]">
                {stageCampaigns.length === 0 && (
                  <div className="h-16 flex items-center justify-center border border-dashed border-[#2A2A2A] rounded-lg">
                    <p className="text-[10px] text-[#333]">Drop here</p>
                  </div>
                )}
                {stageCampaigns.map((campaign) => (
                  <div
                    key={campaign.id}
                    draggable
                    onDragStart={(e) => onDragStart(e, campaign.id)}
                    onDragEnd={onDragEnd}
                    className="bg-[#1A1A1A] border border-[#2A2A2A] rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-[#3A3A3A] transition-colors group"
                  >
                    {/* Top row */}
                    <div className="flex items-start gap-2 mb-2">
                      <GripVertical size={12} className="text-[#333] mt-0.5 flex-shrink-0 group-hover:text-[#6B6B6B]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-[#F5F5F5] leading-snug mb-1">
                          {campaign.name}
                        </p>
                        {/* Priority + Goal badges */}
                        <div className="flex flex-wrap gap-1">
                          <span
                            className={clsx(
                              'inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-medium border',
                              PRIORITY_CONFIG[campaign.priority].color
                            )}
                          >
                            {campaign.priority}
                          </span>
                          <Badge variant={goalBadgeVariant(campaign.goal)} className="text-[9px] px-1.5 py-0.5">
                            {campaign.goal}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Platforms */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {campaign.platforms.map((p) => (
                        <div
                          key={p}
                          className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-[#222] text-[9px] text-[#6B6B6B]"
                        >
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: PLATFORM_CONFIG[p].color }}
                          />
                          {PLATFORM_CONFIG[p].label}
                        </div>
                      ))}
                    </div>

                    {/* Due date + actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-[9px] text-[#6B6B6B]">
                        <Calendar size={10} />
                        {formatShortDate(campaign.endDate)}
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); openEdit(campaign); }}
                          className="p-1 rounded text-[#6B6B6B] hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                          aria-label="Edit campaign"
                        >
                          <Pencil size={10} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteId(campaign.id); }}
                          className="p-1 rounded text-[#6B6B6B] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          aria-label="Delete campaign"
                        >
                          <Trash2 size={10} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add to column */}
              <button
                onClick={openAdd}
                className="flex items-center justify-center gap-1.5 mx-2 mb-2 py-2 text-[10px] text-[#6B6B6B] hover:text-orange-400 border border-dashed border-[#2A2A2A] hover:border-orange-500/30 rounded-lg transition-colors"
              >
                <Plus size={10} /> Add
              </button>
            </div>
          );
        })}
      </div>

      {campaigns.length === 0 && (
        <EmptyState
          icon={Target}
          title="No campaigns yet"
          description="Create your first campaign to organize your content around a goal."
          action={{ label: '+ New Campaign', onClick: openAdd }}
        />
      )}

      {/* Campaign modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCampaign ? 'Edit Campaign' : 'New Campaign'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            {editingCampaign && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setModalOpen(false);
                  setDeleteId(editingCampaign.id);
                }}
              >
                <Trash2 size={12} /> Delete
              </Button>
            )}
            <Button size="sm" onClick={handleSave}>
              {editingCampaign ? 'Save Changes' : 'Create Campaign'}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
              Campaign Name <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Q2 Lead Generation Push"
              className={clsx(
                'w-full h-9 px-3 text-sm bg-[#0A0A0A] border rounded-lg text-[#F5F5F5] placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500/60',
                formErrors.name ? 'border-red-500/50' : 'border-[#2A2A2A]'
              )}
            />
            {formErrors.name && <p className="text-[10px] text-red-400 mt-1">{formErrors.name}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={2}
              placeholder="What is this campaign trying to achieve?"
              className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500/60 resize-none"
            />
          </div>

          {/* Goal + Priority row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Goal</label>
              <select
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value as ContentGoal }))}
                className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60"
              >
                {GOALS.map((g) => (
                  <option key={g} value={g} className="capitalize">{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Priority</label>
              <select
                value={form.priority}
                onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value as Priority }))}
                className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p} className="capitalize">{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Stage */}
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Stage</label>
            <select
              value={form.stage}
              onChange={(e) => setForm((f) => ({ ...f, stage: e.target.value as CampaignStage }))}
              className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60"
            >
              {STAGES.map((s) => (
                <option key={s} value={s}>{STAGE_CONFIG[s].label}</option>
              ))}
            </select>
          </div>

          {/* Platforms */}
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-2">Platforms</label>
            <div className="flex flex-wrap gap-2">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => togglePlatform(p)}
                  className={clsx(
                    'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs border transition-colors',
                    form.platforms.includes(p)
                      ? 'bg-orange-500/10 border-orange-500/40 text-orange-400'
                      : 'bg-[#0A0A0A] border-[#2A2A2A] text-[#6B6B6B] hover:border-[#3A3A3A]'
                  )}
                >
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: PLATFORM_CONFIG[p].color }}
                  />
                  {PLATFORM_CONFIG[p].label}
                </button>
              ))}
            </div>
          </div>

          {/* Target audience */}
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
              <Users size={11} className="inline mr-1" />Target Audience
            </label>
            <input
              type="text"
              value={form.targetAudience}
              onChange={(e) => setForm((f) => ({ ...f, targetAudience: e.target.value }))}
              placeholder="e.g. Small business owners, 30–50, service-based"
              className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500/60"
            />
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Budget (optional)</label>
            <input
              type="number"
              min="0"
              value={form.budget ?? ''}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  budget: e.target.value === '' ? undefined : Number(e.target.value),
                }))
              }
              placeholder="0"
              className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500/60"
            />
          </div>

          {/* Dates row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                Start Date <span className="text-orange-500">*</span>
              </label>
              <input
                type="date"
                value={form.startDate}
                onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))}
                className={clsx(
                  'w-full h-9 px-3 text-sm bg-[#0A0A0A] border rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60',
                  formErrors.startDate ? 'border-red-500/50' : 'border-[#2A2A2A]'
                )}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                End Date <span className="text-orange-500">*</span>
              </label>
              <input
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))}
                className={clsx(
                  'w-full h-9 px-3 text-sm bg-[#0A0A0A] border rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60',
                  formErrors.endDate ? 'border-red-500/50' : 'border-[#2A2A2A]'
                )}
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Notes</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={2}
              placeholder="Any additional context, links, or strategy notes..."
              className="w-full px-3 py-2 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500/60 resize-none"
            />
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Campaign"
        description="This campaign will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
