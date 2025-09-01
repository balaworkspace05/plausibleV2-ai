import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type TimeRange = '7d' | '30d' | '90d' | '1y';

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const timeRangeOptions = [
  { value: '7d' as TimeRange, label: 'Last 7 days' },
  { value: '30d' as TimeRange, label: 'Last 30 days' },
  { value: '90d' as TimeRange, label: 'Last 90 days' },
  { value: '1y' as TimeRange, label: 'Last year' },
];

export const TimeRangeSelector = ({ selectedRange, onRangeChange }: TimeRangeSelectorProps) => {
  const selectedOption = timeRangeOptions.find(option => option.value === selectedRange);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2 bg-card border-card-border hover:bg-accent">
          <Calendar className="w-4 h-4" />
          {selectedOption?.label}
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-card border-card-border">
        {timeRangeOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onRangeChange(option.value)}
            className={`cursor-pointer hover:bg-accent ${
              selectedRange === option.value ? 'bg-primary/10 text-primary' : ''
            }`}
          >
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};