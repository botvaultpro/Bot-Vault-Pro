import * as LucideIcons from 'lucide-react'
import type { FeatureListContent, FeatureItem } from '@/types/cms'
import type { LucideProps } from 'lucide-react'

interface Props {
  content: Record<string, unknown>
}

function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<LucideProps>>)[name]
  if (!Icon) return <LucideIcons.Box {...props} />
  return <Icon {...props} />
}

function FeatureCard({ feature }: { feature: FeatureItem }) {
  return (
    <div className="flex flex-col gap-4 p-6 bg-surface border border-bvp-border rounded-lg hover:border-orange/40 transition-colors">
      <div className="flex-shrink-0 w-10 h-10 rounded bg-orange-muted flex items-center justify-center">
        <DynamicIcon name={feature.icon || 'Zap'} size={20} className="text-orange" />
      </div>
      <div>
        <h3 className="font-display text-lg uppercase tracking-wide text-text mb-2">{feature.title}</h3>
        <p className="font-body text-sm text-text-muted leading-relaxed">{feature.body}</p>
      </div>
    </div>
  )
}

export default function FeatureListSection({ content }: Props) {
  const c = content as FeatureListContent
  const features = c.features || []

  return (
    <section className="py-20 md:py-28 bg-bg">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        {c.headline && (
          <div className="mb-12">
            <h2 className="font-display text-display-sm uppercase tracking-wide text-text mb-3">
              {c.headline}
            </h2>
            {c.subheadline && (
              <p className="font-body text-text-muted text-lg max-w-2xl">{c.subheadline}</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <FeatureCard key={idx} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  )
}
