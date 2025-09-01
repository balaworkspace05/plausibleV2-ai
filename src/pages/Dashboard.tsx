import { MetricCard } from "@/components/analytics/MetricCard";
import { AnalyticsChart } from "@/components/analytics/AnalyticsChart";
import { TopList } from "@/components/analytics/TopList";
import { 
  mockMetrics, 
  mockChartData, 
  mockTopPages, 
  mockTopSources, 
  mockTopCountries 
} from "@/data/mockData";

export const Dashboard = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground">
          Privacy-first analytics with AI-powered insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Unique Visitors"
          value={mockMetrics.visitors.value}
          change={mockMetrics.visitors.change}
          description={mockMetrics.visitors.description}
        />
        <MetricCard
          label="Pageviews"
          value={mockMetrics.pageviews.value}
          change={mockMetrics.pageviews.change}
          description={mockMetrics.pageviews.description}
        />
        <MetricCard
          label="Bounce Rate"
          value={mockMetrics.bounceRate.value}
          change={mockMetrics.bounceRate.change}
          description={mockMetrics.bounceRate.description}
        />
        <MetricCard
          label="Avg. Duration"
          value={mockMetrics.avgDuration.value}
          change={mockMetrics.avgDuration.change}
          description={mockMetrics.avgDuration.description}
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AnalyticsChart data={mockChartData} metric="visitors" />
        <AnalyticsChart data={mockChartData} metric="pageviews" />
      </div>

      {/* Top Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopList
          title="Top Pages"
          items={mockTopPages}
          type="pages"
          showUrls={true}
        />
        <TopList
          title="Top Sources"
          items={mockTopSources}
          type="sources"
        />
        <TopList
          title="Top Countries"
          items={mockTopCountries}
          type="countries"
        />
      </div>
    </div>
  );
};