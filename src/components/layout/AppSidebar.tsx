import { NavLink, useLocation } from 'react-router-dom';
import { 
  BarChart3, 
  Users, 
  FileText, 
  ExternalLink, 
  Zap, 
  TestTube, 
  Bot, 
  Leaf, 
  Target, 
  Settings,
  Crown,
  Activity
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Badge } from '@/components/ui/badge';

const mainItems = [
  { title: "Overview", url: "/dashboard", icon: BarChart3 },
  { title: "Visitors", url: "/dashboard/visitors", icon: Users },
  { title: "Page Views", url: "/dashboard/pageviews", icon: FileText },
  { title: "Sources", url: "/dashboard/sources", icon: ExternalLink },
  { title: "Real-Time", url: "/dashboard/realtime", icon: Activity },
];

const proItems = [
  { title: "A/B Testing", url: "/dashboard/ab-testing", icon: TestTube, pro: true },
  { title: "Benchmarks", url: "/dashboard/benchmarks", icon: Target, pro: true },
];

const aiItems = [
  { title: "Anomaly Radar", url: "/dashboard/anomaly-radar", icon: Bot },
  { title: "Carbon Impact", url: "/dashboard/carbon", icon: Leaf },
  { title: "Visitor Heatmaps", url: "/dashboard/visitor-heatmaps", icon: Activity },
];

const settingsItems = [
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isCollapsed = state === 'collapsed';

  const isActive = (path: string) => currentPath === path;
  const getNavCls = (path: string) => 
    isActive(path) 
      ? "bg-primary text-primary-foreground font-medium" 
      : "hover:bg-muted/50 transition-colors";

  return (
    <Sidebar className={isCollapsed ? "w-14" : "w-60"} collapsible="icon">
      <SidebarContent>
        {/* Main Analytics */}
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Pro Features */}
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            Pro Features
            <Crown className="w-3 h-3 text-primary" />
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {proItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && (
                        <span className="flex items-center justify-between w-full">
                          {item.title}
                          <Badge variant="secondary" className="text-xs">Pro</Badge>
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* AI & Insights */}
        <SidebarGroup>
          <SidebarGroupLabel>AI & Insights</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {aiItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} className={getNavCls(item.url)}>
                      <item.icon className="mr-2 h-4 w-4" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}