'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Plus, Trash2, Edit2, Loader2 } from 'lucide-react'
import type { CmsPage, CmsSection, SectionType } from '@/types/cms'
import SectionEditorModal from '@/components/admin/SectionEditorModal'

const SECTION_LABELS: Record<SectionType, string> = {
  hero:          'Hero / Mascot Banner',
  product_grid:  'Product Grid',
  how_it_works:  'How It Works Steps',
  feature_list:  'Feature List',
  cta_banner:    'CTA Banner',
  testimonials:  'Testimonials',
  faq:           'FAQ Accordion',
  rich_text:     'Rich Text Block',
  image_text:    'Image + Text',
  subscribe:     'Subscribe Bar',
}

function SortableRow({
  section,
  onEdit,
  onDelete,
  onToggle,
}: {
  section: CmsSection
  onEdit: (s: CmsSection) => void
  onDelete: (id: string) => void
  onToggle: (id: string, value: boolean) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 px-4 py-3 bg-surface border border-bvp-border rounded-lg"
    >
      <button {...attributes} {...listeners} className="flex-shrink-0 text-text-faint hover:text-text-muted cursor-grab active:cursor-grabbing touch-none">
        <GripVertical size={16} />
      </button>

      <div className="flex-1 min-w-0">
        <span className="font-body text-sm text-text">
          {SECTION_LABELS[section.section_type] || section.section_type}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => onToggle(section.id, !section.is_active)}
          className={`relative w-10 h-5 rounded-full transition-colors ${section.is_active ? 'bg-orange' : 'bg-bvp-border'}`}
        >
          <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${section.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>

        <button
          onClick={() => onEdit(section)}
          className="flex items-center justify-center w-8 h-8 text-text-muted hover:text-text transition-colors"
        >
          <Edit2 size={14} />
        </button>

        <button
          onClick={() => onDelete(section.id)}
          className="flex items-center justify-center w-8 h-8 text-text-muted hover:text-red-400 transition-colors"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

interface Props {
  pages: CmsPage[]
}

export default function SectionBuilderClient({ pages }: Props) {
  const [selectedPageId, setSelectedPageId] = useState(pages[0]?.id || '')
  const [sections, setSections] = useState<CmsSection[]>([])
  const [loading, setLoading] = useState(false)
  const [editingSection, setEditingSection] = useState<CmsSection | null | 'new'>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const loadSections = useCallback(async (pageId: string) => {
    if (!pageId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/sections?pageId=${pageId}`)
      const data = await res.json()
      setSections(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (selectedPageId) loadSections(selectedPageId)
  }, [selectedPageId, loadSections])

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const oldIndex = sections.findIndex(s => s.id === active.id)
    const newIndex = sections.findIndex(s => s.id === over.id)
    const reordered = arrayMove(sections, oldIndex, newIndex)
    setSections(reordered)

    await fetch('/api/admin/reorder-sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        items: reordered.map((s, i) => ({ id: s.id, sort_order: i + 1 })),
      }),
    })
  }

  async function handleToggle(id: string, value: boolean) {
    setSections(prev => prev.map(s => s.id === id ? { ...s, is_active: value } : s))
    await fetch('/api/admin/sections', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_active: value }),
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this section?')) return
    setSections(prev => prev.filter(s => s.id !== id))
    await fetch(`/api/admin/sections?id=${id}`, { method: 'DELETE' })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-display-sm uppercase tracking-wide text-text">BVP Section Builder</h1>
          <p className="font-body text-text-muted text-sm mt-1">Drag to reorder sections. Toggle to show/hide.</p>
        </div>
        <button
          onClick={() => setEditingSection('new')}
          className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors"
        >
          <Plus size={14} /> Add New Section
        </button>
      </div>

      {/* Page selector */}
      <div className="mb-6">
        <label className="font-body text-xs uppercase tracking-widest text-text-faint block mb-2">Page</label>
        <select
          value={selectedPageId}
          onChange={e => setSelectedPageId(e.target.value)}
          className="min-h-[42px] bg-surface border border-bvp-border text-text rounded px-4 py-2.5 font-body text-sm focus:border-orange focus:outline-none w-full max-w-sm"
        >
          {pages.map(page => (
            <option key={page.id} value={page.id}>{page.title}</option>
          ))}
        </select>
      </div>

      {/* Section list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-orange" />
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <p className="font-body text-text-faint mb-4">No sections on this page yet.</p>
          <button
            onClick={() => setEditingSection('new')}
            className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 border border-orange text-orange hover:bg-orange-muted font-body font-bold uppercase tracking-wider text-sm rounded transition-colors"
          >
            <Plus size={14} /> Add First Section
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={sections.map(s => s.id)} strategy={verticalListSortingStrategy}>
            <div className="flex flex-col gap-2">
              {sections.map(section => (
                <SortableRow
                  key={section.id}
                  section={section}
                  onEdit={s => setEditingSection(s)}
                  onDelete={handleDelete}
                  onToggle={handleToggle}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Editor modal */}
      {editingSection !== null && (
        <SectionEditorModal
          section={editingSection === 'new' ? null : editingSection}
          pageId={selectedPageId}
          onClose={() => setEditingSection(null)}
          onSave={() => loadSections(selectedPageId)}
        />
      )}
    </div>
  )
}
