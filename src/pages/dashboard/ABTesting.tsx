import { TestTube } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface ABTestingProps {
  selectedProject?: Project | null;
}

export function ABTesting({ selectedProject }: ABTestingProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <TestTube className="w-8 h-8" />
          A/B Testing
          <Badge variant="secondary">Pro Feature</Badge>
        </h1>
        <p className="text-muted-foreground">
          Create and manage experiments to optimize your conversion rates
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>A/B Testing Suite</CardTitle>
          <CardDescription>Advanced experimentation tools</CardDescription>
        </CardHeader>
        <CardContent className="text-center py-12">
          <TestTube className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">Advanced A/B testing features are in development</p>
        </CardContent>
      </Card>
    </div>
  );
}