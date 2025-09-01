import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface ChartDataPoint {
  date: string;
  visitors: number;
  pageviews: number;
}

interface AnalyticsChartProps {
  data: ChartDataPoint[];
  metric: 'visitors' | 'pageviews';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-card-border rounded-lg p-3 shadow-[var(--shadow-medium)]">
        <p className="text-sm font-medium text-card-foreground">{label}</p>
        <p className="text-sm text-primary">
          {payload[0].dataKey === 'visitors' ? 'Unique visitors' : 'Pageviews'}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export const AnalyticsChart = ({ data, metric }: AnalyticsChartProps) => {
  return (
    <div className="analytics-card h-80">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-card-foreground">
          {metric === 'visitors' ? 'Unique Visitors' : 'Pageviews'}
        </h3>
        <p className="text-sm text-muted-foreground">
          {metric === 'visitors' 
            ? 'Number of unique visitors over time'
            : 'Total pageviews over time'
          }
        </p>
      </div>
      
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke="hsl(var(--border))"
            opacity={0.3}
          />
          <XAxis 
            dataKey="date" 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey={metric}
            stroke="hsl(var(--primary))"
            strokeWidth={2.5}
            dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: "hsl(var(--primary))", fill: "hsl(var(--primary))" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};