import Link from 'next/link'
import type { NavLink, SiteSettings } from '@/types/cms'

interface Props {
  links: NavLink[]
  settings: SiteSettings
}

export default function Footer({ links, settings }: Props) {
  const footerLinks = links.filter(l => l.location === 'footer' && l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)
  const headerLinks = links.filter(l => l.location === 'header' && l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)

  const displayLinks = footerLinks.length > 0 ? footerLinks : headerLinks

  return (
    <footer className="bg-surface border-t border-bvp-border">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">

          {/* Brand */}
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-3">
              <span className="font-display text-2xl text-orange leading-none">BVP</span>
              <span className="font-body text-xs text-text-faint uppercase tracking-widest">Bot Vault Pro</span>
            </div>
            <p className="font-body text-sm text-text-muted leading-relaxed">
              {settings['footer_tagline'] || 'AI automation built for trades. No fluff. Just results.'}
            </p>
          </div>

          {/* Nav links */}
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            {displayLinks.map(link => (
              <Link
                key={link.id}
                href={link.url}
                target={link.open_in_new_tab ? '_blank' : undefined}
                className="font-body text-sm text-text-muted hover:text-text uppercase tracking-wider transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-bvp-border flex flex-col sm:flex-row justify-between gap-3">
          <p className="font-body text-xs text-text-faint">
            {settings['footer_copyright'] || '© 2025 Bot Vault Pro. All rights reserved.'}
          </p>
          {settings['support_email'] && (
            <a
              href={`mailto:${settings['support_email']}`}
              className="font-body text-xs text-text-faint hover:text-orange transition-colors"
            >
              {settings['support_email']}
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
