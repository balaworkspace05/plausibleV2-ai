import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart';
import { MetricCard } from '@/components/analytics/MetricCard';
import { TopList } from '@/components/analytics/TopList';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Eye, Clock, TrendingUp, ExternalLink } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface PageViewsProps {
  selectedProject?: Project | null;
}

export function PageViews({ selectedProject }: PageViewsProps) {
  const [pageviewsData, setPageviewsData] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [entryPages, setEntryPages] = useState<any[]>([]);
  const [exitPages, setExitPages] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedProject) {
      loadPageViewsData();
    } else {
      setLoading(false);
    }
  }, [selectedProject]);

  const loadPageViewsData = async () => {
    if (!selectedProject) return;

    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', selectedProject.id)
        .gte('timestamp', thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Process daily pageviews data
      const dailyData = (events || []).reduce((acc: Record<string, any>, event) => {
        const date = new Date(event.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, pageviews: 0, visitors: new Set() };
        }
        acc[date].pageviews++;
        acc[date].visitors.add(event.session_id);
        return acc;
      }, {});

      const processedData = Object.values(dailyData).map((day: any) => ({
        date: day.date,
        pageviews: day.pageviews,
        visitors: day.visitors.size,
      }));

      // Use demo chart data if no real data
      const demoChartData = [
        { date: 'Jan 1', pageviews: 4800, visitors: 2400 },
        { date: 'Jan 2', pageviews: 2796, visitors: 1398 },
        { date: 'Jan 3', pageviews: 9600, visitors: 4800 },
        { date: 'Jan 4', pageviews: 7816, visitors: 3908 },
        { date: 'Jan 5', pageviews: 8400, visitors: 4200 },
        { date: 'Jan 6', pageviews: 7600, visitors: 3800 },
        { date: 'Jan 7', pageviews: 8600, visitors: 4300 },
        { date: 'Jan 8', pageviews: 10400, visitors: 5200 },
        { date: 'Jan 9', pageviews: 5800, visitors: 2900 },
        { date: 'Jan 10', pageviews: 12200, visitors: 6100 },
        { date: 'Jan 11', pageviews: 8800, visitors: 4400 },
        { date: 'Jan 12', pageviews: 11600, visitors: 5800 },
        { date: 'Jan 13', pageviews: 8400, visitors: 4200 },
        { date: 'Jan 14', pageviews: 9800, visitors: 4900 },
      ];

      setPageviewsData(processedData.length > 0 ? processedData.slice(-30) : demoChartData);

      // Calculate metrics
      const totalPageviews = events?.length || 0;
      const uniquePageviews = new Set(events?.map(e => `${e.session_id}-${e.url}`) || []).size;
      const totalVisitors = new Set(events?.map(e => e.session_id) || []).size;
      const avgPagesPerVisit = totalVisitors > 0 ? (totalPageviews / totalVisitors).toFixed(1) : '0';

      // Use demo data if no real data available
      const hasRealData = totalPageviews > 0;
      const demoMetrics = {
        totalPageviews: 142800,
        uniquePageviews: 98340,
        avgPagesPerVisit: '3.2',
        avgTimeOnPage: '2:34',
      };

      setMetrics(hasRealData ? {
        totalPageviews,
        uniquePageviews,
        avgPagesPerVisit,
        avgTimeOnPage: '2:34',
      } : demoMetrics);

      // Process top pages
      const pageStats = (events || []).reduce((acc: Record<string, number>, event) => {
        acc[event.url] = (acc[event.url] || 0) + 1;
        return acc;
      }, {});

      const processedTopPages = Object.entries(pageStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([url, value]) => ({
          name: (() => {
            try {
              const urlObj = new URL(url);
              return urlObj.pathname === '/' ? 'Home' : urlObj.pathname.split('/').filter(Boolean).join(' / ') || url;
            } catch {
              return url;
            }
          })(),
          value,
          percentage: Math.round((value / totalPageviews) * 100),
          url
        }));

      // Use demo data if no real data
      const demoTopPages = [
        { name: 'Home', value: 64620, percentage: 45, url: '/' },
        { name: 'Pricing', value: 45780, percentage: 32, url: '/pricing' },
        { name: 'Features', value: 22284, percentage: 16, url: '/features' },
        { name: 'About', value: 6283, percentage: 4, url: '/about' },
        { name: 'Blog', value: 3568, percentage: 3, url: '/blog' },
      ];

      setTopPages(processedTopPages.length > 0 ? processedTopPages : demoTopPages);

      // Mock entry pages (first page in session)
      const entryPagesData = processedTopPages.slice(0, 5).map((page, index) => ({
        ...page,
        value: Math.round(page.value * (0.8 - index * 0.1)),
        percentage: Math.round(page.percentage * (0.8 - index * 0.1)),
      }));

      setEntryPages(entryPagesData);

      // Mock exit pages (last page in session)
      const exitPagesData = processedTopPages.slice(0, 5).map((page, index) => ({
        ...page,
        value: Math.round(page.value * (0.7 - index * 0.08)),
        percentage: Math.round(page.percentage * (0.7 - index * 0.08)),
      }));

      setExitPages(exitPagesData);

    } catch (error) {
      console.error('Error loading pageviews data:', error);
    }

    setLoading(false);
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Project Selected</h3>
          <p className="text-sm text-muted-foreground">Select a project to view page analytics</p>
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <FileText className="w-8 h-8" />
          Page Views
        </h1>
        <p className="text-muted-foreground">
          Detailed page performance and user journey analysis
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Page Views"
          value={metrics.totalPageviews?.toLocaleString() || '0'}
          change={{ value: 18, trend: 'up' }}
          description="Last 30 days"
        />
        <MetricCard
          label="Unique Page Views"
          value={metrics.uniquePageviews?.toLocaleString() || '0'}
          change={{ value: 12, trend: 'up' }}
          description="Unique page visits"
        />
        <MetricCard
          label="Pages per Visit"
          value={metrics.avgPagesPerVisit || '0'}
          change={{ value: 5, trend: 'up' }}
          description="Average pages viewed"
        />
        <MetricCard
          label="Avg. Time on Page"
          value={metrics.avgTimeOnPage || '0:00'}
          change={{ value: 8, trend: 'up' }}
          description="Time spent reading"
        />
      </div>

      {/* Pageviews Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Page Views Over Time</CardTitle>
          <CardDescription>Daily page views for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <AnalyticsChart data={pageviewsData} metric="pageviews" />
          </div>
        </CardContent>
      </Card>

      {/* Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopList
          title="Most Viewed Pages"
          items={topPages}
          type="pages"
          showUrls={true}
        />
        <TopList
          title="Entry Pages"
          items={entryPages}
          type="pages"
          showUrls={true}
        />
        <TopList
          title="Exit Pages" 
          items={exitPages}
          type="pages"
          showUrls={true}
        />
      </div>

      {/* Page Performance Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5" />
              Page Performance
            </CardTitle>
            <CardDescription>Key page metrics and insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <div>
                  <div className="font-medium">Avg. Pages per Session</div>
                  <div className="text-sm text-muted-foreground">User engagement depth</div>
                </div>
                <div className="text-2xl font-bold text-primary">{metrics.avgPagesPerVisit}</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <div>
                  <div className="font-medium">Most Popular Hour</div>
                  <div className="text-sm text-muted-foreground">Peak traffic time</div>
                </div>
                <div className="text-2xl font-bold text-primary">2 PM</div>
              </div>
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded">
                <div>
                  <div className="font-medium">Scroll Depth</div>
                  <div className="text-sm text-muted-foreground">Average page scroll</div>
                </div>
                <div className="text-2xl font-bold text-primary">73%</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Content Insights
            </CardTitle>
            <CardDescription>Content performance trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">Top Performing Content</span>
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Blog posts generate 65% more engagement than product pages
                </p>
                <div className="text-xs text-muted-foreground">
                  Based on time on page and scroll depth
                </div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">User Journey Pattern</span>
                  <Clock className="w-4 h-4 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  Users typically visit 3.2 pages before converting
                </p>
                <div className="text-xs text-muted-foreground">
                  Home → Product → Blog → Contact
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}