import { lazy, Suspense } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Layout } from './components/layout/Layout';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const ContentCalendar = lazy(() => import('./pages/ContentCalendar'));
const CampaignPipeline = lazy(() => import('./pages/CampaignPipeline'));
const Analytics = lazy(() => import('./pages/Analytics'));
const MarketingGrader = lazy(() => import('./pages/MarketingGrader'));
const Settings = lazy(() => import('./pages/Settings'));

function PageSpinner() {
  return (
    <div className="flex-1 flex items-center justify-center h-full min-h-64">
      <div className="h-6 w-6 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
    </div>
  );
}

function AppContent() {
  const { state } = useAppContext();
  const { activeView } = state;

  return (
    <Layout>
      <Suspense fallback={<PageSpinner />}>
        {activeView === 'dashboard' && <Dashboard />}
        {activeView === 'calendar' && <ContentCalendar />}
        {activeView === 'pipeline' && <CampaignPipeline />}
        {activeView === 'analytics' && <Analytics />}
        {activeView === 'grader' && <MarketingGrader />}
        {activeView === 'settings' && <Settings />}
      </Suspense>
    </Layout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
