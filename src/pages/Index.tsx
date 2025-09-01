import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Shield, Zap, Globe, TrendingUp, Bot, Radar, Leaf } from "lucide-react";

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <BarChart3 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">Analytics Pro</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <a href="/auth">Sign In</a>
            </Button>
            <Button asChild>
              <a href="/auth">Get Started</a>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Badge variant="secondary" className="mb-6">
          Privacy-First Analytics Platform
        </Badge>
        <h2 className="text-5xl font-bold text-foreground mb-6">
          Analytics Beyond Numbers
          <span className="text-primary"> with AI</span>
        </h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          Privacy-first analytics inspired by Plausible, enhanced with AI insights, 
          anomaly detection, and industry benchmarks. Track what matters without compromising privacy.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Button size="lg" asChild>
            <a href="/auth">Start Free Trial</a>
          </Button>
          <Button size="lg" variant="outline">
            View Demo
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Everything Plausible Has, Plus More
          </h3>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            All the privacy-first features you love, enhanced with next-generation capabilities
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Core Analytics */}
          <Card className="hover-scale">
            <CardHeader>
              <BarChart3 className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Privacy-First Analytics</CardTitle>
              <CardDescription>
                Cookie-free tracking, GDPR compliant, lightweight script (&lt;1KB)
              </CardDescription>
            </CardHeader>
          </Card>

          {/* AI Insights */}
          <Card className="hover-scale">
            <CardHeader>
              <Bot className="w-8 h-8 text-primary mb-2" />
              <CardTitle>AI Insights Assistant</CardTitle>
              <CardDescription>
                Ask questions in natural language: "Why did traffic spike?" Get intelligent answers.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Anomaly Detection */}
          <Card className="hover-scale">
            <CardHeader>
              <Radar className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Anomaly Radar</CardTitle>
              <CardDescription>
                AI-powered detection of traffic spikes, drops, and unusual patterns with alerts.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Industry Benchmarks */}
          <Card className="hover-scale">
            <CardHeader>
              <TrendingUp className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Industry Benchmarks</CardTitle>
              <CardDescription>
                Compare your metrics with industry averages. See your percentile ranking.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Privacy Heatmaps */}
          <Card className="hover-scale">
            <CardHeader>
              <Globe className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Privacy-Friendly Heatmaps</CardTitle>
              <CardDescription>
                Aggregate click & scroll data without storing personal information.
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Eco Impact */}
          <Card className="hover-scale">
            <CardHeader>
              <Leaf className="w-8 h-8 text-primary mb-2" />
              <CardTitle>Carbon Footprint Tracking</CardTitle>
              <CardDescription>
                Monitor your website's environmental impact and get optimization suggestions.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Privacy Focus */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-primary/5 rounded-2xl p-12 text-center">
          <Shield className="w-16 h-16 text-primary mx-auto mb-6" />
          <h3 className="text-3xl font-bold text-foreground mb-4">
            Privacy by Design
          </h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            No cookies, no personal data collection, GDPR/CCPA compliant out of the box.
            Your visitors' privacy is protected while you get actionable insights.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-primary mb-2">100%</div>
              <div className="text-sm text-muted-foreground">Cookie-free</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-2">&lt;1KB</div>
              <div className="text-sm text-muted-foreground">Lightweight script</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-primary mb-2">GDPR</div>
              <div className="text-sm text-muted-foreground">Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h3 className="text-3xl font-bold text-foreground mb-4">
          Ready to Get Started?
        </h3>
        <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
          Join thousands of websites using privacy-first analytics with AI-powered insights.
        </p>
        <Button size="lg" asChild>
          <a href="/auth">Start Your Free Trial</a>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t bg-background/50">
        <div className="container mx-auto px-4 py-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
              <BarChart3 className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">Analytics Pro</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Privacy-first analytics with AI insights. Built for the modern web.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
