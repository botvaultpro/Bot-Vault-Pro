import type { RichTextContent } from '@/types/cms'

interface Props {
  content: Record<string, unknown>
}

export default function RichTextSection({ content }: Props) {
  const c = content as RichTextContent

  return (
    <section className="py-20 md:py-28 bg-bg">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        {c.headline && (
          <h2 className="font-display text-display-sm uppercase tracking-wide text-text mb-8">
            {c.headline}
          </h2>
        )}
        {c.body && (
          <div
            className="prose prose-invert prose-orange max-w-none font-body text-text-muted
              prose-headings:font-display prose-headings:uppercase prose-headings:tracking-wide prose-headings:text-text
              prose-a:text-orange prose-a:no-underline hover:prose-a:underline
              prose-strong:text-text
              prose-li:text-text-muted"
            dangerouslySetInnerHTML={{ __html: c.body }}
          />
        )}
      </div>
    </section>
  )
}
