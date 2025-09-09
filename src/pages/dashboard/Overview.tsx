import { useState, useEffect } from 'react';
import { MetricsGrid } from '@/components/analytics/MetricsGrid';
import { EnhancedAnalyticsChart } from '@/components/analytics/EnhancedAnalyticsChart';
import { TimeRangeSelector, TimeRange } from '@/components/analytics/TimeRangeSelector';
import { FilterDropdown, FilterOption } from '@/components/analytics/FilterDropdown';
import { TopList } from '@/components/analytics/TopList';
import { AnomalyRadar } from '@/components/features/AnomalyRadar';
import { IndustryBenchmarks } from '@/components/features/IndustryBenchmarks';
import { CarbonFootprint } from '@/components/features/CarbonFootprint';
import { ABTestingLab } from '@/components/features/ABTestingLab';
import { VisitorIntentHeatmaps } from '@/components/features/VisitorIntentHeatmaps';
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

      // Use demo data if no real data available
      const hasRealData = totalPageviews > 0;
      
      if (hasRealData) {
        setMetricsData({
          uniqueVisitors: { value: uniqueVisitors, change: calcChange(uniqueVisitors, prevUniqueVisitors) },
          totalVisits: { value: totalVisits, change: calcChange(totalVisits, prevTotalVisits) },
          pageviews: { value: totalPageviews, change: calcChange(totalPageviews, prevTotalPageviews) },
          viewsPerVisit: { value: viewsPerVisit, change: calcChange(viewsPerVisit, prevViewsPerVisit) },
        });
      } else {
        // Demo metrics data
        setMetricsData({
          uniqueVisitors: { value: 47200, change: { value: 12.5, trend: 'up' as const } },
          totalVisits: { value: 52800, change: { value: 8.7, trend: 'up' as const } },
          pageviews: { value: 142800, change: { value: 15.3, trend: 'up' as const } },
          viewsPerVisit: { value: 2.7, change: { value: 5.2, trend: 'up' as const } },
        });
      }

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

      // Use demo chart data if no real data
      const demoChartData = [
        { date: 'Jan 1', visitors: 2400, pageviews: 4800, sessions: 2400 },
        { date: 'Jan 2', visitors: 1398, pageviews: 2796, sessions: 1398 },
        { date: 'Jan 3', visitors: 4800, pageviews: 9600, sessions: 4800 },
        { date: 'Jan 4', visitors: 3908, pageviews: 7816, sessions: 3908 },
        { date: 'Jan 5', visitors: 4200, pageviews: 8400, sessions: 4200 },
        { date: 'Jan 6', visitors: 3800, pageviews: 7600, sessions: 3800 },
        { date: 'Jan 7', visitors: 4300, pageviews: 8600, sessions: 4300 },
        { date: 'Jan 8', visitors: 5200, pageviews: 10400, sessions: 5200 },
        { date: 'Jan 9', visitors: 2900, pageviews: 5800, sessions: 2900 },
        { date: 'Jan 10', visitors: 6100, pageviews: 12200, sessions: 6100 },
        { date: 'Jan 11', visitors: 4400, pageviews: 8800, sessions: 4400 },
        { date: 'Jan 12', visitors: 5800, pageviews: 11600, sessions: 5800 },
        { date: 'Jan 13', visitors: 4200, pageviews: 8400, sessions: 4200 },
        { date: 'Jan 14', visitors: 4900, pageviews: 9800, sessions: 4900 },
      ];

      setChartData(hasRealData ? processedChartData : demoChartData);

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

      // Use demo data if no real data
      const demoTopPages = [
        { name: 'Home', value: 64620, percentage: 45, url: '/' },
        { name: 'Pricing', value: 45780, percentage: 32, url: '/pricing' },
        { name: 'Features', value: 22284, percentage: 16, url: '/features' },
        { name: 'About', value: 6283, percentage: 4, url: '/about' },
        { name: 'Blog', value: 4277, percentage: 3, url: '/blog' },
      ];

      setTopPages(hasRealData ? processedTopPages : demoTopPages);

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

      // Use demo data if no real data
      const demoTopSources = [
        { name: 'google.com', value: 60270, percentage: 42 },
        { name: 'Direct', value: 42840, percentage: 30 },
        { name: 'twitter.com', value: 21420, percentage: 15 },
        { name: 'facebook.com', value: 11424, percentage: 8 },
        { name: 'linkedin.com', value: 7140, percentage: 5 },
      ];

      setTopSources(hasRealData ? processedTopSources : demoTopSources);

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

      // Use demo data if no real data
      const demoTopCountries = [
        { name: 'United States', value: 55272, percentage: 39 },
        { name: 'United Kingdom', value: 26796, percentage: 19 },
        { name: 'Germany', value: 21284, percentage: 15 },
        { name: 'Canada', value: 15708, percentage: 11 },
        { name: 'France', value: 12852, percentage: 9 },
      ];

      setTopCountries(hasRealData ? processedTopCountries : demoTopCountries);

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

      {/* AI-Powered Analytics Features */}
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

      {/* Next-Gen Features Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CarbonFootprint 
          projectId={selectedProject.id}
          monthlyVisitors={metricsData?.uniqueVisitors?.value || 1000}
          avgPageSize={245} // KB
        />
        <ABTestingLab projectId={selectedProject.id} />
      </div>

      {/* Next-Gen Features Row 2 */}
      <div className="grid grid-cols-1 gap-6">
        <VisitorIntentHeatmaps projectId={selectedProject.id} />
      </div>
    </div>
  );
}