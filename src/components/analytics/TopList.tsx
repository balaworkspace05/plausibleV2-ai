import { ExternalLink, TrendingUp } from "lucide-react";

interface TopListItem {
  name: string;
  value: number;
  percentage: number;
  url?: string;
}

interface TopListProps {
  title: string;
  items: TopListItem[];
  type: 'pages' | 'sources' | 'countries';
  showUrls?: boolean;
}

export const TopList = ({ title, items, type, showUrls = false }: TopListProps) => {
  const getIcon = (item: TopListItem) => {
    if (type === 'sources' && item.name.includes('google')) {
      return '🔍';
    }
    if (type === 'sources' && item.name.includes('twitter')) {
      return '🐦';
    }
    if (type === 'sources' && item.name.includes('facebook')) {
      return '📘';
    }
    if (type === 'countries') {
      return '🌍';
    }
    return '📄';
  };

  return (
    <div className="analytics-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
        <TrendingUp className="w-4 h-4 text-muted-foreground" />
      </div>
      
      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="text-sm">{getIcon(item)}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-card-foreground truncate">
                    {item.name}
                  </p>
                  {showUrls && item.url && (
                    <ExternalLink className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                  <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-card-foreground">
                {item.value.toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{item.percentage}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};