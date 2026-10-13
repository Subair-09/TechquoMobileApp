import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { ViewsTimelinePoint } from '../types/index.js';

interface ViewsChartProps {
  data: ViewsTimelinePoint[];
  title?: string;
}

export const ViewsChart: React.FC<ViewsChartProps> = ({
  data,
  title = 'Article Views Over Time',
}) => {
  return (
    <div className="bg-white rounded-xl border border-neutral-200/90 p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-neutral-900">{title}</h3>
          <p className="text-xs text-neutral-500">Daily unique readers and impressions</p>
        </div>
        <div className="flex items-center space-x-2 text-xs">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-neutral-900"></span>
          <span className="text-neutral-600 font-medium">Page Views</span>
        </div>
      </div>

      <div className="flex-1 w-full min-h-[260px]">
        {data.length === 0 ? (
          <div className="h-full flex items-center justify-center text-xs text-neutral-400">
            No readership data available yet
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#050505" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#050505" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8892B0', fontSize: 11 }}
                dy={6}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#8892B0', fontSize: 11 }}
                dx={-4}
                tickFormatter={(value) => (value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value)}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-neutral-900 text-white px-3 py-1.5 rounded-lg text-xs shadow-lg">
                        <p className="font-semibold">{payload[0].payload.date}</p>
                        <p className="text-neutral-300">
                          {Number(payload[0].value).toLocaleString()} views
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="views"
                stroke="#050505"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#viewsGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};
