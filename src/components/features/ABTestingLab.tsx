import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  TestTube, 
  Play, 
  Pause, 
  Trophy, 
  Clock, 
  Users, 
  TrendingUp,
  Sparkles,
  BarChart3,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface ABTest {
  id: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  variant_a: string;
  variant_b: string;
  created_at: string;
  project_id: string;
}

interface ABTestingLabProps {
  projectId: string;
}

interface TestResult {
  variant: 'A' | 'B';
  visitors: number;
  conversions: number;
  conversionRate: number;
  isWinning: boolean;
  confidence: number;
}

export const ABTestingLab = ({ projectId }: ABTestingLabProps) => {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const { toast } = useToast();

  // Mock data for demo
  const mockResults: { [key: string]: { A: TestResult; B: TestResult } } = {
    'CTA Button Test': {
      A: { variant: 'A', visitors: 1247, conversions: 89, conversionRate: 7.14, isWinning: false, confidence: 95.2 },
      B: { variant: 'B', visitors: 1203, conversions: 112, conversionRate: 9.31, isWinning: true, confidence: 95.2 }
    },
    'Headline Test': {
      A: { variant: 'A', visitors: 892, conversions: 34, conversionRate: 3.81, isWinning: true, confidence: 78.4 },
      B: { variant: 'B', visitors: 856, conversions: 28, conversionRate: 3.27, isWinning: false, confidence: 78.4 }
    }
  };

  useEffect(() => {
    loadTests();
  }, [projectId]);

  useEffect(() => {
    // Check for winning tests and show confetti
    const winningTest = tests.find(test => {
      const results = mockResults[test.name];
      return results && (results.A.confidence > 95 || results.B.confidence > 95);
    });
    
    if (winningTest && !showConfetti) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
    }
  }, [tests]);

  const loadTests = async () => {
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .select('*')
        .eq('project_id', projectId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Add demo tests if none exist
      let testsData = (data as ABTest[]) || [];
      if (testsData.length === 0) {
        testsData = [
          {
            id: 'demo-1',
            name: 'CTA Button Test',
            status: 'running' as const,
            variant_a: 'Get Started',
            variant_b: 'Try Free Now',
            created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            project_id: projectId
          },
          {
            id: 'demo-2', 
            name: 'Headline Test',
            status: 'running' as const,
            variant_a: 'Analytics Made Simple',
            variant_b: 'Powerful Analytics for Growth',
            created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            project_id: projectId
          }
        ];
      }
      
      setTests(testsData);
    } catch (error) {
      console.error('Error loading tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTestStatus = async (testId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'running' ? 'paused' : 'running';
    
    setTests(prev => 
      prev.map(test => 
        test.id === testId 
          ? { ...test, status: newStatus as ABTest['status'] }
          : test
      )
    );

    toast({
      title: newStatus === 'running' ? "Test Started" : "Test Paused",
      description: `A/B test has been ${newStatus === 'running' ? 'started' : 'paused'} successfully`,
    });
  };

  const getStatusColor = (status: ABTest['status']) => {
    switch (status) {
      case 'running': return 'bg-success text-success-foreground';
      case 'paused': return 'bg-warning text-warning-foreground';
      case 'completed': return 'bg-primary text-primary-foreground';
      case 'draft': return 'bg-muted text-muted-foreground';
    }
  };

  const getTimeToSignificance = (testName: string) => {
    const results = mockResults[testName];
    if (!results) return '2-3 days';
    
    const totalVisitors = results.A.visitors + results.B.visitors;
    if (totalVisitors > 2000) return 'Significant!';
    if (totalVisitors > 1500) return '6-12 hours';
    if (totalVisitors > 1000) return '1-2 days';
    return '2-3 days';
  };

  if (loading) {
    return (
      <Card className="analytics-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            A/B Testing Lab
          </CardTitle>
          <CardDescription>Experiment and optimize your conversions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="flex justify-between items-center">
                  <div className="w-32 h-5 bg-muted rounded" />
                  <div className="w-20 h-6 bg-muted rounded-full" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-24 bg-muted rounded" />
                  <div className="h-24 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="analytics-card relative overflow-hidden">
      {/* Confetti Effect */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none z-10">
          <div className="confetti">
            <Sparkles className="w-6 h-6 text-primary animate-bounce" style={{ left: '20%', animationDelay: '0s' }} />
            <Sparkles className="w-4 h-4 text-success animate-bounce" style={{ left: '60%', animationDelay: '0.2s' }} />
            <Sparkles className="w-5 h-5 text-warning animate-bounce" style={{ left: '80%', animationDelay: '0.4s' }} />
          </div>
        </div>
      )}
      
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="w-5 h-5 text-primary" />
              A/B Testing Lab
              <Badge variant="secondary" className="ml-2">
                {tests.filter(t => t.status === 'running').length} Active
              </Badge>
            </CardTitle>
            <CardDescription>Experiment and optimize your conversion rates</CardDescription>
          </div>
          
          <Button size="sm" className="btn-analytics">
            <Target className="w-4 h-4 mr-2" />
            New Test
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-6">
          {tests.length === 0 ? (
            <div className="text-center py-8 space-y-3">
              <TestTube className="w-16 h-16 text-muted-foreground mx-auto opacity-50" />
              <div>
                <p className="font-medium text-card-foreground">No experiments running</p>
                <p className="text-sm text-muted-foreground">Start your first A/B test to optimize conversions</p>
              </div>
            </div>
          ) : (
            tests.map(test => {
              const results = mockResults[test.name];
              const timeToSig = getTimeToSignificance(test.name);
              
              return (
                <div key={test.id} className="space-y-4 p-4 rounded-lg border bg-card/50">
                  {/* Test Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium text-card-foreground">{test.name}</h4>
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                      
                      {results && (results.A.confidence > 95 || results.B.confidence > 95) && (
                        <Badge className="bg-success text-success-foreground">
                          <Trophy className="w-3 h-3 mr-1" />
                          Winner!
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeToSig}
                      </div>
                      
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleTestStatus(test.id, test.status)}
                        disabled={test.status === 'completed'}
                      >
                        {test.status === 'running' ? (
                          <Pause className="w-4 h-4" />
                        ) : (
                          <Play className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Test Results */}
                  {results && (
                    <>
                      {/* Variants Comparison */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Variant A */}
                        <div className={`p-4 rounded-lg border-2 transition-all ${
                          results.A.isWinning 
                            ? 'border-success bg-success/5' 
                            : 'border-border bg-muted/30'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Variant A</span>
                            {results.A.isWinning && <Trophy className="w-4 h-4 text-success" />}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-3">"{test.variant_a}"</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Visitors</span>
                              <span className="font-medium">{results.A.visitors.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Conversions</span>
                              <span className="font-medium">{results.A.conversions}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Rate</span>
                              <span className="font-bold text-card-foreground">{results.A.conversionRate}%</span>
                            </div>
                          </div>
                          
                          <Progress 
                            value={results.A.conversionRate * 10} 
                            className="mt-3 h-2"
                          />
                        </div>

                        {/* Variant B */}
                        <div className={`p-4 rounded-lg border-2 transition-all ${
                          results.B.isWinning 
                            ? 'border-success bg-success/5' 
                            : 'border-border bg-muted/30'
                        }`}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium">Variant B</span>
                            {results.B.isWinning && <Trophy className="w-4 h-4 text-success" />}
                          </div>
                          
                          <p className="text-xs text-muted-foreground mb-3">"{test.variant_b}"</p>
                          
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Visitors</span>
                              <span className="font-medium">{results.B.visitors.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Conversions</span>
                              <span className="font-medium">{results.B.conversions}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span className="text-muted-foreground">Rate</span>
                              <span className="font-bold text-card-foreground">{results.B.conversionRate}%</span>
                            </div>
                          </div>
                          
                          <Progress 
                            value={results.B.conversionRate * 10} 
                            className="mt-3 h-2"
                          />
                        </div>
                      </div>

                      {/* Statistical Significance */}
                      <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/20">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Statistical Confidence</span>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Progress 
                            value={Math.max(results.A.confidence, results.B.confidence)} 
                            className="w-24 h-2"
                          />
                          <span className="text-sm font-bold text-primary">
                            {Math.max(results.A.confidence, results.B.confidence).toFixed(1)}%
                          </span>
                        </div>
                      </div>

                      {/* Winner Analysis */}
                      {(results.A.confidence > 95 || results.B.confidence > 95) && (
                        <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                          <div className="flex items-center gap-2 mb-1">
                            <Trophy className="w-4 h-4 text-success" />
                            <span className="text-sm font-medium text-success">Test Complete!</span>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Variant {results.A.isWinning ? 'A' : 'B'} is the winner with{' '}
                            <span className="font-medium text-success">
                              {Math.abs(results.A.conversionRate - results.B.conversionRate).toFixed(2)}%
                            </span>{' '}
                            higher conversion rate. Implement this version for best results!
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};