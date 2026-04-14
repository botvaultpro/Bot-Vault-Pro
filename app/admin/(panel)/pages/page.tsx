import Link from 'next/link'
import { supabaseAdmin } from '@/lib/cms-supabase'
import type { CmsPage } from '@/types/cms'
import { Plus, Edit2 } from 'lucide-react'
import PageToggle from './PageToggle'

async function getPages(): Promise<CmsPage[]> {
  const { data } = await supabaseAdmin
    .from('cms_pages')
    .select('*')
    .order('nav_order', { ascending: true })
  return (data || []) as CmsPage[]
}

export default async function AdminPagesPage() {
  const pages = await getPages()

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-display-sm uppercase tracking-wide text-text">BVP Pages</h1>
          <p className="font-body text-text-muted text-sm mt-1">{pages.length} pages</p>
        </div>
        <Link
          href="/admin/pages/new"
          className="inline-flex items-center gap-2 min-h-[40px] px-4 py-2 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors"
        >
          <Plus size={14} /> Add New Page
        </Link>
      </div>

      <div className="bg-surface border border-bvp-border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-bvp-border">
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Title</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint hidden md:table-cell">Slug</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">In Nav</th>
              <th className="text-left px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Active</th>
              <th className="text-right px-4 py-3 font-body text-xs uppercase tracking-widest text-text-faint">Edit</th>
            </tr>
          </thead>
          <tbody>
            {pages.map(page => (
              <tr key={page.id} className="border-b border-bvp-border last:border-0 hover:bg-surface2 transition-colors">
                <td className="px-4 py-3 font-body text-sm text-text">{page.title}</td>
                <td className="px-4 py-3 font-mono text-xs text-text-faint hidden md:table-cell">/{page.slug}</td>
                <td className="px-4 py-3">
                  <PageToggle pageId={page.id} field="show_in_nav" value={page.show_in_nav} isHome={page.slug === 'home'} />
                </td>
                <td className="px-4 py-3">
                  <PageToggle pageId={page.id} field="is_active" value={page.is_active} isHome={page.slug === 'home'} />
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/pages/${page.id}`} className="inline-flex items-center justify-center w-8 h-8 text-text-muted hover:text-text transition-colors">
                    <Edit2 size={14} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
