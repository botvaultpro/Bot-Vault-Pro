import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { supabaseAdmin } from '@/lib/cms-supabase'
import SectionRenderer from '@/components/sections/SectionRenderer'
import Navbar from '@/components/cms-layout/Navbar'
import Footer from '@/components/cms-layout/Footer'
import type { CmsSection, NavLink, SiteSettings } from '@/types/cms'

interface Props {
  params: Promise<{ slug: string }>
}

async function getPageData(slug: string) {
  const [pageResult, navResult, settingsResult] = await Promise.all([
    supabaseAdmin
      .from('cms_pages')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single(),
    supabaseAdmin
      .from('nav_links')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabaseAdmin
      .from('site_settings')
      .select('key, value'),
  ])

  if (pageResult.error || !pageResult.data) return null

  const sectionsResult = await supabaseAdmin
    .from('cms_sections')
    .select('*')
    .eq('page_id', pageResult.data.id)
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  const settings: SiteSettings = {}
  for (const row of settingsResult.data || []) {
    settings[row.key] = row.value || ''
  }

  return {
    page: pageResult.data,
    sections: (sectionsResult.data || []) as CmsSection[],
    navLinks: (navResult.data || []) as NavLink[],
    settings,
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const data = await getPageData(slug)
  if (!data) return {}
  return {
    title: data.page.meta_title || `BVP — ${data.page.title}`,
    description: data.page.meta_description || undefined,
  }
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params

  // Don't render home as a slug page — handled by app/page.tsx
  if (slug === 'home') notFound()

  const data = await getPageData(slug)
  if (!data) notFound()

  const { sections, navLinks, settings, page } = data

  return (
    <>
      <Navbar links={navLinks} settings={settings} />
      <main>
        {sections.length === 0 ? (
          <div className="max-w-3xl mx-auto px-4 md:px-8 py-20">
            <h1 className="font-display text-display-sm uppercase tracking-wide text-text mb-4">
              {page.title}
            </h1>
            <p className="font-body text-text-muted">
              No content yet. Add sections from the{' '}
              <a href="/admin/sections" className="text-orange hover:underline">admin panel</a>.
            </p>
          </div>
        ) : (
          sections.map(section => (
            <SectionRenderer key={section.id} section={section} />
          ))
        )}
      </main>
      <Footer links={navLinks} settings={settings} />
    </>
  )
}
