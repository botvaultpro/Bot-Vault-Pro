import { useState, useMemo, useCallback } from 'react';
import { clsx } from 'clsx';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  List,
  CalendarDays,
  Trash2,
  Pencil,
  ArrowUpDown,
} from 'lucide-react';
import { format, isSameDay, isSameMonth } from 'date-fns';
import { Modal, ConfirmDialog } from '../components/ui/Modal';
import { Badge, statusBadgeVariant, goalBadgeVariant } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { useAppContext, useContentItems, generateId, nowISO } from '../context/AppContext';
import { getCalendarDays, addMonths, subMonths, formatDisplayDate, toISODate } from '../utils/dateHelpers';
import { seedEngagementScore } from '../utils/scoring';
import {
  PLATFORM_CONFIG,
  type ContentItem,
  type Platform,
  type ContentType,
  type ContentStatus,
  type ContentGoal,
} from '../types';

const PLATFORMS: Platform[] = ['instagram', 'linkedin', 'blog', 'youtube', 'email', 'twitter', 'facebook'];
const CONTENT_TYPES: ContentType[] = ['post', 'video', 'blog', 'email', 'story', 'reel', 'newsletter'];
const STATUSES: ContentStatus[] = ['draft', 'scheduled', 'published', 'archived'];
const GOALS: ContentGoal[] = ['awareness', 'engagement', 'conversion', 'retention'];

function buildBlank(date?: string): Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'> {
  return {
    title: '',
    platform: 'instagram',
    contentType: 'post',
    status: 'draft',
    goal: 'awareness',
    scheduledDate: date ?? toISODate(new Date()),
    notes: '',
  };
}

type SortKey = 'scheduledDate' | 'platform' | 'status' | 'goal' | 'title';

