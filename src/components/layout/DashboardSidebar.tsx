import { 
  BarChart3, 
  Users, 
  MousePointer, 
  Globe, 
  Zap, 
  TestTube, 
  MessageCircle,
  Settings,
  Leaf,
  Target
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const navigationItems = [
  { name: "Overview", icon: BarChart3, href: "/", active: true },
  { name: "Visitors", icon: Users, href: "/visitors" },
  { name: "Page Views", icon: MousePointer, href: "/pageviews" },
  { name: "Sources", icon: Globe, href: "/sources" },
  { name: "Real-time", icon: Zap, href: "/realtime" },
];

const advancedItems = [
  { name: "A/B Testing", icon: TestTube, href: "/ab-testing", badge: "Pro" },
  { name: "AI Assistant", icon: MessageCircle, href: "/assistant", badge: "AI" },
  { name: "Carbon Impact", icon: Leaf, href: "/carbon", badge: "Eco" },
  { name: "Benchmarks", icon: Target, href: "/benchmarks", badge: "Pro" },
];

export const DashboardSidebar = () => {
  const location = useLocation();
  
  const isActive = (href: string) => {
    return location.pathname === href;
  };

  return (
    <aside className="w-64 bg-nav-background border-r border-card-border p-6">
      <nav className="space-y-8">
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Analytics
          </h2>
          <div className="space-y-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            Advanced Features
          </h2>
          <div className="space-y-1">
            {advancedItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`nav-item ${isActive(item.href) ? 'active' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  <span className="ml-auto">
                    <span className="bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full font-medium">
                      {item.badge}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
        
        <div className="pt-4 border-t border-card-border">
          <Link
            to="/settings"
            className={`nav-item ${isActive('/settings') ? 'active' : ''}`}
          >
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      </nav>
    </aside>
  );
};