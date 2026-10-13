import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CategoryDistributionItem } from '../types/index.js';

interface ContentOverviewProps {
  data: CategoryDistributionItem[];
  totalArticles: number;
}

const CATEGORY_COLORS = [
  '#050505', // Deep black
  '#2563EB', // Tech blue
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#64748B', // Slate
];

export const ContentOverview: React.FC<ContentOverviewProps> = ({
  data,
  totalArticles,
}) => {
  const chartData = data.map((item, idx) => ({
    name: item.name,
    value: item.count,
    color: item.color || CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }));

  return (
    <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col h-full">
      <div className="mb-2">
        <h3 className="text-base font-semibold text-neutral-900">Content Overview</h3>
        <p className="text-xs text-neutral-500">Distribution across tech verticals</p>
      </div>

      <div className="relative flex-1 min-h-[220px] flex items-center justify-center">
        {chartData.length === 0 ? (
          <div className="text-xs text-neutral-400">No categories recorded</div>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={62}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0];
                      const percent = totalArticles > 0
                        ? Math.round(((Number(item.value) || 0) / totalArticles) * 100)
                        : 0;
                      return (
                        <div className="bg-neutral-900 text-white px-3 py-1.5 rounded-lg text-xs shadow-lg">
                          <p className="font-semibold">{item.name}</p>
                          <p className="text-neutral-300">
                            {item.value} articles ({percent}%)
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold font-sans text-neutral-900 leading-none">
                {totalArticles}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-neutral-400 font-medium mt-1">
                Stories
              </span>
            </div>
          </>
        )}
      </div>

      {/* Category legend */}
      <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-2 text-xs">
        {chartData.map((cat) => {
          const percent = totalArticles > 0
            ? Math.round((cat.value / totalArticles) * 100)
            : 0;
          return (
            <div key={cat.name} className="flex items-center justify-between">
              <div className="flex items-center space-x-2 truncate">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="text-neutral-700 truncate">{cat.name}</span>
              </div>
              <span className="text-neutral-400 font-mono text-[11px] ml-1">
                {percent}%
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
