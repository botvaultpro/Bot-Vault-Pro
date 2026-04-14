// CMS and site management types

export interface Product {
  id: string
  created_at: string
  updated_at: string
  name: string
  slug: string
  tagline: string | null
  description: string | null
  long_description: string | null
  price_cents: number
  stripe_price_id: string | null
  stripe_product_id: string | null
  gumroad_url: string | null
  download_url: string | null
  thumbnail_url: string | null
  category: string
  is_active: boolean
  is_featured: boolean
  sort_order: number
  metadata: Record<string, unknown>
}

export interface Order {
  id: string
  created_at: string
  product_id: string | null
  customer_email: string
  customer_name: string | null
  amount_cents: number
  stripe_session_id: string | null
  stripe_payment_intent: string | null
  status: 'pending' | 'completed' | 'refunded' | 'failed'
  email_sent: boolean
  metadata: Record<string, unknown>
  products?: Product
}

export interface Subscriber {
  id: string
  created_at: string
  email: string
  name: string | null
  source: string
  tags: string[]
  is_active: boolean
  resend_contact_id: string | null
}

export interface CmsPage {
  id: string
  created_at: string
  updated_at: string
  title: string
  slug: string
  meta_title: string | null
  meta_description: string | null
  is_active: boolean
  show_in_nav: boolean
  nav_label: string | null
  nav_order: number
}

export interface CmsSection {
  id: string
  created_at: string
  updated_at: string
  page_id: string
  section_type: SectionType
  sort_order: number
  is_active: boolean
  content: SectionContent
}

export type SectionType =
  | 'hero'
  | 'product_grid'
  | 'how_it_works'
  | 'feature_list'
  | 'cta_banner'
  | 'testimonials'
  | 'faq'
  | 'rich_text'
  | 'image_text'
  | 'subscribe'

export type SectionContent = Record<string, unknown>

export interface NavLink {
  id: string
  label: string
  url: string
  is_active: boolean
  open_in_new_tab: boolean
  sort_order: number
  location: 'header' | 'footer'
}

export type SiteSettings = Record<string, string>

export interface AdminStats {
  total_products: number
  total_orders: number
  total_revenue_cents: number
  total_subscribers: number
}

// Section content shapes (for admin editor type safety)
export interface HeroContent {
  badge?: string
  headline?: string
  subheadline?: string
  cta_primary_text?: string
  cta_primary_url?: string
  cta_secondary_text?: string
  cta_secondary_url?: string
  stat_1?: string
  stat_2?: string
  stat_3?: string
  show_mascot?: boolean
}

export interface ProductGridContent {
  headline?: string
  subheadline?: string
  show_featured_only?: boolean
}

export interface HowItWorksStep {
  number: string
  title: string
  body: string
}

export interface HowItWorksContent {
  headline?: string
  subheadline?: string
  steps?: HowItWorksStep[]
}

export interface FeatureItem {
  icon?: string
  title: string
  body: string
}

export interface FeatureListContent {
  headline?: string
  subheadline?: string
  features?: FeatureItem[]
}

export interface CtaBannerContent {
  headline?: string
  subheadline?: string
  cta_text?: string
  cta_url?: string
  style?: 'orange' | 'dark' | 'gradient'
}

export interface Testimonial {
  quote: string
  name: string
  company?: string
  rating?: number
}

export interface TestimonialsContent {
  headline?: string
  testimonials?: Testimonial[]
}

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqContent {
  headline?: string
  subheadline?: string
  faqs?: FaqItem[]
}

export interface RichTextContent {
  headline?: string
  body?: string
}

export interface ImageTextContent {
  headline?: string
  body?: string
  image_url?: string
  image_alt?: string
  image_position?: 'left' | 'right'
  cta_text?: string
  cta_url?: string
}

export interface SubscribeContent {
  headline?: string
  subheadline?: string
  button_text?: string
  success_message?: string
}
