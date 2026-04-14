import { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  CartesianGrid,
} from 'recharts';
import { Info, ArrowUpDown } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Badge, goalBadgeVariant } from '../components/ui/Badge';
import { EmptyState } from '../components/ui/EmptyState';
import { useContentItems } from '../context/AppContext';
import { PLATFORM_CONFIG, GOAL_CONFIG, type ContentItem, type Platform, type ContentGoal } from '../types';
import { parseISO, isValid, subDays, format } from 'date-fns';

type DateRange = 7 | 30 | 90;
type SortKey = keyof Pick<ContentItem, 'title' | 'platform' | 'contentType' | 'goal'> | 'engagementScore';

const CHART_COLORS: Record<string, string> = {
  // Platforms
  instagram: '#F97316',
  linkedin: '#3B82F6',
  blog: '#22C55E',
  youtube: '#A855F7',
  email: '#6B7280',
  twitter: '#06B6D4',
  facebook: '#818CF8',
  // Goals
  awareness: '#3B82F6',
  engagement: '#F97316',
  conversion: '#22C55E',
  retention: '#A855F7',
  // Content types
  post: '#F97316',
  video: '#3B82F6',
  story: '#A855F7',
  reel: '#06B6D4',
  newsletter: '#84CC16',
};

const TOOLTIP_STYLE = {
  backgroundColor: '#1A1A1A',
  border: '1px solid #2A2A2A',
  borderRadius: 8,
  fontSize: 11,
  color: '#F5F5F5',
};

