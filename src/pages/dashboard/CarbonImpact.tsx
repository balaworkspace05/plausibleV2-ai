import React from 'react';
import { CarbonFootprint } from '@/components/features/CarbonFootprint';

interface Project {
  id: string;
  name: string;
  domain: string;
  created_at: string;
}

interface CarbonImpactProps {
  selectedProject?: Project | null;
}

export function CarbonImpact({ selectedProject }: CarbonImpactProps) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Carbon Impact Analytics
        </h1>
        <p className="text-muted-foreground">
          Monitor and optimize your website's environmental footprint
        </p>
      </div>

      {/* Carbon Footprint Component */}
      <CarbonFootprint 
        projectId={selectedProject?.id || 'demo'}
        monthlyVisitors={12500}
        avgPageSize={850} // KB
      />
    </div>
  );
}