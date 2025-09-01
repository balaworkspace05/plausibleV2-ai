import { MetricCard } from './MetricCard';
import { Skeleton } from '@/components/ui/skeleton';

interface MetricsData {
  uniqueVisitors: {
    value: number;
    change: { value: number; trend: 'up' | 'down' | 'neutral' };
  };
  totalVisits: {
    value: number;
    change: { value: number; trend: 'up' | 'down' | 'neutral' };
  };
  pageviews: {
    value: number;
    change: { value: number; trend: 'up' | 'down' | 'neutral' };
  };
  viewsPerVisit: {
    value: number;
    change: { value: number; trend: 'up' | 'down' | 'neutral' };
  };
}

interface MetricsGridProps {
  data: MetricsData | null;
  loading: boolean;
}

export const MetricsGrid = ({ data, loading }: MetricsGridProps) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="analytics-card">
            <div className="space-y-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="analytics-card">
            <div className="text-center p-4">
              <p className="text-muted-foreground">No data available</p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        label="Unique Visitors"
        value={data.uniqueVisitors.value.toLocaleString()}
        change={data.uniqueVisitors.change}
        description="Individual users who visited"
      />
      <MetricCard
        label="Total Visits"
        value={data.totalVisits.value.toLocaleString()}
        change={data.totalVisits.change}
        description="Total number of sessions"
      />
      <MetricCard
        label="Total Pageviews"
        value={data.pageviews.value.toLocaleString()}
        change={data.pageviews.change}
        description="Pages viewed by all visitors"
      />
      <MetricCard
        label="Views Per Visit"
        value={data.viewsPerVisit.value.toFixed(1)}
        change={data.viewsPerVisit.change}
        description="Average pages per session"
      />
    </div>
  );
};