export default function Analytics() {
  const allItems = useContentItems();
  const [dateRange, setDateRange] = useState<DateRange>(30);
  const [sortKey, setSortKey] = useState<SortKey>('engagementScore');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const filteredItems = useMemo(() => {
    const cutoff = subDays(new Date(), dateRange);
    return allItems.filter((item) => {
      try {
        const d = parseISO(item.scheduledDate);
        return isValid(d) && d >= cutoff;
      } catch {
        return false;
      }
    });
  }, [allItems, dateRange]);

  // Platform engagement
  const platformData = useMemo(() => {
    const map: Record<string, { total: number; count: number }> = {};
    filteredItems.forEach((item) => {
      if (!map[item.platform]) map[item.platform] = { total: 0, count: 0 };
      map[item.platform].total += item.engagementScore ?? 0;
      map[item.platform].count += 1;
    });
    return Object.entries(map).map(([platform, { total, count }]) => ({
      name: PLATFORM_CONFIG[platform as Platform]?.label ?? platform,
      avg: count > 0 ? Math.round(total / count) : 0,
      posts: count,
      color: CHART_COLORS[platform as keyof typeof CHART_COLORS] ?? '#6B7280',
    }));
  }, [filteredItems]);

  // Content type breakdown
  const contentTypeData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredItems.forEach((item) => {
      map[item.contentType] = (map[item.contentType] ?? 0) + 1;
    });
    return Object.entries(map).map(([type, count]) => ({
      name: type,
      value: count,
      color: CHART_COLORS[type as keyof typeof CHART_COLORS] ?? '#6B7280',
    }));
  }, [filteredItems]);

  // Publishing frequency (posts per day, grouped by week)
  const frequencyData = useMemo(() => {
    const map: Record<string, number> = {};
    filteredItems.forEach((item) => {
      try {
        const d = parseISO(item.scheduledDate);
        if (!isValid(d)) return;
        const week = format(d, 'MMM d');
        map[week] = (map[week] ?? 0) + 1;
      } catch {
        // ignore
      }
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, posts]) => ({ date, posts }));
  }, [filteredItems]);

  // Goal distribution
  const goalData = useMemo(() => {
    const total = filteredItems.length || 1;
    const goals: ContentGoal[] = ['awareness', 'engagement', 'conversion', 'retention'];
    return goals.map((goal) => {
      const count = filteredItems.filter((i) => i.goal === goal).length;
      return {
        goal: GOAL_CONFIG[goal].label,
        count,
        pct: Math.round((count / total) * 100),
        color: GOAL_CONFIG[goal].color,
      };
    });
  }, [filteredItems]);

  // Top content table
  const topContent = useMemo(() => {
    const items = filteredItems.slice();
    items.sort((a, b) => {
      let av: string | number = '';
      let bv: string | number = '';
      if (sortKey === 'engagementScore') {
        av = a.engagementScore ?? 0;
        bv = b.engagementScore ?? 0;
      } else {
        av = a[sortKey] ?? '';
        bv = b[sortKey] ?? '';
      }
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return items.slice(0, 10);
  }, [filteredItems, sortKey, sortDir]);

  function toggleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('desc'); }
  }

  const hasData = filteredItems.length > 0;

  return (
    <div className="p-5 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-heading font-bold text-[#F5F5F5] tracking-wide uppercase">
            Analytics
          </h1>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Info size={11} className="text-[#6B6B6B]" />
            <p className="text-[10px] text-[#6B6B6B]">Based on your logged data</p>
          </div>
        </div>
        <div className="flex gap-1.5">
          {([7, 30, 90] as DateRange[]).map((d) => (
            <button
              key={d}
              onClick={() => setDateRange(d)}
              className={`px-3 py-1.5 text-xs rounded-lg border transition-colors ${
                dateRange === d
                  ? 'bg-orange-500/10 text-orange-400 border-orange-500/30'
                  : 'text-[#6B6B6B] border-[#2A2A2A] hover:border-[#3A3A3A]'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </div>

      {!hasData ? (
        <EmptyState
          icon={Info}
          title="No data for this period"
          description="Add content to your calendar to see analytics here."
        />
      ) : (
        <>
          {/* Charts row 1 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Platform performance */}
            <Card>
              <h2 className="text-xs font-heading font-semibold text-[#F5F5F5] uppercase tracking-wide mb-4">
                Platform Engagement (Avg Score)
              </h2>
              {platformData.length === 0 ? (
                <p className="text-xs text-[#6B6B6B] py-4 text-center">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={platformData} barSize={28} margin={{ top: 0, right: 0, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: '#1A1A1A' }} />
                    <Bar dataKey="avg" radius={[4, 4, 0, 0]} name="Avg Score">
                      {platformData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Content type donut */}
            <Card>
              <h2 className="text-xs font-heading font-semibold text-[#F5F5F5] uppercase tracking-wide mb-4">
                Content Type Breakdown
              </h2>
              {contentTypeData.length === 0 ? (
                <p className="text-xs text-[#6B6B6B] py-4 text-center">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={contentTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                      nameKey="name"
                    >
                      {contentTypeData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={TOOLTIP_STYLE}
                      formatter={(val: number, name: string) => [`${val} posts`, name]}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span style={{ fontSize: 10, color: '#A3A3A3', textTransform: 'capitalize' }}>
                          {value}
                        </span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Card>
          </div>

          {/* Charts row 2 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Publishing frequency */}
            <Card>
              <h2 className="text-xs font-heading font-semibold text-[#F5F5F5] uppercase tracking-wide mb-4">
                Publishing Frequency
              </h2>
              {frequencyData.length === 0 ? (
                <p className="text-xs text-[#6B6B6B] py-4 text-center">No data</p>
              ) : (
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={frequencyData} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1A1A1A" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#6B6B6B' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: '#6B6B6B' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip contentStyle={TOOLTIP_STYLE} />
                    <Line
                      type="monotone"
                      dataKey="posts"
                      stroke="#F97316"
                      strokeWidth={2}
                      dot={{ fill: '#F97316', r: 3 }}
                      activeDot={{ r: 4 }}
                      name="Posts"
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Card>

            {/* Goal distribution */}
            <Card>
              <h2 className="text-xs font-heading font-semibold text-[#F5F5F5] uppercase tracking-wide mb-4">
                Goal Distribution
              </h2>
              <div className="space-y-3">
                {goalData.map((g) => (
                  <div key={g.goal}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#A3A3A3]">{g.goal}</span>
                      <span className="text-xs text-[#6B6B6B]">
                        {g.count} piece{g.count !== 1 ? 's' : ''} · {g.pct}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#2A2A2A] overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${g.pct}%`, backgroundColor: g.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Top content table */}
          <Card>
            <h2 className="text-xs font-heading font-semibold text-[#F5F5F5] uppercase tracking-wide mb-3">
              Top Performing Content
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#2A2A2A]">
                    {(
                      [
                        ['title', 'Title'],
                        ['platform', 'Platform'],
                        ['contentType', 'Type'],
                        ['goal', 'Goal'],
                        ['engagementScore', 'Score'],
                      ] as [SortKey, string][]
                    ).map(([key, label]) => (
                      <th
                        key={key}
                        onClick={() => toggleSort(key)}
                        className="px-3 py-2 font-medium text-[#6B6B6B] uppercase tracking-wider cursor-pointer hover:text-[#A3A3A3] transition-colors whitespace-nowrap"
                      >
                        <span className="flex items-center gap-1">
                          {label} <ArrowUpDown size={9} />
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {topContent.map((item) => (
                    <tr key={item.id} className="border-b border-[#1A1A1A] last:border-0 hover:bg-[#1A1A1A] transition-colors">
                      <td className="px-3 py-2 text-[#F5F5F5] font-medium max-w-[180px] truncate">{item.title}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: PLATFORM_CONFIG[item.platform].color }}
                          />
                          <span className="text-[#A3A3A3]">{PLATFORM_CONFIG[item.platform].label}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-[#A3A3A3] capitalize">{item.contentType}</td>
                      <td className="px-3 py-2">
                        <Badge variant={goalBadgeVariant(item.goal)} className="text-[9px]">{item.goal}</Badge>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          <div className="h-1 w-16 rounded-full bg-[#2A2A2A] overflow-hidden">
                            <div
                              className="h-full rounded-full bg-orange-500"
                              style={{ width: `${item.engagementScore ?? 0}%` }}
                            />
                          </div>
                          <span className="text-[#F5F5F5] font-medium">{item.engagementScore ?? 0}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}
