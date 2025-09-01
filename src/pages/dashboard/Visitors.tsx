import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart';
import { MetricCard } from '@/components/analytics/MetricCard';
import { supabase } from '@/integrations/supabase/client';
import { Users, Globe, Monitor, Smartphone, Clock, TrendingUp } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface VisitorsProps {
  selectedProject: Project | null;
}

export function Visitors({ selectedProject }: VisitorsProps) {
  const [visitorsData, setVisitorsData] = useState<any[]>([]);
  const [deviceStats, setDeviceStats] = useState<any[]>([]);
  const [browserStats, setBrowserStats] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedProject) {
      loadVisitorsData();
    } else {
      setLoading(false);
    }
  }, [selectedProject]);

  const loadVisitorsData = async () => {
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

      // Process daily visitors data
      const dailyData = (events || []).reduce((acc: Record<string, any>, event) => {
        const date = new Date(event.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, visitors: new Set() };
        }
        acc[date].visitors.add(event.session_id);
        return acc;
      }, {});

      const processedData = Object.values(dailyData).map((day: any) => ({
        date: day.date,
        visitors: day.visitors.size,
        pageviews: 0, // Not needed for this chart
      }));

      setVisitorsData(processedData.slice(-30)); // Last 30 days

      // Calculate metrics
      const totalVisitors = new Set(events?.map(e => e.session_id) || []).size;
      const totalPageviews = events?.length || 0;
      const avgPageviews = totalVisitors > 0 ? (totalPageviews / totalVisitors).toFixed(1) : '0';

      // Calculate bounce rate (sessions with only 1 pageview)
      const sessionCounts = (events || []).reduce((acc: Record<string, number>, event) => {
        acc[event.session_id] = (acc[event.session_id] || 0) + 1;
        return acc;
      }, {});
      
      const bouncedSessions = Object.values(sessionCounts).filter(count => count === 1).length;
      const bounceRate = totalVisitors > 0 ? ((bouncedSessions / totalVisitors) * 100).toFixed(1) : '0';

      setMetrics({
        totalVisitors,
        avgPageviews,
        bounceRate,
        newVisitors: Math.round(totalVisitors * 0.73), // Mock calculation
      });

      // Process device stats
      const osStats = (events || []).reduce((acc: Record<string, number>, event) => {
        const os = event.os || 'Unknown';
        acc[os] = (acc[os] || 0) + 1;
        return acc;
      }, {});

      const deviceData = Object.entries(osStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({
          name,
          value,
          percentage: Math.round((value / (events?.length || 1)) * 100),
        }));

      setDeviceStats(deviceData);

      // Process browser stats  
      const browserStatsData = (events || []).reduce((acc: Record<string, number>, event) => {
        const browser = event.browser || 'Unknown';
        acc[browser] = (acc[browser] || 0) + 1;
        return acc;
      }, {});

      const browserData = Object.entries(browserStatsData)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([name, value]) => ({
          name,
          value,
          percentage: Math.round((value / (events?.length || 1)) * 100),
        }));

      setBrowserStats(browserData);

    } catch (error) {
      console.error('Error loading visitors data:', error);
    }

    setLoading(false);
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Project Selected</h3>
          <p className="text-sm text-muted-foreground">Select a project to view visitor analytics</p>
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
          <Users className="w-8 h-8" />
          Visitors
        </h1>
        <p className="text-muted-foreground">
          Detailed visitor analytics and behavior insights
        </p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Total Visitors"
          value={metrics.totalVisitors?.toLocaleString() || '0'}
          change={{ value: 12, trend: 'up' }}
          description="Last 30 days"
        />
        <MetricCard
          label="New Visitors"
          value={metrics.newVisitors?.toLocaleString() || '0'}
          change={{ value: 8, trend: 'up' }}
          description="First-time visitors"
        />
        <MetricCard
          label="Avg. Pages/Visit"
          value={metrics.avgPageviews || '0'}
          change={{ value: 5, trend: 'up' }}
          description="Pages per session"
        />
        <MetricCard
          label="Bounce Rate"
          value={`${metrics.bounceRate}%` || '0%'}
          change={{ value: 3, trend: 'down' }}
          description="Single page visits"
        />
      </div>

      {/* Visitors Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Visitors Over Time</CardTitle>
          <CardDescription>Daily unique visitors for the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <AnalyticsChart data={visitorsData} metric="visitors" />
          </div>
        </CardContent>
      </Card>

      {/* Device & Browser Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device/OS Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              Operating Systems
            </CardTitle>
            <CardDescription>Visitor breakdown by operating system</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {deviceStats.map((device, index) => (
                <div key={device.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-primary" style={{
                      backgroundColor: `hsl(var(--primary) / ${1 - index * 0.2})`
                    }}></div>
                    <span className="font-medium">{device.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{device.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{device.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Browser Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Browsers
            </CardTitle>
            <CardDescription>Visitor breakdown by browser type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {browserStats.map((browser, index) => (
                <div key={browser.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded bg-secondary" style={{
                      backgroundColor: `hsl(var(--secondary) / ${1 - index * 0.2})`
                    }}></div>
                    <span className="font-medium">{browser.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{browser.value.toLocaleString()}</div>
                    <div className="text-xs text-muted-foreground">{browser.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitor Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Visitor Insights
          </CardTitle>
          <CardDescription>Key patterns and behaviors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">2m 34s</div>
              <div className="text-sm text-muted-foreground">Avg. Visit Duration</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Smartphone className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">68%</div>
              <div className="text-sm text-muted-foreground">Mobile Visitors</div>
            </div>
            <div className="text-center p-4 bg-muted/50 rounded-lg">
              <Globe className="w-8 h-8 text-primary mx-auto mb-2" />
              <div className="text-2xl font-bold">42</div>
              <div className="text-sm text-muted-foreground">Countries</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}