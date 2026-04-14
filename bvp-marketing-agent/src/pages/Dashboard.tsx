import { useMemo } from 'react';
import {
  CalendarDays,
  Layers,
  TrendingUp,
  FileText,
  Plus,
  ArrowRight,
  Star,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { Card, StatCard } from '../components/ui/Card';
import { Badge, statusBadgeVariant } from '../components/ui/Badge';
import { CircularProgress } from '../components/ui/CircularProgress';
import { useAppContext, useContentItems, useCampaigns, useGraderResponses } from '../context/AppContext';
import { calculateScore } from '../utils/scoring';
import { PLATFORM_CONFIG, STAGE_CONFIG, type CampaignStage } from '../types';
import { formatShortDate, parseISO, isValid } from '../utils/dateHelpers';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

const STAGE_COLORS: Record<CampaignStage, string> = {
  ideation: '#6B7280',
  creation: '#3B82F6',
  review: '#F59E0B',
  scheduled: '#F97316',
  published: '#22C55E',
};

const GRADE_CONFIG: Record<string, { label: string; color: string }> = {
  A: { label: 'Strong', color: '#22C55E' },
  B: { label: 'Good', color: '#84CC16' },
  C: { label: 'Fair', color: '#F59E0B' },
  D: { label: 'Weak', color: '#F97316' },
  F: { label: 'Poor', color: '#EF4444' },
};

export default function Dashboard() {
  const { dispatch } = useAppContext();
  const contentItems = useContentItems();
  const campaigns = useCampaigns();
  const graderResponses = useGraderResponses();

  const score = useMemo(
    () => calculateScore(contentItems, campaigns, graderResponses),
    [contentItems, campaigns, graderResponses]
  );

  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 0 });

  const thisWeekCount = useMemo(
    () =>
      contentItems.filter((item) => {
        try {
          const d = parseISO(item.scheduledDate);
          return isValid(d) && isWithinInterval(d, { start: weekStart, end: weekEnd });
        } catch {
          return false;
        }
      }).length,
    [contentItems, weekStart, weekEnd]
  );

  const activeCampaigns = campaigns.filter(
    (c) => c.stage !== 'published' && c.stage !== 'ideation'
  ).length;

  const avgEngagement = useMemo(() => {
    const scored = contentItems.filter((i) => i.engagementScore !== undefined);
    if (scored.length === 0) return 0;
    return Math.round(
      scored.reduce((sum, i) => sum + (i.engagementScore ?? 0), 0) / scored.length
    );
  }, [contentItems]);

  const upcomingItems = useMemo(
    () =>
      contentItems
        .filter((item) => {
          try {
            const d = parseISO(item.scheduledDate);
            return isValid(d) && d >= now && item.status !== 'published';
          } catch {
            return false;
          }
        })
        .sort((a, b) => a.scheduledDate.localeCompare(b.scheduledDate))
        .slice(0, 5),
    [contentItems, now]
  );

  const pipelineData = useMemo(() => {
    const stages: CampaignStage[] = ['ideation', 'creation', 'review', 'scheduled', 'published'];
    return stages.map((stage) => ({
      name: STAGE_CONFIG[stage].label,
      count: campaigns.filter((c) => c.stage === stage).length,
      color: STAGE_COLORS[stage],
    }));
  }, [campaigns]);

  const gradeConfig = GRADE_CONFIG[score.grade] ?? GRADE_CONFIG['C'];

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#F5F5F5] tracking-wide uppercase">
            Dashboard
          </h1>
          <p className="text-xs text-[#6B6B6B] mt-0.5">
            {format(now, 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          label="Posts This Week"
          value={thisWeekCount}
          subtext="scheduled or published"
          icon={<CalendarDays size={16} />}
        />
        <StatCard
          label="Active Campaigns"
          value={activeCampaigns}
          subtext="in progress"
          icon={<Layers size={16} />}
        />
        <StatCard
          label="Avg Engagement"
          value={`${avgEngagement}`}
          subtext="score /100"
          icon={<TrendingUp size={16} />}
          accent
        />
        <StatCard
          label="Pipeline Content"
          value={contentItems.filter((i) => i.status !== 'published').length}
          subtext="draft or scheduled"
          icon={<FileText size={16} />}
        />
      </div>

      {/* Middle row: bento grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        {/* Upcoming content */}
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-heading font-semibold text-[#F5F5F5] tracking-wide uppercase">
              Upcoming Content
            </h2>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'calendar' })}
              className="flex items-center gap-1 text-xs text-orange-400 hover:text-orange-300 transition-colors"
            >
              View all <ArrowRight size={12} />
            </button>
          </div>
          {upcomingItems.length === 0 ? (
            <div className="py-8 flex flex-col items-center text-center">
              <CalendarDays size={24} className="text-[#333] mb-2" />
              <p className="text-xs text-[#6B6B6B]">No upcoming content scheduled.</p>
              <button
                onClick={() => dispatch({ type: 'SET_VIEW', payload: 'calendar' })}
                className="text-xs text-orange-400 hover:text-orange-300 mt-1 flex items-center gap-1"
              >
                Add your first post <ArrowRight size={10} />
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {upcomingItems.map((item) => {
                const pc = PLATFORM_CONFIG[item.platform];
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] hover:border-[#2A2A2A] transition-colors"
                  >
                    <div
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: pc.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-[#F5F5F5] truncate">{item.title}</p>
                      <p className="text-[10px] text-[#6B6B6B]">
                        {pc.label} · {formatShortDate(item.scheduledDate)}
                      </p>
                    </div>
                    <Badge variant={statusBadgeVariant(item.status)}>{item.status}</Badge>
                  </div>
                );
              })}
            </div>
          )}
        </Card>

        {/* Marketing score */}
        <Card className="flex flex-col items-center justify-center gap-3">
          <h2 className="text-sm font-heading font-semibold text-[#F5F5F5] tracking-wide uppercase self-start">
            Marketing Score
          </h2>
          <CircularProgress
            value={score.total}
            size={110}
            strokeWidth={8}
            color={gradeConfig.color}
          />
          <div className="text-center">
            <p className="text-lg font-heading font-bold text-[#F5F5F5]">
              Grade {score.grade}
            </p>
            <p className="text-xs text-[#6B6B6B]">{gradeConfig.label}</p>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'grader' })}
            className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors"
          >
            Run full grader <ArrowRight size={12} />
          </button>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {/* Pipeline health */}
        <Card>
          <h2 className="text-sm font-heading font-semibold text-[#F5F5F5] tracking-wide uppercase mb-3">
            Pipeline Health
          </h2>
          {campaigns.length === 0 ? (
            <div className="py-6 flex flex-col items-center text-center">
              <Layers size={20} className="text-[#333] mb-2" />
              <p className="text-xs text-[#6B6B6B]">No campaigns yet.</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <BarChart data={pipelineData} barSize={24} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 10, fill: '#6B6B6B' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: '#6B6B6B' }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1A1A',
                    border: '1px solid #2A2A2A',
                    borderRadius: 8,
                    fontSize: 11,
                    color: '#F5F5F5',
                  }}
                  cursor={{ fill: '#1A1A1A' }}
                />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {pipelineData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Quick actions */}
        <Card>
          <h2 className="text-sm font-heading font-semibold text-[#F5F5F5] tracking-wide uppercase mb-3">
            Quick Actions
          </h2>
          <div className="space-y-2">
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'calendar' })}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] hover:border-orange-500/30 hover:bg-[#111111] transition-all text-left group"
            >
              <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400 group-hover:bg-orange-500/20">
                <Plus size={14} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#F5F5F5]">Add Content</p>
                <p className="text-[10px] text-[#6B6B6B]">Schedule a new piece of content</p>
              </div>
              <ArrowRight size={12} className="ml-auto text-[#333] group-hover:text-orange-400 transition-colors" />
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'pipeline' })}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] hover:border-orange-500/30 hover:bg-[#111111] transition-all text-left group"
            >
              <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20">
                <Layers size={14} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#F5F5F5]">New Campaign</p>
                <p className="text-[10px] text-[#6B6B6B]">Create and track a campaign</p>
              </div>
              <ArrowRight size={12} className="ml-auto text-[#333] group-hover:text-blue-400 transition-colors" />
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_VIEW', payload: 'grader' })}
              className="w-full flex items-center gap-3 p-3 rounded-lg bg-[#0A0A0A] border border-[#1A1A1A] hover:border-orange-500/30 hover:bg-[#111111] transition-all text-left group"
            >
              <div className="p-1.5 rounded-lg bg-yellow-500/10 text-yellow-400 group-hover:bg-yellow-500/20">
                <Star size={14} />
              </div>
              <div>
                <p className="text-xs font-medium text-[#F5F5F5]">Run Grader</p>
                <p className="text-[10px] text-[#6B6B6B]">Score your marketing strategy</p>
              </div>
              <ArrowRight size={12} className="ml-auto text-[#333] group-hover:text-yellow-400 transition-colors" />
            </button>
          </div>
        </Card>
      </div>
    </div>
  );
}
