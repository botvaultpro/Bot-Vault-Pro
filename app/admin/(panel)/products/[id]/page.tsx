'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { slugify } from '@/lib/cms-utils'
import type { Product } from '@/types/cms'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-xs uppercase tracking-widest text-text-faint">{label}</label>
      {children}
    </div>
  )
}

const inputCls = "min-h-[42px] bg-surface2 border border-bvp-border text-text placeholder-text-faint rounded px-4 py-2.5 font-body text-sm focus:border-orange focus:outline-none transition-colors w-full"
const textareaCls = "bg-surface2 border border-bvp-border text-text placeholder-text-faint rounded px-4 py-2.5 font-body text-sm focus:border-orange focus:outline-none transition-colors w-full resize-y"

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const isNew = params.id === 'new'

  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const [form, setForm] = useState({
    name: '',
    slug: '',
    tagline: '',
    description: '',
    long_description: '',
    price_dollars: '',
    thumbnail_url: '',
    download_url: '',
    gumroad_url: '',
    stripe_price_id: '',
    category: 'digital',
    sort_order: 0,
    is_active: true,
    is_featured: false,
  })

  useEffect(() => {
    if (!isNew) {
      fetch(`/api/admin/products/${params.id}`)
        .then(r => r.json())
        .then((p: Product) => {
          setForm({
            name: p.name || '',
            slug: p.slug || '',
            tagline: p.tagline || '',
            description: p.description || '',
            long_description: p.long_description || '',
            price_dollars: p.price_cents ? String(p.price_cents / 100) : '',
            thumbnail_url: p.thumbnail_url || '',
            download_url: p.download_url || '',
            gumroad_url: p.gumroad_url || '',
            stripe_price_id: p.stripe_price_id || '',
            category: p.category || 'digital',
            sort_order: p.sort_order || 0,
            is_active: p.is_active,
            is_featured: p.is_featured,
          })
          setLoading(false)
        })
    }
  }, [isNew, params.id])

  function set(k: string, v: unknown) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  function handleNameChange(name: string) {
    setForm(prev => ({
      ...prev,
      name,
      slug: isNew ? slugify(name) : prev.slug,
    }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = {
        ...(isNew ? {} : { id: params.id }),
        name: form.name,
        slug: form.slug,
        tagline: form.tagline || null,
        description: form.description || null,
        long_description: form.long_description || null,
        price_cents: form.price_dollars ? Math.round(parseFloat(form.price_dollars) * 100) : 0,
        thumbnail_url: form.thumbnail_url || null,
        download_url: form.download_url || null,
        gumroad_url: form.gumroad_url || null,
        stripe_price_id: form.stripe_price_id || null,
        category: form.category,
        sort_order: form.sort_order,
        is_active: form.is_active,
        is_featured: form.is_featured,
      }

      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        setToast('Saved!')
        setTimeout(() => setToast(''), 2000)
        if (isNew) router.push('/admin/products')
      }
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-orange" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin/products" className="flex items-center gap-2 text-text-muted hover:text-text transition-colors">
          <ArrowLeft size={16} />
        </Link>
        <div>
          <h1 className="font-display text-display-sm uppercase tracking-wide text-text">
            {isNew ? 'Add New BVP Product' : 'Edit BVP Product'}
          </h1>
        </div>
      </div>

      {toast && (
        <div className="mb-6 px-4 py-3 bg-green/10 border border-green/30 rounded font-body text-sm text-green">
          {toast}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Main fields */}
        <div className="xl:col-span-2 flex flex-col gap-6">
          <div className="bg-surface border border-bvp-border rounded-lg p-6 flex flex-col gap-5">
            <Field label="Product Name">
              <input type="text" value={form.name} onChange={e => handleNameChange(e.target.value)} placeholder="BVP AI Readiness Assessment" className={inputCls} />
            </Field>
            <Field label="Slug (URL)">
              <input type="text" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="bvp-ai-readiness-assessment" className={inputCls} />
            </Field>
            <Field label="Tagline (short description)">
              <input type="text" value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="One sentence that sells it" className={inputCls} />
            </Field>
            <Field label="Short Description">
              <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3} placeholder="Used in product grid card" className={textareaCls} />
            </Field>
            <Field label="Long Description">
              <textarea value={form.long_description} onChange={e => set('long_description', e.target.value)} rows={6} placeholder="Full product detail page description" className={textareaCls} />
            </Field>
          </div>
        </div>

        {/* Sidebar fields */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface border border-bvp-border rounded-lg p-6 flex flex-col gap-5">
            <Field label="Price (USD)">
              <input type="number" min="0" step="0.01" value={form.price_dollars} onChange={e => set('price_dollars', e.target.value)} placeholder="29.00" className={inputCls} />
            </Field>
            <Field label="Category">
              <select value={form.category} onChange={e => set('category', e.target.value)} className={inputCls}>
                <option value="digital">Digital</option>
                <option value="template">Template</option>
                <option value="tool">Tool</option>
                <option value="course">Course</option>
              </select>
            </Field>
            <Field label="Sort Order">
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} className={inputCls} />
            </Field>

            <div className="flex flex-col gap-3 pt-2 border-t border-bvp-border">
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => set('is_active', !form.is_active)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.is_active ? 'bg-orange' : 'bg-bvp-border'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="font-body text-sm text-text">Active</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <div onClick={() => set('is_featured', !form.is_featured)} className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${form.is_featured ? 'bg-orange' : 'bg-bvp-border'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_featured ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </div>
                <span className="font-body text-sm text-text">Featured</span>
              </label>
            </div>
          </div>

          <div className="bg-surface border border-bvp-border rounded-lg p-6 flex flex-col gap-5">
            <h3 className="font-display text-sm uppercase tracking-wide text-text">Delivery & Links</h3>
            <Field label="Thumbnail URL">
              <input type="url" value={form.thumbnail_url} onChange={e => set('thumbnail_url', e.target.value)} placeholder="https://..." className={inputCls} />
            </Field>
            <Field label="Download URL">
              <input type="url" value={form.download_url} onChange={e => set('download_url', e.target.value)} placeholder="Direct link to file" className={inputCls} />
            </Field>
            <Field label="Gumroad URL (optional)">
              <input type="url" value={form.gumroad_url} onChange={e => set('gumroad_url', e.target.value)} placeholder="https://gumroad.com/..." className={inputCls} />
            </Field>
            <Field label="Stripe Price ID (optional)">
              <input type="text" value={form.stripe_price_id} onChange={e => set('stripe_price_id', e.target.value)} placeholder="price_..." className={inputCls} />
            </Field>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center justify-center gap-2 min-h-[44px] px-6 py-3 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors disabled:opacity-60"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Save Product</>}
          </button>
        </div>
      </div>
    </div>
  )
}
