'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Loader2 } from 'lucide-react'
import type { CmsSection, SectionType } from '@/types/cms'

interface Props {
  section: CmsSection | null
  pageId: string
  onClose: () => void
  onSave: () => void
}

const SECTION_TYPES: { value: SectionType; label: string }[] = [
  { value: 'hero',          label: 'Hero / Mascot Banner' },
  { value: 'product_grid',  label: 'Product Grid' },
  { value: 'how_it_works',  label: 'How It Works Steps' },
  { value: 'feature_list',  label: 'Feature List' },
  { value: 'cta_banner',    label: 'CTA Banner' },
  { value: 'testimonials',  label: 'Testimonials' },
  { value: 'faq',           label: 'FAQ Accordion' },
  { value: 'rich_text',     label: 'Rich Text Block' },
  { value: 'image_text',    label: 'Image + Text' },
  { value: 'subscribe',     label: 'Subscribe Bar' },
]

type FormState = Record<string, unknown>

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-xs uppercase tracking-widest text-text-faint">{label}</label>
      {children}
    </div>
  )
}

function TextInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="min-h-[40px] bg-surface border border-bvp-border text-text placeholder-text-faint rounded px-3 py-2 font-body text-sm focus:border-orange focus:outline-none transition-colors w-full"
    />
  )
}

