import { Star } from 'lucide-react'
import type { TestimonialsContent, Testimonial } from '@/types/cms'

interface Props {
  content: Record<string, unknown>
}

function TestimonialCard({ t }: { t: Testimonial }) {
  const rating = t.rating || 5
  return (
    <div className="flex flex-col gap-4 p-6 bg-surface border border-bvp-border rounded-lg">
      <div className="flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={i < rating ? 'text-amber fill-amber' : 'text-bvp-border'}
          />
        ))}
      </div>
      <p className="font-body text-text-muted text-sm leading-relaxed italic">"{t.quote}"</p>
      <div>
        <p className="font-body font-semibold text-text text-sm">{t.name}</p>
        {t.company && <p className="font-body text-text-faint text-xs mt-0.5">{t.company}</p>}
      </div>
    </div>
  )
}

export default function TestimonialsSection({ content }: Props) {
  const c = content as TestimonialsContent
  const testimonials = c.testimonials || []

  return (
    <section className="py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {c.headline && (
          <div className="mb-12">
            <h2 className="font-display text-display-sm uppercase tracking-wide text-text mb-3">
              {c.headline}
            </h2>
          </div>
        )}

        {testimonials.length === 0 ? (
          <p className="font-body text-text-faint text-center py-10">No testimonials yet.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {testimonials.map((t, i) => (
              <TestimonialCard key={i} t={t} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
