import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin-auth'
import AdminSidebar from '@/components/admin/AdminSidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await getAdminSession()
  if (!isAdmin) redirect('/admin/login')

  return (
    <div className="flex min-h-screen bg-bg font-body">
      <AdminSidebar />
      <main className="flex-1 overflow-auto bg-bg p-8">
        {children}
      </main>
    </div>
  )
}
