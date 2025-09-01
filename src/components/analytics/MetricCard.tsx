import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: string;
  change?: {
    value: number;
    trend: 'up' | 'down' | 'neutral';
  };
  description?: string;
}

export const MetricCard = ({ label, value, change, description }: MetricCardProps) => {
  const getTrendIcon = () => {
    if (!change) return null;
    
    switch (change.trend) {
      case 'up':
        return <TrendingUp className="w-3 h-3" />;
      case 'down':
        return <TrendingDown className="w-3 h-3" />;
      default:
        return <Minus className="w-3 h-3" />;
    }
  };

  const getTrendClass = () => {
    if (!change) return '';
    
    switch (change.trend) {
      case 'up':
        return 'metric-change positive';
      case 'down':
        return 'metric-change negative';
      default:
        return 'metric-change neutral';
    }
  };

  return (
    <div className="analytics-card">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="metric-label">{label}</p>
          <p className="metric-value">{value}</p>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {change && (
          <div className={getTrendClass()}>
            {getTrendIcon()}
            <span>{Math.abs(change.value)}%</span>
          </div>
        )}
      </div>
    </div>
  );
};