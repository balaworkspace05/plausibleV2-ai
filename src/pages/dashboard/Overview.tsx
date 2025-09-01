import { useState, useEffect } from 'react';
import { MetricsGrid } from '@/components/analytics/MetricsGrid';
import { EnhancedAnalyticsChart } from '@/components/analytics/EnhancedAnalyticsChart';
import { TimeRangeSelector, TimeRange } from '@/components/analytics/TimeRangeSelector';
import { FilterDropdown, FilterOption } from '@/components/analytics/FilterDropdown';
import { TopList } from '@/components/analytics/TopList';
import { AnomalyRadar } from '@/components/features/AnomalyRadar';
import { IndustryBenchmarks } from '@/components/features/IndustryBenchmarks';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface OverviewProps {
  selectedProject?: Project | null;
}

export function Overview({ selectedProject }: OverviewProps) {
  const [metricsData, setMetricsData] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [topSources, setTopSources] = useState<any[]>([]);
  const [topCountries, setTopCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<TimeRange>('30d');
  const [activeFilters, setActiveFilters] = useState<FilterOption[]>([]);

  useEffect(() => {
    if (selectedProject) {
      loadAnalyticsData();
    } else {
      setLoading(false);
    }
  }, [selectedProject, timeRange, activeFilters]);

  const getDaysFromRange = (range: TimeRange): number => {
    switch (range) {
      case '7d': return 7;
      case '30d': return 30;
      case '90d': return 90;
      case '1y': return 365;
      default: return 30;
    }
  };

  const loadAnalyticsData = async () => {
    if (!selectedProject) return;

    try {
      const days = getDaysFromRange(timeRange);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', selectedProject.id)
        .gte('timestamp', startDate.toISOString());

      if (error) throw error;

      // Process metrics data
      const uniqueVisitors = new Set((events || []).map(e => e.session_id)).size;
      const totalVisits = uniqueVisitors; // Simplified for now
      const totalPageviews = (events || []).length;
      const viewsPerVisit = totalVisits > 0 ? totalPageviews / totalVisits : 0;

      // Calculate previous period for comparison
      const prevStartDate = new Date(startDate);
      prevStartDate.setDate(prevStartDate.getDate() - days);
      
      const { data: prevEvents } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', selectedProject.id)
        .gte('timestamp', prevStartDate.toISOString())
        .lt('timestamp', startDate.toISOString());

      const prevUniqueVisitors = new Set((prevEvents || []).map(e => e.session_id)).size;
      const prevTotalVisits = prevUniqueVisitors;
      const prevTotalPageviews = (prevEvents || []).length;
      const prevViewsPerVisit = prevTotalVisits > 0 ? prevTotalPageviews / prevTotalVisits : 0;

      // Calculate percentage changes
      const calcChange = (current: number, previous: number) => {
        if (previous === 0) return { value: 0, trend: 'neutral' as const };
        const change = ((current - previous) / previous) * 100;
        return {
          value: Math.abs(change),
          trend: change > 0 ? 'up' as const : change < 0 ? 'down' as const : 'neutral' as const
        };
      };

      setMetricsData({
        uniqueVisitors: { value: uniqueVisitors, change: calcChange(uniqueVisitors, prevUniqueVisitors) },
        totalVisits: { value: totalVisits, change: calcChange(totalVisits, prevTotalVisits) },
        pageviews: { value: totalPageviews, change: calcChange(totalPageviews, prevTotalPageviews) },
        viewsPerVisit: { value: viewsPerVisit, change: calcChange(viewsPerVisit, prevViewsPerVisit) },
      });

      // Process chart data (group by day)
      const dailyData = (events || []).reduce((acc: Record<string, any>, event) => {
        const date = new Date(event.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, visitors: new Set(), pageviews: 0, sessions: new Set() };
        }
        acc[date].visitors.add(event.session_id);
        acc[date].sessions.add(event.session_id);
        acc[date].pageviews++;
        return acc;
      }, {});

      const processedChartData = Object.values(dailyData)
        .map((day: any) => ({
          date: day.date,
          visitors: day.visitors.size,
          pageviews: day.pageviews,
          sessions: day.sessions.size,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      setChartData(processedChartData);

      // Process top pages
      const pageStats = (events || []).reduce((acc: Record<string, number>, event) => {
        acc[event.url] = (acc[event.url] || 0) + 1;
        return acc;
      }, {});

      const processedTopPages = Object.entries(pageStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([url, value]) => ({
          name: new URL(url).pathname === '/' ? 'Home' : new URL(url).pathname.split('/').pop() || url,
          value,
          percentage: Math.round((value / (events?.length || 1)) * 100),
          url
        }));

      setTopPages(processedTopPages);

      // Process top sources
      const referrerStats = (events || []).reduce((acc: Record<string, number>, event) => {
        const referrer = event.referrer || 'Direct';
        acc[referrer] = (acc[referrer] || 0) + 1;
        return acc;
      }, {});

      const processedTopSources = Object.entries(referrerStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({
          name: name === 'Direct' ? 'Direct' : (() => {
            try {
              return new URL(name).hostname || name;
            } catch {
              return name;
            }
          })(),
          value,
          percentage: Math.round((value / (events?.length || 1)) * 100),
        }));

      setTopSources(processedTopSources);

      // Process top countries
      const countryStats = (events || []).reduce((acc: Record<string, number>, event) => {
        const country = event.country || 'Unknown';
        acc[country] = (acc[country] || 0) + 1;
        return acc;
      }, {});

      const processedTopCountries = Object.entries(countryStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({
          name,
          value,
          percentage: Math.round((value / (events?.length || 1)) * 100),
        }));

      setTopCountries(processedTopCountries);

    } catch (error) {
      console.error('Error loading analytics data:', error);
    }

    setLoading(false);
  };

  const handleFilterAdd = (filter: FilterOption) => {
    setActiveFilters(prev => [...prev, filter]);
  };

  const handleFilterRemove = (filter: FilterOption) => {
    setActiveFilters(prev => 
      prev.filter(f => 
        !(f.category === filter.category && f.type === filter.type && f.value === filter.value)
      )
    );
  };

  const handleClearAllFilters = () => {
    setActiveFilters([]);
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Project Selected</h3>
          <p className="text-sm text-muted-foreground">Select a project from the dropdown to view analytics</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Analytics Overview
          </h1>
          <p className="text-muted-foreground">
            Complete analytics dashboard for {selectedProject.name}
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <FilterDropdown
            activeFilters={activeFilters}
            onFilterAdd={handleFilterAdd}
            onFilterRemove={handleFilterRemove}
            onClearAll={handleClearAllFilters}
          />
          <TimeRangeSelector
            selectedRange={timeRange}
            onRangeChange={setTimeRange}
          />
        </div>
      </div>

      {/* Top Metrics Row */}
      <MetricsGrid data={metricsData} loading={loading} />

      {/* Main Chart Section */}
      <EnhancedAnalyticsChart data={chartData} loading={loading} />

      {/* Top Lists Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopList
          title="Top Pages"
          items={topPages}
          type="pages"
          showUrls={true}
        />
        <TopList
          title="Top Sources"
          items={topSources}
          type="sources"
        />
        <TopList
          title="Top Countries"
          items={topCountries}
          type="countries"
        />
      </div>

      {/* Advanced Analytics Features */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnomalyRadar projectId={selectedProject.id} />
        <IndustryBenchmarks 
          projectId={selectedProject.id}
          currentMetrics={{
            bounceRate: 45.2,
            avgDuration: 150,
            conversionRate: 2.8,
          }}
        />
      </div>
    </div>
  );
}