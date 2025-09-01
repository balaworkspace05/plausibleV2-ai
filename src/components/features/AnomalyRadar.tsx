import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, TrendingUp, TrendingDown, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Anomaly {
  id: string;
  metric_type: string;
  expected_value: number;
  actual_value: number;
  severity: string;
  detected_at: string;
  is_resolved: boolean;
}

interface AnomalyRadarProps {
  projectId: string;
}

export function AnomalyRadar({ projectId }: AnomalyRadarProps) {
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!projectId) return;

    loadAnomalies();

    // Set up real-time subscription for new anomalies
    const channel = supabase
      .channel('anomaly-updates')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'anomalies',
          filter: `project_id=eq.${projectId}`
        },
        (payload) => {
          const newAnomaly = payload.new as Anomaly;
          setAnomalies(prev => [newAnomaly, ...prev]);
          
          // Show toast notification for new anomalies
          toast({
            title: "🚨 Anomaly Detected",
            description: getAnomalyDescription(newAnomaly),
            variant: newAnomaly.severity === 'high' ? 'destructive' : 'default',
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [projectId, toast]);

  const loadAnomalies = async () => {
    if (!projectId) return;

    const { data, error } = await supabase
      .from('anomalies')
      .select('*')
      .eq('project_id', projectId)
      .order('detected_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error loading anomalies:', error);
    } else {
      setAnomalies(data || []);
    }
    setLoading(false);
  };

  const resolveAnomaly = async (anomalyId: string) => {
    const { error } = await supabase
      .from('anomalies')
      .update({ is_resolved: true })
      .eq('id', anomalyId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to resolve anomaly",
        variant: "destructive",
      });
    } else {
      setAnomalies(prev => 
        prev.map(a => a.id === anomalyId ? { ...a, is_resolved: true } : a)
      );
      toast({
        title: "Resolved",
        description: "Anomaly marked as resolved",
      });
    }
  };

  const getAnomalyDescription = (anomaly: Anomaly) => {
    switch (anomaly.metric_type) {
      case 'traffic_spike':
        return `Traffic spike detected: ${anomaly.actual_value} events (expected ~${anomaly.expected_value})`;
      case 'bounce_rate_spike':
        return `Bounce rate spike: ${anomaly.actual_value.toFixed(1)}% (expected ~${anomaly.expected_value.toFixed(1)}%)`;
      case 'session_drop':
        return `Session duration drop: ${anomaly.actual_value}s (expected ~${anomaly.expected_value}s)`;
      default:
        return `${anomaly.metric_type}: ${anomaly.actual_value} (expected ~${anomaly.expected_value})`;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (anomaly: Anomaly) => {
    if (anomaly.actual_value > anomaly.expected_value) {
      return <TrendingUp className="w-4 h-4" />;
    } else {
      return <TrendingDown className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            Anomaly Radar
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const unresolved = anomalies.filter(a => !a.is_resolved);
  const resolved = anomalies.filter(a => a.is_resolved);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          Anomaly Radar
          {unresolved.length > 0 && (
            <Badge variant="destructive" className="ml-auto">
              {unresolved.length} active
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          AI-powered detection of traffic spikes, drops, and unusual patterns
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {anomalies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No anomalies detected. Your traffic looks normal! 🎉</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unresolved.length > 0 && (
              <>
                <h4 className="text-sm font-medium text-destructive">Active Anomalies</h4>
                {unresolved.map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className="flex items-start gap-3 p-3 border rounded-lg bg-destructive/5"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(anomaly)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={getSeverityColor(anomaly.severity) as any}>
                          {anomaly.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(anomaly.detected_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">
                        {getAnomalyDescription(anomaly)}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => resolveAnomaly(anomaly.id)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </>
            )}
            
            {resolved.length > 0 && (
              <>
                {unresolved.length > 0 && <div className="border-t pt-4" />}
                <h4 className="text-sm font-medium text-muted-foreground">Resolved</h4>
                {resolved.slice(0, 3).map((anomaly) => (
                  <div
                    key={anomaly.id}
                    className="flex items-start gap-3 p-3 border rounded-lg opacity-60"
                  >
                    <div className="flex-shrink-0 mt-1">
                      {getSeverityIcon(anomaly)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline">
                          {anomaly.severity}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(anomaly.detected_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {getAnomalyDescription(anomaly)}
                      </p>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}