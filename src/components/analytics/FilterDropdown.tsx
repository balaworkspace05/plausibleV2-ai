import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Filter, X } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

export interface FilterOption {
  category: string;
  type: string;
  value: string;
  label: string;
}

interface FilterDropdownProps {
  activeFilters: FilterOption[];
  onFilterAdd: (filter: FilterOption) => void;
  onFilterRemove: (filter: FilterOption) => void;
  onClearAll: () => void;
}

const filterCategories = [
  {
    category: 'URL',
    options: [
      { type: 'page', value: '/', label: 'Homepage' },
      { type: 'page', value: '/about', label: 'About Page' },
      { type: 'page', value: '/contact', label: 'Contact Page' },
      { type: 'hostname', value: 'www.example.com', label: 'Main Domain' },
    ]
  },
  {
    category: 'Device',
    options: [
      { type: 'location', value: 'US', label: 'United States' },
      { type: 'location', value: 'UK', label: 'United Kingdom' },
      { type: 'location', value: 'CA', label: 'Canada' },
      { type: 'screen', value: 'desktop', label: 'Desktop' },
      { type: 'screen', value: 'mobile', label: 'Mobile' },
      { type: 'screen', value: 'tablet', label: 'Tablet' },
      { type: 'browser', value: 'chrome', label: 'Chrome' },
      { type: 'browser', value: 'firefox', label: 'Firefox' },
      { type: 'browser', value: 'safari', label: 'Safari' },
      { type: 'os', value: 'windows', label: 'Windows' },
      { type: 'os', value: 'macos', label: 'macOS' },
      { type: 'os', value: 'linux', label: 'Linux' },
    ]
  },
  {
    category: 'Acquisition',
    options: [
      { type: 'source', value: 'google', label: 'Google' },
      { type: 'source', value: 'facebook', label: 'Facebook' },
      { type: 'source', value: 'twitter', label: 'Twitter' },
      { type: 'source', value: 'direct', label: 'Direct' },
      { type: 'utm', value: 'email', label: 'Email Campaign' },
      { type: 'utm', value: 'social', label: 'Social Media' },
    ]
  },
  {
    category: 'Behaviour',
    options: [
      { type: 'goal', value: 'signup', label: 'Sign Up Goal' },
      { type: 'goal', value: 'purchase', label: 'Purchase Goal' },
      { type: 'property', value: 'engaged', label: 'Engaged Users' },
      { type: 'property', value: 'returning', label: 'Returning Users' },
    ]
  },
  {
    category: 'Segments',
    options: [
      { type: 'filter_usage', value: 'active', label: 'Active Filter Users' },
      { type: 'settings_usage', value: 'configured', label: 'Settings Configured' },
      { type: 'trial', value: 'signup', label: 'Trial Signups' },
      { type: 'trial', value: 'converted', label: 'Trial Conversions' },
    ]
  }
];

export const FilterDropdown = ({ 
  activeFilters, 
  onFilterAdd, 
  onFilterRemove, 
  onClearAll 
}: FilterDropdownProps) => {
  const isFilterActive = (option: FilterOption) => {
    return activeFilters.some(filter => 
      filter.category === option.category && 
      filter.type === option.type && 
      filter.value === option.value
    );
  };

  const handleFilterToggle = (category: string, option: any) => {
    const filter: FilterOption = {
      category,
      type: option.type,
      value: option.value,
      label: option.label
    };

    if (isFilterActive(filter)) {
      onFilterRemove(filter);
    } else {
      onFilterAdd(filter);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center gap-2">
          {activeFilters.map((filter, index) => (
            <Badge
              key={index}
              variant="secondary"
              className="gap-1 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20"
            >
              {filter.label}
              <X
                className="w-3 h-3 cursor-pointer hover:text-danger"
                onClick={() => onFilterRemove(filter)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-muted-foreground hover:text-danger text-xs"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Filter Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2 bg-card border-card-border hover:bg-accent">
            <Filter className="w-4 h-4" />
            Filters
            {activeFilters.length > 0 && (
              <Badge variant="secondary" className="ml-1 bg-primary text-primary-foreground">
                {activeFilters.length}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-card border-card-border max-h-96 overflow-y-auto">
          {filterCategories.map((category, categoryIndex) => (
            <div key={category.category}>
              <DropdownMenuLabel className="text-muted-foreground font-medium">
                {category.category}
              </DropdownMenuLabel>
              {category.options.map((option, optionIndex) => (
                <DropdownMenuItem
                  key={optionIndex}
                  onClick={() => handleFilterToggle(category.category, option)}
                  className={`cursor-pointer hover:bg-accent ${
                    isFilterActive({
                      category: category.category,
                      type: option.type,
                      value: option.value,
                      label: option.label
                    }) ? 'bg-primary/10 text-primary' : ''
                  }`}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
              {categoryIndex < filterCategories.length - 1 && <DropdownMenuSeparator />}
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};