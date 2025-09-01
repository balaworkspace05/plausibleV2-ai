export const mockChartData = [
  { date: "Jan 1", visitors: 2400, pageviews: 4800 },
  { date: "Jan 2", visitors: 1398, pageviews: 2796 },
  { date: "Jan 3", visitors: 9800, pageviews: 19600 },
  { date: "Jan 4", visitors: 3908, pageviews: 7816 },
  { date: "Jan 5", visitors: 4800, pageviews: 9600 },
  { date: "Jan 6", visitors: 3800, pageviews: 7600 },
  { date: "Jan 7", visitors: 4300, pageviews: 8600 },
  { date: "Jan 8", visitors: 5200, pageviews: 10400 },
  { date: "Jan 9", visitors: 2900, pageviews: 5800 },
  { date: "Jan 10", visitors: 6100, pageviews: 12200 },
  { date: "Jan 11", visitors: 4400, pageviews: 8800 },
  { date: "Jan 12", visitors: 5800, pageviews: 11600 },
  { date: "Jan 13", visitors: 7200, pageviews: 14400 },
  { date: "Jan 14", visitors: 4900, pageviews: 9800 },
];

export const mockTopPages = [
  { name: "/", value: 12543, percentage: 45.2, url: "/" },
  { name: "/pricing", value: 8902, percentage: 32.1, url: "/pricing" },
  { name: "/features", value: 4321, percentage: 15.6, url: "/features" },
  { name: "/about", value: 1234, percentage: 4.4, url: "/about" },
  { name: "/blog", value: 756, percentage: 2.7, url: "/blog" },
];

export const mockTopSources = [
  { name: "google.com", value: 8543, percentage: 42.3 },
  { name: "twitter.com", value: 4321, percentage: 21.4 },
  { name: "Direct", value: 3210, percentage: 15.9 },
  { name: "facebook.com", value: 2100, percentage: 10.4 },
  { name: "linkedin.com", value: 1987, percentage: 9.8 },
];

export const mockTopCountries = [
  { name: "United States", value: 11234, percentage: 38.7 },
  { name: "United Kingdom", value: 5432, percentage: 18.7 },
  { name: "Germany", value: 4321, percentage: 14.9 },
  { name: "Canada", value: 3210, percentage: 11.1 },
  { name: "France", value: 2890, percentage: 9.9 },
];

export const mockMetrics = {
  visitors: {
    value: "47.2K",
    change: { value: 12.5, trend: "up" as const },
    description: "Unique visitors this month"
  },
  pageviews: {
    value: "142.8K",
    change: { value: 8.3, trend: "up" as const },
    description: "Total pageviews this month"
  },
  bounceRate: {
    value: "24.3%",
    change: { value: 5.2, trend: "down" as const },
    description: "Visitors who left after one page"
  },
  avgDuration: {
    value: "2m 34s",
    change: { value: 15.7, trend: "up" as const },
    description: "Average time on site"
  },
};