import Link from 'next/link'
import type { ImageTextContent } from '@/types/cms'

interface Props {
  content: Record<string, unknown>
}

export default function ImageTextSection({ content }: Props) {
  const c = content as ImageTextContent
  const imgLeft = c.image_position !== 'right'

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${imgLeft ? '' : 'lg:grid-flow-col-dense'}`}>

          {/* Image */}
          {c.image_url && (
            <div className={`${!imgLeft ? 'lg:col-start-2' : ''}`}>
              <div className="rounded-lg overflow-hidden border border-bvp-border bg-surface2 aspect-video">
                <img
                  src={c.image_url}
                  alt={c.image_alt || ''}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}

          {/* Text */}
          <div className={`${!imgLeft ? 'lg:col-start-1 lg:row-start-1' : ''}`}>
            {c.headline && (
              <h2 className="font-display text-display-sm uppercase tracking-wide text-text mb-4">
                {c.headline}
              </h2>
            )}
            {c.body && (
              <p className="font-body text-text-muted leading-relaxed mb-6">{c.body}</p>
            )}
            {c.cta_text && c.cta_url && (
              <Link
                href={c.cta_url}
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-3 bg-orange hover:bg-orange-hover text-white font-body font-bold uppercase tracking-wider text-sm rounded transition-colors"
              >
                {c.cta_text}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
