import { supabaseAdmin } from '@/lib/cms-supabase'
import type { SiteSettings } from '@/types/cms'
import SettingsClient from './SettingsClient'

async function getSettings(): Promise<SiteSettings> {
  const { data } = await supabaseAdmin.from('site_settings').select('key, value')
  const settings: SiteSettings = {}
  for (const row of data || []) {
    settings[row.key] = row.value || ''
  }
  return settings
}

export default async function AdminSettingsPage() {
  const settings = await getSettings()
  return <SettingsClient initialSettings={settings} />
}
