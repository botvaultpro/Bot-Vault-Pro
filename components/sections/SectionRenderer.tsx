import type { CmsSection, Product } from '@/types/cms'
import HeroSection from './HeroSection'
import ProductGridSection from './ProductGridSection'
import HowItWorksSection from './HowItWorksSection'
import FeatureListSection from './FeatureListSection'
import CtaBannerSection from './CtaBannerSection'
import TestimonialsSection from './TestimonialsSection'
import FaqSection from './FaqSection'
import RichTextSection from './RichTextSection'
import ImageTextSection from './ImageTextSection'
import SubscribeSection from './SubscribeSection'

interface Props {
  section: CmsSection
  products?: Product[]
}

export default function SectionRenderer({ section, products = [] }: Props) {
  if (!section.is_active) return null

  switch (section.section_type) {
    case 'hero':
      return <HeroSection content={section.content} />
    case 'product_grid':
      return <ProductGridSection content={section.content} products={products} />
    case 'how_it_works':
      return <HowItWorksSection content={section.content} />
    case 'feature_list':
      return <FeatureListSection content={section.content} />
    case 'cta_banner':
      return <CtaBannerSection content={section.content} />
    case 'testimonials':
      return <TestimonialsSection content={section.content} />
    case 'faq':
      return <FaqSection content={section.content} />
    case 'rich_text':
      return <RichTextSection content={section.content} />
    case 'image_text':
      return <ImageTextSection content={section.content} />
    case 'subscribe':
      return <SubscribeSection content={section.content} />
    default:
      return null
  }
}
