import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Code, Copy, Check, Globe, Zap } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface TrackingScriptProps {
  projectId: string;
  domain: string;
}

export function TrackingScript({ projectId, domain }: TrackingScriptProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const trackingScript = `<!-- Analytics Pro Tracking Script -->
<script>
(function() {
  const projectId = '${projectId}';
  const apiUrl = 'https://xltwfeecybmcyrvdfhav.supabase.co/functions/v1/track-event';
  
  // Generate session ID
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    sessionStorage.setItem('analytics_session', sessionId);
  }

  // Track pageview
  function trackPageview() {
    const data = {
      projectId: projectId,
      url: window.location.href,
      referrer: document.referrer || null,
      sessionId: sessionId,
      eventName: 'pageview',
      userAgent: navigator.userAgent
    };

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(e => console.warn('Analytics tracking failed:', e));
  }

  // Track custom events
  window.analyticsTrack = function(eventName, data = {}) {
    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId: projectId,
        url: window.location.href,
        sessionId: sessionId,
        eventName: eventName,
        userAgent: navigator.userAgent,
        ...data
      })
    }).catch(e => console.warn('Analytics tracking failed:', e));
  };

  // Track initial pageview
  trackPageview();

  // Track SPA navigation
  let currentPath = window.location.pathname;
  setInterval(() => {
    if (window.location.pathname !== currentPath) {
      currentPath = window.location.pathname;
      trackPageview();
    }
  }, 1000);
})();
</script>`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(trackingScript);
      setCopied(true);
      toast({
        title: "Copied!",
        description: "Tracking script copied to clipboard",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Please select and copy the script manually",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="w-5 h-5" />
          Tracking Script
          <Badge variant="secondary" className="ml-auto">
            <Zap className="w-3 h-3 mr-1" />
            &lt;1KB
          </Badge>
        </CardTitle>
        <CardDescription>
          Add this lightweight script to your website to start tracking
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Installation Instructions */}
        <div className="space-y-2">
          <h4 className="font-medium">Installation Instructions</h4>
          <ol className="text-sm text-muted-foreground space-y-1">
            <li>1. Copy the script below</li>
            <li>2. Add it to your website's &lt;head&gt; section or before &lt;/body&gt;</li>
            <li>3. Analytics will start tracking immediately!</li>
          </ol>
        </div>

        {/* Script */}
        <div className="relative">
          <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto max-h-64">
            <code>{trackingScript}</code>
          </pre>
          <Button
            size="sm"
            variant="outline"
            className="absolute top-2 right-2"
            onClick={copyToClipboard}
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </Button>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Cookie-free tracking</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>GDPR compliant</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Real-time data</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>SPA compatible</span>
          </div>
        </div>

        {/* Custom Events */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Custom Event Tracking</h4>
          <p className="text-sm text-muted-foreground mb-3">
            Track custom events like button clicks, form submissions, etc.
          </p>
          <div className="bg-muted p-3 rounded text-xs">
            <code>
              {`// Track button click
analyticsTrack('button_click', { button: 'signup' });

// Track form submission
analyticsTrack('form_submit', { form: 'contact' });`}
            </code>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}