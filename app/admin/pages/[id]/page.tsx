'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/cms-utils'
import type { CmsPage } from '@/types/cms'

const inputCls = "min-h-[42px] bg-surface2 border border-bvp-border text-text placeholder-text-faint rounded px-4 py-2.5 font-body text-sm focus:border-orange focus:outline-none transition-colors w-full"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-xs uppercase tracking-widest text-text-faint">{label}</label>
      {children}
    </div>
  )
}

export default function PageEditPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const [form, setForm] = useState({
    title: '',
    slug: '',
    meta_title: '',
    meta_description: '',
    show_in_nav: false,
    nav_label: '',
    nav_order: 0,
    is_active: true,
  })

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/pages/${params.id}`)
        .then(r => r.json())
        .then((p: CmsPage) => {
          setForm({
            title: p.title || '',
            slug: p.slug || '',
            meta_title: p.meta_title || '',
            meta_description: p.meta_description || '',
            show_in_nav: p.show_in_nav,
            nav_label: p.nav_label || '',
            nav_order: p.nav_order || 0,
            is_active: p.is_active,
          })
          setLoading(false)
        })
    }
  }, [isNew, params.id])

  function set(k: string, v: unknown) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function handleTitleChange(title: string) {
    setForm(prev => ({
      ...prev,
      title,
      slug: isNew ? slugify(title) : prev.slug,
      nav_label: isNew ? title : prev.nav_label,
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        ...(isNew ? {} : { id: params.id }),
        ...form,
        nav_label: form.nav_label || null,
        meta_title: form.meta_title || null,
        meta_description: form.meta_description || null,
      }

      const res = await fetch('/api/admin/pages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setToast('Saved!')
        setTimeout(() => setToast(''), 2000)
        if (isNew) router.push('/admin/pages')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-orange" /></div>
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/pages" className="flex items-center text-text-muted hover:text-text transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <h1 className="font-display text-display-sm uppercase tracking-wide text-text">
          {isNew ? 'Add New Page' : 'Edit Page'}
        </h1>
      </div>

      {toast && (
        <div className="mb-6 px-4 py-3 bg-green/10 border border-green/30 rounded font-body text-sm text-green">{toast}</div>
      )}

      <div className="max-w-2xl flex flex-col gap-6">
        <div className="bg-surface border border-bvp-border rounded-lg p-6 flex flex-col gap-5">
          <Field label="Page Title">
            <input type="text" value={form.title} onChange={e => handleTitleChange(e.target.value)} placeholder="About BVP" className={inputCls} />
          </Field>
          <Field label="Slug (URL path)">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono text-sm text-text-faint">/</span>
              <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="about" className={`${inputCls} pl-7`} />
            </div>
          </Field>
          <Field label="Meta Title (SEO)">
            <input type="text" value={form.meta_title} onChange={e => set('meta_title', e.target.value)} placeholder="BVP About Page" className={inputCls} />
          </Field>
          <Field label="Meta Description (SEO)">
            <textarea value={form.meta_description} onChange={e => set('meta_description', e.target.value)} rows={3} placeholder="Page description for search engines" className="bg-surface2 border border-bvp-border text-text placeholder-text-faint rounded px-4 py-2.5 font-body text-sm focus:border-orange focus:outline-none transition-colors w-full resize-y" />
          </Field>
        </div>

        <div className="bg-surface border border-bvp-border rounded-lg p-6 flex flex-col gap-5">
          <h3 className="font-display text-sm uppercase tracking-wide text-text">Navigation</h3>
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set('show_in_nav', !form.show_in_nav)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.show_in_nav ? 'bg-orange' : 'bg-bvp-border'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.show_in_nav ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="font-body text-sm text-text">Show in Navigation</span>
          </label>
          {form.show_in_nav && (
            <>
              <Field label="Nav Label">
                <input type="text" value={form.nav_label} onChange={e => set('nav_label', e.target.value)} placeholder="About" className={inputCls} />
              </Field>
              <Field label="Nav Order">
                <input type="number" value={form.nav_order} onChange={e => set('nav_order', parseInt(e.target.value) || 0)} className={inputCls} />
              </Field>
            </>
          )}
          <label className="flex items-center gap-3 cursor-pointer">
            <div onClick={() => set('is_active', !form.is_active)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.is_active ? 'bg-orange' : 'bg-bvp-border'}`}>
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="font-body text-sm text-text">Page Active</span>
          </label>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors disabled:opacity-60 self-start"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Save Page</>}
        </button>
      </div>
    </div>
  )
}
