import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TrendingUp, Award, Target } from 'lucide-react';

interface Benchmark {
  industry: string;
  avg_conversion: number;
  avg_bounce: number;
  avg_session_duration: number;
}

interface IndustryBenchmarksProps {
  projectId: string;
  currentMetrics: {
    bounceRate: number;
    avgDuration: number;
    conversionRate?: number;
  };
}

export function IndustryBenchmarks({ projectId, currentMetrics }: IndustryBenchmarksProps) {
  const [benchmarks, setBenchmarks] = useState<Benchmark[]>([]);
  const [selectedIndustry, setSelectedIndustry] = useState<string>('SaaS');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBenchmarks();
  }, []);

  const loadBenchmarks = async () => {
    const { data, error } = await supabase
      .from('industry_benchmarks')
      .select('*')
      .order('industry');

    if (error) {
      console.error('Error loading benchmarks:', error);
    } else {
      setBenchmarks(data || []);
    }
    setLoading(false);
  };

  const getPerformanceLevel = (current: number, benchmark: number, isInverse = false) => {
    const ratio = isInverse ? benchmark / current : current / benchmark;
    if (ratio >= 1.2) return { level: 'excellent', color: 'bg-green-500', percentile: '90th' };
    if (ratio >= 1.1) return { level: 'good', color: 'bg-blue-500', percentile: '75th' };
    if (ratio >= 0.9) return { level: 'average', color: 'bg-yellow-500', percentile: '50th' };
    if (ratio >= 0.8) return { level: 'below average', color: 'bg-orange-500', percentile: '25th' };
    return { level: 'poor', color: 'bg-red-500', percentile: '10th' };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Industry Benchmarks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-muted rounded w-48"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-16 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedBenchmark = benchmarks.find(b => b.industry === selectedIndustry) || benchmarks[0];
  
  if (!selectedBenchmark) {
    return null;
  }

  const bouncePerf = getPerformanceLevel(currentMetrics.bounceRate, selectedBenchmark.avg_bounce, true);
  const durationPerf = getPerformanceLevel(currentMetrics.avgDuration, selectedBenchmark.avg_session_duration);
  const conversionPerf = currentMetrics.conversionRate 
    ? getPerformanceLevel(currentMetrics.conversionRate, selectedBenchmark.avg_conversion)
    : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Industry Benchmarks
        </CardTitle>
        <CardDescription>
          Compare your performance with industry standards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Industry Selector */}
        <div className="flex flex-wrap gap-2">
          {benchmarks.map((benchmark) => (
            <Badge
              key={benchmark.industry}
              variant={selectedIndustry === benchmark.industry ? "default" : "outline"}
              className="cursor-pointer hover:bg-primary/20"
              onClick={() => setSelectedIndustry(benchmark.industry)}
            >
              {benchmark.industry}
            </Badge>
          ))}
        </div>

        {/* Benchmark Comparisons */}
        <div className="space-y-4">
          {/* Bounce Rate */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Bounce Rate</span>
              <Badge variant={bouncePerf.level === 'excellent' ? 'default' : 'secondary'}>
                {bouncePerf.percentile} percentile
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Your: {currentMetrics.bounceRate.toFixed(1)}%</span>
                  <span>Industry: {selectedBenchmark.avg_bounce.toFixed(1)}%</span>
                </div>
                <Progress 
                  value={Math.min(currentMetrics.bounceRate, 100)} 
                  className="h-2"
                />
              </div>
              <div className={`w-2 h-2 rounded-full ${bouncePerf.color}`}></div>
            </div>
          </div>

          {/* Session Duration */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Avg. Session Duration</span>
              <Badge variant={durationPerf.level === 'excellent' ? 'default' : 'secondary'}>
                {durationPerf.percentile} percentile
              </Badge>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <div className="flex justify-between text-xs text-muted-foreground mb-1">
                  <span>Your: {currentMetrics.avgDuration}s</span>
                  <span>Industry: {selectedBenchmark.avg_session_duration}s</span>
                </div>
                <Progress 
                  value={(currentMetrics.avgDuration / selectedBenchmark.avg_session_duration) * 50} 
                  className="h-2"
                />
              </div>
              <div className={`w-2 h-2 rounded-full ${durationPerf.color}`}></div>
            </div>
          </div>

          {/* Conversion Rate (if available) */}
          {conversionPerf && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Conversion Rate</span>
                <Badge variant={conversionPerf.level === 'excellent' ? 'default' : 'secondary'}>
                  {conversionPerf.percentile} percentile
                </Badge>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-muted-foreground mb-1">
                    <span>Your: {currentMetrics.conversionRate?.toFixed(1)}%</span>
                    <span>Industry: {selectedBenchmark.avg_conversion.toFixed(1)}%</span>
                  </div>
                  <Progress 
                    value={(currentMetrics.conversionRate! / selectedBenchmark.avg_conversion) * 50} 
                    className="h-2"
                  />
                </div>
                <div className={`w-2 h-2 rounded-full ${conversionPerf.color}`}></div>
              </div>
            </div>
          )}
        </div>

        {/* Performance Summary */}
        <div className="border-t pt-4">
          <div className="flex items-start gap-3">
            <Award className="w-5 h-5 text-primary mt-0.5" />
            <div>
              <p className="text-sm font-medium">Performance Summary</p>
              <p className="text-xs text-muted-foreground mt-1">
                {bouncePerf.level === 'excellent' && durationPerf.level === 'excellent'
                  ? "🎉 Excellent performance across all metrics!"
                  : bouncePerf.level === 'poor' || durationPerf.level === 'poor'
                  ? "⚠️ Some metrics need attention. Focus on user experience improvements."
                  : "👍 Good performance with room for optimization."
                }
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}