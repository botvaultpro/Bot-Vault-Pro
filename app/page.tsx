import { supabaseAdmin } from '@/lib/cms-supabase'
import SectionRenderer from '@/components/sections/SectionRenderer'
import Navbar from '@/components/cms-layout/Navbar'
import Footer from '@/components/cms-layout/Footer'
import type { CmsSection, Product, NavLink, SiteSettings } from '@/types/cms'

async function getHomeData() {
  const [pageResult, navResult, settingsResult, productsResult] = await Promise.all([
    supabaseAdmin
      .from('cms_pages')
      .select('id')
      .eq('slug', 'home')
      .single(),
    supabaseAdmin
      .from('nav_links')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
    supabaseAdmin
      .from('site_settings')
      .select('key, value'),
    supabaseAdmin
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true }),
  ])

  const pageId = pageResult.data?.id

  const sectionsResult = pageId
    ? await supabaseAdmin
        .from('cms_sections')
        .select('*')
        .eq('page_id', pageId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
    : { data: [] }

  const settings: SiteSettings = {}
  for (const row of settingsResult.data || []) {
    settings[row.key] = row.value || ''
  }

  return {
    sections: (sectionsResult.data || []) as CmsSection[],
    products: (productsResult.data || []) as Product[],
    navLinks: (navResult.data || []) as NavLink[],
    settings,
  }
}

export default async function HomePage() {
  const { sections, products, navLinks, settings } = await getHomeData()

  return (
    <>
      <Navbar links={navLinks} settings={settings} />
      <main>
        {sections.map(section => (
          <SectionRenderer key={section.id} section={section} products={products} />
        ))}
        {sections.length === 0 && (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
            <span className="font-display text-6xl text-orange mb-4">BVP</span>
            <p className="font-body text-text-muted text-lg mb-2">Site is live.</p>
            <p className="font-body text-text-faint text-sm">
              Go to{' '}
              <a href="/admin" className="text-orange hover:underline">
                /admin
              </a>{' '}
              to add content sections.
            </p>
          </div>
        )}
      </main>
      <Footer links={navLinks} settings={settings} />
    </>
  )
}
