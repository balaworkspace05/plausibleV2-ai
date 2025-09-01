import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ProjectSelector } from '@/components/projects/ProjectSelector';
import { RealTimeMetrics } from '@/components/analytics/RealTimeMetrics';
import { AnalyticsChart } from '@/components/analytics/AnalyticsChart';
import { TopList } from '@/components/analytics/TopList';
import { AnomalyRadar } from '@/components/features/AnomalyRadar';
import { IndustryBenchmarks } from '@/components/features/IndustryBenchmarks';
import { AIInsightsChat } from '@/components/features/AIInsightsChat';
import { TrackingScript } from '@/components/features/TrackingScript';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

export const Dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [topPages, setTopPages] = useState<any[]>([]);
  const [topSources, setTopSources] = useState<any[]>([]);
  const [topCountries, setTopCountries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedProject) {
      loadAnalyticsData();
    }
  }, [selectedProject]);

  const loadAnalyticsData = async () => {
    if (!selectedProject) return;

    try {
      // Load events for the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: events, error } = await supabase
        .from('events')
        .select('*')
        .eq('project_id', selectedProject.id)
        .gte('timestamp', thirtyDaysAgo.toISOString());

      if (error) throw error;

      // Process chart data (group by day)
      const dailyData = (events || []).reduce((acc: Record<string, any>, event) => {
        const date = new Date(event.timestamp).toLocaleDateString();
        if (!acc[date]) {
          acc[date] = { date, visitors: new Set(), pageviews: 0 };
        }
        acc[date].visitors.add(event.session_id);
        acc[date].pageviews++;
        return acc;
      }, {});

      const processedChartData = Object.values(dailyData).map((day: any) => ({
        date: day.date,
        visitors: day.visitors.size,
        pageviews: day.pageviews,
      }));

      setChartData(processedChartData.slice(-7)); // Last 7 days

      // Process top pages
      const pageStats = (events || []).reduce((acc: Record<string, number>, event) => {
        acc[event.url] = (acc[event.url] || 0) + 1;
        return acc;
      }, {});

      const processedTopPages = Object.entries(pageStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([url, value], index) => ({
          name: url.split('/').pop() || 'Home',
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
          name: name === 'Direct' ? 'Direct' : new URL(name).hostname || name,
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

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground">
              Privacy-first analytics with AI-powered insights
            </p>
          </div>
          <ProjectSelector 
            selectedProject={selectedProject}
            onProjectSelect={setSelectedProject}
          />
        </div>

        {selectedProject ? (
          <>
            {/* Real-time Metrics */}
            <RealTimeMetrics projectId={selectedProject.id} />

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnalyticsChart data={chartData} metric="visitors" />
              <AnalyticsChart data={chartData} metric="pageviews" />
            </div>

            {/* Top Lists */}
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

            {/* Unique Features */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnomalyRadar projectId={selectedProject.id} />
              <IndustryBenchmarks 
                projectId={selectedProject.id}
                currentMetrics={{
                  bounceRate: 45.2, // Will be calculated from real data
                  avgDuration: 150,
                  conversionRate: 2.8,
                }}
              />
            </div>

            {/* AI Chat & Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AIInsightsChat projectId={selectedProject.id} />
              <TrackingScript 
                projectId={selectedProject.id}
                domain={selectedProject.domain}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>Select a project to view analytics</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};