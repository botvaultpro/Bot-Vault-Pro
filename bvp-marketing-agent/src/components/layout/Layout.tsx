import { type ReactNode, Suspense } from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: ReactNode;
}

function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="h-6 w-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-[#0A0A0A] overflow-hidden font-body">
      <Sidebar />
      <main className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto pb-14 md:pb-0">
          <Suspense fallback={<PageSpinner />}>{children}</Suspense>
        </div>
      </main>
    </div>
  );
}
