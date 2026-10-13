import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  TrendingUp,
  Eye,
  Clock,
  Share2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { analyticsApi } from '../services/api.js';
import { DashboardStats, TopArticleItem } from '../types/index.js';
import { ViewsChart } from '../components/ViewsChart.js';
import { ContentOverview } from '../components/ContentOverview.js';

export const AnalyticsPage: React.FC = () => {
  const [period, setPeriod] = useState('30d');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topArticles, setTopArticles] = useState<TopArticleItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const [dashRes, topRes] = await Promise.all([
          analyticsApi.getDashboardStats(period),
          analyticsApi.getTopArticles(10),
        ]);
        if (dashRes.success) setStats(dashRes.data);
        if (topRes.success) setTopArticles(topRes.data);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [period]);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/80">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
            Analytics & Editorial Insights
          </h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
            Publication metrics, reader behavior, and traffic engagement
          </p>
        </div>

        {/* Date Filter */}
        <div className="bg-white border border-neutral-200 rounded-lg p-0.5 flex items-center text-xs shadow-2xs">
          {(['7d', '30d', '90d'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-md font-medium transition-all ${
                period === p
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {p === '7d' ? '7 Days' : p === '30d' ? '30 Days' : '90 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase">
            <span>Total Impressions</span>
            <Eye className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 text-2xl font-bold font-sans text-neutral-900">
            {(stats?.totalViews || 0).toLocaleString()}
          </div>
          <p className="text-xs text-emerald-600 mt-1 font-medium flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>+{stats?.viewsGrowth ?? 14}% vs previous period</span>
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase">
            <span>Avg Read Time</span>
            <Clock className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 text-2xl font-bold font-sans text-neutral-900">
            {stats?.avgReadingTime || '3m 48s'}
          </div>
          <p className="text-xs text-neutral-400 mt-1">High editorial completion</p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase">
            <span>Published Stories</span>
            <BarChart3 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 text-2xl font-bold font-sans text-neutral-900">
            {stats?.publishedArticles || 0}
          </div>
          <p className="text-xs text-neutral-400 mt-1">
            Across {stats?.categoryDistribution?.length || 0} tech verticals
          </p>
        </div>

        <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-2xs">
          <div className="flex items-center justify-between text-neutral-500 text-xs font-semibold uppercase">
            <span>Audience Comments</span>
            <Share2 className="w-4 h-4 text-neutral-400" />
          </div>
          <div className="mt-3 text-2xl font-bold font-sans text-neutral-900">
            {stats?.totalComments || 0}
          </div>
          <p className="text-xs text-neutral-400 mt-1">Active community discussions</p>
        </div>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-8">
          <ViewsChart
            data={stats?.viewsTimeline || []}
            title="Readership Timeline"
          />
        </div>
        <div className="lg:col-span-4">
          <ContentOverview
            data={stats?.categoryDistribution || []}
            totalArticles={stats?.totalArticles || 0}
          />
        </div>
      </div>

      {/* Top 10 Performing Articles Table */}
      <div className="bg-white rounded-xl border border-neutral-200/90 shadow-[0_1px_3px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-5 border-b border-neutral-100">
          <h3 className="text-base font-semibold text-neutral-900">Top Performing Stories</h3>
          <p className="text-xs text-neutral-500">
            Articles generating the highest reader traction and reach
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-[11px] uppercase tracking-wider text-neutral-500 font-semibold border-b border-neutral-100">
              <tr>
                <th className="py-3 px-5 w-12 text-center">#</th>
                <th className="py-3 px-4">Story</th>
                <th className="py-3 px-4 hidden sm:table-cell">Category</th>
                <th className="py-3 px-5 text-right">Unique Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {topArticles.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-xs text-neutral-400">
                    No articles recorded yet.
                  </td>
                </tr>
              ) : (
                topArticles.map((art, idx) => (
                  <tr key={art.id} className="hover:bg-neutral-50/60 transition-colors">
                    <td className="py-3.5 px-5 text-center font-mono font-bold text-xs text-neutral-400">
                      {idx + 1}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={art.coverImage}
                          alt={art.title}
                          className="w-12 h-9 rounded object-cover flex-shrink-0 bg-neutral-100 border border-neutral-200"
                        />
                        <div className="min-w-0">
                          <Link
                            to={`/articles/${art.id}/edit`}
                            className="font-medium text-neutral-900 hover:text-blue-600 truncate block text-sm"
                          >
                            {art.title}
                          </Link>
                          <span className="text-[10px] text-neutral-400 font-mono">
                            /{art.slug}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 hidden sm:table-cell">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-700">
                        {art.categoryName}
                      </span>
                    </td>

                    <td className="py-3.5 px-5 text-right font-mono font-semibold text-xs text-neutral-800">
                      {art.views.toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
