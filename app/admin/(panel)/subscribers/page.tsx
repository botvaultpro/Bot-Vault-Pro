import { supabaseAdmin } from '@/lib/cms-supabase'
import type { Subscriber } from '@/types/cms'
import SubscribersClient from './SubscribersClient'

async function getSubscribers(): Promise<Subscriber[]> {
  const { data } = await supabaseAdmin
    .from('subscribers')
    .select('*')
    .order('created_at', { ascending: false })
  return (data || []) as Subscriber[]
}

export default async function AdminSubscribersPage() {
  const subscribers = await getSubscribers()
  return <SubscribersClient initialSubscribers={subscribers} />
}