function TextArea({ value, onChange, placeholder, rows = 3 }: { value: string; onChange: (v: string) => void; placeholder?: string; rows?: number }) {
  return (
    <textarea
      value={value || ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="bg-surface border border-bvp-border text-text placeholder-text-faint rounded px-3 py-2 font-body text-sm focus:border-orange focus:outline-none transition-colors w-full resize-y"
    />
  )
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex items-center gap-3 cursor-pointer">
      <div
        onClick={() => onChange(!checked)}
        className={`relative w-11 h-6 rounded-full transition-colors ${checked ? 'bg-orange' : 'bg-bvp-border'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </div>
      <span className="font-body text-sm text-text">{label}</span>
    </label>
  )
}

function HeroFields({ data, onChange }: { data: FormState; onChange: (d: FormState) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Badge Text"><TextInput value={data.badge as string} onChange={v => set('badge', v)} placeholder="// AI AUTOMATION" /></FieldGroup>
      <FieldGroup label="Headline"><TextInput value={data.headline as string} onChange={v => set('headline', v)} placeholder="AI Automation Built For Trades" /></FieldGroup>
      <FieldGroup label="Subheadline"><TextArea value={data.subheadline as string} onChange={v => set('subheadline', v)} rows={2} /></FieldGroup>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Primary CTA Text"><TextInput value={data.cta_primary_text as string} onChange={v => set('cta_primary_text', v)} /></FieldGroup>
        <FieldGroup label="Primary CTA URL"><TextInput value={data.cta_primary_url as string} onChange={v => set('cta_primary_url', v)} placeholder="#products" /></FieldGroup>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="Secondary CTA Text"><TextInput value={data.cta_secondary_text as string} onChange={v => set('cta_secondary_text', v)} /></FieldGroup>
        <FieldGroup label="Secondary CTA URL"><TextInput value={data.cta_secondary_url as string} onChange={v => set('cta_secondary_url', v)} /></FieldGroup>
      </div>
      <div className="grid grid-cols-3 gap-4">
        <FieldGroup label="Stat 1"><TextInput value={data.stat_1 as string} onChange={v => set('stat_1', v)} placeholder="500+ Hours Saved" /></FieldGroup>
        <FieldGroup label="Stat 2"><TextInput value={data.stat_2 as string} onChange={v => set('stat_2', v)} placeholder="Trades-Specific" /></FieldGroup>
        <FieldGroup label="Stat 3"><TextInput value={data.stat_3 as string} onChange={v => set('stat_3', v)} placeholder="No Tech Skills" /></FieldGroup>
      </div>
      <Toggle checked={Boolean(data.show_mascot !== false)} onChange={v => set('show_mascot', v)} label="Show Mascot" />
    </div>
  )
}

function ProductGridFields({ data, onChange }: { data: FormState; onChange: (d: FormState) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Headline"><TextInput value={data.headline as string} onChange={v => set('headline', v)} /></FieldGroup>
      <FieldGroup label="Subheadline"><TextArea value={data.subheadline as string} onChange={v => set('subheadline', v)} rows={2} /></FieldGroup>
      <Toggle checked={Boolean(data.show_featured_only)} onChange={v => set('show_featured_only', v)} label="Show Featured Products Only" />
    </div>
  )
}

function HowItWorksFields({ data, onChange }: { data: FormState; onChange: (d: FormState) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })
  const steps = (data.steps as { number: string; title: string; body: string }[]) || []

  function updateStep(i: number, field: string, value: string) {
    const updated = [...steps]
    updated[i] = { ...updated[i], [field]: value }
    set('steps', updated)
  }

  function addStep() {
    set('steps', [...steps, { number: String(steps.length + 1).padStart(2, '0'), title: '', body: '' }])
  }

  function removeStep(i: number) {
    set('steps', steps.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Headline"><TextInput value={data.headline as string} onChange={v => set('headline', v)} /></FieldGroup>
      <FieldGroup label="Subheadline"><TextInput value={data.subheadline as string} onChange={v => set('subheadline', v)} /></FieldGroup>
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-body text-xs uppercase tracking-widest text-text-faint">Steps</label>
          <button onClick={addStep} className="flex items-center gap-1 text-xs text-orange hover:text-orange-hover font-body uppercase tracking-wider">
            <Plus size={12} /> Add Step
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <div key={i} className="p-3 bg-surface2 rounded border border-bvp-border">
              <div className="flex items-center justify-between mb-2">
                <span className="font-mono text-xs text-orange">{step.number}</span>
                <button onClick={() => removeStep(i)} className="text-text-faint hover:text-red-400 transition-colors">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex flex-col gap-2">
                <TextInput value={step.number} onChange={v => updateStep(i, 'number', v)} placeholder="01" />
                <TextInput value={step.title} onChange={v => updateStep(i, 'title', v)} placeholder="Step title" />
                <TextArea value={step.body} onChange={v => updateStep(i, 'body', v)} rows={2} placeholder="Step description" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CtaBannerFields({ data, onChange }: { data: FormState; onChange: (d: FormState) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Headline"><TextInput value={data.headline as string} onChange={v => set('headline', v)} /></FieldGroup>
      <FieldGroup label="Subheadline"><TextArea value={data.subheadline as string} onChange={v => set('subheadline', v)} rows={2} /></FieldGroup>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="CTA Text"><TextInput value={data.cta_text as string} onChange={v => set('cta_text', v)} /></FieldGroup>
        <FieldGroup label="CTA URL"><TextInput value={data.cta_url as string} onChange={v => set('cta_url', v)} /></FieldGroup>
      </div>
      <FieldGroup label="Style">
        <select
          value={(data.style as string) || 'orange'}
          onChange={e => set('style', e.target.value)}
          className="min-h-[40px] bg-surface border border-bvp-border text-text rounded px-3 py-2 font-body text-sm focus:border-orange focus:outline-none"
        >
          <option value="orange">Orange</option>
          <option value="dark">Dark</option>
          <option value="gradient">Gradient</option>
        </select>
      </FieldGroup>
    </div>
  )
}

function TestimonialsFields({ data, onChange }: { data: FormState; onChange: (d: FormState) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })
  const testimonials = (data.testimonials as { quote: string; name: string; company: string; rating: number }[]) || []

  function updateT(i: number, field: string, value: string | number) {
    const updated = [...testimonials]
    updated[i] = { ...updated[i], [field]: value }
    set('testimonials', updated)
  }

  function addT() {
    set('testimonials', [...testimonials, { quote: '', name: '', company: '', rating: 5 }])
  }

  function removeT(i: number) {
    set('testimonials', testimonials.filter((_, idx) => idx !== i))
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Headline"><TextInput value={data.headline as string} onChange={v => set('headline', v)} /></FieldGroup>
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-body text-xs uppercase tracking-widest text-text-faint">Testimonials</label>
          <button onClick={addT} className="flex items-center gap-1 text-xs text-orange hover:text-orange-hover font-body uppercase tracking-wider">
            <Plus size={12} /> Add
          </button>
        </div>
        {testimonials.map((t, i) => (
          <div key={i} className="p-3 bg-surface2 rounded border border-bvp-border mb-3">
            <div className="flex justify-end mb-2">
              <button onClick={() => removeT(i)} className="text-text-faint hover:text-red-400"><Trash2 size={12} /></button>
            </div>
            <div className="flex flex-col gap-2">
              <TextArea value={t.quote} onChange={v => updateT(i, 'quote', v)} placeholder="Quote" rows={2} />
              <TextInput value={t.name} onChange={v => updateT(i, 'name', v)} placeholder="Name" />
              <TextInput value={t.company} onChange={v => updateT(i, 'company', v)} placeholder="Company" />
              <div className="flex items-center gap-2">
                <label className="font-body text-xs text-text-faint">Rating:</label>
                <input type="number" min={1} max={5} value={t.rating || 5} onChange={e => updateT(i, 'rating', parseInt(e.target.value))}
                  className="w-16 min-h-[32px] bg-surface border border-bvp-border text-text rounded px-2 py-1 font-mono text-sm focus:border-orange focus:outline-none" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function FaqFields({ data, onChange }: { data: FormState; onChange: (d: FormState) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })
  const faqs = (data.faqs as { question: string; answer: string }[]) || []

  function updateFaq(i: number, field: string, value: string) {
    const updated = [...faqs]
    updated[i] = { ...updated[i], [field]: value }
    set('faqs', updated)
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Headline"><TextInput value={data.headline as string} onChange={v => set('headline', v)} /></FieldGroup>
      <FieldGroup label="Subheadline"><TextInput value={data.subheadline as string} onChange={v => set('subheadline', v)} /></FieldGroup>
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-body text-xs uppercase tracking-widest text-text-faint">FAQs</label>
          <button onClick={() => set('faqs', [...faqs, { question: '', answer: '' }])} className="flex items-center gap-1 text-xs text-orange font-body uppercase tracking-wider">
            <Plus size={12} /> Add FAQ
          </button>
        </div>
        {faqs.map((faq, i) => (
          <div key={i} className="p-3 bg-surface2 rounded border border-bvp-border mb-3">
            <div className="flex justify-end mb-2">
              <button onClick={() => set('faqs', faqs.filter((_, idx) => idx !== i))} className="text-text-faint hover:text-red-400"><Trash2 size={12} /></button>
            </div>
            <div className="flex flex-col gap-2">
              <TextInput value={faq.question} onChange={v => updateFaq(i, 'question', v)} placeholder="Question" />
              <TextArea value={faq.answer} onChange={v => updateFaq(i, 'answer', v)} rows={3} placeholder="Answer" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RichTextFields({ data, onChange }: { data: FormState; onChange: (d: FormState) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Headline"><TextInput value={data.headline as string} onChange={v => set('headline', v)} /></FieldGroup>
      <FieldGroup label="Body (HTML)"><TextArea value={data.body as string} onChange={v => set('body', v)} rows={8} placeholder="<p>Your content...</p>" /></FieldGroup>
    </div>
  )
}

function ImageTextFields({ data, onChange }: { data: FormState; onChange: (d: FormState) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Headline"><TextInput value={data.headline as string} onChange={v => set('headline', v)} /></FieldGroup>
      <FieldGroup label="Body"><TextArea value={data.body as string} onChange={v => set('body', v)} rows={3} /></FieldGroup>
      <FieldGroup label="Image URL"><TextInput value={data.image_url as string} onChange={v => set('image_url', v)} placeholder="https://..." /></FieldGroup>
      <FieldGroup label="Image Alt Text"><TextInput value={data.image_alt as string} onChange={v => set('image_alt', v)} /></FieldGroup>
      <FieldGroup label="Image Position">
        <select value={(data.image_position as string) || 'left'} onChange={e => set('image_position', e.target.value)}
          className="min-h-[40px] bg-surface border border-bvp-border text-text rounded px-3 py-2 font-body text-sm focus:border-orange focus:outline-none">
          <option value="left">Left</option>
          <option value="right">Right</option>
        </select>
      </FieldGroup>
      <div className="grid grid-cols-2 gap-4">
        <FieldGroup label="CTA Text"><TextInput value={data.cta_text as string} onChange={v => set('cta_text', v)} /></FieldGroup>
        <FieldGroup label="CTA URL"><TextInput value={data.cta_url as string} onChange={v => set('cta_url', v)} /></FieldGroup>
      </div>
    </div>
  )
}

function SubscribeFields({ data, onChange }: { data: FormState; onChange: (d: FormState) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })
  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Headline"><TextInput value={data.headline as string} onChange={v => set('headline', v)} /></FieldGroup>
      <FieldGroup label="Subheadline"><TextInput value={data.subheadline as string} onChange={v => set('subheadline', v)} /></FieldGroup>
      <FieldGroup label="Button Text"><TextInput value={data.button_text as string} onChange={v => set('button_text', v)} placeholder="Subscribe" /></FieldGroup>
      <FieldGroup label="Success Message"><TextInput value={data.success_message as string} onChange={v => set('success_message', v)} placeholder="You are in. Watch your inbox." /></FieldGroup>
    </div>
  )
}

function FeatureListFields({ data, onChange }: { data: FormState; onChange: (d: FormState) => void }) {
  const set = (k: string, v: unknown) => onChange({ ...data, [k]: v })
  const features = (data.features as { icon: string; title: string; body: string }[]) || []

  function updateF(i: number, field: string, value: string) {
    const updated = [...features]
    updated[i] = { ...updated[i], [field]: value }
    set('features', updated)
  }

  return (
    <div className="flex flex-col gap-4">
      <FieldGroup label="Headline"><TextInput value={data.headline as string} onChange={v => set('headline', v)} /></FieldGroup>
      <FieldGroup label="Subheadline"><TextInput value={data.subheadline as string} onChange={v => set('subheadline', v)} /></FieldGroup>
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="font-body text-xs uppercase tracking-widest text-text-faint">Features</label>
          <button onClick={() => set('features', [...features, { icon: 'Zap', title: '', body: '' }])} className="flex items-center gap-1 text-xs text-orange font-body uppercase tracking-wider">
            <Plus size={12} /> Add Feature
          </button>
        </div>
        {features.map((f, i) => (
          <div key={i} className="p-3 bg-surface2 rounded border border-bvp-border mb-3">
            <div className="flex justify-end mb-2">
              <button onClick={() => set('features', features.filter((_, idx) => idx !== i))} className="text-text-faint hover:text-red-400"><Trash2 size={12} /></button>
            </div>
            <div className="flex flex-col gap-2">
              <TextInput value={f.icon} onChange={v => updateF(i, 'icon', v)} placeholder="Lucide icon name (e.g. Zap)" />
              <TextInput value={f.title} onChange={v => updateF(i, 'title', v)} placeholder="Feature title" />
              <TextArea value={f.body} onChange={v => updateF(i, 'body', v)} rows={2} placeholder="Feature description" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SectionFields({ type, data, onChange }: { type: SectionType; data: FormState; onChange: (d: FormState) => void }) {
  switch (type) {
    case 'hero':          return <HeroFields data={data} onChange={onChange} />
    case 'product_grid':  return <ProductGridFields data={data} onChange={onChange} />
    case 'how_it_works':  return <HowItWorksFields data={data} onChange={onChange} />
    case 'feature_list':  return <FeatureListFields data={data} onChange={onChange} />
    case 'cta_banner':    return <CtaBannerFields data={data} onChange={onChange} />
    case 'testimonials':  return <TestimonialsFields data={data} onChange={onChange} />
    case 'faq':           return <FaqFields data={data} onChange={onChange} />
    case 'rich_text':     return <RichTextFields data={data} onChange={onChange} />
    case 'image_text':    return <ImageTextFields data={data} onChange={onChange} />
    case 'subscribe':     return <SubscribeFields data={data} onChange={onChange} />
    default:              return null
  }
}

export default function SectionEditorModal({ section, pageId, onClose, onSave }: Props) {
  const isNew = !section
  const [type, setType] = useState<SectionType>(section?.section_type || 'hero')
  const [formData, setFormData] = useState<FormState>(section?.content || {})
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        page_id: pageId,
        section_type: type,
        content: formData,
        is_active: section?.is_active ?? true,
        sort_order: section?.sort_order ?? 99,
        ...(section?.id ? { id: section.id } : {}),
      }

      const res = await fetch('/api/admin/sections', {
        method: section?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        onSave()
        onClose()
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="w-full max-w-2xl bg-surface border border-bvp-border rounded-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-bvp-border flex-shrink-0">
          <h2 className="font-display text-xl uppercase tracking-wide text-text">
            {isNew ? 'Add Section' : 'Edit Section'}
          </h2>
          <button onClick={onClose} className="text-text-muted hover:text-text transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {isNew && (
            <div className="mb-6">
              <label className="font-body text-xs uppercase tracking-widest text-text-faint block mb-2">Section Type</label>
              <select
                value={type}
                onChange={e => { setType(e.target.value as SectionType); setFormData({}) }}
                className="w-full min-h-[40px] bg-surface2 border border-bvp-border text-text rounded px-3 py-2 font-body text-sm focus:border-orange focus:outline-none"
              >
                {SECTION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          )}

          <SectionFields type={type} data={formData} onChange={setFormData} />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-bvp-border flex-shrink-0">
          <button onClick={onClose} className="min-h-[40px] px-5 py-2 font-body text-sm uppercase tracking-wider text-text-muted hover:text-text transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center min-h-[40px] px-6 py-2 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : 'Save Section'}
          </button>
        </div>
      </div>
    </div>
  )
}
