import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Target, Crown, TrendingUp, Award, ArrowUp, ArrowDown, Lightbulb } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface BenchmarksProps {
  selectedProject?: Project | null;
}

interface BenchmarkData {
  metric: string;
  yourValue: number;
  industryMedian: number;
  top10Percent: number;
  unit: string;
  isHigherBetter: boolean;
}

export function Benchmarks({ selectedProject }: BenchmarksProps) {
  const [selectedIndustry, setSelectedIndustry] = useState('saas');
  const [hoveredMetric, setHoveredMetric] = useState<string | null>(null);

  const industries = [
    { value: 'saas', label: 'SaaS' },
    { value: 'ecommerce', label: 'E-commerce' },
    { value: 'blogs', label: 'Blogs & Content' },
    { value: 'fintech', label: 'FinTech' },
  ];

  const benchmarkData: BenchmarkData[] = [
    {
      metric: 'Conversion Rate',
      yourValue: 3.2,
      industryMedian: 2.4,
      top10Percent: 5.8,
      unit: '%',
      isHigherBetter: true
    },
    {
      metric: 'Bounce Rate',
      yourValue: 42,
      industryMedian: 54,
      top10Percent: 28,
      unit: '%',
      isHigherBetter: false
    },
    {
      metric: 'Page Load Speed',
      yourValue: 2.1,
      industryMedian: 3.2,
      top10Percent: 1.4,
      unit: 's',
      isHigherBetter: false
    },
    {
      metric: 'Session Duration',
      yourValue: 4.2,
      industryMedian: 3.1,
      top10Percent: 6.8,
      unit: 'min',
      isHigherBetter: true
    }
  ];

  const calculatePercentile = (value: number, median: number, top10: number, isHigherBetter: boolean) => {
    if (isHigherBetter) {
      if (value >= top10) return 90;
      if (value >= median) return 50 + ((value - median) / (top10 - median)) * 40;
      return 10 + ((value / median) * 40);
    } else {
      if (value <= top10) return 90;
      if (value <= median) return 50 + ((median - value) / (median - top10)) * 40;
      return 10 * (1 - ((value - median) / median));
    }
  };

  const getPerformanceLevel = (percentile: number) => {
    if (percentile >= 90) return { level: 'Excellent', color: 'text-success', bgColor: 'bg-success/10' };
    if (percentile >= 75) return { level: 'Very Good', color: 'text-primary', bgColor: 'bg-primary/10' };
    if (percentile >= 50) return { level: 'Good', color: 'text-warning', bgColor: 'bg-warning/10' };
    if (percentile >= 25) return { level: 'Below Average', color: 'text-muted-foreground', bgColor: 'bg-muted/20' };
    return { level: 'Poor', color: 'text-danger', bgColor: 'bg-danger/10' };
  };

  const getTip = (metric: string, yourValue: number, top10: number, isHigherBetter: boolean) => {
    const tips: Record<string, string> = {
      'Conversion Rate': 'Optimize your checkout flow and add social proof to increase conversions',
      'Bounce Rate': 'Improve page loading speed and content relevance to reduce bounces',
      'Page Load Speed': 'Compress images and enable CDN to reach top 10% performance',
      'Session Duration': 'Add interactive content and internal links to increase engagement'
    };
    return tips[metric] || 'Keep optimizing to reach the next level';
  };

  const overallPercentile = Math.round(benchmarkData.reduce((acc, item) => {
    return acc + calculatePercentile(item.yourValue, item.industryMedian, item.top10Percent, item.isHigherBetter);
  }, 0) / benchmarkData.length);

  const overallPerformance = getPerformanceLevel(overallPercentile);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-primary" />
            Industry Benchmarks
          </h1>
          <p className="text-muted-foreground">
            Compare your performance against industry standards
          </p>
        </div>
        
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            {industries.map((industry) => (
              <SelectItem key={industry.value} value={industry.value}>
                {industry.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Overall Performance Card */}
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-5 h-5 text-primary" />
            Your Industry Rank
          </CardTitle>
          <CardDescription>Overall performance compared to {selectedIndustry.toUpperCase()} industry</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className={`p-3 rounded-lg ${overallPerformance.bgColor}`}>
              <Award className={`w-8 h-8 ${overallPerformance.color}`} />
            </div>
            <div>
              <div className="text-2xl font-bold text-card-foreground">
                Top {100 - overallPercentile}%
              </div>
              <div className={`text-sm font-medium ${overallPerformance.color}`}>
                {overallPerformance.level} Performance
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Industry Ranking</span>
              <span className={overallPerformance.color}>{overallPercentile}th percentile</span>
            </div>
            <Progress value={overallPercentile} className="h-3" />
            <p className="text-xs text-muted-foreground">
              You're performing better than {overallPercentile}% of {selectedIndustry.toUpperCase()} websites
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Individual Metrics */}
      <div className="grid gap-6">
        {benchmarkData.map((item, index) => {
          const percentile = calculatePercentile(
            item.yourValue, 
            item.industryMedian, 
            item.top10Percent, 
            item.isHigherBetter
          );
          const performance = getPerformanceLevel(percentile);
          const isHovered = hoveredMetric === item.metric;
          
          return (
            <Card 
              key={item.metric}
              className={`analytics-card transition-all duration-300 hover:shadow-lg ${
                isHovered ? 'ring-2 ring-primary/20' : ''
              }`}
              onMouseEnter={() => setHoveredMetric(item.metric)}
              onMouseLeave={() => setHoveredMetric(null)}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{item.metric}</CardTitle>
                  <Badge variant="outline" className={`${performance.color} border-current`}>
                    {performance.level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Your Performance */}
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-2">
                      <div className="text-2xl font-bold text-primary">
                        {item.yourValue}{item.unit}
                      </div>
                      {item.yourValue > item.industryMedian === item.isHigherBetter ? (
                        <ArrowUp className="w-5 h-5 text-success" />
                      ) : (
                        <ArrowDown className="w-5 h-5 text-danger" />
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">Your Performance</div>
                  </div>

                  {/* Industry Median */}
                  <div className="text-center">
                    <div className="text-xl font-semibold text-muted-foreground mb-2">
                      {item.industryMedian}{item.unit}
                    </div>
                    <div className="text-sm text-muted-foreground">Industry Median</div>
                  </div>

                  {/* Top 10% */}
                  <div className="text-center">
                    <div className="text-xl font-semibold text-success mb-2">
                      {item.top10Percent}{item.unit}
                    </div>
                    <div className="text-sm text-muted-foreground">Top 10%</div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Percentile Ranking</span>
                    <span className={performance.color}>{Math.round(percentile)}th percentile</span>
                  </div>
                  <Progress value={percentile} className="h-3" />
                </div>

                {/* Hover Tip */}
                {isHovered && (
                  <div className="mt-4 p-3 rounded-lg bg-primary/5 border border-primary/20 animate-fade-in">
                    <div className="flex items-start gap-2">
                      <Lightbulb className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-primary mb-1">Optimization Tip</div>
                        <div className="text-sm text-card-foreground">
                          {getTip(item.metric, item.yourValue, item.top10Percent, item.isHigherBetter)}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Next Goals */}
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-success" />
            Next Performance Goals
          </CardTitle>
          <CardDescription>Focus areas to reach the next percentile</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3">
            {benchmarkData
              .filter(item => calculatePercentile(item.yourValue, item.industryMedian, item.top10Percent, item.isHigherBetter) < 90)
              .slice(0, 2)
              .map((item, index) => (
                <div key={item.metric} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                  <div className={`w-2 h-2 rounded-full ${index === 0 ? 'bg-primary' : 'bg-secondary'}`} />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.metric}</div>
                    <div className="text-xs text-muted-foreground">
                      Improve by {Math.abs(item.isHigherBetter ? item.top10Percent - item.yourValue : item.yourValue - item.top10Percent).toFixed(1)}{item.unit} to reach top 10%
                    </div>
                  </div>
                </div>
              ))
            }
          </div>
        </CardContent>
      </Card>
    </div>
  );
}