import { supabaseAdmin } from '@/lib/cms-supabase'
import type { CmsPage, CmsSection } from '@/types/cms'
import SectionBuilderClient from './SectionBuilderClient'

async function getPages(): Promise<CmsPage[]> {
  const { data } = await supabaseAdmin
    .from('cms_pages')
    .select('*')
    .order('nav_order', { ascending: true })
  return (data || []) as CmsPage[]
}

export default async function AdminSectionsPage() {
  const pages = await getPages()
  return <SectionBuilderClient pages={pages} />
}
