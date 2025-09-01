import React from 'react';
import { VisitorIntentHeatmaps } from '@/components/features/VisitorIntentHeatmaps';

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface VisitorHeatmapsProps {
  selectedProject?: Project | null;
}

export function VisitorHeatmaps({ selectedProject }: VisitorHeatmapsProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Visitor Heatmaps & Intent Analysis
        </h1>
        <p className="text-muted-foreground">
          Understand how visitors interact with your website through heat mapping and behavioral analysis
        </p>
      </div>

      {/* Visitor Intent Heatmaps Component */}
      <VisitorIntentHeatmaps 
        projectId={selectedProject?.id || 'demo'}
      />
    </div>
  );
}