export default function ContentCalendar() {
  const { dispatch } = useAppContext();
  const contentItems = useContentItems();

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentItem | null>(null);
  const [form, setForm] = useState<Omit<ContentItem, 'id' | 'createdAt' | 'updatedAt'>>(buildBlank());
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Delete confirm
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Filters (list view)
  const [filterPlatform, setFilterPlatform] = useState<Platform | ''>('');
  const [filterStatus, setFilterStatus] = useState<ContentStatus | ''>('');
  const [filterGoal, setFilterGoal] = useState<ContentGoal | ''>('');
  const [sortKey, setSortKey] = useState<SortKey>('scheduledDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const calendarDays = useMemo(() => getCalendarDays(currentMonth), [currentMonth]);

  function openAdd(date?: string) {
    setEditingItem(null);
    setForm(buildBlank(date));
    setFormErrors({});
    setModalOpen(true);
  }

  function openEdit(item: ContentItem) {
    setEditingItem(item);
    setForm({
      title: item.title,
      platform: item.platform,
      contentType: item.contentType,
      status: item.status,
      goal: item.goal,
      scheduledDate: item.scheduledDate,
      notes: item.notes,
    });
    setFormErrors({});
    setModalOpen(true);
  }

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = 'Title is required';
    if (!form.scheduledDate) errors.scheduledDate = 'Date is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    const now = nowISO();
    if (editingItem) {
      dispatch({
        type: 'UPDATE_CONTENT',
        payload: {
          ...editingItem,
          ...form,
          engagementScore: seedEngagementScore({ ...editingItem, ...form }),
          updatedAt: now,
        },
      });
    } else {
      const newItem: ContentItem = {
        id: generateId(),
        ...form,
        createdAt: now,
        updatedAt: now,
      };
      newItem.engagementScore = seedEngagementScore(newItem);
      dispatch({ type: 'ADD_CONTENT', payload: newItem });
    }
    setModalOpen(false);
  }

  function handleDelete(id: string) {
    dispatch({ type: 'DELETE_CONTENT', payload: id });
    setDeleteId(null);
  }

  const itemsForDay = useCallback(
    (day: Date) =>
      contentItems.filter((item) => {
        try {
          const [y, m, d] = item.scheduledDate.split('-').map(Number);
          const itemDate = new Date(y, m - 1, d);
          return isSameDay(itemDate, day);
        } catch {
          return false;
        }
      }),
    [contentItems]
  );

  const filteredSortedItems = useMemo(() => {
    let items = contentItems.slice();
    if (filterPlatform) items = items.filter((i) => i.platform === filterPlatform);
    if (filterStatus) items = items.filter((i) => i.status === filterStatus);
    if (filterGoal) items = items.filter((i) => i.goal === filterGoal);
    items.sort((a, b) => {
      const av = a[sortKey] ?? '';
      const bv = b[sortKey] ?? '';
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items;
  }, [contentItems, filterPlatform, filterStatus, filterGoal, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-5 md:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-xl font-heading font-bold text-[#F5F5F5] tracking-wide uppercase">
          Content Calendar
        </h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('month')}
            className={clsx(
              'p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40',
              viewMode === 'month'
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                : 'text-[#6B6B6B] hover:text-[#F5F5F5] border border-[#2A2A2A]'
            )}
            aria-label="Month view"
          >
            <CalendarDays size={15} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={clsx(
              'p-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40',
              viewMode === 'list'
                ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20'
                : 'text-[#6B6B6B] hover:text-[#F5F5F5] border border-[#2A2A2A]'
            )}
            aria-label="List view"
          >
            <List size={15} />
          </button>
          <Button size="sm" onClick={() => openAdd()}>
            <Plus size={14} /> Add Content
          </Button>
        </div>
      </div>

      {/* Month view */}
      {viewMode === 'month' && (
        <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] overflow-hidden">
          {/* Month nav */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A2A]">
            <button
              onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
              className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              aria-label="Previous month"
            >
              <ChevronLeft size={16} />
            </button>
            <h2 className="text-sm font-heading font-semibold text-[#F5F5F5] tracking-wide">
              {format(currentMonth, 'MMMM yyyy')}
            </h2>
            <button
              onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
              className="p-1.5 rounded-lg text-[#6B6B6B] hover:text-[#F5F5F5] hover:bg-[#1A1A1A] transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500/40"
              aria-label="Next month"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Week day headers */}
          <div className="grid grid-cols-7 border-b border-[#2A2A2A]">
            {WEEK_DAYS.map((d) => (
              <div
                key={d}
                className="py-2 text-center text-[10px] font-medium text-[#6B6B6B] uppercase tracking-wider"
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7">
            {calendarDays.map((day, i) => {
              const isToday = isSameDay(day, new Date());
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const dayItems = itemsForDay(day);

              return (
                <div
                  key={i}
                  className={clsx(
                    'min-h-[72px] md:min-h-[90px] p-1.5 border-b border-r border-[#1A1A1A] cursor-pointer transition-colors',
                    isCurrentMonth ? 'bg-[#111111] hover:bg-[#1A1A1A]' : 'bg-[#0A0A0A]',
                    i % 7 === 6 && 'border-r-0'
                  )}
                  onClick={() => {
                    if (isCurrentMonth) {
                      openAdd(toISODate(day));
                    }
                  }}
                >
                  <div
                    className={clsx(
                      'w-6 h-6 flex items-center justify-center rounded-full text-xs font-medium mb-1',
                      isToday
                        ? 'bg-orange-500 text-white'
                        : isCurrentMonth
                        ? 'text-[#A3A3A3]'
                        : 'text-[#333]'
                    )}
                  >
                    {format(day, 'd')}
                  </div>
                  <div className="space-y-0.5">
                    {dayItems.slice(0, 3).map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-1 px-1 py-0.5 rounded text-[9px] text-[#A3A3A3] hover:text-[#F5F5F5] bg-[#1A1A1A] hover:bg-[#222] transition-colors truncate"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEdit(item);
                        }}
                        title={item.title}
                      >
                        <div
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: PLATFORM_CONFIG[item.platform].color }}
                        />
                        <span className="truncate">{item.title}</span>
                      </div>
                    ))}
                    {dayItems.length > 3 && (
                      <div className="text-[9px] text-[#6B6B6B] px-1">
                        +{dayItems.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Platform legend */}
          <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-t border-[#1A1A1A]">
            {PLATFORMS.map((p) => (
              <div key={p} className="flex items-center gap-1.5">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: PLATFORM_CONFIG[p].color }}
                />
                <span className="text-[10px] text-[#6B6B6B]">{PLATFORM_CONFIG[p].label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List view */}
      {viewMode === 'list' && (
        <div className="space-y-3">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value as Platform | '')}
              className="h-8 px-2 text-xs bg-[#111111] border border-[#2A2A2A] rounded-lg text-[#A3A3A3] focus:outline-none focus:border-orange-500/50"
            >
              <option value="">All Platforms</option>
              {PLATFORMS.map((p) => (
                <option key={p} value={p}>
                  {PLATFORM_CONFIG[p].label}
                </option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as ContentStatus | '')}
              className="h-8 px-2 text-xs bg-[#111111] border border-[#2A2A2A] rounded-lg text-[#A3A3A3] focus:outline-none focus:border-orange-500/50"
            >
              <option value="">All Statuses</option>
              {STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
            <select
              value={filterGoal}
              onChange={(e) => setFilterGoal(e.target.value as ContentGoal | '')}
              className="h-8 px-2 text-xs bg-[#111111] border border-[#2A2A2A] rounded-lg text-[#A3A3A3] focus:outline-none focus:border-orange-500/50"
            >
              <option value="">All Goals</option>
              {GOALS.map((g) => (
                <option key={g} value={g} className="capitalize">
                  {g}
                </option>
              ))}
            </select>
          </div>

          {filteredSortedItems.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="No content yet"
              description="Add your first content piece to get started."
              action={{ label: '+ Add Content', onClick: () => openAdd() }}
            />
          ) : (
            <div className="rounded-xl border border-[#2A2A2A] bg-[#111111] overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    {(
                      [
                        ['title', 'Title'],
                        ['platform', 'Platform'],
                        ['status', 'Status'],
                        ['goal', 'Goal'],
                        ['scheduledDate', 'Date'],
                      ] as [SortKey, string][]
                    ).map(([key, label]) => (
                      <th
                        key={key}
                        className="px-3 py-2.5 font-medium text-[#6B6B6B] uppercase tracking-wider cursor-pointer hover:text-[#A3A3A3] transition-colors whitespace-nowrap"
                        onClick={() => toggleSort(key)}
                      >
                        <span className="flex items-center gap-1">
                          {label}
                          <ArrowUpDown size={10} />
                        </span>
                      </th>
                    ))}
                    <th className="px-3 py-2.5" />
                  </tr>
                </thead>
                <tbody>
                  {filteredSortedItems.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#1A1A1A] last:border-b-0 hover:bg-[#1A1A1A] transition-colors"
                    >
                      <td className="px-3 py-2.5 text-[#F5F5F5] font-medium max-w-[200px] truncate">
                        {item.title}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: PLATFORM_CONFIG[item.platform].color }}
                          />
                          <span className="text-[#A3A3A3]">{PLATFORM_CONFIG[item.platform].label}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge variant={goalBadgeVariant(item.goal)}>{item.goal}</Badge>
                      </td>
                      <td className="px-3 py-2.5 text-[#A3A3A3] whitespace-nowrap">
                        {formatDisplayDate(item.scheduledDate)}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1 rounded text-[#6B6B6B] hover:text-orange-400 hover:bg-orange-500/10 transition-colors"
                            aria-label="Edit"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => setDeleteId(item.id)}
                            className="p-1 rounded text-[#6B6B6B] hover:text-red-400 hover:bg-red-500/10 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Edit Content' : 'Add Content'}
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            {editingItem && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  setModalOpen(false);
                  setDeleteId(editingItem.id);
                }}
              >
                <Trash2 size={12} /> Delete
              </Button>
            )}
            <Button size="sm" onClick={handleSave}>
              {editingItem ? 'Save Changes' : 'Add Content'}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
              Title <span className="text-orange-500">*</span>
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. 5 Tips for Growing Your Audience"
              className={clsx(
                'w-full h-9 px-3 text-sm bg-[#0A0A0A] border rounded-lg text-[#F5F5F5] placeholder-[#6B6B6B] focus:outline-none focus:border-orange-500/60',
                formErrors.title ? 'border-red-500/50' : 'border-[#2A2A2A]'
              )}
            />
            {formErrors.title && (
              <p className="text-[10px] text-red-400 mt-1">{formErrors.title}</p>
            )}
          </div>

          {/* Row: Platform + Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value as Platform }))}
                className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {PLATFORM_CONFIG[p].label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Content Type</label>
              <select
                value={form.contentType}
                onChange={(e) => setForm((f) => ({ ...f, contentType: e.target.value as ContentType }))}
                className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60"
              >
                {CONTENT_TYPES.map((t) => (
                  <option key={t} value={t} className="capitalize">
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row: Status + Goal */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ContentStatus }))}
                className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Goal</label>
              <select
                value={form.goal}
                onChange={(e) => setForm((f) => ({ ...f, goal: e.target.value as ContentGoal }))}
                className="w-full h-9 px-3 text-sm bg-[#0A0A0A] border border-[#2A2A2A] rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60"
              >
                {GOALS.map((g) => (
                  <option key={g} value={g} className="capitalize">
                    {g}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
              Scheduled Date <span className="text-orange-500">*</span>
            </label>
            <input
              type="date"
              value={form.scheduledDate}
              onChange={(e) => setForm((f) => ({ ...f, scheduledDate: e.target.value }))}
              className={clsx(
                'w-full h-9 px-3 text-sm bg-[#0A0A0A] border rounded-lg text-[#F5F5F5] focus:outline-none focus:border-orange-500/60',
                formErrors.scheduledDate ? 'border-red-500/50' : 'border-[#2A2A2A]'
              )}
            />
            {formErrors.scheduledDate && (
              <p className="text-[10px] text-red-400 mt-1">{formErrors.scheduledDate}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
              Notes / Caption
            </label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Caption, talking points, or strategy notes..."
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
        title="Delete Content"
        description="This content item will be permanently deleted. This action cannot be undone."
        confirmLabel="Delete"
        danger
      />
    </div>
  );
}
