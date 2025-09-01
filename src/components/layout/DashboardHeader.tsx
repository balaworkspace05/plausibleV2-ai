import { Search, Bell, Settings, User, Moon, Sun } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface DashboardHeaderProps {
  onThemeToggle: () => void;
  isDark: boolean;
}

export const DashboardHeader = ({ onThemeToggle, isDark }: DashboardHeaderProps) => {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <header className="bg-nav-background border-b border-card-border px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <h1 className="text-xl font-semibold text-nav-foreground">Analytics Pro</h1>
          </div>
          
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search metrics, pages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-80 bg-background"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onThemeToggle}
            className="text-nav-foreground hover:bg-nav-accent"
          >
            {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-nav-foreground hover:bg-nav-accent"
          >
            <Bell className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-nav-foreground hover:bg-nav-accent"
          >
            <Settings className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="text-nav-foreground hover:bg-nav-accent"
          >
            <User className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};