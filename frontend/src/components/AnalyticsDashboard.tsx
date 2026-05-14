import { useState, useEffect } from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { templates } from '../templates';

interface Stats {
  totalEvents: number;
  totalSessions: number;
  totalGenerations: number;
  successfulGenerations: number;
  failedGenerations: number;
  generationRate: number;
  templatePopularity: { templateId: string; count: number }[];
  feedbackPositive: number;
  feedbackNegative: number;
  demoStarted: number;
  demoFetched: number;
  demoSucceeded: number;
  demoFailed: number;
  dailyEvents: { date: string; count: number }[];
  totalPageViews: number;
  uniqueRepos: number;
}

// 设计系统图表色 — 与 CSS 变量 --color-chart-* 保持一致
const CHART_LINE = '#6366f1';
const CHART_BAR = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#f97316'];
const CHART_PIE = ['#10b981', '#f43f5e'];

function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-6 p-8">
      <div className="h-8 w-48 rounded bg-neutral-200" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-24 rounded-card bg-neutral-100" />
        ))}
      </div>
      <div className="h-64 rounded-card bg-neutral-100" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="h-64 rounded-card bg-neutral-100" />
        <div className="h-64 rounded-card bg-neutral-100" />
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-neutral-400">
      <svg className="mb-4 h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
      <p className="text-lg font-medium">暂无数据</p>
      <p className="mt-1 text-sm">当有用户操作后，分析数据将在这里展示</p>
    </div>
  );
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color: string }) {
  return (
    <div className="rounded-card border border-neutral-100 bg-white p-4 shadow-elevated transition-shadow duration-normal hover:shadow-floating">
      <p className="text-xs font-medium text-neutral-500">{label}</p>
      <p className={`mt-1 text-2xl font-bold ${color}`}>{value}</p>
      {sub && <p className="mt-0.5 text-xs text-neutral-400">{sub}</p>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-dialog border border-neutral-200 bg-white px-3 py-2 text-xs shadow-modal">
      <p className="mb-1 font-medium text-neutral-900">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="text-neutral-600">
          {p.name || ''}: <span className="font-semibold">{p.value.toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/analytics/stats')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: Stats) => {
        if (!cancelled) setStats(data);
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => { cancelled = true; };
  }, []);

  if (loading) return <LoadingSkeleton />;
  if (error) {
    return (
      <div className="rounded-card border border-error-50 bg-error-50 p-6 text-center text-sm text-error-500">
        加载失败: {error}
      </div>
    );
  }
  if (!stats || stats.totalEvents === 0) return <EmptyState />;

  const templateData = stats.templatePopularity.map((t) => ({
    name: templates.find((tm) => tm.id === t.templateId)?.name || t.templateId,
    count: t.count,
  }));

  const feedbackData = [
    { name: '满意', value: stats.feedbackPositive },
    { name: '待改进', value: stats.feedbackNegative },
  ];

  const funnelData = [
    { name: '点击 Demo', count: stats.demoStarted },
    { name: '仓库已获取', count: stats.demoFetched },
    { name: '生成成功', count: stats.demoSucceeded },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="flex items-center gap-2 text-xl font-bold text-neutral-900">
            <svg className="h-6 w-6 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0020.25 18V6A2.25 2.25 0 0018 3.75H6A2.25 2.25 0 003.75 6v12A2.25 2.25 0 006 20.25z" />
            </svg>
            分析看板
          </h1>
        <p className="mt-1 text-sm text-neutral-500">应用使用数据概览，共统计 {stats.totalEvents} 条事件</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="生成次数" value={stats.successfulGenerations} sub={`失败 ${stats.failedGenerations} 次`} color="text-brand-600" />
        <StatCard label="生成成功率" value={`${stats.generationRate}%`} color="text-success-500" />
        <StatCard label="模板数" value={stats.templatePopularity.length} sub="已投入使用" color="text-chart-4" />
        <StatCard label="独立仓库" value={stats.uniqueRepos} color="text-chart-3" />
        <StatCard label="访问次数" value={stats.totalPageViews} sub={`${stats.totalSessions} 次会话`} color="text-chart-2" />
      </div>

      {/* Daily Trend */}
      <div className="rounded-card border border-neutral-100 bg-white p-5 shadow-elevated">
        <h3 className="mb-4 text-sm font-semibold text-neutral-900">每日事件趋势（近 14 天）</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.dailyEvents} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 12, fill: '#a8a29e' }} axisLine={{ stroke: '#d6d3d1' }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#a8a29e' }} axisLine={{ stroke: '#d6d3d1' }} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="count" name="事件数" stroke={CHART_LINE} strokeWidth={2} dot={{ r: 3, fill: CHART_LINE }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Template Popularity */}
        <div className="rounded-card border border-neutral-100 bg-white p-5 shadow-elevated">
          <h3 className="mb-4 text-sm font-semibold text-neutral-900">模板热度排行</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={templateData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#a8a29e' }} axisLine={{ stroke: '#d6d3d1' }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} width={80} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" name="使用次数" radius={[0, 4, 4, 0]}>
                  {templateData.map((_, idx) => (
                    <Cell key={idx} fill={CHART_BAR[idx % CHART_BAR.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Feedback & Demo Funnel */}
        <div className="space-y-6">
          {/* Feedback Pie */}
          {stats.feedbackPositive + stats.feedbackNegative > 0 && (
            <div className="rounded-card border border-neutral-100 bg-white p-5 shadow-elevated">
              <h3 className="mb-4 text-sm font-semibold text-neutral-900">用户反馈</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={feedbackData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {feedbackData.map((_, idx) => (
                        <Cell key={idx} fill={CHART_PIE[idx % CHART_PIE.length]} stroke="none" />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      formatter={(value: string) => (
                        <span className="text-xs text-neutral-600">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Demo Funnel */}
          {stats.demoStarted > 0 && (
            <div className="rounded-card border border-neutral-100 bg-white p-5 shadow-elevated">
              <h3 className="mb-4 text-sm font-semibold text-neutral-900">Demo 转化漏斗</h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" horizontal={false} />
                    <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: '#a8a29e' }} axisLine={{ stroke: '#d6d3d1' }} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} width={90} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" name="用户数" radius={[0, 4, 4, 0]} fill={CHART_LINE} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
