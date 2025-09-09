import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MetricCard } from '@/components/analytics/MetricCard';
import { TopList } from '@/components/analytics/TopList';
import { supabase } from '@/integrations/supabase/client';
import { ExternalLink, Globe, Search, TrendingUp, Users } from 'lucide-react';
import { Loader2 } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface SourcesProps {
  selectedProject?: Project | null;
}

export function Sources({ selectedProject }: SourcesProps) {
  const [topSources, setTopSources] = useState<any[]>([]);
  const [searchEngines, setSearchEngines] = useState<any[]>([]);
  const [socialMedia, setSocialMedia] = useState<any[]>([]);
  const [directTraffic, setDirectTraffic] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedProject) {
      loadSourcesData();
    } else {
      setLoading(false);
    }
  }, [selectedProject]);

  const loadSourcesData = async () => {
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

      // Process referrer sources
      const referrerStats = (events || []).reduce((acc: Record<string, number>, event) => {
        const referrer = event.referrer || 'Direct';
        acc[referrer] = (acc[referrer] || 0) + 1;
        return acc;
      }, {});

      const totalTraffic = events?.length || 0;

      // Calculate metrics
      const directCount = referrerStats['Direct'] || 0;
      const organicCount = Object.entries(referrerStats)
        .filter(([ref]) => ref.includes('google') || ref.includes('bing') || ref.includes('duckduckgo'))
        .reduce((sum, [, count]) => sum + count, 0);
      
      const socialCount = Object.entries(referrerStats)
        .filter(([ref]) => ref.includes('facebook') || ref.includes('twitter') || ref.includes('linkedin'))
        .reduce((sum, [, count]) => sum + count, 0);

      const emailCount = Object.entries(referrerStats)
        .filter(([ref]) => ref.includes('email') || ref.includes('newsletter'))
        .reduce((sum, [, count]) => sum + count, 0);

      setMetrics({
        directTraffic: ((directCount / totalTraffic) * 100).toFixed(1),
        organicTraffic: ((organicCount / totalTraffic) * 100).toFixed(1),
        socialTraffic: ((socialCount / totalTraffic) * 100).toFixed(1),
        emailTraffic: ((emailCount / totalTraffic) * 100).toFixed(1),
      });

      // Process top sources
      const processedTopSources = Object.entries(referrerStats)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
        .map(([name, value]) => ({
          name: name === 'Direct' ? 'Direct' : (() => {
            try {
              return new URL(name).hostname || name;
            } catch {
              return name;
            }
          })(),
          value,
          percentage: Math.round((value / totalTraffic) * 100),
        }));

      // Use demo data if no real data
      const demoTopSources = [
        { name: 'google.com', value: 24650, percentage: 42 },
        { name: 'Direct', value: 17680, percentage: 30 },
        { name: 'twitter.com', value: 8840, percentage: 15 },
        { name: 'facebook.com', value: 4720, percentage: 8 },
        { name: 'linkedin.com', value: 2950, percentage: 5 },
      ];

      setTopSources(processedTopSources.length > 0 ? processedTopSources : demoTopSources);

      // Mock search engines data
      const searchEnginesData = [
        { name: 'Google', value: Math.round(organicCount * 0.85), percentage: 85 },
        { name: 'Bing', value: Math.round(organicCount * 0.10), percentage: 10 },
        { name: 'DuckDuckGo', value: Math.round(organicCount * 0.05), percentage: 5 },
      ];
      setSearchEngines(searchEnginesData);

      // Mock social media data
      const socialMediaData = [
        { name: 'Facebook', value: Math.round(socialCount * 0.60), percentage: 60 },
        { name: 'Twitter', value: Math.round(socialCount * 0.25), percentage: 25 },
        { name: 'LinkedIn', value: Math.round(socialCount * 0.15), percentage: 15 },
      ];
      setSocialMedia(socialMediaData);

      // Mock direct traffic sources
      const directTrafficData = [
        { name: 'Bookmarks', value: Math.round(directCount * 0.40), percentage: 40 },
        { name: 'Type-in URL', value: Math.round(directCount * 0.35), percentage: 35 },
        { name: 'Mobile App', value: Math.round(directCount * 0.25), percentage: 25 },
      ];
      setDirectTraffic(directTrafficData);

    } catch (error) {
      console.error('Error loading sources data:', error);
    }

    setLoading(false);
  };

  if (!selectedProject) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <ExternalLink className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground mb-2">No Project Selected</h3>
          <p className="text-sm text-muted-foreground">Select a project to view traffic sources</p>
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
          <ExternalLink className="w-8 h-8" />
          Traffic Sources
        </h1>
        <p className="text-muted-foreground">
          Understand where your visitors come from and optimize your acquisition channels
        </p>
      </div>

      {/* Traffic Source Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Direct Traffic"
          value={`${metrics.directTraffic}%`}
          change={{ value: 5, trend: 'up' }}
          description="Bookmarks & direct visits"
        />
        <MetricCard
          label="Organic Search"
          value={`${metrics.organicTraffic}%`}
          change={{ value: 12, trend: 'up' }}
          description="Search engine results"
        />
        <MetricCard
          label="Social Media"
          value={`${metrics.socialTraffic}%`}
          change={{ value: 8, trend: 'up' }}
          description="Social platforms"
        />
        <MetricCard
          label="Email Marketing"
          value={`${metrics.emailTraffic}%`}
          change={{ value: 15, trend: 'up' }}
          description="Newsletter & campaigns"
        />
      </div>

      {/* Traffic Sources Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* All Sources */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              All Traffic Sources
            </CardTitle>
            <CardDescription>Complete breakdown of visitor origins</CardDescription>
          </CardHeader>
          <CardContent>
            <TopList
              title=""
              items={topSources}
              type="sources"
            />
          </CardContent>
        </Card>

        {/* Search Engines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Search Engines
            </CardTitle>
            <CardDescription>Organic search traffic breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {searchEngines.map((engine, index) => (
                <div key={engine.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm">🔍</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {engine.name}
                      </p>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div
                          className="bg-primary h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${engine.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-card-foreground">
                      {engine.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{engine.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Social Media & Direct Traffic */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Social Media
            </CardTitle>
            <CardDescription>Social platform traffic breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {socialMedia.map((platform, index) => (
                <div key={platform.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm">📱</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {platform.name}
                      </p>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div
                          className="bg-secondary h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${platform.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-card-foreground">
                      {platform.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{platform.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Direct Traffic */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Direct Traffic
            </CardTitle>
            <CardDescription>Direct visitor sources</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {directTraffic.map((source, index) => (
                <div key={source.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-sm">🔗</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {source.name}
                      </p>
                      <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                        <div
                          className="bg-accent h-1.5 rounded-full transition-all duration-500"
                          style={{ width: `${source.percentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-card-foreground">
                      {source.value.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">{source.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Source Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic Source Insights</CardTitle>
          <CardDescription>Key findings and recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-primary/5 rounded-lg">
              <h4 className="font-medium mb-2">🎯 Top Performing Source</h4>
              <p className="text-sm text-muted-foreground mb-2">
                {topSources[0]?.name || 'Direct'} drives {topSources[0]?.percentage || 0}% of your traffic
              </p>
              <div className="text-xs text-muted-foreground">
                Focus on optimizing this channel for better ROI
              </div>
            </div>
            
            <div className="p-4 bg-secondary/5 rounded-lg">
              <h4 className="font-medium mb-2">📈 Growth Opportunity</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Social media traffic has grown by 25% this month
              </p>
              <div className="text-xs text-muted-foreground">
                Consider increasing social media engagement
              </div>
            </div>
            
            <div className="p-4 bg-accent/5 rounded-lg">
              <h4 className="font-medium mb-2">⚠️ Attention Needed</h4>
              <p className="text-sm text-muted-foreground mb-2">
                Email marketing conversion rate is below average
              </p>
              <div className="text-xs text-muted-foreground">
                Review email campaign content and targeting
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}