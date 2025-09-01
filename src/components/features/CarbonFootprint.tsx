import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Leaf, Globe, Zap, TrendingDown, Lightbulb, ExternalLink } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface CarbonFootprintProps {
  projectId: string;
  monthlyVisitors: number;
  avgPageSize: number; // in KB
}

interface CarbonMetrics {
  co2PerVisit: number; // grams
  monthlyCo2: number; // kg
  treesNeeded: number;
  efficiency: 'excellent' | 'good' | 'average' | 'poor';
  suggestions: string[];
}

export const CarbonFootprint = ({ projectId, monthlyVisitors, avgPageSize }: CarbonFootprintProps) => {
  const [metrics, setMetrics] = useState<CarbonMetrics | null>(null);
  const [treeGrowth, setTreeGrowth] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    calculateCarbonMetrics();
  }, [monthlyVisitors, avgPageSize]);

  useEffect(() => {
    // Animate tree growth based on efficiency
    const targetGrowth = getTreeGrowthPercentage();
    const interval = setInterval(() => {
      setTreeGrowth(prev => {
        if (prev < targetGrowth) {
          return prev + 2;
        }
        clearInterval(interval);
        return targetGrowth;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [metrics]);

  const calculateCarbonMetrics = () => {
    // Carbon calculations based on real-world data
    // Average energy per GB: ~1.5 kWh
    // Average carbon per kWh: ~0.5 kg CO2
    
    const bytesPerVisit = avgPageSize * 1024; // Convert KB to bytes
    const gbPerVisit = bytesPerVisit / (1024 * 1024 * 1024);
    const co2PerVisit = gbPerVisit * 1.5 * 0.5 * 1000; // grams CO2
    const monthlyCo2 = (co2PerVisit * monthlyVisitors) / 1000; // kg CO2
    const treesNeeded = monthlyCo2 / 20; // ~20kg CO2 per tree per year

    let efficiency: 'excellent' | 'good' | 'average' | 'poor';
    let suggestions: string[] = [];

    if (co2PerVisit < 1) {
      efficiency = 'excellent';
      suggestions = [
        'Amazing! Your site is carbon-efficient',
        'Consider becoming carbon negative with offsets'
      ];
    } else if (co2PerVisit < 2) {
      efficiency = 'good';
      suggestions = [
        'Optimize images with next-gen formats (WebP, AVIF)',
        'Enable gzip/brotli compression',
        'Use a green hosting provider'
      ];
    } else if (co2PerVisit < 4) {
      efficiency = 'average';
      suggestions = [
        'Compress images to cut CO₂ by 15%',
        'Minify CSS/JS files',
        'Implement lazy loading for images',
        'Use CDN for faster delivery'
      ];
    } else {
      efficiency = 'poor';
      suggestions = [
        'Critical: Optimize large images immediately',
        'Remove unused CSS/JS code',
        'Enable browser caching',
        'Consider AMP for mobile pages'
      ];
    }

    setMetrics({
      co2PerVisit,
      monthlyCo2,
      treesNeeded,
      efficiency,
      suggestions
    });
  };

  const getTreeGrowthPercentage = () => {
    if (!metrics) return 0;
    
    switch (metrics.efficiency) {
      case 'excellent': return 100;
      case 'good': return 75;
      case 'average': return 50;
      case 'poor': return 25;
      default: return 0;
    }
  };

  const getEfficiencyColor = () => {
    if (!metrics) return 'text-muted-foreground';
    
    switch (metrics.efficiency) {
      case 'excellent': return 'text-success';
      case 'good': return 'text-primary';
      case 'average': return 'text-warning';
      case 'poor': return 'text-danger';
    }
  };

  const getTreeColor = () => {
    if (!metrics) return '#6b7280';
    
    switch (metrics.efficiency) {
      case 'excellent': return '#22c55e';
      case 'good': return '#3b82f6';
      case 'average': return '#f59e0b';
      case 'poor': return '#8b5cf6';
    }
  };

  const TreeIcon = ({ size = 64 }: { size?: number }) => (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 64 64" 
      className="transition-all duration-1000 ease-out"
      style={{ 
        filter: `hue-rotate(${treeGrowth * 1.2}deg) brightness(${1 + treeGrowth * 0.01})`,
        transform: `scale(${0.8 + (treeGrowth * 0.004)})`
      }}
    >
      {/* Tree trunk */}
      <rect 
        x="28" 
        y="45" 
        width="8" 
        height="15" 
        fill="#8b4513"
        rx="2"
      />
      
      {/* Tree foliage - grows with efficiency */}
      <circle 
        cx="32" 
        cy="35" 
        r={12 + (treeGrowth * 0.08)} 
        fill={getTreeColor()}
        opacity={0.3 + (treeGrowth * 0.007)}
      />
      <circle 
        cx="32" 
        cy="30" 
        r={10 + (treeGrowth * 0.06)} 
        fill={getTreeColor()}
        opacity={0.5 + (treeGrowth * 0.005)}
      />
      <circle 
        cx="32" 
        cy="25" 
        r={8 + (treeGrowth * 0.04)} 
        fill={getTreeColor()}
      />
      
      {/* Leaves that appear with growth */}
      {treeGrowth > 50 && (
        <>
          <circle cx="25" cy="28" r="3" fill={getTreeColor()} opacity="0.7" />
          <circle cx="39" cy="32" r="2.5" fill={getTreeColor()} opacity="0.6" />
          <circle cx="32" cy="18" r="2" fill={getTreeColor()} opacity="0.8" />
        </>
      )}
      
      {/* Sparkles for excellent efficiency */}
      {metrics?.efficiency === 'excellent' && treeGrowth > 80 && (
        <>
          <circle cx="20" cy="20" r="1" fill="#fbbf24" opacity="0.8">
            <animate attributeName="opacity" values="0;1;0" dur="2s" repeatCount="indefinite" />
          </circle>
          <circle cx="45" cy="25" r="0.5" fill="#fbbf24" opacity="0.6">
            <animate attributeName="opacity" values="0;1;0" dur="1.5s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );

  if (!metrics) {
    return (
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Leaf className="w-5 h-5" />
            Carbon Impact
          </CardTitle>
          <CardDescription>Environmental analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-pulse text-muted-foreground">Calculating carbon footprint...</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="analytics-card relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-success" />
              Carbon Impact
              <Badge 
                variant="outline" 
                className={`ml-2 ${getEfficiencyColor()} border-current`}
              >
                {metrics.efficiency}
              </Badge>
            </CardTitle>
            <CardDescription>Environmental impact of your website</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <TreeIcon size={48} />
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-card-foreground">
                {metrics.co2PerVisit.toFixed(2)}g
              </div>
              <div className="text-sm text-muted-foreground">CO₂ per visit</div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-muted/30">
              <div className="text-2xl font-bold text-card-foreground">
                {metrics.monthlyCo2.toFixed(1)}kg
              </div>
              <div className="text-sm text-muted-foreground">Monthly CO₂</div>
            </div>
          </div>

          {/* Efficiency Progress */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Carbon Efficiency</span>
              <span className={`text-sm font-medium ${getEfficiencyColor()}`}>
                {treeGrowth}% optimized
              </span>
            </div>
            <Progress value={treeGrowth} className="h-3" />
            <p className="text-xs text-muted-foreground">
              Your tree grows with better efficiency! 🌱
            </p>
          </div>

          {/* Tree Offset */}
          <div className="p-3 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-center gap-2 mb-1">
              <Globe className="w-4 h-4 text-success" />
              <span className="text-sm font-medium text-success">Tree Offset Goal</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Plant {Math.ceil(metrics.treesNeeded)} tree{metrics.treesNeeded > 1 ? 's' : ''} to offset your annual carbon footprint
            </p>
          </div>

          {/* AI Suggestions */}
          {!showDetails ? (
            <Button
              variant="outline"
              onClick={() => setShowDetails(true)}
              className="w-full"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              View Optimization Tips
            </Button>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">AI Optimization Suggestions</span>
              </div>
              
              <div className="space-y-2">
                {metrics.suggestions.map((suggestion, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20"
                  >
                    <TrendingDown className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm text-card-foreground">{suggestion}</span>
                  </div>
                ))}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://www.websitecarbon.com/', '_blank')}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Learn More About Web Sustainability
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};