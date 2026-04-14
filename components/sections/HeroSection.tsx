'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import type { HeroContent } from '@/types/cms'

interface Props {
  content: Record<string, unknown>
}

export default function HeroSection({ content }: Props) {
  const c = content as HeroContent

  return (
    <section className="relative w-full min-h-[90vh] flex items-center bg-bg overflow-hidden">
      {/* Background glow */}
      <div
        className="pointer-events-none absolute top-0 right-0 w-[600px] h-[600px] opacity-10 blur-3xl"
        style={{ background: 'radial-gradient(circle, #ff5e14 0%, transparent 70%)' }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 md:px-8 py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

          {/* Text column */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="order-2 lg:order-1"
          >
            {c.badge && (
              <span className="inline-block mb-6 px-3 py-1 text-xs font-mono uppercase tracking-widest text-orange border border-orange/40 rounded-full bg-orange/5">
                {c.badge}
              </span>
            )}

            <h1 className="font-display text-display-sm md:text-display-md xl:text-display uppercase leading-none tracking-wide text-text mb-6">
              {c.headline || 'AI Automation Built For Trades'}
            </h1>

            {c.subheadline && (
              <p className="font-body text-lg md:text-xl text-text-muted mb-8 max-w-xl leading-relaxed">
                {c.subheadline}
              </p>
            )}

            <div className="flex flex-wrap gap-4 mb-10">
              {c.cta_primary_text && c.cta_primary_url && (
                <Link
                  href={c.cta_primary_url}
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors"
                >
                  {c.cta_primary_text}
                </Link>
              )}
              {c.cta_secondary_text && c.cta_secondary_url && (
                <Link
                  href={c.cta_secondary_url}
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 border border-orange text-orange hover:bg-orange-muted font-body font-bold uppercase tracking-wider text-sm rounded transition-colors"
                >
                  {c.cta_secondary_text}
                </Link>
              )}
            </div>

            {(c.stat_1 || c.stat_2 || c.stat_3) && (
              <div className="flex flex-wrap gap-3">
                {[c.stat_1, c.stat_2, c.stat_3].filter(Boolean).map((stat, i) => (
                  <span
                    key={i}
                    className="inline-block px-3 py-1 text-xs font-mono uppercase tracking-widest text-text-muted border border-bvp-border rounded-full bg-surface"
                  >
                    {stat as string}
                  </span>
                ))}
              </div>
            )}
          </motion.div>

          {/* Mascot column */}
          {c.show_mascot !== false && (
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: 0.1 }}
              className="order-1 lg:order-2 flex justify-center"
            >
              <div className="relative flex justify-center items-center">
                <div
                  className="absolute inset-0 rounded-full blur-3xl opacity-20"
                  style={{ background: 'radial-gradient(circle, #ff5e14 0%, transparent 70%)' }}
                />
                <Image
                  src="/mascot.png"
                  alt="BVP Mascot — Bot Vault Pro AI Automation"
                  width={560}
                  height={560}
                  priority
                  className="relative z-10 w-full max-w-[320px] md:max-w-[420px] xl:max-w-[480px] drop-shadow-2xl"
                />
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}
