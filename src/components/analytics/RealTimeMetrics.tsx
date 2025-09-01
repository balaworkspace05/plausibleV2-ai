import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MetricCard } from './MetricCard';
import { Loader2 } from 'lucide-react';

interface RealTimeMetricsProps {
  projectId: string;
}

interface Metrics {
  visitors: number;
  pageviews: number;
  bounceRate: number;
  avgDuration: number;
  visitorsChange: number;
  pageviewsChange: number;
  bounceRateChange: number;
  avgDurationChange: number;
}

export function RealTimeMetrics({ projectId }: RealTimeMetricsProps) {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!projectId) return;

    loadMetrics();

    // Set up real-time subscription
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
          filter: `project_id=eq.${projectId}`
        },
        () => {
          // Reload metrics when new events come in
          loadMetrics();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId]);

  const loadMetrics = async () => {
    if (!projectId) return;

    try {
      // Get current period metrics (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: currentEvents, error: currentError } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .gte('timestamp', thirtyDaysAgo.toISOString());

      if (currentError) throw currentError;

      // Get previous period metrics (30 days before that)
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const { data: previousEvents, error: previousError } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', projectId)
        .gte('timestamp', sixtyDaysAgo.toISOString())
        .lt('timestamp', thirtyDaysAgo.toISOString());

      if (previousError) throw previousError;

      // Calculate current metrics
      const currentVisitors = new Set(currentEvents?.map(e => e.session_id) || []).size;
      const currentPageviews = currentEvents?.length || 0;
      
      // Simple bounce rate calculation (sessions with only 1 pageview)
      const sessionCounts = (currentEvents || []).reduce((acc: Record<string, number>, event) => {
        acc[event.session_id] = (acc[event.session_id] || 0) + 1;
        return acc;
      }, {});
      const bouncedSessions = Object.values(sessionCounts).filter(count => count === 1).length;
      const currentBounceRate = currentVisitors > 0 ? (bouncedSessions / currentVisitors) * 100 : 0;
      
      // Dummy avg duration for now
      const currentAvgDuration = 150;

      // Calculate previous metrics
      const previousVisitors = new Set(previousEvents?.map(e => e.session_id) || []).size;
      const previousPageviews = previousEvents?.length || 0;
      const prevSessionCounts = (previousEvents || []).reduce((acc: Record<string, number>, event) => {
        acc[event.session_id] = (acc[event.session_id] || 0) + 1;
        return acc;
      }, {});
      const prevBouncedSessions = Object.values(prevSessionCounts).filter(count => count === 1).length;
      const previousBounceRate = previousVisitors > 0 ? (prevBouncedSessions / previousVisitors) * 100 : 0;
      const previousAvgDuration = 140;

      // Calculate changes
      const visitorsChange = previousVisitors > 0 ? ((currentVisitors - previousVisitors) / previousVisitors) * 100 : 0;
      const pageviewsChange = previousPageviews > 0 ? ((currentPageviews - previousPageviews) / previousPageviews) * 100 : 0;
      const bounceRateChange = previousBounceRate > 0 ? ((currentBounceRate - previousBounceRate) / previousBounceRate) * 100 : 0;
      const avgDurationChange = previousAvgDuration > 0 ? ((currentAvgDuration - previousAvgDuration) / previousAvgDuration) * 100 : 0;

      setMetrics({
        visitors: currentVisitors,
        pageviews: currentPageviews,
        bounceRate: currentBounceRate,
        avgDuration: currentAvgDuration,
        visitorsChange,
        pageviewsChange,
        bounceRateChange,
        avgDurationChange,
      });
    } catch (error) {
      console.error('Error loading metrics:', error);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="analytics-card animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2"></div>
            <div className="h-8 bg-muted rounded w-16 mb-2"></div>
            <div className="h-3 bg-muted rounded w-32"></div>
          </div>
        ))}
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        label="Unique Visitors"
        value={metrics.visitors.toLocaleString()}
        change={{
          value: Math.round(metrics.visitorsChange),
          trend: metrics.visitorsChange > 0 ? 'up' : metrics.visitorsChange < 0 ? 'down' : 'neutral'
        }}
        description="Last 30 days"
      />
      <MetricCard
        label="Pageviews"
        value={metrics.pageviews.toLocaleString()}
        change={{
          value: Math.round(metrics.pageviewsChange),
          trend: metrics.pageviewsChange > 0 ? 'up' : metrics.pageviewsChange < 0 ? 'down' : 'neutral'
        }}
        description="Last 30 days"
      />
      <MetricCard
        label="Bounce Rate"
        value={`${metrics.bounceRate.toFixed(1)}%`}
        change={{
          value: Math.round(Math.abs(metrics.bounceRateChange)),
          trend: metrics.bounceRateChange < 0 ? 'up' : metrics.bounceRateChange > 0 ? 'down' : 'neutral'
        }}
        description="Single page visits"
      />
      <MetricCard
        label="Avg. Duration"
        value={`${metrics.avgDuration}s`}
        change={{
          value: Math.round(metrics.avgDurationChange),
          trend: metrics.avgDurationChange > 0 ? 'up' : metrics.avgDurationChange < 0 ? 'down' : 'neutral'
        }}
        description="Session duration"
      />
    </div>
  );
}