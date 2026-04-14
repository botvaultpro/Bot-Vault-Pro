'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import type { FaqContent, FaqItem } from '@/types/cms'

interface Props {
  content: Record<string, unknown>
}

function FaqRow({ faq }: { faq: FaqItem }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-bvp-border">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-5 text-left group"
      >
        <span className="font-body font-semibold text-text text-base leading-snug group-hover:text-orange transition-colors">
          {faq.question}
        </span>
        <ChevronDown
          size={18}
          className={`flex-shrink-0 text-orange transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pb-5 font-body text-text-muted text-sm leading-relaxed">
              {faq.answer}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FaqSection({ content }: Props) {
  const c = content as FaqContent
  const faqs = c.faqs || []

  return (
    <section className="py-20 md:py-28 bg-bg">
      <div className="max-w-3xl mx-auto px-4 md:px-8">
        {c.headline && (
          <div className="mb-10 text-center">
            <h2 className="font-display text-display-sm uppercase tracking-wide text-text mb-3">
              {c.headline}
            </h2>
            {c.subheadline && (
              <p className="font-body text-text-muted text-lg">{c.subheadline}</p>
            )}
          </div>
        )}

        <div>
          {faqs.map((faq, i) => (
            <FaqRow key={i} faq={faq} />
          ))}
        </div>
      </div>
    </section>
  )
}
