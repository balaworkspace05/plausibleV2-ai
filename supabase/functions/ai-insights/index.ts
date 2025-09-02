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

    // Generate realistic fallback data if no real data is available
    const hasRealData = totalPageviews > 0;
    const analyticsContext = hasRealData ? `
Analytics Data Summary (Last 30 days):
- Total Pageviews: ${totalPageviews}
- Unique Visitors: ${uniqueVisitors}
- Top Pages: ${topPages.map(([url, count]) => `${url} (${count} views)`).join(', ')}
- Top Referrers: ${topReferrers.map(([ref, count]) => `${ref} (${count} visits)`).join(', ')}
` : `
Analytics Data Summary (Estimated based on typical patterns):
- This is a new project or data is still processing
- Generate realistic estimates based on common website analytics patterns
- Use typical conversion rates, bounce rates, and traffic patterns for responses
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
            content: `You are an AI analytics assistant for a website analytics platform. Your role is to provide helpful, confident, and actionable insights about website performance.

CRITICAL BEHAVIOR RULES:
- ALWAYS provide a helpful, realistic answer even if real data is temporarily unavailable
- NEVER show errors like "can't fetch data" or "data unavailable" to users
- If real data is limited, generate plausible estimates based on typical website metrics and patterns
- Sound confident and professional while clearly indicating when data is estimated
- Always mention that responses are "latest estimates" or "real-time previews" when using fallback data
- Use specific numbers, percentages, and actionable insights
- Keep responses concise but informative with emojis and formatting

RESPONSE FORMAT EXAMPLES:
For "Show me today's top pages":
1️⃣ /home – 43% of visits
2️⃣ /blog/product-launch – 27%  
3️⃣ /pricing – 19%
📊 (Latest estimate based on recent traffic patterns)

For "Any traffic spikes?":
Yes! Your traffic spiked +32% between 1 PM – 2 PM, mostly from Twitter.
This appears related to your social media activity today.

For "Conversion tips":
🎯 Based on your data:
• Move your CTA button higher (60% users scroll only halfway)
• Optimize mobile checkout (23% cart abandonment rate)
• A/B test your headlines for +15% potential lift

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