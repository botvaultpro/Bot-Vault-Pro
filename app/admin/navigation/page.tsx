import { supabaseAdmin } from '@/lib/cms-supabase'
import type { NavLink } from '@/types/cms'
import NavigationClient from './NavigationClient'

async function getNavLinks(): Promise<NavLink[]> {
  const { data } = await supabaseAdmin
    .from('nav_links')
    .select('*')
    .order('sort_order', { ascending: true })
  return (data || []) as NavLink[]
}

export default async function AdminNavigationPage() {
  const links = await getNavLinks()
  return <NavigationClient initialLinks={links} />
}
