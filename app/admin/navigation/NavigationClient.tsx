'use client'

import { useState } from 'react'
import { Plus, Trash2, Save, Loader2, Edit2, X } from 'lucide-react'
import type { NavLink } from '@/types/cms'

interface Props {
  initialLinks: NavLink[]
}

const inputCls = "min-h-[38px] bg-surface2 border border-bvp-border text-text placeholder-text-faint rounded px-3 py-2 font-body text-sm focus:border-orange focus:outline-none transition-colors w-full"

type FormLink = Omit<NavLink, 'id'> & { id?: string }

const emptyLink: FormLink = {
  label: '',
  url: '',
  is_active: true,
  open_in_new_tab: false,
  sort_order: 0,
  location: 'header',
}

export default function NavigationClient({ initialLinks }: Props) {
  const [links, setLinks] = useState<NavLink[]>(initialLinks)
  const [editing, setEditing] = useState<NavLink | null>(null)
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState<FormLink>(emptyLink)
  const [saving, setSaving] = useState(false)

  function set(k: string, v: unknown) {
    setForm(prev => ({ ...prev, [k]: v }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/navigation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (form.id) {
        setLinks(prev => prev.map(l => l.id === form.id ? data : l))
      } else {
        setLinks(prev => [...prev, data])
      }
      setEditing(null)
      setAdding(false)
      setForm(emptyLink)
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this nav link?')) return
    await fetch(`/api/admin/navigation?id=${id}`, { method: 'DELETE' })
    setLinks(prev => prev.filter(l => l.id !== id))
  }

  async function handleToggle(link: NavLink) {
    const newVal = !link.is_active
    await fetch('/api/admin/navigation', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: link.id, is_active: newVal }),
    })
    setLinks(prev => prev.map(l => l.id === link.id ? { ...l, is_active: newVal } : l))
  }

  function startEdit(link: NavLink) {
    setEditing(link)
    setAdding(false)
    setForm({ ...link })
  }

  function startAdd() {
    setAdding(true)
    setEditing(null)
    setForm(emptyLink)
  }

  function cancel() {
    setEditing(null)
    setAdding(false)
    setForm(emptyLink)
  }

  const showForm = editing !== null || adding

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-display-sm uppercase tracking-wide text-text">BVP Navigation</h1>
          <p className="font-body text-text-muted text-sm mt-1">Manage header and footer links</p>
        </div>
        <button
          onClick={startAdd}
          className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors"
        >
          <Plus size={14} /> Add Link
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 p-6 bg-surface border border-orange/30 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg uppercase tracking-wide text-text">
              {editing ? 'Edit Link' : 'Add Link'}
            </h3>
            <button onClick={cancel} className="text-text-muted hover:text-text"><X size={16} /></button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="font-body text-xs uppercase tracking-widest text-text-faint block mb-1.5">Label</label>
              <input type="text" value={form.label} onChange={e => set('label', e.target.value)} placeholder="Products" className={inputCls} />
            </div>
            <div>
              <label className="font-body text-xs uppercase tracking-widest text-text-faint block mb-1.5">URL</label>
              <input type="text" value={form.url} onChange={e => set('url', e.target.value)} placeholder="#products or /about" className={inputCls} />
            </div>
            <div>
              <label className="font-body text-xs uppercase tracking-widest text-text-faint block mb-1.5">Location</label>
              <select value={form.location} onChange={e => set('location', e.target.value)} className={inputCls}>
                <option value="header">Header</option>
                <option value="footer">Footer</option>
              </select>
            </div>
            <div>
              <label className="font-body text-xs uppercase tracking-widest text-text-faint block mb-1.5">Sort Order</label>
              <input type="number" value={form.sort_order} onChange={e => set('sort_order', parseInt(e.target.value) || 0)} className={inputCls} />
            </div>
          </div>
          <div className="flex gap-6 mb-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => set('is_active', !form.is_active)} className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${form.is_active ? 'bg-orange' : 'bg-bvp-border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.is_active ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="font-body text-sm text-text">Active</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => set('open_in_new_tab', !form.open_in_new_tab)} className={`relative w-9 h-5 rounded-full transition-colors cursor-pointer ${form.open_in_new_tab ? 'bg-orange' : 'bg-bvp-border'}`}>
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${form.open_in_new_tab ? 'translate-x-4' : 'translate-x-0.5'}`} />
              </div>
              <span className="font-body text-sm text-text">Open in New Tab</span>
            </label>
          </div>
          <div className="flex gap-3">
            <button onClick={cancel} className="min-h-[38px] px-4 py-2 font-body text-sm uppercase tracking-wider text-text-muted hover:text-text transition-colors">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 min-h-[38px] px-5 py-2 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors disabled:opacity-60">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Save</>}
            </button>
          </div>
        </div>
      )}

      {/* Links table */}
      <div className="bg-surface border border-bvp-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bvp-border">
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Label</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden md:table-cell">URL</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden lg:table-cell">Location</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Active</th>
              <th className="text-right px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Actions</th>
            </tr>
          </thead>
          <tbody>
            {links.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-10 text-center font-body text-text-faint text-sm">No nav links yet.</td></tr>
            ) : (
              links.map(link => (
                <tr key={link.id} className="border-b border-bvp-border last:border-0 hover:bg-surface2 transition-colors">
                  <td className="px-4 py-3 font-body text-sm text-text">{link.label}</td>
                  <td className="px-4 py-3 font-mono text-xs text-text-faint hidden md:table-cell">{link.url}</td>
                  <td className="px-4 py-3 font-body text-xs text-text-faint hidden lg:table-cell capitalize">{link.location}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggle(link)} className={`relative w-10 h-5 rounded-full transition-colors ${link.is_active ? 'bg-orange' : 'bg-bvp-border'}`}>
                      <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${link.is_active ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => startEdit(link)} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-text transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => handleDelete(link.id)} className="w-8 h-8 flex items-center justify-center text-text-muted hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
