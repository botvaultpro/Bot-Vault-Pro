import Link from 'next/link'
import type { CtaBannerContent } from '@/types/cms'

interface Props {
  content: Record<string, unknown>
}

export default function CtaBannerSection({ content }: Props) {
  const c = content as CtaBannerContent
  const style = c.style || 'orange'

  const bgClass =
    style === 'orange'
      ? 'bg-orange'
      : style === 'gradient'
      ? 'bg-gradient-to-r from-orange to-amber'
      : 'bg-surface border-t border-b border-orange/30'

  const textClass = style === 'dark' ? 'text-text' : 'text-white'
  const subClass = style === 'dark' ? 'text-text-muted' : 'text-white/80'
  const btnClass =
    style === 'dark'
      ? 'bg-orange hover:bg-orange-hover text-white'
      : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'

  return (
    <section className={`py-16 md:py-20 ${bgClass}`}>
      <div className="max-w-7xl mx-auto px-4 md:px-8 text-center">
        {c.headline && (
          <h2 className={`font-display text-display-sm uppercase tracking-wide mb-3 ${textClass}`}>
            {c.headline}
          </h2>
        )}
        {c.subheadline && (
          <p className={`font-body text-lg mb-8 max-w-2xl mx-auto ${subClass}`}>
            {c.subheadline}
          </p>
        )}
        {c.cta_text && c.cta_url && (
          <Link
            href={c.cta_url}
            className={`inline-flex items-center justify-center min-h-[44px] px-8 py-3 font-body font-bold uppercase tracking-wider text-sm rounded transition-colors ${btnClass}`}
          >
            {c.cta_text}
          </Link>
        )}
      </div>
    </section>
  )
}
