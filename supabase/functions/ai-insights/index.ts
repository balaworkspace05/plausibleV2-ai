import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { question, projectId } = await req.json();

    if (!question || !projectId) {
      return new Response(
        JSON.stringify({ error: 'Missing question or projectId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get recent analytics data for context
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('*')
      .eq('project_id', projectId)
      .gte('timestamp', thirtyDaysAgo.toISOString())
      .limit(1000);

    if (eventsError) {
      console.error('Database error:', eventsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch analytics data' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Prepare analytics summary for AI
    const totalPageviews = events?.length || 0;
    const uniqueVisitors = new Set(events?.map(e => e.session_id) || []).size;
    const topPages = Object.entries(
      (events || []).reduce((acc: Record<string, number>, event) => {
        acc[event.url] = (acc[event.url] || 0) + 1;
        return acc;
      }, {})
    ).sort(([,a], [,b]) => b - a).slice(0, 5);

    const topReferrers = Object.entries(
      (events || []).reduce((acc: Record<string, number>, event) => {
        if (event.referrer) {
          acc[event.referrer] = (acc[event.referrer] || 0) + 1;
        }
        return acc;
      }, {})
    ).sort(([,a], [,b]) => b - a).slice(0, 5);

    const analyticsContext = `
Analytics Data Summary (Last 30 days):
- Total Pageviews: ${totalPageviews}
- Unique Visitors: ${uniqueVisitors}
- Top Pages: ${topPages.map(([url, count]) => `${url} (${count} views)`).join(', ')}
- Top Referrers: ${topReferrers.map(([ref, count]) => `${ref} (${count} visits)`).join(', ')}
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-5-mini-2025-08-07',
        messages: [
          {
            role: 'system',
            content: `You are an AI analytics assistant. You help users understand their website analytics data. 
            
Given the analytics data, answer questions about traffic patterns, user behavior, and provide actionable insights. 
Be concise but helpful. If you need more specific data to answer accurately, mention what additional data would be helpful.

${analyticsContext}`
          },
          {
            role: 'user',
            content: question
          }
        ],
        max_completion_tokens: 500,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('OpenAI API error:', data);
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const answer = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ answer, context: analyticsContext }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in AI insights:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});