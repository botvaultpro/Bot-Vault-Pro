'use client'

import { useState } from 'react'
import { Save, Loader2 } from 'lucide-react'
import type { SiteSettings } from '@/types/cms'

interface Props {
  initialSettings: SiteSettings
}

const inputCls = "min-h-[42px] bg-surface2 border border-bvp-border text-text placeholder-text-faint rounded px-4 py-2.5 font-body text-sm focus:border-orange focus:outline-none transition-colors w-full"

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="font-body text-xs uppercase tracking-widest text-text-faint">{label}</label>
      {children}
      {hint && <p className="font-body text-xs text-text-faint">{hint}</p>}
    </div>
  )
}

export default function SettingsClient({ initialSettings }: Props) {
  const [settings, setSettings] = useState<SiteSettings>(initialSettings)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  function set(key: string, value: string) {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) {
        setToast('Settings saved!')
        setTimeout(() => setToast(''), 2000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-display-sm uppercase tracking-wide text-text">BVP Site Settings</h1>
        <p className="font-body text-text-muted text-sm mt-1">Global settings for your entire site</p>
      </div>

      {toast && (
        <div className="mb-6 px-4 py-3 bg-green/10 border border-green/30 rounded font-body text-sm text-green">{toast}</div>
      )}

      <div className="max-w-2xl flex flex-col gap-8">
        {/* General */}
        <div className="bg-surface border border-bvp-border rounded-lg p-6 flex flex-col gap-5">
          <h2 className="font-display text-lg uppercase tracking-wide text-text border-b border-bvp-border pb-3">General</h2>
          <Field label="Site Name">
            <input type="text" value={settings['site_name'] || ''} onChange={e => set('site_name', e.target.value)} placeholder="Bot Vault Pro" className={inputCls} />
          </Field>
          <Field label="Site Tagline">
            <input type="text" value={settings['site_tagline'] || ''} onChange={e => set('site_tagline', e.target.value)} placeholder="AI automation built for trades." className={inputCls} />
          </Field>
          <Field label="Support Email">
            <input type="email" value={settings['support_email'] || ''} onChange={e => set('support_email', e.target.value)} placeholder="support@botvaultpro.com" className={inputCls} />
          </Field>
        </div>

        {/* Announcement bar */}
        <div className="bg-surface border border-bvp-border rounded-lg p-6 flex flex-col gap-5">
          <h2 className="font-display text-lg uppercase tracking-wide text-text border-b border-bvp-border pb-3">Announcement Bar</h2>
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              onClick={() => set('announcement_bar_active', settings['announcement_bar_active'] === 'true' ? 'false' : 'true')}
              className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${settings['announcement_bar_active'] === 'true' ? 'bg-orange' : 'bg-bvp-border'}`}
            >
              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${settings['announcement_bar_active'] === 'true' ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="font-body text-sm text-text">Show Announcement Bar</span>
          </label>
          <Field label="Announcement Text">
            <input type="text" value={settings['announcement_bar_text'] || ''} onChange={e => set('announcement_bar_text', e.target.value)} placeholder="New: BVP AI Agent Factory is live →" className={inputCls} />
          </Field>
          <Field label="Announcement URL">
            <input type="text" value={settings['announcement_bar_url'] || ''} onChange={e => set('announcement_bar_url', e.target.value)} placeholder="#products" className={inputCls} />
          </Field>
        </div>

        {/* Footer */}
        <div className="bg-surface border border-bvp-border rounded-lg p-6 flex flex-col gap-5">
          <h2 className="font-display text-lg uppercase tracking-wide text-text border-b border-bvp-border pb-3">Footer</h2>
          <Field label="Footer Tagline">
            <input type="text" value={settings['footer_tagline'] || ''} onChange={e => set('footer_tagline', e.target.value)} className={inputCls} />
          </Field>
          <Field label="Footer Copyright">
            <input type="text" value={settings['footer_copyright'] || ''} onChange={e => set('footer_copyright', e.target.value)} placeholder="© 2025 Bot Vault Pro. All rights reserved." className={inputCls} />
          </Field>
        </div>

        {/* Social */}
        <div className="bg-surface border border-bvp-border rounded-lg p-6 flex flex-col gap-5">
          <h2 className="font-display text-lg uppercase tracking-wide text-text border-b border-bvp-border pb-3">Social Links</h2>
          <Field label="Twitter / X URL">
            <input type="url" value={settings['social_twitter'] || ''} onChange={e => set('social_twitter', e.target.value)} placeholder="https://twitter.com/..." className={inputCls} />
          </Field>
          <Field label="Instagram URL">
            <input type="url" value={settings['social_instagram'] || ''} onChange={e => set('social_instagram', e.target.value)} placeholder="https://instagram.com/..." className={inputCls} />
          </Field>
          <Field label="LinkedIn URL">
            <input type="url" value={settings['social_linkedin'] || ''} onChange={e => set('social_linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." className={inputCls} />
          </Field>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center justify-center gap-2 min-h-[44px] px-8 py-3 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors disabled:opacity-60 self-start"
        >
          {saving ? <Loader2 size={14} className="animate-spin" /> : <><Save size={14} /> Save All Settings</>}
        </button>
      </div>
    </div>
  )
}
