import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Radar, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Bot, 
  Clock,
  ExternalLink,
  ChevronRight,
  Activity
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface AnomalyRadarProps {
  selectedProject?: Project | null;
}

interface Anomaly {
  id: string;
  type: 'spike' | 'drop';
  metric: string;
  timestamp: string;
  value: number;
  baseline: number;
  change: number;
  source: string;
  confidence: number;
  status: 'active' | 'resolved' | 'investigating';
}

const generateTimelineData = () => {
  const now = new Date();
  const data = [];
  
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseline = 120 + Math.sin(i * 0.5) * 20;
    let value = baseline + (Math.random() - 0.5) * 30;
    
    // Create spike at hour 8
    if (i === 8) value = baseline * 2.1;
    // Create drop at hour 15
    if (i === 15) value = baseline * 0.4;
    
    data.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: time.toISOString(),
      visitors: Math.round(value),
      baseline: Math.round(baseline),
    });
  }
  
  return data;
};

export function AnomalyRadar({ selectedProject }: AnomalyRadarProps) {
  const [radarActive, setRadarActive] = useState(true);
  const [selectedAnomaly, setSelectedAnomaly] = useState<string | null>(null);
  const [timelineData] = useState(generateTimelineData);
  const [pulseIntensity, setPulseIntensity] = useState(1);

  const anomalies: Anomaly[] = [
    {
      id: '1',
      type: 'spike',
      metric: 'Visitors',
      timestamp: '2024-01-15T14:30:00Z',
      value: 285,
      baseline: 120,
      change: 137.5,
      source: 'Twitter Campaign',
      confidence: 94,
      status: 'active'
    },
    {
      id: '2',
      type: 'drop',
      metric: 'Page Views',
      timestamp: '2024-01-15T09:15:00Z',
      value: 45,
      baseline: 89,
      change: -49.4,
      source: 'Server Issue',
      confidence: 87,
      status: 'resolved'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setPulseIntensity(prev => prev === 1 ? 1.3 : 1);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  const RadarAnimation = () => (
    <div className="relative w-32 h-32">
      {/* Radar circles */}
      {[1, 2, 3].map((ring) => (
        <div
          key={ring}
          className="absolute border-2 border-primary/20 rounded-full animate-pulse"
          style={{
            width: `${ring * 33}%`,
            height: `${ring * 33}%`,
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            animationDelay: `${ring * 0.3}s`,
          }}
        />
      ))}
      
      {/* Center dot */}
      <div 
        className="absolute w-4 h-4 bg-primary rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
        style={{ 
          transform: `translate(-50%, -50%) scale(${pulseIntensity})`,
          boxShadow: radarActive ? '0 0 20px hsl(var(--primary))' : 'none'
        }}
      />
      
      {/* Sweeping line */}
      <div 
        className="absolute w-0.5 h-16 bg-gradient-to-t from-primary to-transparent top-1/2 left-1/2 origin-bottom animate-spin"
        style={{ animationDuration: '3s' }}
      />
      
      {/* Anomaly blips */}
      {anomalies.filter(a => a.status === 'active').map((anomaly, index) => (
        <div
          key={anomaly.id}
          className={`absolute w-2 h-2 rounded-full animate-pulse ${
            anomaly.type === 'spike' ? 'bg-success' : 'bg-danger'
          }`}
          style={{
            top: `${25 + index * 15}%`,
            right: `${30 + index * 10}%`,
            boxShadow: `0 0 10px ${anomaly.type === 'spike' ? 'hsl(var(--success))' : 'hsl(var(--danger))'}`,
          }}
        />
      ))}
    </div>
  );

  const getAnomalyIcon = (type: string) => {
    return type === 'spike' ? TrendingUp : TrendingDown;
  };

  const getAnomalyColor = (type: string) => {
    return type === 'spike' ? 'success' : 'danger';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
            <Radar className="w-8 h-8 text-primary" />
            Anomaly Radar
            <Badge variant="outline" className="text-primary border-primary/30 bg-primary/5">
              AI-Powered
            </Badge>
          </h1>
          <p className="text-muted-foreground">
            Real-time detection of traffic spikes, drops, and unusual patterns
          </p>
        </div>
        
        <Button
          variant={radarActive ? 'default' : 'outline'}
          onClick={() => setRadarActive(!radarActive)}
          className="flex items-center gap-2"
        >
          <Activity className="w-4 h-4" />
          {radarActive ? 'Active' : 'Paused'}
        </Button>
      </div>

      {/* Radar Display */}
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radar className="w-5 h-5" />
            Live Detection Radar
          </CardTitle>
          <CardDescription>Scanning for traffic anomalies in real-time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RadarAnimation />
          </div>
          
          <div className="text-center text-sm text-muted-foreground">
            {radarActive ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                Actively monitoring {selectedProject?.domain || 'your website'} • Last scan: just now
              </div>
            ) : (
              'Radar paused • Click to resume monitoring'
            )}
          </div>
        </CardContent>
      </Card>

      {/* Active Anomalies */}
      <div className="grid gap-4">
        {anomalies.map((anomaly) => {
          const Icon = getAnomalyIcon(anomaly.type);
          const color = getAnomalyColor(anomaly.type);
          const isSelected = selectedAnomaly === anomaly.id;
          
          return (
            <Alert 
              key={anomaly.id}
              className={`cursor-pointer transition-all duration-300 hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary/30' : ''
              } ${
                anomaly.status === 'active' 
                  ? `border-${color} bg-${color}/5 shadow-${color}/20` 
                  : 'opacity-60'
              }`}
              onClick={() => setSelectedAnomaly(isSelected ? null : anomaly.id)}
            >
              <div className="flex items-start gap-3 w-full">
                <Icon 
                  className={`w-5 h-5 mt-0.5 text-${color}`} 
                  style={{
                    filter: anomaly.status === 'active' ? `drop-shadow(0 0 4px hsl(var(--${color})))` : 'none'
                  }}
                />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">
                      {anomaly.metric} {anomaly.type === 'spike' ? 'Spike' : 'Drop'} Detected
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={anomaly.status === 'active' ? 'default' : 'secondary'}
                        className={anomaly.status === 'active' ? `bg-${color} text-${color}-foreground` : ''}
                      >
                        {anomaly.status}
                      </Badge>
                      <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />
                    </div>
                  </div>
                  
                  <AlertDescription>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Change</div>
                        <div className={`font-medium text-${color}`}>
                          {anomaly.change > 0 ? '+' : ''}{anomaly.change.toFixed(1)}%
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Value</div>
                        <div className="font-medium">{anomaly.value}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Confidence</div>
                        <div className="font-medium">{anomaly.confidence}%</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Time</div>
                        <div className="font-medium">{formatTimestamp(anomaly.timestamp)}</div>
                      </div>
                    </div>
                    
                    {/* AI Analysis */}
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/20">
                      <Bot className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-primary mb-1">AI Analysis</div>
                        <div className="text-sm">
                          {anomaly.type === 'spike' 
                            ? `Traffic surge likely caused by ${anomaly.source}. Monitor for sustained growth patterns.`
                            : `Traffic drop attributed to ${anomaly.source}. Investigate and implement recovery measures.`
                          }
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          );
        })}
      </div>

      {/* Timeline Chart */}
      {selectedAnomaly && (
        <Card className="analytics-card animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              24-Hour Timeline
            </CardTitle>
            <CardDescription>Traffic patterns with anomaly highlights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="time" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="baseline" 
                    stroke="hsl(var(--muted-foreground))" 
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    dot={false}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="visitors" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, fill: 'hsl(var(--primary))' }}
                  />
                  <ReferenceLine y={120} stroke="hsl(var(--success))" strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Manage and investigate anomalies</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Set Alert Rules
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Button variant="outline" size="sm">
              <Bot className="w-4 h-4 mr-2" />
              AI Insights
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}