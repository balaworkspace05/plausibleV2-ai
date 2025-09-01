import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  MousePointer, 
  Scroll, 
  Eye, 
  Download,
  Users,
  ShoppingCart,
  BookOpen,
  DoorOpen,
  TrendingUp,
  MapPin
} from 'lucide-react';

interface VisitorIntentHeatmapsProps {
  projectId: string;
}

interface HeatmapData {
  x: number;
  y: number;
  intensity: number;
  clicks?: number;
}

interface IntentSegment {
  type: 'buyer' | 'reader' | 'bouncer';
  percentage: number;
  avgScrollDepth: number;
  topPages: string[];
  behavior: string;
}

export const VisitorIntentHeatmaps = ({ projectId }: VisitorIntentHeatmapsProps) => {
  const [activeTab, setActiveTab] = useState('click');
  const [showOverlay, setShowOverlay] = useState(false);

  // Mock heatmap data
  const clickHeatmap: HeatmapData[] = [
    { x: 45, y: 20, intensity: 0.9, clicks: 234 },
    { x: 60, y: 35, intensity: 0.7, clicks: 156 },
    { x: 30, y: 50, intensity: 0.8, clicks: 189 },
    { x: 70, y: 25, intensity: 0.6, clicks: 98 },
    { x: 50, y: 65, intensity: 0.5, clicks: 76 },
  ];

  const scrollHeatmap: HeatmapData[] = [
    { x: 50, y: 10, intensity: 1.0 },
    { x: 50, y: 25, intensity: 0.8 },
    { x: 50, y: 40, intensity: 0.6 },
    { x: 50, y: 55, intensity: 0.3 },
    { x: 50, y: 70, intensity: 0.1 },
  ];

  const intentSegments: IntentSegment[] = [
    {
      type: 'buyer',
      percentage: 25,
      avgScrollDepth: 78,
      topPages: ['/pricing', '/features', '/signup'],
      behavior: 'High engagement, multiple page visits, focuses on CTA buttons'
    },
    {
      type: 'reader',
      percentage: 60,
      avgScrollDepth: 65,
      topPages: ['/blog', '/docs', '/about'],
      behavior: 'Medium engagement, content consumption, longer session duration'
    },
    {
      type: 'bouncer',
      percentage: 15,
      avgScrollDepth: 25,
      topPages: ['/'],
      behavior: 'Quick exit, minimal interaction, short session duration'
    }
  ];

  const getIntentIcon = (type: string) => {
    switch (type) {
      case 'buyer': return ShoppingCart;
      case 'reader': return BookOpen;
      case 'bouncer': return DoorOpen;
      default: return Users;
    }
  };

  const getIntentColor = (type: string) => {
    switch (type) {
      case 'buyer': return 'text-success border-success/20 bg-success/5';
      case 'reader': return 'text-primary border-primary/20 bg-primary/5';
      case 'bouncer': return 'text-danger border-danger/20 bg-danger/5';
      default: return 'text-muted-foreground border-border bg-muted/5';
    }
  };

  const HeatmapVisualization = ({ data, type }: { data: HeatmapData[]; type: 'click' | 'scroll' }) => (
    <div className="relative w-full h-64 bg-gradient-to-b from-muted/20 to-muted/40 rounded-lg border overflow-hidden">
      {/* Mock webpage layout */}
      <div className="absolute inset-4 bg-card border rounded shadow-sm">
        {/* Header */}
        <div className="h-12 bg-primary/10 border-b flex items-center px-4">
          <div className="w-24 h-4 bg-primary/30 rounded" />
        </div>
        
        {/* Hero section */}
        <div className="h-20 bg-gradient-to-r from-primary/5 to-primary/10 flex items-center justify-center">
          <div className="w-32 h-6 bg-primary/40 rounded" />
        </div>
        
        {/* Content sections */}
        <div className="p-4 space-y-4">
          <div className="w-full h-3 bg-muted/60 rounded" />
          <div className="w-3/4 h-3 bg-muted/40 rounded" />
          <div className="w-1/2 h-8 bg-primary/20 rounded" />
        </div>
      </div>
      
      {/* Heatmap overlay */}
      {data.map((point, index) => (
        <div
          key={index}
          className="absolute pointer-events-none"
          style={{
            left: `${point.x}%`,
            top: `${point.y}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div
            className={`rounded-full ${
              type === 'click' 
                ? 'bg-danger' 
                : 'bg-primary'
            } animate-pulse`}
            style={{
              width: `${8 + point.intensity * 16}px`,
              height: `${8 + point.intensity * 16}px`,
              opacity: point.intensity * 0.7,
              boxShadow: `0 0 ${point.intensity * 20}px ${
                type === 'click' 
                  ? 'hsl(var(--danger))' 
                  : 'hsl(var(--primary))'
              }`,
            }}
          />
          
          {type === 'click' && point.clicks && (
            <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs font-bold text-danger">
              {point.clicks}
            </div>
          )}
        </div>
      ))}
      
      {/* Legend */}
      <div className="absolute bottom-2 right-2 bg-card/90 backdrop-blur-sm rounded border p-2">
        <div className="text-xs text-muted-foreground">
          {type === 'click' ? 'Click Intensity' : 'Scroll Depth'}
        </div>
        <div className="flex items-center gap-1 mt-1">
          <div className="w-2 h-2 bg-current opacity-30 rounded-full" />
          <span className="text-xs">Low</span>
          <div className="w-2 h-2 bg-current opacity-100 rounded-full ml-2" />
          <span className="text-xs">High</span>
        </div>
      </div>
    </div>
  );

  return (
    <Card className="analytics-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              Visitor Intent Analysis
              <Badge variant="secondary" className="ml-2">Beta</Badge>
            </CardTitle>
            <CardDescription>Understand how visitors interact with your site</CardDescription>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowOverlay(!showOverlay)}
          >
            <MapPin className="w-4 h-4 mr-2" />
            {showOverlay ? 'Hide' : 'Show'} Overlay
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {/* Heatmap Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="click" className="flex items-center gap-2">
                <MousePointer className="w-4 h-4" />
                Clicks
              </TabsTrigger>
              <TabsTrigger value="scroll" className="flex items-center gap-2">
                <Scroll className="w-4 h-4" />
                Scrolls
              </TabsTrigger>
              <TabsTrigger value="intent" className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                Intent
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="click" className="space-y-4">
              <HeatmapVisualization data={clickHeatmap} type="click" />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 rounded-lg bg-danger/5 border border-danger/20">
                  <div className="text-2xl font-bold text-danger">1,247</div>
                  <div className="text-sm text-muted-foreground">Total Clicks</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="text-2xl font-bold text-primary">89%</div>
                  <div className="text-sm text-muted-foreground">Above Fold</div>
                </div>
                <div className="text-center p-3 rounded-lg bg-success/5 border border-success/20">
                  <div className="text-2xl font-bold text-success">234</div>
                  <div className="text-sm text-muted-foreground">CTA Clicks</div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="scroll" className="space-y-4">
              <HeatmapVisualization data={scrollHeatmap} type="scroll" />
              
              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  <span className="font-medium text-primary">AI Insight</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  60% of users stop scrolling halfway down the page. Consider moving your primary CTA 
                  higher up to capture more conversions.
                </p>
              </div>
            </TabsContent>
            
            <TabsContent value="intent" className="space-y-4">
              <div className="grid gap-4">
                {intentSegments.map((segment, index) => {
                  const Icon = getIntentIcon(segment.type);
                  return (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${getIntentColor(segment.type)}`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-5 h-5" />
                          <h4 className="font-medium capitalize">
                            {segment.type === 'buyer' ? '🛒 Buyers' : 
                             segment.type === 'reader' ? '📖 Readers' : 
                             '🚪 Bouncers'}
                          </h4>
                        </div>
                        
                        <Badge variant="outline" className="border-current">
                          {segment.percentage}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3">
                        <div>
                          <div className="text-sm text-muted-foreground">Scroll Depth</div>
                          <div className="font-medium">{segment.avgScrollDepth}%</div>
                        </div>
                        <div>
                          <div className="text-sm text-muted-foreground">Top Pages</div>
                          <div className="font-medium text-xs">
                            {segment.topPages.slice(0, 2).join(', ')}
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-sm opacity-80">{segment.behavior}</p>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {/* Export Options */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Data from last 30 days • {clickHeatmap.length + scrollHeatmap.length} interaction points
            </div>
            
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export Heatmap
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};