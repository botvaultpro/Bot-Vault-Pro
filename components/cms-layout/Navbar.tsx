'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import type { NavLink, SiteSettings } from '@/types/cms'

interface Props {
  links: NavLink[]
  settings: SiteSettings
}

export default function Navbar({ links, settings }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const headerLinks = links.filter(l => l.location === 'header' && l.is_active)
    .sort((a, b) => a.sort_order - b.sort_order)

  const announcementActive = settings['announcement_bar_active'] === 'true'
  const announcementText = settings['announcement_bar_text']
  const announcementUrl = settings['announcement_bar_url']

  return (
    <>
      {/* Announcement bar */}
      {announcementActive && announcementText && (
        <div className="w-full bg-orange py-2 px-4 text-center">
          {announcementUrl ? (
            <a href={announcementUrl} className="font-body text-xs text-white font-semibold uppercase tracking-widest hover:underline">
              {announcementText}
            </a>
          ) : (
            <span className="font-body text-xs text-white font-semibold uppercase tracking-widest">
              {announcementText}
            </span>
          )}
        </div>
      )}

      {/* Navbar */}
      <nav className="sticky top-0 z-50 w-full bg-bg/90 backdrop-blur-sm border-b border-bvp-border">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="font-display text-2xl text-orange leading-none">BVP</span>
              <span className="hidden sm:block font-body text-xs text-text-faint uppercase tracking-widest">
                Bot Vault Pro
              </span>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden md:flex items-center gap-6">
              {headerLinks.map(link => (
                <Link
                  key={link.id}
                  href={link.url}
                  target={link.open_in_new_tab ? '_blank' : undefined}
                  rel={link.open_in_new_tab ? 'noopener noreferrer' : undefined}
                  className="font-body text-sm text-text-muted hover:text-text uppercase tracking-wider transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* CTA + mobile menu */}
            <div className="flex items-center gap-4">
              <Link
                href="#products"
                className="hidden sm:inline-flex items-center justify-center min-h-[36px] px-4 py-2 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-xs rounded transition-colors"
              >
                Get Started
              </Link>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden flex items-center justify-center w-10 h-10 text-text-muted hover:text-text transition-colors"
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-bvp-border bg-surface">
            <div className="px-4 py-4 flex flex-col gap-1">
              {headerLinks.map(link => (
                <Link
                  key={link.id}
                  href={link.url}
                  target={link.open_in_new_tab ? '_blank' : undefined}
                  onClick={() => setMobileOpen(false)}
                  className="font-body text-sm text-text-muted hover:text-text uppercase tracking-wider py-3 border-b border-bvp-border last:border-0 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="#products"
                onClick={() => setMobileOpen(false)}
                className="mt-3 inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-orange text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>
    </>
  )
}
