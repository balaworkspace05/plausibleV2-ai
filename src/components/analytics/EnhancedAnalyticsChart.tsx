import { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  TooltipProps,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartDataPoint {
  date: string;
  visitors: number;
  pageviews: number;
  sessions: number;
}

interface EnhancedAnalyticsChartProps {
  data: ChartDataPoint[];
  loading: boolean;
}

type ChartMetric = 'visitors' | 'pageviews' | 'sessions';

const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-card-border rounded-lg shadow-lg p-3">
        <p className="text-sm font-medium text-card-foreground mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-muted-foreground capitalize">
              {entry.dataKey}:
            </span>
            <span className="text-sm font-medium text-card-foreground">
              {entry.value?.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const EnhancedAnalyticsChart = ({ data, loading }: EnhancedAnalyticsChartProps) => {
  const [selectedMetrics, setSelectedMetrics] = useState<ChartMetric[]>(['visitors', 'pageviews']);

  const metricConfig = {
    visitors: { color: 'hsl(var(--primary))', label: 'Visitors' },
    pageviews: { color: 'hsl(var(--success))', label: 'Pageviews' },
    sessions: { color: 'hsl(var(--warning))', label: 'Sessions' },
  };

  const toggleMetric = (metric: ChartMetric) => {
    setSelectedMetrics(prev => 
      prev.includes(metric) 
        ? prev.filter(m => m !== metric)
        : [...prev, metric]
    );
  };

  if (loading) {
    return (
      <div className="analytics-card">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="flex gap-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20" />
            ))}
          </div>
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="analytics-card">
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-12 h-12 text-muted-foreground"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-foreground mb-2">No Data Available</h3>
          <p className="text-muted-foreground">
            Start collecting data by installing the tracking script on your website.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-card-foreground">Traffic Trends</h3>
          <p className="text-sm text-muted-foreground">
            Track your website's performance over time
          </p>
        </div>
        
        {/* Metric Toggle Buttons */}
        <div className="flex gap-2">
          {Object.entries(metricConfig).map(([metric, config]) => (
            <Button
              key={metric}
              size="sm"
              variant={selectedMetrics.includes(metric as ChartMetric) ? "default" : "outline"}
              onClick={() => toggleMetric(metric as ChartMetric)}
              className={`gap-2 ${
                selectedMetrics.includes(metric as ChartMetric)
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-card border-card-border hover:bg-accent'
              }`}
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: config.color }}
              />
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="hsl(var(--border))" 
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="date"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            
            {selectedMetrics.map((metric) => (
              <Line
                key={metric}
                type="monotone"
                dataKey={metric}
                stroke={metricConfig[metric].color}
                strokeWidth={2}
                dot={{ fill: metricConfig[metric].color, strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: metricConfig[metric].color, strokeWidth: 2 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};