import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface TrackingEvent {
  projectId: string;
  url: string;
  referrer?: string;
  sessionId: string;
  eventName?: string;
  userAgent?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const eventData: TrackingEvent = await req.json();
    
    // Basic validation
    if (!eventData.projectId || !eventData.url || !eventData.sessionId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: projectId, url, sessionId' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse user agent for browser/OS detection
    const userAgent = eventData.userAgent || req.headers.get('user-agent') || '';
    let browser = 'Unknown';
    let os = 'Unknown';

    if (userAgent.includes('Chrome')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari')) browser = 'Safari';
    else if (userAgent.includes('Edge')) browser = 'Edge';

    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac')) os = 'macOS';
    else if (userAgent.includes('Linux')) os = 'Linux';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('iOS')) os = 'iOS';

    // Get country from CF-IPCountry header or use IP geolocation
    const country = req.headers.get('CF-IPCountry') || 'Unknown';

    // Insert event into database
    const { data, error } = await supabase
      .from('events')
      .insert({
        project_id: eventData.projectId,
        event_name: eventData.eventName || 'pageview',
        url: eventData.url,
        referrer: eventData.referrer,
        session_id: eventData.sessionId,
        country,
        browser,
        os,
      });

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to save event' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Check for anomalies (simple spike detection)
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    const { count: recentEvents } = await supabase
      .from('events')
      .select('*', { count: 'exact', head: true })
      .eq('project_id', eventData.projectId)
      .gte('timestamp', oneHourAgo.toISOString());

    // If more than 100 events in the last hour, trigger anomaly detection
    if (recentEvents && recentEvents > 100) {
      const { data: existingAnomaly } = await supabase
        .from('anomalies')
        .select('id')
        .eq('project_id', eventData.projectId)
        .eq('metric_type', 'traffic_spike')
        .eq('is_resolved', false)
        .single();

      if (!existingAnomaly) {
        await supabase
          .from('anomalies')
          .insert({
            project_id: eventData.projectId,
            metric_type: 'traffic_spike',
            expected_value: 50,
            actual_value: recentEvents,
            severity: recentEvents > 500 ? 'high' : recentEvents > 200 ? 'medium' : 'low'
          });
      }
    }

    return new Response(
      JSON.stringify({ success: true }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing request:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});