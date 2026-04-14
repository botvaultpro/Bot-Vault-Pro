import type { HowItWorksContent } from '@/types/cms'

interface Props {
  content: Record<string, unknown>
}

export default function HowItWorksSection({ content }: Props) {
  const c = content as HowItWorksContent
  const steps = c.steps || []

  return (
    <section id="how-it-works" className="py-20 md:py-28 bg-surface">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {c.headline && (
          <div className="mb-12 text-center">
            <h2 className="font-display text-display-sm uppercase tracking-wide text-text mb-3">
              {c.headline}
            </h2>
            {c.subheadline && (
              <p className="font-body text-text-muted text-lg max-w-2xl mx-auto">{c.subheadline}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-start p-8">
              {/* Connecting line on desktop */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 right-0 w-1/2 h-px bg-bvp-border" />
              )}

              <div className="mb-4">
                <span className="font-display text-5xl text-orange leading-none">{step.number}</span>
              </div>
              <h3 className="font-display text-xl uppercase tracking-wide text-text mb-3">{step.title}</h3>
              <p className="font-body text-text-muted text-sm leading-relaxed">{step.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
