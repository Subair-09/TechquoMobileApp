import React, { useState, useEffect } from 'react';
import {
  FileText,
  Eye,
  MessageSquare,
  Users,
  RefreshCw,
} from 'lucide-react';
import { KPICard } from '../components/KPICard.js';
import { ViewsChart } from '../components/ViewsChart.js';
import { ContentOverview } from '../components/ContentOverview.js';
import { RecentArticlesTable } from '../components/RecentArticlesTable.js';
import { LatestActivity } from '../components/LatestActivity.js';
import { QuickActions } from '../components/QuickActions.js';
import { analyticsApi } from '../services/api.js';
import { DashboardStats } from '../types/index.js';

export const DashboardPage: React.FC = () => {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDashboardData = async (selectedPeriod: string = period) => {
    try {
      const res = await analyticsApi.getDashboardStats(selectedPeriod);
      if (res.success && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchDashboardData(period);
  };

  if (isLoading && !stats) {
    return (
      <div className="py-24 flex flex-col items-center justify-center space-y-3">
        <div className="w-8 h-8 border-2 border-neutral-300 border-t-neutral-900 rounded-full animate-spin"></div>
        <p className="text-xs uppercase tracking-widest text-neutral-400 font-medium">
          Loading metrics...
        </p>
      </div>
    );
  }

  const formatNumber = (num: number = 0) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString();
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header & Date Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Overview of publication performance and editorial metrics
          </p>
        </div>

        {/* Date Filter & Refresh */}
        <div className="flex items-center space-x-2">
          <div className="bg-white border border-neutral-200 rounded-lg p-0.5 flex items-center text-xs shadow-2xs">
            <button
              onClick={() => setPeriod('7d')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                period === '7d'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setPeriod('30d')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                period === '30d'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              30 Days
            </button>
            <button
              onClick={() => setPeriod('90d')}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                period === '90d'
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              90 Days
            </button>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-white border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 rounded-lg transition-colors shadow-2xs"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <KPICard
          title="Total Articles"
          value={stats?.totalArticles ?? 0}
          change="+8% this month"
          isPositive={true}
          icon={FileText}
          subtitle={`${stats?.publishedArticles ?? 0} published • ${stats?.draftArticles ?? 0} drafts`}
        />

        <KPICard
          title="Total Views"
          value={formatNumber(stats?.totalViews ?? 0)}
          change={`+${stats?.viewsGrowth ?? 14}% vs prev`}
          isPositive={true}
          icon={Eye}
          subtitle="Unique reader impressions"
        />

        <KPICard
          title="Comments"
          value={stats?.totalComments ?? 0}
          change={stats?.pendingComments ? `${stats.pendingComments} pending` : 'All clear'}
          isPositive={!stats?.pendingComments}
          icon={MessageSquare}
          subtitle="Audience engagement"
        />

        <KPICard
          title="Active Authors"
          value={stats?.totalAuthors ?? 0}
          change="Contributing writers"
          isPositive={true}
          icon={Users}
          subtitle="Editorial tech journalists"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <ViewsChart
            data={stats?.viewsTimeline || []}
            title="Readership Trends"
          />
        </div>
        <div className="lg:col-span-4">
          <ContentOverview
            data={stats?.categoryDistribution || []}
            totalArticles={stats?.totalArticles || 0}
          />
        </div>
      </div>

      {/* Tables & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <RecentArticlesTable articles={stats?.recentArticles || []} />
        </div>
        <div className="lg:col-span-4 space-y-5">
          <QuickActions />
          <LatestActivity activities={stats?.latestActivity || []} />
        </div>
      </div>
    </div>
  );
};
